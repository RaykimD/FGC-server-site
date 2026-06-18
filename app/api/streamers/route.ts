import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const sheetId = process.env.SHEET_ID;
        
        const gid = "98008153"; 
        
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

        // 시트 데이터를 가져옵니다. (60초마다 최신화)
        const res = await fetch(url, { next: { revalidate: 31536000 } }); 
        if (!res.ok) throw new Error('시트 데이터를 가져오는데 실패했습니다.');

        const text = await res.text();
        
        // CSV 데이터를 읽기 좋게 배열로 쪼갭니다.
        const rows = text.split('\n').map(row => 
            row.split(',').map(cell => cell.replace(/\r/g, '').replace(/^"(.*)"$/, '$1').trim())
        );

        const regularApplicants: {name: string, id: string}[] = [];
        const veteranApplicants: {name: string, id: string}[] = [];

        // 1행(헤더)을 제외하고 2행부터 데이터를 읽어서 분류합니다.
        rows.slice(1).forEach(row => {
            const name = row[0];
            const id = row[1];
            const category = row[2] || '일반'; // C열이 비어있으면 기본값으로 '일반' 취급

            if (!name || !id) return; // 닉네임이나 아이디가 빈칸이면 무시

            const applicant = { name, id };

            if (category === '베테랑') {
                veteranApplicants.push(applicant);
            } else {
                regularApplicants.push(applicant);
            }
        });

        // 기존에 있던 중복 제거 방어 로직 (아이디 기준)
        const uniqueRegular = Array.from(new Map(regularApplicants.map(item => [item.id, item])).values());
        const uniqueVeteran = Array.from(new Map(veteranApplicants.map(item => [item.id, item])).values());

        return NextResponse.json({
            success: true,
            data: {
                regular: uniqueRegular,
                veteran: uniqueVeteran
            },
            lastUpdated: Date.now()
        });

    } catch (error) {
        console.error("신청자 데이터 로드 실패:", error);
        return NextResponse.json({ success: false, error: '데이터 갱신 실패' }, { status: 500 });
    }
}