import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { date, time, boss, guild } = await req.json();
    
    // 💡 연결하신 보스 루팅 제보용 디스코드 웹훅 주소
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1516681299895521362/QfvOJpxBEe3bYQ9IJodaz4syKPA_aapjLDKmQRpwT6XIuWI5WwNCBI5hJHlQ3OfNpDbA";

    const message = {
      embeds: [
        {
          title: `🐉 보스 루팅 제보가 접수되었습니다!`,
          color: 10181046, // 보라색 테마
          fields: [
            { name: "날짜 및 시간", value: `${date} ${time}`, inline: true },
            { name: "보스 종류", value: boss, inline: true },
            { name: "루팅 길드", value: guild, inline: false },
          ],
          timestamp: new Date().toISOString(),
        }
      ]
    };

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}