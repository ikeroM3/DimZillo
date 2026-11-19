import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const isAuth = token ? !!(await verifyToken(token)) : false;

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (!isAuth && pathname.startsWith('/home')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/home', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/login', '/register'],
};
