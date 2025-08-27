import '@testing-library/jest-dom'

// Mock Next.js server runtime for middleware and API routes
global.Request = global.Request || class Request {
  constructor(url, init) {
    this.url = url
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.cookies = new Map()
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

// Mock Supabase environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key'

// Mock window.location for redirect tests
delete global.window.location
global.window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
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