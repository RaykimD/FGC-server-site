import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLVMxL_1fcg4B4zF6_nT33BNV2GpvqOWpqWdS9-J8NLJ6C_8BOHGwB4kk0Jun9RGM/exec";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.type) {
      data.type = 'stat';
    }

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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

export async function GET() {
  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { cache: 'no-store' });
    const text = await res.text();
    
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch(e) {
      return NextResponse.json({ success: false, data: [] });
    }
  } catch (error) {
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}