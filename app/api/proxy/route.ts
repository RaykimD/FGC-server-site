// app/api/proxy/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 서버 측에서 아프리카TV 이미지를 직접 요청 (CORS 무시)
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');

    const buffer = await response.arrayBuffer();

    // 가져온 이미지를 우리 사이트의 이미지인 것처럼 브라우저에 전달
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Image proxy failed' }, { status: 500 });
  }
}