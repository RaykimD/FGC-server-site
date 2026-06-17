import { NextResponse } from 'next/server';

// 💡 여기에 방금 [새 배포]로 발급받은 '새로운' URL을 꼭! 다시 붙여넣어 주세요!
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1516484784568664148/U3R89s9E37pDB2vbgqV1SXphXpro_eZ_povEJAGesFrbMxZNXV09U2wdkjAbQBCt5LaO";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzg-tNwhnqb9LV7X-Fw1Jh04FRpm3XYyNsy76_tJukRpQLO21WnCbFDUmjhcYHDlHk/exec";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const categoryMap: Record<string, string> = {
      weapon: '무기', helmet: '투구', armor: '갑옷', belt: '벨트', shoes: '신발',
      ring1: '반지1', ring2: '반지2', ki: '내공', evasion: '회피', atkSpeed: '공속',
      hp: '체력', luck: '운', lightfoot: '경공비급', mount: '탈것', boss: '보스 루팅'
    };
    const categoryName = categoryMap[data.category] || data.category;

    let discordPromise: Promise<any> = Promise.resolve();

    if (data.category !== 'boss') {
      const discordPayload = {
        embeds: [{
          title: "📢 새로운 정보 공유 제보가 도착했습니다!",
          color: 3447003,
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

      discordPromise = fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      }).catch(err => console.error("디스코드 전송 실패:", err));
    }

    // 💡 구글 시트로 데이터 전송 후 터미널에 결과 출력
    const sheetPromise = fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.text())
    .then(text => console.log("\n=== [디버그] 구글 기록 결과 ===\n", text, "\n==============================\n"))
    .catch(err => console.error("구글 시트 전송 실패:", err));

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
      next: { revalidate: 30 } 
    });
    const text = await res.text();
    
    // 정상적인 JSON 데이터면 화면에 뿌려주고, 구글 에러가 발생했다면 터미널에 표시
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch(e) {
      console.log("\n=== [디버그] 대기열 로드 실패 원본 ===\n", text.substring(0, 300), "\n====================================\n");
      return NextResponse.json({ success: false, data: [] });
    }
  } catch (error) {
    console.error("제보 목록 불러오기 에러:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}