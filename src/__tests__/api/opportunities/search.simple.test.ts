import { NextRequest } from 'next/server'
import { GET } from '@/app/api/opportunities/search/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('/api/opportunities/search - Simplified Tests', () => {
  // Mock opportunity data
  const mockOpportunities = [
    {
      id: 'opp-1',
      opportunity_name: 'Downtown Office Building',
      property_type: 'office',
      status: 'active',
      public_listing: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'opp-2',
      opportunity_name: 'Luxury Apartments',
      property_type: 'multifamily',
      status: 'active', 
      public_listing: true,
      created_at: new Date().toISOString()
    }
  ]

  let mockSupabaseClient: any

  beforeEach(() => {
    // Create a simplified mock that returns the expected data structure
    mockSupabaseClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockReturnValue({
                lte: jest.fn().mockReturnValue({
                  ilike: jest.fn().mockReturnValue({
                    or: jest.fn().mockReturnValue({
                      range: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                          order: jest.fn().mockResolvedValue({
                            data: mockOpportunities,
                            error: null,
                            count: mockOpportunities.length
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        }),
        // Count query chain - second from() call
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              count: mockOpportunities.length,
              error: null
            })
          })
        })
      })
    }

    // Make from() calls return different builders for main and count queries
    let callCount = 0
    mockSupabaseClient.from = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        // Main query chain
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          ilike: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          order: jest.fn()
            .mockReturnValueOnce({
              order: jest.fn().mockResolvedValue({
                data: mockOpportunities,
                error: null,
                count: mockOpportunities.length
              })
            })
        }
      } else {
        // Count query chain
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnThis(),
          ilike: jest.fn().mockReturnThis(),
          or: jest.fn().mockResolvedValue({
            count: mockOpportunities.length,
            error: null
          })
        }
      }
    })

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('Basic API Functionality', () => {
    it('should return opportunities with pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.opportunities).toEqual(mockOpportunities)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.total).toBe(2)
    })

    it('should handle property type filtering', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?property_type=office')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.opportunities).toBeDefined()
      expect(data.pagination).toBeDefined()
    })

    it('should handle keyword search', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?keyword=downtown')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.opportunities).toBeDefined()
      expect(data.pagination).toBeDefined()
    })

    it('should handle pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?page=2&limit=5')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(5)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Override the mock to return an error
      mockSupabaseClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
          count: 0
        })
      }))

      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch opportunities')
    })
  })
})