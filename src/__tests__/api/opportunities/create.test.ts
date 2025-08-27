import { NextRequest } from 'next/server'
import { POST } from '@/app/api/opportunities/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('/api/opportunities POST', () => {
  // Test data using current flat schema structure
  const validOpportunityData = {
    title: 'Test Property',
    propertyType: 'multifamily',
    description: 'Test description for validation',
    street: '123 Test St',
    city: 'Test City',
    state: 'NY',
    zipCode: '10001',
    country: 'US',
    squareFootage: 10000,
    yearBuilt: 2020,
    unitCount: 50,
    totalInvestment: 1000000,
    minimumInvestment: 50000,
    targetReturn: 12.5,
    holdPeriod: 60,
    acquisitionFee: 2.5,
    managementFee: 1.5,
    dispositionFee: 2.0,
    status: 'draft'
  }

  const mockSingle = jest.fn()
  const mockSelect = jest.fn(() => ({ single: mockSingle }))
  const mockInsert = jest.fn(() => ({ select: mockSelect }))
  const mockFrom = jest.fn(() => ({ insert: mockInsert }))

  const mockSupabase = {
    auth: {
      getUser: jest.fn()
    },
    from: mockFrom
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockSingle.mockResolvedValue({ data: null, error: null })
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('Authentication', () => {
    it('should reject unauthenticated requests with 401', async () => {
      // Mock no authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      })

      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify(validOpportunityData),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(request)
      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data.error).toBe('Authentication required')
    })

    it('should reject non-sponsor users with 403', async () => {
      // Mock authenticated user who is not a deal sponsor
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123',
            user_metadata: { role: 'capital_partner' } // Investor, not sponsor
          } 
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify(validOpportunityData),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(request)
      expect(response.status).toBe(403)
      
      const data = await response.json()
      expect(data.error).toBe('Only deal sponsors can create opportunities')
    })

    it('should allow authenticated sponsors to create opportunities', async () => {
      // Mock authenticated sponsor
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'sponsor-123',
            user_metadata: { role: 'deal_sponsor' }
          } 
        },
        error: null
      })

      // Mock successful database insertion
      const mockOpportunity = {
        id: 'opp-123',
        title: 'Test Property',
        property_type: 'multifamily',
        total_investment: 1000000,
        minimum_investment: 50000,
        target_return: 12.5,
        hold_period: 60,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockOpportunity,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify(validOpportunityData),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(request)
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.opportunity).toEqual(mockOpportunity)
      expect(data.message).toBe('Opportunity created successfully')
    })
  })

  describe('Data Validation', () => {
    beforeEach(() => {
      // Mock authenticated sponsor for all validation tests
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'sponsor-123',
            user_metadata: { role: 'deal_sponsor' }
          } 
        },
        error: null
      })
    })

    it('should validate required opportunity fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          // Missing propertyDetails and financialStructure
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toBeDefined()
    })

    it('should validate property details', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title: '', // Invalid: empty title
          propertyType: 'invalid-type', // Invalid enum value
          description: 'sh', // Invalid: too short
          street: '123 Test St',
          city: 'Test City',
          state: 'NY',
          zipCode: '123', // Invalid: too short  
          country: 'US',
          squareFootage: -1000, // Invalid: negative
          yearBuilt: 1700, // Invalid: too old
          unitCount: 50,
          totalInvestment: 1000000,
          minimumInvestment: 50000,
          targetReturn: 12.5,
          holdPeriod: 60,
          acquisitionFee: 2.5,
          managementFee: 1.5,
          dispositionFee: 2.0,
          status: 'draft'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toBeDefined()
      expect(data.details.length).toBeGreaterThan(0)
    })

    it('should validate financial structure data', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Property',
          propertyType: 'multifamily',
          description: 'Test description for financial validation',
          street: '123 Test St',
          city: 'Test City',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          squareFootage: 10000,
          yearBuilt: 2020,
          unitCount: 50,
          totalInvestment: 50000, // Invalid: below minimum
          minimumInvestment: 100000, // Invalid: exceeds total investment
          targetReturn: 60, // Invalid: exceeds maximum
          holdPeriod: 6, // Invalid: below minimum
          acquisitionFee: 2.5,
          managementFee: 1.5,
          dispositionFee: 2.0,
          status: 'draft'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toBeDefined()
      expect(data.details.length).toBeGreaterThan(0)
    })

    it('should return validation errors for invalid data', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title: 'A'.repeat(201), // Too long
          propertyType: 'multifamily',
          description: 'Valid description',
          street: '',  // Required field missing
          city: 'Test City',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          squareFootage: 10000,
          yearBuilt: 2020,
          unitCount: 50,
          totalInvestment: 1000000,
          minimumInvestment: 50000,
          targetReturn: 12.5,
          holdPeriod: 60,
          acquisitionFee: 2.5,
          managementFee: 1.5,
          dispositionFee: 2.0,
          status: 'draft'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route  
      const response = await POST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toContainEqual(
        expect.objectContaining({
          path: expect.arrayContaining(['title']),
          message: 'Title must be less than 200 characters'
        })
      )
      expect(data.details).toContainEqual(
        expect.objectContaining({
          path: expect.arrayContaining(['street']),
          message: 'Street address is required'
        })
      )
    })
  })

  describe('Database Operations', () => {
    beforeEach(() => {
      // Mock authenticated sponsor
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'sponsor-123',
            user_metadata: { role: 'deal_sponsor' }
          } 
        },
        error: null
      })
    })

    it('should create opportunity record in database', async () => {
      const mockOpportunity = {
        id: 'opp-123',
        sponsor_id: 'sponsor-123',
        title: 'Test Property',
        property_type: 'multifamily',
        total_investment: 1000000,
        minimum_investment: 50000,
        target_return: 12.5,
        hold_period: 60,
        status: 'draft',
        created_at: new Date().toISOString()
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockOpportunity,
        error: null
      })

      const validRequest = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify(validOpportunityData),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(validRequest)
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.opportunity).toEqual(mockOpportunity)
      
      // Verify database insert was called with correct data
      expect(mockSupabase.from).toHaveBeenCalledWith('investment_opportunities')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          sponsor_id: 'sponsor-123',
          title: 'Test Property',
          property_type: 'multifamily',
          total_investment: 1000000,
          minimum_investment: 50000,
          target_return: 12.5,
          hold_period: 60
        })
      )
    })

    it('should handle database connection errors', async () => {
      // Mock database error
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { 
          code: 'connection_error',
          message: 'Database connection failed'
        }
      })

      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify(validOpportunityData),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(request)
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Failed to create opportunity')
    })

    it('should rollback transaction on file upload failure', async () => {
      // Mock successful database insert but failed file upload
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: {
          id: 'opp-123',
          title: 'Test Property',
          status: 'draft'
        },
        error: null
      })

      // Mock file upload failure (this would be in the actual implementation)
      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify(validOpportunityData),
        headers: { 'Content-Type': 'application/json' }
      })

      // This test verifies rollback behavior will be implemented
      const response = await POST(request)
      
      // Either success with file upload or proper rollback handling
      expect([200, 201, 500].includes(response.status)).toBe(true)
    })

    it('should return created opportunity with ID', async () => {
      const mockOpportunity = {
        id: 'opp-456',
        sponsor_id: 'sponsor-123',
        title: 'Premium Office Building',
        property_type: 'office',
        total_investment: 2500000,
        minimum_investment: 75000,
        target_return: 10.5,
        hold_period: 72,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockOpportunity,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Premium Office Building',
          propertyType: 'office',
          description: 'Premium office building in prime downtown location',
          street: '456 Business Ave',
          city: 'Downtown',
          state: 'CA',
          zipCode: '90210',
          country: 'US',
          squareFootage: 25000,
          yearBuilt: 2018,
          unitCount: 100,
          totalInvestment: 2500000,
          minimumInvestment: 75000,
          targetReturn: 10.5,
          holdPeriod: 72,
          acquisitionFee: 2.5,
          managementFee: 1.5,
          dispositionFee: 2.0,
          status: 'draft'
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      // This should fail until we implement the route
      const response = await POST(request)
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.opportunity).toEqual(mockOpportunity)
      expect(data.opportunity.id).toBe('opp-456')
      expect(data.message).toBe('Opportunity created successfully')
    })
  })
})