# Authentication Middleware Implementation Plan

## Executive Summary

Based on comprehensive analysis of the DealRoom Network codebase and existing authentication infrastructure, this document provides detailed implementation guidance for Next.js 15 middleware to handle route protection and authentication state management. The project has excellent foundations with enhanced Supabase SSR clients, comprehensive failing tests, and API routes already implemented.

## Current Project Status Analysis

### ✅ Already Implemented (Sessions 1-3 Foundation)
- **Framework**: Next.js 15 with App Router and TypeScript
- **Authentication Infrastructure**: Enhanced Supabase SSR clients (client.ts and server.ts) 
- **API Routes**: Complete authentication API implementation (login, register, logout, callback)
- **Form Components**: LoginForm and RegisterForm with validation
- **Test Framework**: Comprehensive middleware tests written and failing (RED phase)
- **Route Structure**: Organized auth and dashboard route groups

### ❌ Missing (Session 3 Implementation Target)
- **Middleware Implementation**: `src/middleware.ts` or `middleware.ts` file
- **Route Protection Logic**: Authentication-based access control
- **Cookie Management**: Proper session handling in middleware context
- **Redirect Logic**: Smart redirection based on authentication state

## Middleware Implementation Requirements

### 1. File Location Analysis

**Correct Location**: `middleware.ts` (root level, not in src/)
- Next.js 15 requires middleware at project root
- Must be named exactly `middleware.ts`
- Existing tests expect this location with import path `@/middleware`

### 2. Route Protection Strategy

**Protected Routes:**
- `/dashboard/*` - Requires authentication
- All dashboard sub-routes (opportunities, investors, inquiries, partnerships, messages, profile)

**Public Routes:**
- `/auth/*` - Authentication pages (with smart redirects)
- `/api/*` - API routes (handled separately)
- `/_next/*` - Next.js static assets
- Static assets (images, favicon, etc.)
- Landing page `/`

**Special Cases:**
- `/auth/verify-email` - Allow access even when authenticated
- `/auth/callback` - OAuth callback handling
- Authenticated users on `/auth/login` or `/auth/register` → redirect to `/dashboard`

## Complete Middleware Implementation

### Core Implementation
**File**: `middleware.ts`

```typescript
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
    
    // 1. Protect Dashboard Routes
    if (pathname.startsWith('/dashboard')) {
      if (!isAuthenticated) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      // User is authenticated, allow access
      return response
    }

    // 2. Handle Authentication Pages  
    if (pathname.startsWith('/auth')) {
      // Special case: Always allow access to verify-email and callback
      if (pathname.includes('/verify-email') || pathname.includes('/callback')) {
        return response
      }
      
      // Redirect authenticated users away from login/register pages
      if (isAuthenticated && (pathname.includes('/login') || pathname.includes('/register'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // Allow unauthenticated users to access auth pages
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
```

## Business Logic Integration

### 1. Supabase SSR Integration

**Authentication State Management:**
```typescript
// Enhanced user authentication check
const { data: { user }, error } = await supabase.auth.getUser()

// Check for both user existence and absence of errors
const isAuthenticated = !!user && !error

// Handle various authentication states
if (error) {
  // Log error for debugging
  console.error('[Middleware] Auth error:', error.message)
  
  // Treat as unauthenticated for security
  // Redirect protected routes to login
}
```

**Cookie Management Integration:**
```typescript
// Proper cookie handling for Supabase sessions
cookies: {
  get(name: string) {
    return request.cookies.get(name)?.value
  },
  set(name: string, value: string, options: any) {
    // Important: Create new response to preserve cookie changes
    response = NextResponse.next({
      request: { headers: request.headers },
    })
    response.cookies.set({ name, value, ...options })
  },
  remove(name: string, options: any) {
    response = NextResponse.next({
      request: { headers: request.headers },
    })
    response.cookies.set({ name, value: '', ...options })
  },
}
```

