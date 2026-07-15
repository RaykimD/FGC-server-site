import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');

  // 💡 보안: 아무나 주소를 쳐서 새로고침 테러를 하지 못하게 암호를 설정합니다.
  if (secret !== 'fgc-secret-1234') {
    return NextResponse.json({ message: '권한이 없습니다.' }, { status: 401 });
  }

  if (path) {
    // 💡 핵심: 전달받은 경로(path)의 캐시를 즉시 폭파시킵니다!
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  }

  return NextResponse.json({ revalidated: false, message: '경로가 없습니다.' });
}