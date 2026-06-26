import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  let response = await updateSession(request)
  
  // Track affiliate referrals
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref) {
    // Cookie expires in 30 days
    response.cookies.set('247billz_ref', ref, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
