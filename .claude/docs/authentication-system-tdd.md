# Authentication System TDD Implementation Plan

## Project Analysis Summary

Based on the current codebase analysis, the project has the foundational setup complete but lacks the testing framework and authentication implementation. The current state includes:

**✅ Already Implemented:**
- Next.js 15 with App Router and TypeScript
- Supabase client/server setup (basic configuration)
- Tailwind CSS with Shadcn/ui components
- Basic project structure with auth/dashboard route groups
- Form validation dependencies (Zod, React Hook Form)
- Toast notifications (Sonner)

**❌ Missing for Authentication:**
- Jest and React Testing Library setup
- Authentication API routes
- Authentication forms and components
- Authentication middleware and route protection
- User role management system
- Email verification and password reset flows

## Test Framework Setup Required

### 1. Package Installation Requirements

**Testing Dependencies to Add:**
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/user-event": "^14.5.1",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.8",
    "msw": "^2.0.8"
  }
}
```

### 2. Jest Configuration Files Needed

**jest.config.js:**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

**jest.setup.js:**
```javascript
import '@testing-library/jest-dom'
```

**package.json scripts to add:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## TDD Implementation Phases

### Phase 1: Red Phase - Write Failing Tests (4 hours)

#### 1.1 Authentication API Routes Tests
**Location:** `src/__tests__/api/auth/`

**Files to create:**
- `login.test.ts` - Login endpoint tests
- `register.test.ts` - Registration endpoint tests  
- `logout.test.ts` - Logout endpoint tests
- `callback.test.ts` - OAuth callback tests

**Test Coverage:**
```typescript
// Example: src/__tests__/api/auth/login.test.ts
describe('/api/auth/login', () => {
  it('should authenticate valid user credentials', async () => {
    // Test valid login
  })
  
  it('should reject invalid credentials', async () => {
    // Test invalid login
  })
  
  it('should handle missing email/password', async () => {
    // Test validation errors
  })
  
  it('should handle unverified email accounts', async () => {
    // Test email verification requirement
  })
})
```

#### 1.2 Authentication Components Tests
**Location:** `src/__tests__/components/auth/`

**Files to create:**
- `LoginForm.test.tsx` - Login form component tests
- `RegisterForm.test.tsx` - Registration form component tests
- `VerifyEmailForm.test.tsx` - Email verification form tests
- `ResetPasswordForm.test.tsx` - Password reset form tests
- `RoleSelectionForm.test.tsx` - User role selection tests

**Test Coverage:**
```typescript
// Example: src/__tests__/components/auth/LoginForm.test.tsx
describe('LoginForm', () => {
  it('renders login form fields correctly', async () => {
    // Test form rendering
  })
  
  it('validates required fields', async () => {
    // Test form validation
  })
  
  it('submits form with valid data', async () => {
    // Test form submission
  })
  
  it('displays error messages for invalid input', async () => {
    // Test error handling
  })
})
```

#### 1.3 Authentication Middleware Tests
**Location:** `src/__tests__/middleware/`

**Files to create:**
- `auth.test.ts` - Authentication middleware tests
- `roleProtection.test.ts` - Role-based protection tests

#### 1.4 Authentication State Management Tests
**Location:** `src/__tests__/lib/auth/`

**Files to create:**
- `authContext.test.tsx` - Auth context provider tests
- `authHelpers.test.ts` - Authentication helper functions tests
- `roleValidation.test.ts` - Role validation logic tests

#### 1.5 Email Verification & Password Reset Tests
**Location:** `src/__tests__/api/auth/`

**Files to create:**
- `verify-email.test.ts` - Email verification endpoint tests
- `forgot-password.test.ts` - Password reset request tests
- `reset-password.test.ts` - Password reset confirmation tests

### Phase 2: Green Phase - Implementation (8 hours)

#### 2.1 Supabase Authentication Setup (1.5 hours)

**Files to implement:**
1. **Environment Variables (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. **Enhanced Supabase Client (src/lib/supabase/client.ts):**
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

3. **Enhanced Supabase Server Client (src/lib/supabase/server.ts):**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle server component cookie setting
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle server component cookie removal
          }
        },
      },
    }
  )
}
```

#### 2.2 Zod Validation Schemas (1 hour)

**File to create:** `src/lib/validations/auth.ts`
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  userRole: z.enum(['deal_sponsor', 'capital_partner', 'service_provider']),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
```

#### 2.3 Authentication API Routes (2 hours)

**Files to create in src/app/api/auth/:**

1. **login/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)
    
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ user: data.user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

2. **register/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)
    
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          user_role: validatedData.userRole,
        },
      },
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Registration successful. Please check your email for verification.',
      user: data.user 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

3. **logout/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
```

4. **callback/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
```

#### 2.4 Authentication Forms Components (2.5 hours)

**Files to create in src/components/auth/:**

1. **LoginForm.tsx:**
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
      
      if (error) throw error
      
      toast.success('Logged in successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
```

