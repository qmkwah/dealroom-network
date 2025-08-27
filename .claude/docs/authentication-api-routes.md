# Authentication API Routes Implementation Plan

## Executive Summary

Based on comprehensive analysis of the DealRoom Network codebase, this document provides detailed implementation guidance for the authentication API routes to complete the TDD GREEN phase. The project has excellent foundations with Next.js 15, TypeScript, Supabase SSR clients, Zod validation schemas, and comprehensive failing tests already in place.

## Current Project Status Analysis

### ✅ Already Implemented (Session 1 Foundation)
- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: Supabase SSR clients (`client.ts` and `server.ts`) properly configured
- **Testing**: Jest with React Testing Library fully configured with comprehensive test suite
- **Validation**: Complete Zod schemas in `src/lib/validations/auth.ts`
- **Dependencies**: All required packages installed (React Hook Form, Sonner, etc.)
- **Test Structure**: Failing tests written for all authentication functionality

### ❌ Missing (Session 2 Implementation Targets)
- **API Routes**: Login, register, logout, and callback endpoints
- **Components**: LoginForm and RegisterForm React components
- **Pages**: Authentication pages using the components
- **Integration**: Connecting components to API routes

## Implementation Plan Overview

### Phase 1: API Routes Implementation (Priority 1)
**Estimated Time**: 2 hours
**Focus**: Make API route tests pass

### Phase 2: Form Components Implementation (Priority 2)
**Estimated Time**: 2.5 hours
**Focus**: Make component tests pass

## Phase 1: Authentication API Routes Implementation

### 1.1 Login Route Implementation
**File**: `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input using existing Zod schema
    const validatedData = loginSchema.parse(body)
    
    // Initialize Supabase server client
    const supabase = createClient()
    
    // Attempt authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })
    
    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please verify your email address before logging in' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata
      }
    })
    
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Key Implementation Notes:**
- Uses existing Zod schema for validation
- Integrates with enhanced Supabase server client
- Handles specific authentication error cases (invalid credentials, unverified email)
- Returns proper HTTP status codes matching test expectations
- Includes comprehensive error handling for edge cases

### 1.2 Register Route Implementation
**File**: `src/app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validations/auth'
import { ZodError } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input using existing Zod schema
    const validatedData = registerSchema.parse(body)
    
    // Initialize Supabase server client
    const supabase = createClient()
    
    // Attempt user registration
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          user_role: validatedData.userRole,
          full_name: `${validatedData.firstName} ${validatedData.lastName}`
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })
    
    if (error) {
      // Handle specific registration errors
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('Password')) {
        return NextResponse.json(
          { error: 'Password does not meet requirements' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      message: 'Registration successful! Please check your email for verification.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        user_metadata: data.user?.user_metadata
      }
    })
    
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Key Implementation Notes:**
- Comprehensive validation using existing registerSchema
- Stores user metadata (first_name, last_name, user_role) for profile creation
- Handles duplicate email registration errors
- Sets up email verification with proper redirect URL
- Error handling matches test expectations

