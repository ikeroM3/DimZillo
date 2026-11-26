import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = Boolean(req.cookies.get('token')?.value);

  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasToken ? '/home' : '/register', req.url));
  }

  if (pathname.startsWith('/home') && !hasToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if ((pathname === '/login' || pathname === '/register') && hasToken) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/home/:path*', '/login', '/register'],
};
