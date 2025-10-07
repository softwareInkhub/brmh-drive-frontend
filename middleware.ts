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

  // For localhost development, COMPLETELY BYPASS middleware auth
  // Let client-side AuthGuard handle everything
  const isLocalhost = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1';
  if (isLocalhost) {
    console.log('[Drive Middleware] 🏠 Localhost detected - BYPASSING all middleware auth checks');
    console.log('[Drive Middleware] ✅ Client-side AuthGuard will handle authentication');
    return NextResponse.next();
  }

  // Production only: Check for auth token in cookies
  const idToken = req.cookies.get('id_token')?.value;
  const accessToken = req.cookies.get('access_token')?.value;
  
  if (idToken || accessToken) {
    console.log('[Drive Middleware] User authenticated (cookies), allowing access');
    return NextResponse.next();
  }

  // Avoid redirect loops for callback routes
  if (pathname.startsWith('/callback') || pathname.startsWith('/auth')) {
    console.log('[Drive Middleware] Callback/auth route, allowing access');
    return NextResponse.next();
  }

  // Redirect to auth page with return URL (production only)
  const nextUrl = encodeURIComponent(href);
  console.log('[Drive Middleware] No auth token found, redirecting to auth page');
  return NextResponse.redirect(`https://auth.brmh.in/login?next=${nextUrl}`);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
