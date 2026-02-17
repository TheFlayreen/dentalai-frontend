import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  const credentials = await req.json();

  const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: response.status });
  }

  return NextResponse.json({
    success: true,
  });
}
