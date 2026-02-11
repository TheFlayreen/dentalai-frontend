import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
    const credentials = await req.json();

    const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: response.status }
        );
    }

    const backendCookies: string[] = response.headers.getSetCookie();

    const res = NextResponse.json({
        success: true
    });

    res.cookies.set('verifyEmailRequested', 'true');

    if (backendCookies.length > 0) {
        backendCookies.forEach(cookie => {
            res.headers.append('set-cookie', cookie);
        });
    }

    // if (backendCookies) {
    //     res.headers.append('set-cookie', backendCookies);
    // }

    return res;
}