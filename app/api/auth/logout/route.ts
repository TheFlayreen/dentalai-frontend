import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
    const response = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: response.status }
        );
    }
    const res = NextResponse.json({
        success: true
    });

    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');

    return res;
}