2. **RegisterForm.tsx:**
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
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })
  
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
          },
        },
      })
      
      if (error) throw error
      
      toast.success('Registration successful! Please check your email for verification.')
      router.push('/auth/verify-email')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="userRole">I am a</Label>
        <Select onValueChange={(value) => setValue('userRole', value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deal_sponsor">Deal Sponsor</SelectItem>
            <SelectItem value="capital_partner">Capital Partner (Investor)</SelectItem>
            <SelectItem value="service_provider">Service Provider</SelectItem>
          </SelectContent>
        </Select>
        {errors.userRole && (
          <p className="text-sm text-red-500 mt-1">{errors.userRole.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  )
}
```

#### 2.5 Authentication Pages (1 hour)

**Files to create in src/app/(auth)/:**

1. **login/page.tsx:**
```typescript
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your DealRoom account</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center space-y-2">
          <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot your password?
          </Link>
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

2. **register/page.tsx:**
```typescript
import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Join DealRoom Network</h1>
          <p className="text-gray-600">Create your professional account</p>
        </div>
        
        <RegisterForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

#### 2.6 Authentication Middleware & Route Protection (1 hour)

**File to create:** `src/middleware.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
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

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (user && !request.nextUrl.pathname.includes('verify-email')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Phase 3: Refactor Phase - Code Quality Improvements

#### 3.1 Authentication Context Provider

**File to create:** `src/lib/auth/AuthContext.tsx`
```typescript
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## Database Schema Requirements

### 1. User Profiles Tables Setup

**SQL to run in Supabase:**

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  user_role TEXT CHECK (user_role IN ('deal_sponsor', 'capital_partner', 'service_provider')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, user_role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'user_role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Row Level Security policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Role-Specific Profile Tables

```sql
-- Deal Sponsor Profiles
CREATE TABLE public.deal_sponsor_profiles (
  id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  title TEXT,
  years_experience INTEGER,
  specialties TEXT[],
  track_record JSONB,
  aum_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Capital Partner Profiles  
CREATE TABLE public.capital_partner_profiles (
  id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  investor_type TEXT CHECK (investor_type IN ('individual', 'family_office', 'fund', 'institution')),
  investment_range_min BIGINT,
  investment_range_max BIGINT,
  preferred_markets TEXT[],
  investment_criteria JSONB,
  accredited_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Service Provider Profiles
CREATE TABLE public.service_provider_profiles (
  id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  service_categories TEXT[],
  description TEXT,
  certifications TEXT[],
  service_areas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

## Test Execution Strategy

### 1. Running Tests in TDD Cycle

**Red Phase Verification:**
```bash
pnpm test
# Should show all tests failing initially
```

**Green Phase Verification:**
```bash
pnpm test
# Should show all tests passing after implementation
```

**Coverage Requirements:**
```bash
pnpm test:coverage
# Should achieve >90% coverage on auth components
```

### 2. Test Categories

**Unit Tests:**
- Form validation
- Helper functions
- API route handlers
- Authentication utilities

**Integration Tests:**
- Login/logout flows
- Registration with database
- Role-based access control
- Email verification process

**Component Tests:**
- Form rendering and interaction
- Error state handling
- Loading states
- User feedback (toasts)

## Implementation Checklist

### Pre-Implementation Setup
- [ ] Install testing dependencies
- [ ] Create Jest configuration files
- [ ] Setup test directory structure
- [ ] Configure test scripts in package.json

### Red Phase (4 hours)
- [ ] Write API route tests (1 hour)
- [ ] Write component tests (1.5 hours)
- [ ] Write middleware tests (0.5 hours)
- [ ] Write authentication helper tests (1 hour)
- [ ] Verify all tests fail

### Green Phase (8 hours)
- [ ] Setup enhanced Supabase clients (1.5 hours)
- [ ] Create validation schemas (1 hour)
- [ ] Implement API routes (2 hours)
- [ ] Create authentication forms (2.5 hours)
- [ ] Build authentication pages (1 hour)
- [ ] Implement middleware and route protection (1 hour)
- [ ] Verify all tests pass

### Refactor Phase
- [ ] Create authentication context
- [ ] Improve error handling
- [ ] Add loading states optimization
- [ ] Ensure code maintainability
- [ ] Verify all tests still pass

### Database Setup
- [ ] Run SQL schema setup in Supabase
- [ ] Configure RLS policies
- [ ] Test user registration flow
- [ ] Generate TypeScript types

### Final Verification
- [ ] All tests passing
- [ ] Authentication flows working
- [ ] Role-based access functional
- [ ] Email verification operational
- [ ] Password reset working

## Success Criteria

✅ **Feature Complete When:**
1. All authentication tests pass (100% test suite)
2. Users can register with email verification
3. Users can login/logout successfully
4. Role-based access control works
5. Password reset flow functional
6. Protected routes redirect correctly
7. Authentication state persists across sessions
8. Test coverage >90% on authentication code

This comprehensive plan ensures a complete TDD implementation of the authentication system with all required features and robust testing coverage.