import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if the request is for the dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for access token in cookies
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      // Redirect to home page if no token
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}; 