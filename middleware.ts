import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const publicPaths: string[] = ['/login', '/register', '/reset-password'];
const adminPaths: string[] = ['/scenarios', '/users'];
const traineePaths: string[] = ['/trainer', '/analytics', '/history'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  const token: string | undefined = request.cookies.get('accessToken')?.value;

  const payload = token ? (jwt.decode(token) as { role: string; exp: number } | null) : null;

  const role: string | undefined = payload?.role;

  const isPublicPath: boolean = publicPaths.some((path) => pathname.startsWith(path));

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
    if (role === 'ADMIN' && traineePaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/scenarios', request.url));
    }
    if (role === 'TRAINEE' && adminPaths.some((path) => pathname.startsWith(path))) {
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
    return expToken < Math.floor(Date.now() / 1000);
  } catch (e) {
    return true;
  }
}
