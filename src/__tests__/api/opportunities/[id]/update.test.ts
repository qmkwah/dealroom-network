import { NextRequest } from 'next/server'
import { PUT } from '@/app/api/opportunities/[id]/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('/api/opportunities/[id] - PUT', () => {
  const mockUpdate = jest.fn(() => ({
    eq: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: {
            id: 'test-opportunity-id',
            opportunity_name: 'Updated Name'
          },
          error: null
        }))
      }))
    }))
  }))

  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-opportunity-id',
              sponsor_id: 'user-123',
              opportunity_name: 'Original Name'
            },
            error: null
          }))
        }))
      })),
      update: mockUpdate
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'user-123' } },
        error: null
      }))
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Successful Update', () => {
    it('should update opportunity when owner makes valid request', async () => {
      const requestData = {
        opportunity_name: 'Updated Office Building',
        opportunity_description: 'Updated description',
        total_project_cost: 3000000,
        equity_requirement: 750000,
        minimum_investment: 50000,
        projected_irr: 0.15
      }

      const request = new NextRequest('http://localhost:3000/api/opportunities/test-opportunity-id', {
        method: 'PUT',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request, { params: { id: 'test-opportunity-id' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('test-opportunity-id')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('investment_opportunities')
    })
  })

  describe('Authorization', () => {
    it('should reject update from non-owner', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'different-user-id' } },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/opportunities/test-opportunity-id', {
        method: 'PUT',
        body: JSON.stringify({ opportunity_name: 'Hacked Name' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request, { params: { id: 'test-opportunity-id' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized: You can only update your own opportunities')
    })

    it('should reject update from unauthenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/opportunities/test-opportunity-id', {
        method: 'PUT',
        body: JSON.stringify({ opportunity_name: 'Anonymous Update' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request, { params: { id: 'test-opportunity-id' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Validation', () => {
    it('should reject update with invalid data', async () => {
      const invalidData = {
        opportunity_name: '', // Empty required field
        total_project_cost: -1000, // Negative number
        projected_irr: 2.5 // Invalid percentage (over 100%)
      }

      const request = new NextRequest('http://localhost:3000/api/opportunities/test-opportunity-id', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request, { params: { id: 'test-opportunity-id' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details).toBeDefined()
    })
  })

  describe('Database Update Verification', () => {
    it('should call update with correct parameters', async () => {
      const requestData = {
        opportunity_name: 'Updated Name',
        total_project_cost: 2500000
      }

      const request = new NextRequest('http://localhost:3000/api/opportunities/test-opportunity-id', {
        method: 'PUT',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await PUT(request, { params: { id: 'test-opportunity-id' } })

      // Verify that from was called with the correct table name
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('investment_opportunities')
      
      // Verify that update was called with correct data
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          opportunity_name: 'Updated Name',
          total_project_cost: 2500000,
          updated_at: expect.any(String)
        })
      )
    })
  })
})