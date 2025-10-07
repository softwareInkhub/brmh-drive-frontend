import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname, href } = req.nextUrl;

  // Allow public files, API routes, and debug pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/debug-auth') ||
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
    console.log('[Drive Middleware] ✅ User authenticated via SSO cookies, allowing access');
    
    // Create response and set a non-httpOnly auth flag cookie so client-side knows user is authenticated
    const response = NextResponse.next();
    
    // Set a client-readable flag (not httpOnly) so client-side code knows auth is valid
    // Use sameSite: 'lax' for same-site subdomains
    response.cookies.set('auth_valid', '1', {
      path: '/',
      domain: '.brmh.in',
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false, // Important: client-side can read this
    });
    
    console.log('[Drive Middleware] ✅ Set auth_valid flag for client-side');
    
    return response;
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