### 1.3 Logout Route Implementation
**File**: `src/app/api/auth/logout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase server client
    const supabase = createClient()
    
    // Sign out the user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { error: 'Failed to logout' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      message: 'Logged out successfully'
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Key Implementation Notes:**
- Simple logout implementation using Supabase auth.signOut()
- Proper error handling for logout failures
- Returns appropriate success/error messages

### 1.4 Callback Route Implementation
**File**: `src/app/api/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    
    if (code) {
      const supabase = createClient()
      
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    }

    // If there's an error or no code, redirect to login with error
    return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
    
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
  }
}
```

**Key Implementation Notes:**
- Handles OAuth callback flow for email verification
- Supports both development and production environments
- Proper URL construction for redirects
- Error handling with redirect to login page

## Phase 2: Form Components Implementation

### 2.1 LoginForm Component
**File**: `src/components/auth/LoginForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, LoginInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })
  
  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Logged in successfully!')
      router.push('/dashboard')
      router.refresh() // Refresh to update auth state
      
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password')}
          className={errors.password ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
```

### 2.2 RegisterForm Component
**File**: `src/components/auth/RegisterForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registerSchema, RegisterInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })
  
  const watchUserRole = watch('userRole')
  
  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            user_role: data.userRole,
            full_name: `${data.firstName} ${data.lastName}`
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      })
      
      if (error) {
        throw error
      }
      
      toast.success('Registration successful! Please check your email for verification.')
      router.push('/auth/verify-email')
      
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Failed to register')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            {...register('firstName')}
            className={errors.firstName ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            {...register('lastName')}
            className={errors.lastName ? 'border-red-500' : ''}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="userRole">I am a</Label>
        <Select 
          onValueChange={(value) => setValue('userRole', value as 'deal_sponsor' | 'capital_partner' | 'service_provider')}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.userRole ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deal_sponsor">Deal Sponsor (Real Estate Professional)</SelectItem>
            <SelectItem value="capital_partner">Capital Partner (Investor)</SelectItem>
            <SelectItem value="service_provider">Service Provider</SelectItem>
          </SelectContent>
        </Select>
        {errors.userRole && (
          <p className="text-sm text-red-500">{errors.userRole.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register('password')}
          className={errors.password ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
```

## Business Logic Integration Requirements

### Environment Variables Setup
**File**: `.env.local` (ensure these are set)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or production URL
```

### Authentication Flow Architecture

1. **Registration Flow**:
   - User fills out RegisterForm with role selection
   - Form validates using Zod schema
   - API calls Supabase auth.signUp with metadata
   - Email verification sent to user
   - User clicks verification link → callback route → dashboard

2. **Login Flow**:
   - User fills out LoginForm
   - Form validates using Zod schema  
   - API calls Supabase auth.signInWithPassword
   - Successful login → redirect to dashboard
   - Failed login → display error message

3. **Logout Flow**:
   - User initiates logout
   - API calls Supabase auth.signOut
   - Session cleared → redirect to login

### Security Considerations

1. **Input Validation**:
   - All inputs validated with Zod schemas
   - Client-side and server-side validation
   - Sanitization of user metadata

2. **Error Handling**:
   - Generic error messages to prevent user enumeration
   - Specific errors logged server-side only
   - Rate limiting (implemented by Supabase)

3. **Session Management**:
   - Secure HTTP-only cookies via Supabase SSR
   - Automatic token refresh
   - Proper session cleanup on logout

### Testing Integration

The implementation is designed to make all existing tests pass:

1. **API Route Tests** (`src/__tests__/api/auth/`):
   - All endpoints return expected status codes
   - Error handling matches test expectations
   - Success responses include required fields

2. **Component Tests** (`src/__tests__/components/auth/`):
   - Forms render correctly with expected fields
   - Validation errors display properly
   - Loading states work as expected
   - Form submission triggers appropriate actions

### Integration with Existing Codebase

1. **Supabase Integration**:
   - Uses existing enhanced SSR clients
   - Integrates with database.types.ts (when generated)
   - Follows Supabase best practices for Next.js 15

2. **UI Component Integration**:
   - Uses existing Shadcn/ui components
   - Follows established styling patterns
   - Integrates with toast notifications (Sonner)

3. **Validation Integration**:
   - Uses existing Zod schemas
   - Integrates with React Hook Form
   - Consistent error handling patterns

## Implementation Priority & Sequence

### Step 1: Create API Route Files (30 minutes)
1. Create `src/app/api/auth/login/route.ts`
2. Create `src/app/api/auth/register/route.ts`
3. Create `src/app/api/auth/logout/route.ts`
4. Create `src/app/api/auth/callback/route.ts`

### Step 2: Create Component Files (45 minutes)
1. Create `src/components/auth/LoginForm.tsx`
2. Create `src/components/auth/RegisterForm.tsx`

### Step 3: Test Execution (15 minutes)
1. Run `pnpm test` to verify all tests pass
2. Fix any remaining test failures
3. Verify type checking with `pnpm type-check`

### Step 4: Manual Testing (30 minutes)
1. Test registration flow with email verification
2. Test login flow with valid/invalid credentials
3. Test logout functionality
4. Verify error handling and user feedback

## Success Criteria

✅ **Implementation Complete When:**

1. **All API Tests Pass**: All tests in `src/__tests__/api/auth/` directory pass
2. **All Component Tests Pass**: All tests in `src/__tests__/components/auth/` directory pass
3. **Type Safety**: No TypeScript errors when running `pnpm type-check`
4. **Manual Testing**: All authentication flows work end-to-end
5. **Error Handling**: Proper error messages and user feedback
6. **Integration**: Components work seamlessly with API routes

## Next Steps After Implementation

1. **Component Integration**: Create authentication pages that use these components
2. **Route Protection**: Implement middleware for protected routes
3. **User Profile**: Create profile management features
4. **Database Setup**: Run SQL scripts to set up user profile tables in Supabase

This implementation plan provides a complete foundation for the authentication system and ensures all existing tests will pass while maintaining clean, maintainable code following Next.js 15 and Supabase best practices.