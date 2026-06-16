import { NextResponse } from 'next/server';

// 💡 1.5분(90초) 캐시 설정
export const revalidate = 90; 

const SHEET_ID = '1SUL7ZjnZxTt93Mgk6edzS4kVHlFYABND9GL_q624gAU';

const GUILDS_INFO = [
  { id: 'kim', name: '성태 길드', sheetName: '성태길드' },
  { id: 'kang', name: '만식 길드', sheetName: '만식길드' },
  { id: 'oah', name: '오아 길드', sheetName: '오아길드' },
  { id: 'supi', name: '수피 길드', sheetName: '수피길드' },
  { id: 'park', name: '사장 길드', sheetName: '사장길드' },
  { id: 'do', name: '도현 길드', sheetName: '도현길드' }
];

const parseCSVRow = (row: string) => {
  return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').trim());
};

export async function GET() {
  try {
    const allGuildsData = await Promise.all(GUILDS_INFO.map(async (guild) => {
      // 💡 5분마다 새 데이터를 가져오도록 설정
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(guild.sheetName)}`;
      
      const res = await fetch(url, { 
        next: { revalidate: 300 } 
      });
      const csvText = await res.text();
      const rows = csvText.replace(/\r/g, '').split('\n');

      let headerRowIndex = -1;
      let nameColIndex = -1;
      const members = [];
      const tools = { pickaxe4: '0', pickaxe5: '0', scythe3: '0', scythe4: '0', scythe5: '0' };

      // 1. 헤더 및 도구 정보 탐색
      for (let i = 0; i < rows.length; i++) {
        if (!rows[i].trim()) continue;
        const cols = parseCSVRow(rows[i]);
        
        if (headerRowIndex === -1) {
          const idx = cols.findIndex(c => c.includes('이름') || c.includes('닉네임'));
          if (idx !== -1) {
            headerRowIndex = i;
            nameColIndex = idx;
          }
        }

        for (let j = 0; j < cols.length - 1; j++) {
          const val = cols[j].replace(/\s+/g, '');
          if (val.includes('4강곡괭이')) tools.pickaxe4 = cols[j + 1] || '0';
          if (val.includes('5강곡괭이')) tools.pickaxe5 = cols[j + 1] || '0';
          if (val.includes('3강낫')) tools.scythe3 = cols[j + 1] || '0';
          if (val.includes('4강낫')) tools.scythe4 = cols[j + 1] || '0';
          if (val.includes('5강낫')) tools.scythe5 = cols[j + 1] || '0';
        }
      }

      const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 3; 
      const targetCol = nameColIndex !== -1 ? nameColIndex : 1; 

      // 2. 멤버 데이터 파싱
      for (let i = startRow; i <= startRow + 15; i++) { // 최대 16명까지 여유 있게
        if (i >= rows.length) break;
        const cols = parseCSVRow(rows[i]);
        const name = cols[targetCol];
        
        if (!name || name === '') continue;

        members.push({
          name: name,
          id: cols[targetCol + 1] || '',
          role: cols[targetCol + 2] || '길드원',
          job: cols[targetCol + 3] || '',
          jobTier: cols[targetCol + 4] || '0차',
          equip: {
            weapon: cols[targetCol + 5] || '+0',
            weaponAtk: cols[targetCol + 6] || '0',
            helmet: cols[targetCol + 7] || '+0',
            armor: cols[targetCol + 8] || '+0',
            belt: cols[targetCol + 9] || '+0',
            shoes: cols[targetCol + 10] || '+0',
            ring1: cols[targetCol + 11] || '미착용',
            ring2: cols[targetCol + 12] || '미착용',
          },
          stats: {
            ki: cols[targetCol + 13] || '0',
            evasion: cols[targetCol + 14] || '0%',
            atkSpeed: cols[targetCol + 15] || '0%',
            sum: cols[targetCol + 16] || '0%',
            hp: cols[targetCol + 17] || '0',
            luck: cols[targetCol + 18] || '0',
          },
          special: {
            lightfoot: cols[targetCol + 19] || '없음',
            mount: cols[targetCol + 20] || '미탑승',
          }
        });
      }

      // 💡 결과값에 길드 정보가 명확히 포함되도록 구조화
      return { 
        id: guild.id, 
        name: guild.name, 
        members: members, 
        tools: tools 
      };
    }));

    return NextResponse.json({ success: true, data: allGuildsData });
  } catch (error) {
    console.error('구글 시트 연동 에러:', error);
    return NextResponse.json({ success: false, error: '데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}