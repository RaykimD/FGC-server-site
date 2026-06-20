import { NextResponse } from 'next/server';

// 💡 넥스트JS의 지독한 캐싱을 강제로 끄는 마법의 코드 (이제 시트 바꾸면 즉시 반영됨)
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sheetId = process.env.SHEET_ID;
        const gid = "98008153";

        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

        // 시트 데이터를 가져옵니다.
        const res = await fetch(url, { next: { revalidate: 10 } });
        if (!res.ok) throw new Error('시트 데이터를 가져오는데 실패했습니다.');

        const text = await res.text();

        // CSV 데이터를 읽기 좋게 배열로 쪼갭니다.
        const rows = text.split('\n').map(row =>
            row.split(',').map(cell => cell.replace(/\r/g, '').replace(/^"(.*)"$/, '$1').trim())
        );

        // 💡 1차 합격자 배열 추가!
        const firstRoundApplicants: { name: string, id: string }[] = [];
        const regularApplicants: { name: string, id: string }[] = [];
        const veteranApplicants: { name: string, id: string }[] = [];

        // 1행(헤더)을 제외하고 2행부터 데이터를 읽어서 분류합니다.
        rows.slice(1).forEach(row => {
            const name = row[0];
            const id = row[1];
            const category = row[2] || '일반'; // C열이 비어있으면 기본값으로 '일반' 취급

            if (!name || !id) return; // 닉네임이나 아이디가 빈칸이면 무시

            // 💡 숫자 아이디 방어 로직 추가 (프론트에서 터지는 것을 백엔드에서도 방어)
            const safeId = String(id);
            const applicant = { name, id: safeId };

            // 💡 여기서 '1차', '퇴역군인(베테랑)', '일반'을 정확히 분류합니다!
            // 기존 코드: if (category === '1차') 
            // 💡 아래처럼 수정하세요! ('1차'라는 글자만 포함되어 있으면 무조건 통과)

            if (category.includes('1차')) {
                firstRoundApplicants.push(applicant);
            } else if (category.includes('퇴역군인') || category.includes('베테랑')) {
                veteranApplicants.push(applicant);
            } else {
                regularApplicants.push(applicant);
            }
        });

        // 기존에 있던 중복 제거 방어 로직 (아이디 기준)
        const uniqueFirstRound = Array.from(new Map(firstRoundApplicants.map(item => [item.id, item])).values());
        const uniqueRegular = Array.from(new Map(regularApplicants.map(item => [item.id, item])).values());
        const uniqueVeteran = Array.from(new Map(veteranApplicants.map(item => [item.id, item])).values());

        return NextResponse.json({
            success: true,
            data: {
                firstRound: uniqueFirstRound, // 💡 드디어 프론트엔드로 1차 합격자 명단을 쏴줍니다!
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