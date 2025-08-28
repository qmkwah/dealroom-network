import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Initialize response that can be modified
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase server client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // Create new response with updated cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // Create new response with removed cookies
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Get current user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser()
    
    const { pathname } = request.nextUrl
    const isAuthenticated = !!user && !error
    
    // Log authentication state for debugging (remove in production)
    console.log(`[Middleware] ${pathname} - Authenticated: ${isAuthenticated}`)

    // Route Protection Logic
    
    // 1. Handle Authentication Pages First
    if (pathname.startsWith('/auth')) {
      // Special case: Always allow access to verify-email and callback
      if (pathname.includes('/verify-email') || pathname.includes('/callback')) {
        return response
      }
      
      // Redirect authenticated users away from login/register/forgot-password pages to dashboard
      if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/auth/forgot-password')) {
        console.log(`[Middleware] Redirecting authenticated user from ${pathname} to /dashboard`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // Allow unauthenticated users to access auth pages
      return response
    }

    // 2. Protect Dashboard Routes
    // Main dashboard route + all dashboard-related routes
    const protectedRoutes = [
      '/dashboard',
      '/profile'
    ]
    
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    )
    
    if (isProtectedRoute) {
      if (!isAuthenticated) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      // User is authenticated, allow access
      return response
    }

    // 3. Public routes - allow all access
    return response

  } catch (error) {
    // Handle Supabase errors gracefully
    console.error('[Middleware] Supabase error:', error)
    
    // If dashboard route and error occurred, redirect to login
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // For other routes, continue normally
    return response
  }
}

// Configure which routes middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets with file extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}