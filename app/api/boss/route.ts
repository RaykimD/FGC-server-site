import { NextResponse } from 'next/server';

const SHEET_ID = '1SUL7ZjnZxTt93Mgk6edzS4kVHlFYABND9GL_q624gAU'; 
const DICT_GID = '1014835785';
const LOG_GID = '1352358629';

type GvizCell = { v: string | number | null, f?: string } | null;
type GvizRow = { c: GvizCell[] };

export async function GET() {
  try {
    const dictUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${DICT_GID}`;
    const logUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${LOG_GID}`;

    const [dictRes, logRes] = await Promise.all([
      fetch(dictUrl, { next: { revalidate: 3600 } }),
      fetch(logUrl, { next: { revalidate: 10 } })
    ]);
    
    const dictText = await dictRes.text();
    const logText = await logRes.text();

    const parseGoogleJSON = (text: string): GvizRow[] => {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) return [];
      const jsonStr = text.substring(start, end + 1);
      const data = JSON.parse(jsonStr);
      return data.table?.rows || [];
    };

    const dictRows = parseGoogleJSON(dictText);
    const logRows = parseGoogleJSON(logText);

    const extractValue = (cell: GvizCell) => {
      if (!cell) return '';
      let val = (cell.f || cell.v?.toString() || '').trim();
      
      if (val.startsWith('Date(')) {
        const match = val.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
        if (match) {
          const [, y, m, d, h, min] = match;
          if (y === '1899') {
            val = `${(h || '0').padStart(2, '0')}:${(min || '0').padStart(2, '0')}`;
          } else {
            const realMonth = String(Number(m) + 1).padStart(2, '0');
            const realDay = (d || '0').padStart(2, '0');
            val = `${realMonth}/${realDay}`;
          }
        }
      }
      return val;
    };

    const normalizeDate = (dateStr: string) => {
      const cleanStr = dateStr.trim();
      const parts = cleanStr.split('/');
      if (parts.length === 2) {
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`;
      }
      return cleanStr;
    };

    const dictionary = dictRows.map((row) => {
      const cells = row.c;
      const dropsStr = extractValue(cells[3]);
      return {
        name: extractValue(cells[0]),
        hp: extractValue(cells[1]) || '0',
        img: extractValue(cells[2]) || '👹',
        drops: dropsStr ? dropsStr.split(',').map(item => item.trim()) : [],
      };
    }).filter(item => item.name !== '' && item.name.toUpperCase() !== 'NAME'); 

    const logs = logRows.map((row, index) => {
      const cells = row.c;
      const rawDate = extractValue(cells[0]);
      const timeVal = extractValue(cells[1]);
      
      return {
        id: index + 1,
        date: normalizeDate(rawDate), 
        time: timeVal,   
        bossName: extractValue(cells[2]),
        guild: extractValue(cells[3]),
        player: extractValue(cells[4]),
      };
    }).filter(item => item.bossName !== '' && item.bossName.toUpperCase() !== 'BOSSNAME'); 

    return NextResponse.json({ dictionary, logs }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Fetch failed' },
      { status: 500 }
    );
  }
}