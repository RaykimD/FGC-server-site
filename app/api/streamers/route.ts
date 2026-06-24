import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const sheetId = process.env.SHEET_ID;
        const gid = "98008153";

        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

        const res = await fetch(url, { next: { revalidate: 600 } });
        if (!res.ok) throw new Error('Fetch failed');

        const text = await res.text();

        const rows = text.split('\n').map(row =>
            row.split(',').map(cell => cell.replace(/\r/g, '').replace(/^"(.*)"$/, '$1').trim())
        );

        const firstRoundApplicants: { name: string, id: string }[] = [];
        const regularApplicants: { name: string, id: string }[] = [];
        const veteranApplicants: { name: string, id: string }[] = [];

        rows.slice(1).forEach(row => {
            const name = row[0];
            const id = row[1];
            const category = row[2] || '일반';

            if (!name || !id) return;

            const safeId = String(id);
            const applicant = { name, id: safeId };

            if (category.includes('1차')) {
                firstRoundApplicants.push(applicant);
            } else if (category.includes('퇴역군인') || category.includes('베테랑')) {
                veteranApplicants.push(applicant);
            } else {
                regularApplicants.push(applicant);
            }
        });

        const uniqueFirstRound = Array.from(new Map(firstRoundApplicants.map(item => [item.id, item])).values());
        const uniqueRegular = Array.from(new Map(regularApplicants.map(item => [item.id, item])).values());
        const uniqueVeteran = Array.from(new Map(veteranApplicants.map(item => [item.id, item])).values());

        return NextResponse.json({
            success: true,
            data: {
                firstRound: uniqueFirstRound,
                regular: uniqueRegular,
                veteran: uniqueVeteran
            },
            lastUpdated: Date.now()
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Data load failed' }, { status: 500 });
    }
}