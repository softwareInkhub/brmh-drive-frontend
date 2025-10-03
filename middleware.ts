import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname, href } = req.nextUrl;

  // Allow public files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Allow auth-related routes to prevent redirect loops
  if (
    pathname.startsWith('/callback') || 
    pathname.startsWith('/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookies (primary SSO method)
  const idToken = req.cookies.get('id_token')?.value;
  const accessToken = req.cookies.get('access_token')?.value;
  
  if (idToken || accessToken) {
    console.log('[Drive Middleware] User authenticated via cookies, allowing access');
    return NextResponse.next();
  }

  // Redirect to centralized auth with return URL
  const nextUrl = encodeURIComponent(href);
  console.log('[Drive Middleware] No auth token found, redirecting to centralized auth');
  return NextResponse.redirect(`https://auth.brmh.in/login?next=${nextUrl}`);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
