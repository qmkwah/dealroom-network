# Jest Configuration Fix and TDD Testing Strategy

## Problem Analysis

The current Jest configuration is failing because it lacks proper module name mapping for the `@/*` path aliases defined in `tsconfig.json`. The error `Cannot find module '@/lib/supabase/client'` occurs because Jest cannot resolve the `@` alias to the `./src/` directory.

**Root Cause:**
- `tsconfig.json` defines `"@/*": ["./src/*"]` path mapping
- Jest configuration is missing corresponding `moduleNameMapping` configuration
- Tests are failing in RED phase because Jest cannot find modules using `@` imports

## Jest Configuration Solution

### 1. Updated Jest Configuration

**File:** `jest.config.js`
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
    // Handle @ path alias mapping
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
  ],
  // Add transform ignore patterns for ES modules
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  // Mock CSS modules and other static assets
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 2. Enhanced Test Environment Setup

**File:** `jest.setup.js`
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/mock-path',
}))

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key'

// Mock window.location for redirect tests
delete window.location
window.location = {
  href: '',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
}

// Suppress console errors during testing
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
```

### 3. Additional Dependencies for Complete Testing

**Required packages for advanced mocking:**
```bash
pnpm add -D identity-obj-proxy @types/node
```

## Mock Strategies for Authentication Components

### 1. Supabase Client Mocking Strategy

**Comprehensive Supabase Mock Pattern:**
```typescript
// Mock pattern used in all tests
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      exchangeCodeForSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  })),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      exchangeCodeForSession: jest.fn(),
    },
  })),
}))
```

### 2. Next.js Component Mocking

**Toast and UI Component Mocks:**
```typescript
// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Mock Shadcn/ui components if needed
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props) => <input {...props} />,
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }) => <label {...props}>{children}</label>,
}))
```

### 3. Form Validation Mocking

**React Hook Form Integration:**
```typescript
// Mock react-hook-form for predictable form testing
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    register: jest.fn((name) => ({
      name,
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
    })),
    handleSubmit: (fn) => (e) => {
      e.preventDefault()
      fn()
    },
    formState: {
      errors: {},
      isSubmitting: false,
      isValid: true,
    },
    setValue: jest.fn(),
    getValues: jest.fn(),
    watch: jest.fn(),
  }),
}))
```

## Test Execution Strategy

### 1. TDD Phase Management

**RED Phase Verification (All tests should fail):**
```bash
# Run tests to ensure they fail initially
pnpm test --verbose --no-cache

# Expected output: All tests failing due to missing implementations
# Tests should fail with meaningful error messages
```

**GREEN Phase Verification (Making tests pass):**
```bash
# Run tests after implementation
pnpm test --verbose --coverage

# Expected output: All tests passing
# Coverage should be >90% for authentication system
```

**REFACTOR Phase Verification:**
```bash
# Run tests after code improvements
pnpm test --verbose --watch

# Tests should continue passing during refactoring
```

### 2. Test Categories and Execution Order

**Unit Tests (Run first):**
```bash
# Test individual functions and utilities
pnpm test src/__tests__/lib/

# Test validation schemas
pnpm test src/__tests__/lib/validations/

# Test authentication helpers
pnpm test src/__tests__/lib/auth/
```

**Component Tests (Run second):**
```bash
# Test form components in isolation
pnpm test src/__tests__/components/auth/

# Test authentication context
pnpm test src/__tests__/lib/auth/AuthContext.test.tsx
```

**API Route Tests (Run third):**
```bash
# Test authentication API endpoints
pnpm test src/__tests__/api/auth/
```

**Integration Tests (Run last):**
```bash
# Test complete authentication flows
pnpm test src/__tests__/integration/

# Test middleware functionality
pnpm test src/__tests__/middleware/
```

### 3. Coverage Requirements and Quality Gates

**Coverage Thresholds:**
```javascript
// Add to jest.config.js
const customJestConfig = {
  // ... existing config
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/components/auth/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/app/api/auth/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}
```

**Quality Verification Commands:**
```bash
# Full test suite with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch

# Run specific test file
pnpm test LoginForm.test.tsx

# Run tests matching pattern
pnpm test --testNamePattern="login"

