import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  const credentials = await req.json();

  const response = await fetch(`${BACKEND_URL}/auth/verify-email`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: response.status });
  }

  const data = await response.json();

  const backendCookies: string[] = response.headers.getSetCookie();

  const res = NextResponse.json({
    success: true,
  });

  res.cookies.delete('verifyEmailRequested');

  res.cookies.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // maxAge: 120 * 60, // 15 хвилин
    path: '/',
  });

  if (backendCookies.length > 0) {
    backendCookies.forEach((cookie) => {
      res.headers.append('set-cookie', cookie);
    });
  }

  // if (backendCookies) {
  //     res.headers.append('set-cookie', backendCookies);
  // }

  return res;
}
