import { NextResponse } from 'next/server';

// 💡 넥스트JS 캐시 강제 무효화! (방장님이 추가하신 아주 훌륭한 코드입니다)
export const dynamic = 'force-dynamic';

const SHEET_ID = '1SUL7ZjnZxTt93Mgk6edzS4kVHlFYABND9GL_q624gAU';

const GUILDS_INFO = [
  { id: 'SEONGTAE', name: '태산', sheetName: '태산' },
  { id: 'MANSIK', name: '만월', sheetName: '만월' },
  { id: 'OAH', name: '아랑', sheetName: '아랑' },
  { id: 'SOOPI', name: '하북펭가', sheetName: '하북펭가' },
  { id: 'CEOPARK', name: '천박', sheetName: '천박' },
  { id: 'DOHYUN', name: '도황', sheetName: '도황' }
];

const parseCSVRow = (row: string) => {
  return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').trim());
};

async function getSoopLiveStatus(bjId: string) {
  if (!bjId) return { isLive: false, viewers: 0 };
  try {
    const res = await fetch(`https://bjapi.afreecatv.com/api/${bjId}/station`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 } // 💡 아프리카 API는 60초 유지 (과부하/차단 방지용)
    });
    if (!res.ok) return { isLive: false, viewers: 0 };
    const json = await res.json();
    if (json.broad) return { isLive: true, viewers: json.broad.current_sum_viewer || 0 };
    return { isLive: false, viewers: 0 };
  } catch {
    return { isLive: false, viewers: 0 };
  }
}

export async function GET() {
  try {
    const allGuildsData = await Promise.all(GUILDS_INFO.map(async (guild) => {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(guild.sheetName)}`;
      
      // 💡 해결! 빈칸이던 곳에 '10'을 넣었습니다. (10초마다 시트 최신화)
      const res = await fetch(url, { next: { revalidate: 10 } });
      const csvText = await res.text();
      const rows = csvText.replace(/\r/g, '').split('\n');

      let headerRowIndex = -1;
      let nameColIndex = -1;
      const rawMembers = [];
      
      const tools = { pickaxe5: '0' }; 

      if (rows.length > 3) {
        const row4Cols = parseCSVRow(rows[3] || '');
        const y4Value = row4Cols[24] ? row4Cols[24].trim() : '0';
        tools.pickaxe5 = y4Value === '' ? '0' : y4Value;
      }

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
      }

      const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 3; 
      const targetCol = nameColIndex !== -1 ? nameColIndex : 1; 

      for (let i = startRow; i <= startRow + 15; i++) {
        if (i >= rows.length) break;
        const cols = parseCSVRow(rows[i]);
        const name = cols[targetCol];
        if (!name || name === '') continue;

        const roleValue = cols[3] && cols[3].trim() !== '' ? cols[3].trim() : '길드원';
        const rawId = cols[targetCol + 1] || '';
        const cleanId = rawId.replace(/[`']/g, '').trim();

        rawMembers.push({
          name: name,
          id: cleanId,
          role: roleValue,
          job: cols[targetCol + 3] || '',
          jobTier: cols[targetCol + 4] || '0차',
          equip: {
            weapon: cols[targetCol + 5] || '+0', weaponAtk: cols[targetCol + 6] || '0',
            helmet: cols[targetCol + 7] || '+0', armor: cols[targetCol + 8] || '+0',
            belt: cols[targetCol + 9] || '+0', shoes: cols[targetCol + 10] || '+0',
            ring1: cols[targetCol + 11] || '미착용', ring2: cols[targetCol + 12] || '미착용',
          },
          stats: {
            ki: cols[targetCol + 13] || '0', evasion: cols[targetCol + 14] || '0%',
            atkSpeed: cols[targetCol + 15] || '0%', sum: cols[targetCol + 16] || '0%',
            hp: cols[targetCol + 17] || '0', luck: cols[targetCol + 18] || '0',
          },
          special: {
            lightfoot: cols[targetCol + 19] || '없음', mount: cols[targetCol + 20] || '미탑승',
          }
        });
      }

      const members = await Promise.all(rawMembers.map(async (member) => {
        const liveStatus = await getSoopLiveStatus(member.id);
        return {
          ...member,
          isLive: liveStatus.isLive,
          viewers: liveStatus.viewers
        };
      }));

      return { id: guild.id, name: guild.name, members, tools };
    }));

    return NextResponse.json({ success: true, data: allGuildsData });
  } catch (error) {
    return NextResponse.json({ success: false, error: '데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}