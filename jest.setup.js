import '@testing-library/jest-dom'

// Mock Next.js server runtime for middleware and API routes
global.Request = global.Request || class Request {
  constructor(url, init) {
    this.url = url
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.cookies = new Map()
    this._body = init?.body
  }
  
  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body)
    }
    return this._body
  }
  
  get(name) {
    return this.cookies.get(name)
  }
}

global.Response = global.Response || class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.headers = new Headers(init?.headers)
  }
  
  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body)
    }
    return this.body
  }
  
  static json(data, init) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    })
  }
  
  static redirect(url, status = 302) {
    return new Response(null, { status, headers: { Location: url } })
  }
}

global.NextRequest = global.Request
global.NextResponse = global.Response

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

// Mock Next.js server functions
jest.mock('next/server', () => ({
  NextRequest: global.Request,
  NextResponse: global.Response,
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => 
    Promise.resolve({
      get: jest.fn((name) => ({ value: `mock-${name}` })),
      set: jest.fn(),
      delete: jest.fn(),
    })
  ),
  headers: jest.fn(() =>
    Promise.resolve({
      get: jest.fn(),
      set: jest.fn(),
    })
  ),
}))

// Use real Supabase environment variables for database tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://uobqgpyyagmkiqpqplfa.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYnFncHl5YWdta2lxcHFwbGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjMwNzUsImV4cCI6MjA3MTg5OTA3NX0.kMnuEKlorvq5WZR93F6i_mqhJIjMcg-eXzgNLeyv_Jc'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYnFncHl5YWdta2lxcHFwbGZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMyMzA3NSwiZXhwIjoyMDcxODk5MDc1fQ.z4hcKrxrfJu7j4wCB0qtzURHM9z29vtWBvPg5wECcdk'

// Mock window.location for redirect tests (JSDOM compatible)
// Don't try to override location in setup - let JSDOM handle it
// Individual tests can mock location as needed

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