### 2. Smart Redirection Logic

**Dashboard Protection:**
```typescript
// Protect all dashboard routes
if (pathname.startsWith('/dashboard')) {
  if (!isAuthenticated) {
    // Preserve intended destination for post-login redirect
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }
}
```

**Authentication Page Handling:**
```typescript
// Smart auth page redirects
if (pathname.startsWith('/auth')) {
  // Always allow verification and callback
  if (pathname.includes('/verify-email') || pathname.includes('/callback')) {
    return response
  }
  
  // Redirect authenticated users away from login/register
  if (isAuthenticated && (pathname.includes('/login') || pathname.includes('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}
```

**Post-Login Redirect Handling:**
```typescript
// In login page component, handle redirectTo parameter
const searchParams = useSearchParams()
const redirectTo = searchParams.get('redirectTo') || '/dashboard'

// After successful login
router.push(redirectTo)
```

### 3. Error Handling Strategy

**Graceful Error Handling:**
```typescript
try {
  const { data: { user }, error } = await supabase.auth.getUser()
  // ... authentication logic
} catch (error) {
  console.error('[Middleware] Supabase error:', error)
  
  // Security-first approach: treat errors as unauthenticated
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  return response // Allow public routes to continue
}
```

## Integration with Existing Authentication System

### 1. API Routes Integration

**Session Management:**
- Middleware handles route protection
- API routes handle authentication actions (login, logout, register)
- Cookie management shared between middleware and API routes via Supabase SSR

**Authentication Flow:**
1. User submits login form → `/api/auth/login`
2. API sets authentication cookies via Supabase
3. Middleware reads cookies on subsequent requests
4. Route protection applied based on authentication state

### 2. Component Integration

**Login Form Enhancement:**
```typescript
// Enhanced login form with redirect handling
const searchParams = useSearchParams()
const redirectTo = searchParams.get('redirectTo')

const onSubmit = async (data: LoginInput) => {
  // ... existing login logic
  
  if (success) {
    // Redirect to intended destination or dashboard
    router.push(redirectTo || '/dashboard')
  }
}
```

**Authentication Context Integration:**
```typescript
// Use middleware protection in combination with context
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      // Middleware should handle this, but add client-side backup
      router.push('/auth/login')
    }
  }, [user, loading, router])
  
  return { user, loading }
}
```

### 3. Testing Integration

**Making Tests Pass:**

The existing tests in `src/__tests__/middleware/auth.test.ts` expect specific behavior:

1. **Protected Routes Test:**
```typescript
// Test expects 302 redirect for unauthenticated dashboard access
it('should protect dashboard routes from unauthenticated users', async () => {
  // Mock unauthenticated state
  mockSupabase.auth.getUser.mockResolvedValue({ 
    data: { user: null }, 
    error: null 
  })
  
  const request = new NextRequest('http://localhost/dashboard')
  const response = await middleware(request)
  
  expect(response.status).toBe(302)
  expect(response.headers.get('location')).toContain('/auth/login')
})
```

2. **Authentication Bypass Test:**
```typescript
// Test expects non-redirect for authenticated users
it('should allow authenticated users to access dashboard', async () => {
  // Mock authenticated state
  mockSupabase.auth.getUser.mockResolvedValue({ 
    data: { user: { id: 'user-id' } }, 
    error: null 
  })
  
  const request = new NextRequest('http://localhost/dashboard')
  const response = await middleware(request)
  
  expect(response.status).not.toBe(302)
})
```

## Security Considerations

### 1. Authentication Security

**Token Validation:**
- Relies on Supabase JWT validation
- Server-side verification of tokens
- Automatic token refresh handling

**Cookie Security:**
- HTTP-only cookies for session management
- Secure cookie attributes in production
- Proper cookie domain and path settings

### 2. Route Security

**Defense in Depth:**
- Middleware provides first line of defense
- API routes have additional authentication checks
- Client-side components include authentication guards

