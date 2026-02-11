import { NextResponse } from 'next/server';
import {cookies} from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const accessToken: string | undefined = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
        return NextResponse.json({success: false});
    }

    console.log("Call refresh endpoint with token:")

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: response.status }
        );
    }

    const data = await response.json();

    const res = NextResponse.json({
        success: true,
        accessToken: data.accessToken
    });

    res.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        // maxAge: 120 * 60,
        path: '/'
    });

    // if (backendCookies) {
    //     res.headers.append('set-cookie', backendCookies);
    // }

    return res;
}