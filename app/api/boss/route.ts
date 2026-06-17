import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sheetId = process.env.SHEET_ID;
    if (!sheetId) {
      return NextResponse.json({ success: false, message: "SHEET_ID 환경변수가 없습니다." }, { status: 500 });
    }

    const gid = "536135862"; 
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

    const res = await fetch(url, { next: { revalidate: 60 } }); 
    if (!res.ok) throw new Error('시트 데이터를 가져오는데 실패했습니다.');

    const text = await res.text();
    
    const rows = text.split('\n').map(row => {
      return row.split(',').map(cell => cell.replace(/\r/g, '').replace(/^"(.*)"$/, '$1').trim());
    });

    const data = rows.slice(1)
      .filter(row => row.length > 0 && row[0] !== '' && !row[0].includes('<!DOCTYPE'))
      .map((row, index) => ({
        id: index + 1,
        date: row[0] || '',
        time: row[1] || '',
        mouse: row[2] || '',
        ginseng: row[3] || '',
        sword: row[4] || '',
        tigerLoot: row[5] || '',
        tigerBind: row[6] || '',
        elephantLoot: row[7] || '',
        elephantBind: row[8] || '',
      }))
      .reverse(); 

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}