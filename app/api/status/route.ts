import { NextResponse } from 'next/server';

export const revalidate = 90; // 💡 90초 캐시로 아프리카 서버 부하 및 차단 완벽 방지

const SHEET_ID = '1SUL7ZjnZxTt93Mgk6edzS4kVHlFYABND9GL_q624gAU';

const GUILDS_INFO = [
  { id: 'SEONGTAE', name: '성태 길드', sheetName: '성태길드' },
  { id: 'MANSIK', name: '만식 길드', sheetName: '만식길드' },
  { id: 'OAH', name: '오아 길드', sheetName: '오아길드' },
  { id: 'SOOPI', name: '수피 길드', sheetName: '수피길드' },
  { id: 'CEOPARK', name: '사장 길드', sheetName: '사장길드' },
  { id: 'DOHYUN', name: '도현 길드', sheetName: '도현길드' }
];

const parseCSVRow = (row: string) => {
  return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').trim());
};

// 💡 SOOP 실시간 방송 정보 가져오는 헬퍼 함수
async function getSoopLiveStatus(bjId: string) {
  if (!bjId) return { isLive: false, viewers: 0 };
  try {
    const res = await fetch(`https://bjapi.afreecatv.com/api/${bjId}/station`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 90 }
    });
    if (!res.ok) return { isLive: false, viewers: 0 };
    const json = await res.json();
    // broad 객체가 존재하면 현재 생방송 중임
    if (json.broad) {
      return {
        isLive: true,
        viewers: json.broad.current_sum_viewer || 0
      };
    }
    return { isLive: false, viewers: 0 };
  } catch {
    return { isLive: false, viewers: 0 };
  }
}

export async function GET() {
  try {
    const allGuildsData = await Promise.all(GUILDS_INFO.map(async (guild) => {
      const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(guild.sheetName)}`;
      
      const res = await fetch(url, { next: { revalidate: 31536000 } });
      const csvText = await res.text();
      const rows = csvText.replace(/\r/g, '').split('\n');

      let headerRowIndex = -1;
      let nameColIndex = -1;
      const rawMembers = [];
      const tools = { pickaxe3: '0', pickaxe4: '0', pickaxe5: '0', scythe3: '0', scythe4: '0', scythe5: '0' };

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
          if (val.includes('3강곡')) tools.pickaxe3 = cols[j + 1] || '0';
          if (val.includes('4강곡')) tools.pickaxe4 = cols[j + 1] || '0';
          if (val.includes('5강곡')) tools.pickaxe5 = cols[j + 1] || '0';
          if (val.includes('3강낫')) tools.scythe3 = cols[j + 1] || '0';
          if (val.includes('4강낫')) tools.scythe4 = cols[j + 1] || '0';
          if (val.includes('5강낫')) tools.scythe5 = cols[j + 1] || '0';
        }
      }

      const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 3; 
      const targetCol = nameColIndex !== -1 ? nameColIndex : 1; 

      for (let i = startRow; i <= startRow + 15; i++) {
        if (i >= rows.length) break;
        const cols = parseCSVRow(rows[i]);
        const name = cols[targetCol];
        if (!name || name === '') continue;

        rawMembers.push({
          name: name,
          id: cols[targetCol + 1] || '',
          role: cols[targetCol + 2] || '길드원',
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

      // 💡 핵심: 긁어온 최종 멤버들의 SOOP 라이브 상태를 실시간 병렬 확인 연동
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
    console.error('구글 시트 연동 에러:', error);
    return NextResponse.json({ success: false, error: '데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}