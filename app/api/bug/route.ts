import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();

    // 💡 연결하신 디스코드 웹훅 주소
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1516632556764794981/Roz9YPIk3K_zDdswIlZRGiMf78--8w9IVYwkaB8N7L2UJxsX-ZloFkK6vkfUom-ZsXL6";

    // 디스코드로 보낼 메시지 디자인 (Embed)
    const message = {
      embeds: [
        {
          title: `🐛 버그/건의 제보: ${title}`,
          description: content,
          color: 16711680, // 빨간색
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
