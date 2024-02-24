import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const user = await supabase.auth.getUser()
  if (user) {
    await supabase.auth.refreshSession()
  }

  // Redirect to home if logged in and trying to access login or signup
  const url = new URL(req.url)
  const { pathname } = url

  if (!user && (url.pathname === '/login' || url.pathname === '/signup')) {
    url.pathname = '/'; // Change path to home if logged in
    return NextResponse.redirect(url);
  }

  return res
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}