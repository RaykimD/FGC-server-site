import { NextResponse } from 'next/server';

const SHEET_ID = '1SUL7ZjnZxTt93Mgk6edzS4kVHlFYABND9GL_q624gAU';

export async function GET() {
  try {
    const bossUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Boss_Dictionary&range=A2:A&headers=0`;
    const guildUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=길드별%20인원&range=C5:M17&headers=0`;

    const [bossRes, guildRes] = await Promise.all([
      fetch(bossUrl, { next: { revalidate: 3600 } }),
      fetch(guildUrl, { next: { revalidate: 600 } })
    ]);
    
    const bossText = await bossRes.text();
    const guildText = await guildRes.text();

    const parseGoogleJSON = (text: string) => {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) return [];
      const jsonStr = text.substring(start, end + 1);
      const data = JSON.parse(jsonStr);
      return data.table?.rows || [];
    };

    const bossRows = parseGoogleJSON(bossText);
    const guildRows = parseGoogleJSON(guildText);

    const bosses = bossRows.map((row: any) => row.c[0]?.v?.toString().trim()).filter(Boolean);

    const guildMap: Record<string, string[]> = {};
    if (guildRows.length > 0) {
      const headerCells = guildRows[0].c;
      const colIndices = [0, 2, 4, 6, 8, 10];
      
      colIndices.forEach((colIdx) => {
        const guildName = headerCells[colIdx]?.v?.toString().trim();
        if (guildName) {
          guildMap[guildName] = [];
          for (let i = 1; i < guildRows.length; i++) {
            const memberName = guildRows[i].c[colIdx]?.v?.toString().trim();
            if (memberName) {
              guildMap[guildName].push(memberName);
            }
          }
        }
      });
    }

    return NextResponse.json({ bosses, guildMap }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ bosses: [], guildMap: {} }, { status: 500 });
  }
}