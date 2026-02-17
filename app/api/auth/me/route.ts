import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req: Request) {
  const response = await fetch(`${BACKEND_URL}/auth/me`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: response.status });
  }

  const data = await response.json();
  console.log('data:', data);
  // const backendCookies = response.headers.get('set-cookie');

  const res = NextResponse.json({
    success: true,
  });

  res.cookies.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // maxAge: 120 * 60, // 15 хвилин
    path: '/',
  });

  // if (backendCookies) {
  //     res.headers.append('set-cookie', backendCookies);
  // }

  return res;
}
