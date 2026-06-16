// app/api/report/route.ts
import { NextResponse } from 'next/server';

// 💡 여기에 나중에 발급받을 디스코드 웹훅 주소와 구글 앱스스크립트 주소를 넣을 겁니다.
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1516484784568664148/U3R89s9E37pDB2vbgqV1SXphXpro_eZ_povEJAGesFrbMxZNXV09U2wdkjAbQBCt5LaO";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz65YS7bB6UTVMHLxYZdXwgWSqZ1IjvCuBAION2rcYZ7aT2Evgb4Jw_LuWCH5eFXwk/exec";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // 카테고리 영문을 한글로 변환 (디스코드 알림용)
    const categoryMap: Record<string, string> = {
      weapon: '무기', helmet: '투구', armor: '갑옷', belt: '벨트', shoes: '신발',
      ring1: '반지1', ring2: '반지2', ki: '내공', evasion: '회피', atkSpeed: '공속',
      hp: '체력', luck: '운', lightfoot: '경공비급', mount: '탈것'
    };
    const categoryName = categoryMap[data.category] || data.category;

    // 1️⃣ 디스코드 웹훅으로 예쁜 임베드 메시지 전송
    const discordPayload = {
      embeds: [{
        title: "📢 새로운 정보 공유 제보가 도착했습니다!",
        color: 3447003, // 파란색
        fields: [
          { name: "👤 대상", value: `${data.member}`, inline: true },
          { name: "🏷️ 변경 항목", value: categoryName, inline: true },
          { name: "📈 수치 변화", value: `${data.oldValue} ➡️ **${data.newValue}**`, inline: false },
          { name: "🔗 증명 링크", value: data.proofLink || "제출되지 않음", inline: false },
          { name: "💬 코멘트", value: data.remarks || "없음", inline: false }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const discordPromise = fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    }).catch(err => console.error("디스코드 전송 실패:", err));

    // 2️⃣ 구글 시트로 데이터 전송
    const sheetPromise = fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(err => console.error("구글 시트 전송 실패:", err));

    // 두 전송을 동시에 실행하고 기다림
    await Promise.all([discordPromise, sheetPromise]);

    return NextResponse.json({ success: true, message: "제보 전송 완료" });
    
  } catch (error) {
    console.error("제보 처리 중 에러:", error);
    return NextResponse.json({ success: false, message: "서버 에러" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { 
      method: 'GET',
      next: { revalidate: 30 } // 제보 목록은 30초마다 최신화 캐싱
    });
    const json = await res.json();
    
    return NextResponse.json(json);
  } catch (error) {
    console.error("제보 목록 불러오기 에러:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}