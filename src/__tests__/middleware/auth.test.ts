/**
 * Authentication Middleware Tests
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Mock NextResponse
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server')
  return {
    ...actual,
    NextRequest: actual.NextRequest,
    NextResponse: {
      next: jest.fn(),
      redirect: jest.fn(),
    },
  }
})

// Mock Supabase SSR
const mockGetUser = jest.fn()
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

// Mock console.log to prevent test output noise
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

// Import the middleware
import { middleware } from '../../../middleware'

const mockNext = (NextResponse as any).next
const mockRedirect = (NextResponse as any).redirect

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockNext.mockReturnValue({
      status: 200,
      headers: { get: () => null },
      cookies: { set: jest.fn() }
    })
    
    mockRedirect.mockReturnValue({
      status: 302,
      headers: { get: (name: string) => name === 'location' ? '/auth/login' : null }
    })
  })

  it('should protect dashboard routes from unauthenticated users', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = new NextRequest('http://localhost/dashboard')
    const response = await middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/auth/login'
    }))
  })

  it('should allow authenticated users to access dashboard', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123', email: 'test@example.com' } }, 
      error: null 
    })

    const request = new NextRequest('http://localhost/dashboard')
    const response = await middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should redirect authenticated users away from auth pages', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123', email: 'test@example.com' } }, 
      error: null 
    })

    const request = new NextRequest('http://localhost/auth/login')
    const response = await middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/dashboard'
    }))
  })

  it('should allow unauthenticated users to access auth pages', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = new NextRequest('http://localhost/auth/login')
    const response = await middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should allow access to email verification for authenticated users', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123', email: 'test@example.com' } }, 
      error: null 
    })

    const request = new NextRequest('http://localhost/auth/verify-email')
    const response = await middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should not interfere with API routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = new NextRequest('http://localhost/api/auth/login')
    const response = await middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should not interfere with static assets', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = new NextRequest('http://localhost/_next/static/image.png')
    const response = await middleware(request)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('should handle cookie management correctly', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'user-123', email: 'test@example.com' } }, 
      error: null 
    })

    const request = new NextRequest('http://localhost/dashboard')
    request.cookies.set('supabase-auth-token', 'valid-token')
    
    const response = await middleware(request)

    expect(response).toBeDefined()
    expect(mockNext).toHaveBeenCalled()
  })

  it('should handle Supabase client errors gracefully', async () => {
    mockGetUser.mockRejectedValue(new Error('Supabase connection error'))

    const request = new NextRequest('http://localhost/dashboard')
    const response = await middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/auth/login'
    }))
  })
})