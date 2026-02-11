import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const getBaseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const publicPaths: string[] = ['/login', '/register', '/verify-email', '/reset-password'];
const adminPaths: string[] = ['/scenarios', '/users'];
const traineePaths: string[] = ['/trainer', '/analytics', '/history'];
const authApiPaths: string[] = [
	'/api/auth/login',
	'/api/auth/register',
	'/api/auth/refresh',
	'/api/auth/verify-email',
	'/api/auth/logout',
	'/api/auth/forgot-password',
	'/api/auth/reset-password',
];


export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico' ||
        authApiPaths.some(path => pathname.startsWith(path))
    ) {
        return NextResponse.next();
    }

    const token: string | undefined = request.cookies.get('accessToken')?.value;
    const refreshToken: string | undefined = request.cookies.get('refreshToken')?.value;

    if (token) {
        const payload = (jwt.decode(token) as { role: string, exp: number } | null) ;

        if (payload) {
            const isTokenExpired: boolean = checkIsExpired(payload?.exp);

            if (isTokenExpired) {
                try {
                    const res = await fetch(`${getBaseUrl}/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Cookie': `refreshToken=${refreshToken}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (res.ok) {
                        const {accessToken: newAccessToken} = await res.json();

                        const backendCookies: string[] = res.headers.getSetCookie();

                        const response = NextResponse.next();

                        response.cookies.set('accessToken', newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                        });

                        if (backendCookies.length > 0) {
                            backendCookies.forEach(cookie => {
                                response.headers.append('set-cookie', cookie);
                            });
                        }

                        response.headers.set('Authorization', `Bearer ${newAccessToken}`);

                        return response;
                    } else {
                        const response = NextResponse.next();
                        response.cookies.delete("accessToken")
                        response.cookies.delete("refreshToken")

                        response.headers.delete('x-access-token')
                        response.headers.delete('Authorization');
                        response.headers.delete('accessToken');
                        response.headers.delete('refreshToken');
                        return response;
                    }
                } catch (e) {
                    console.error('Refresh failed', e);
                }

            }
        }
    }

    const payload = token ? (jwt.decode(token) as { role: string, exp: number } | null) : null;

    const role: string | undefined = payload?.role;

    const isPublicPath: boolean = publicPaths.some(path => pathname.startsWith(path));

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isPublicPath) {
        if (role === 'ADMIN') {
            return NextResponse.redirect(new URL('/scenarios', request.url));
        } else {
            return NextResponse.redirect(new URL('/trainer', request.url));
        }
    }

    if (pathname === '/' && token) {
        if (role === 'ADMIN') return NextResponse.redirect(new URL('/scenarios', request.url));
        if (role === 'TRAINEE') return NextResponse.redirect(new URL('/trainer', request.url));
    }

    if (token) {
        if (role === 'ADMIN' && traineePaths.some(path => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL('/scenarios', request.url));
        }
        if (role === 'TRAINEE' && adminPaths.some(path => pathname.startsWith(path))) {
            return NextResponse.redirect(new URL('/trainer', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};

function checkIsExpired(expToken: number): boolean {
    try {
        return expToken < (Date.now() / 1000);
    } catch (e) {
        return true;
    }
}