**CSRF Protection:**
- Supabase handles CSRF token management
- Middleware doesn't interfere with API routes
- Form submissions protected by Supabase auth

### 3. Error Handling Security

**Information Disclosure Prevention:**
```typescript
// Don't expose detailed error information
catch (error) {
  // Log detailed error server-side
  console.error('[Middleware] Auth error:', error)
  
  // Return generic response to client
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}
```

## Performance Optimization

### 1. Middleware Performance

**Efficient User Lookup:**
```typescript
// Use efficient Supabase getUser() method
// Cached by Supabase SSR implementation
const { data: { user }, error } = await supabase.auth.getUser()
```

**Smart Route Matching:**
```typescript
// Efficient route matching with early returns
if (pathname.startsWith('/dashboard')) {
  // Handle protected routes
  return handleProtectedRoute()
}

if (pathname.startsWith('/auth')) {
  // Handle auth routes  
  return handleAuthRoute()
}

// Default: allow public access
return response
```

### 2. Cookie Optimization

**Minimal Cookie Operations:**
```typescript
// Only create new response when cookies need updating
let response = NextResponse.next({ request: { headers: request.headers } })

// Supabase SSR only updates cookies when necessary
// Middleware preserves existing cookie behavior
```

### 3. Static Asset Exclusion

**Comprehensive Asset Exclusion:**
```typescript
export const config = {
  matcher: [
    // Exclude all static assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Implementation Steps & Timeline

### Step 1: Create Middleware File (15 minutes)
1. **Create** `middleware.ts` in project root
2. **Implement** basic structure with Supabase integration
3. **Add** route protection logic
4. **Configure** route matcher

### Step 2: Test Implementation (15 minutes)
1. **Run** existing middleware tests: `pnpm test src/__tests__/middleware/auth.test.ts`
2. **Verify** all tests pass (transition from RED to GREEN phase)
3. **Fix** any test failures or implementation issues

### Step 3: Manual Testing (15 minutes)
1. **Test** unauthenticated dashboard access → redirects to login
2. **Test** authenticated user on login page → redirects to dashboard  
3. **Test** protected routes work correctly
4. **Test** static assets load without interference

### Step 4: Integration Testing (15 minutes)
1. **Verify** login flow with redirectTo parameter works
2. **Test** logout redirects work correctly
3. **Ensure** no interference with API routes
4. **Validate** cookie management works properly

## Success Criteria

✅ **Implementation Complete When:**

1. **All Middleware Tests Pass**: All tests in `src/__tests__/middleware/auth.test.ts` pass
2. **Route Protection Works**: Unauthenticated users redirected from `/dashboard/*`
3. **Smart Redirects Function**: Authenticated users redirected from `/auth/login` and `/auth/register`
4. **Special Cases Handled**: `/auth/verify-email` and `/auth/callback` accessible
5. **No API Interference**: API routes and static assets unaffected
6. **Error Handling**: Graceful handling of Supabase errors
7. **Cookie Management**: Proper session handling with Supabase SSR
8. **Performance**: No significant impact on page load times

## Integration with Session Context

This middleware implementation integrates seamlessly with:

- **Existing API Routes**: Login, register, logout, callback endpoints
- **Authentication Forms**: LoginForm and RegisterForm components  
- **Supabase SSR Clients**: Enhanced client and server configurations
- **Test Framework**: Makes all existing middleware tests pass
- **Route Structure**: Protects dashboard routes, manages auth routes

## Next Steps After Implementation

1. **Database Schema**: Set up user profile tables and RLS policies
2. **User Profile Creation**: Implement profile completion flows
3. **Role-Based Access**: Extend middleware for role-specific protection
4. **Session Management**: Add session timeout and refresh handling

This middleware implementation provides a complete, production-ready solution for authentication and route protection in the DealRoom Network application, ensuring all existing tests pass while maintaining security, performance, and user experience standards.