# Run tests with detailed output
pnpm test --verbose --detectOpenHandles
```

## TDD Completion Checklist

### Phase 1: Jest Configuration Fix ✅

**Immediate Actions:**
- [ ] Update `jest.config.js` with proper `moduleNameMapping`
- [ ] Enhance `jest.setup.js` with comprehensive mocks
- [ ] Install additional testing dependencies
- [ ] Verify Jest can resolve `@/lib/supabase/client` imports
- [ ] Run test suite to confirm configuration fix

**Verification Command:**
```bash
pnpm test --verbose --no-cache 2>&1 | head -10
```
*Expected: Tests should run without "Cannot find module" errors*

### Phase 2: RED to GREEN Transition

**Current State Analysis:**
- ✅ All failing tests written (RED phase complete)
- ✅ API routes implemented (login, register, logout, callback)
- ✅ Form components implemented (LoginForm, RegisterForm)
- 🚧 Path resolution preventing test execution
- 🚧 Tests need to transition from RED to GREEN

**GREEN Phase Tasks:**
- [ ] Fix Jest path resolution (immediate priority)
- [ ] Run full test suite to identify any remaining implementation gaps
- [ ] Address any failing tests with targeted implementations
- [ ] Verify all authentication flows work end-to-end
- [ ] Achieve >90% test coverage

**Implementation Status Check:**
```bash
# After Jest fix, run comprehensive test to see current state
pnpm test --coverage --verbose
```

### Phase 3: Authentication System Completion

**Critical Components Status:**
- ✅ **Supabase SSR Clients**: Enhanced clients implemented
- ✅ **Zod Validation Schemas**: Authentication schemas created
- ✅ **API Routes**: All 4 auth routes implemented (login, register, logout, callback)
- ✅ **Form Components**: LoginForm and RegisterForm implemented
- 🚧 **Authentication Pages**: Need login/register pages using components
- 🚧 **Route Protection Middleware**: Need middleware.ts implementation
- 🚧 **Database Schema**: Need Supabase schema and RLS policies
- 🚧 **Test Integration**: Need path resolution fix for test execution

**Remaining Implementation (Post Jest Fix):**
1. **Authentication Pages** (1 hour):
   - `src/app/(auth)/login/page.tsx`
   - `src/app/(auth)/register/page.tsx`
   - `src/app/(auth)/verify-email/page.tsx`

2. **Route Protection Middleware** (1 hour):
   - `src/middleware.ts` - Dashboard route protection

3. **Database Schema Setup** (1 hour):
   - Supabase user profiles tables
   - Row Level Security policies
   - Database triggers for user registration

4. **Final Test Verification** (1 hour):
   - Complete test suite execution
   - End-to-end flow testing
   - Coverage verification

### Phase 4: Quality Assurance

**Test Quality Metrics:**
- [ ] All unit tests passing (100%)
- [ ] All component tests passing (100%)
- [ ] All API route tests passing (100%)
- [ ] All integration tests passing (100%)
- [ ] Code coverage >90% overall
- [ ] Authentication component coverage >95%
- [ ] No failing or skipped tests
- [ ] No test warnings or errors

**Production Readiness Checks:**
- [ ] Authentication flows work in development
- [ ] Form validation working properly
- [ ] Error handling providing good UX
- [ ] Loading states implemented
- [ ] Role-based access control functional
- [ ] Email verification flow operational
- [ ] Session persistence across page refreshes
- [ ] Logout clearing sessions properly

## Implementation Commands

### Immediate Fix (15 minutes)

**Step 1: Fix Jest Configuration**
```bash
# Update jest.config.js with proper moduleNameMapping
# Update jest.setup.js with comprehensive mocks
# Install additional dependencies if needed
pnpm add -D identity-obj-proxy @types/node
```

**Step 2: Verify Fix**
```bash
# Test the configuration fix
pnpm test --verbose --no-cache
# Should run tests without path resolution errors
```

**Step 3: Assess Current Status**
```bash
# Run full test suite to see which tests pass/fail
pnpm test --coverage --verbose
# Identify any remaining implementation gaps
```

### Long-term TDD Completion (4 hours)

**Hour 1: Jest Fix & Test Execution**
- Fix Jest configuration
- Run complete test suite
- Address any immediate test failures

**Hour 2: Authentication Pages**
- Implement login/register pages
- Test page rendering and navigation
- Verify component integration

**Hour 3: Route Protection & Middleware**
- Implement authentication middleware
- Test protected route access
- Verify redirect functionality

**Hour 4: Database Setup & Final Testing**
- Configure Supabase schema and RLS
- Run complete end-to-end testing
- Verify production readiness

## Success Criteria

### Immediate Success (Jest Fix)
✅ **Jest Configuration Working When:**
1. `pnpm test` runs without "Cannot find module" errors
2. Tests can import from `@/lib/supabase/client` successfully
3. Mock strategies working for Supabase and Next.js components
4. Test suite executes completely (pass or fail based on implementation)

### Complete TDD Success
✅ **Authentication System Complete When:**
1. All authentication tests pass (100% pass rate)
2. Users can register with email verification
3. Users can login/logout successfully
4. Role-based access control works
5. Password reset flow functional
6. Protected routes redirect correctly
7. Authentication state persists across sessions
8. Test coverage >90% on authentication code
9. No TypeScript errors in authentication components
10. Production-ready authentication system deployed

## Notes for Implementation

**Critical Path:**
1. **IMMEDIATE**: Fix Jest path resolution (blocks all testing)
2. **Next**: Run test suite to assess current GREEN phase status
3. **Then**: Complete remaining authentication components
4. **Finally**: Full end-to-end testing and production deployment

**Dependencies:**
- Jest configuration fix enables all subsequent testing
- Authentication pages depend on working forms (✅ complete)
- Route protection depends on Supabase auth (✅ complete)
- Database schema required for user registration flow

**Risk Mitigation:**
- Jest fix is straightforward configuration update
- All core authentication logic already implemented
- Test framework provides immediate feedback on implementation quality
- TDD approach ensures robust, well-tested authentication system