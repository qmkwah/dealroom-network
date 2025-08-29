import { NextRequest } from 'next/server'
import { POST } from '@/app/api/opportunities/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('/api/opportunities POST', () => {
  // Test data using new database schema structure
  const validOpportunityData = {
    opportunity_name: 'Test Property',
    opportunity_description: 'Test description for validation',
    status: 'draft',
    property_address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'NY',
      zip: '10001',
      country: 'US'
    },
    property_type: 'multifamily',
    property_subtype: 'apartment',
    total_square_feet: 10000,
    number_of_units: 50,
    year_built: 2020,
    property_condition: 'good',
    total_project_cost: 1000000,
    equity_requirement: 300000,
    debt_amount: 700000,
    debt_type: 'bank_loan',
    minimum_investment: 50000,
    maximum_investment: 200000,
    target_raise_amount: 300000,
    projected_irr: 0.125,
    projected_total_return_multiple: 1.8,
    projected_hold_period_months: 60,
    cash_on_cash_return: 0.08,
    preferred_return_rate: 0.06,
    investment_strategy: 'value_add',
    business_plan: 'Renovate units and increase rents',
    value_creation_strategy: 'Capital improvements and operational efficiency',
    exit_strategy: 'sale',
    fundraising_deadline: '2025-12-31',
    expected_closing_date: '2025-06-30',
    public_listing: false,
    featured_listing: false,
    accredited_only: true
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
        sponsor_id: 'sponsor-123',
        opportunity_name: 'Test Property',
        opportunity_description: 'Test description for validation',
        property_type: 'multifamily',
        total_project_cost: 1000000,
        equity_requirement: 300000,
        minimum_investment: 50000,
        target_raise_amount: 300000,
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
          // Missing required fields
        }),
        headers: { 'Content-Type': 'application/json' }
      })

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
          opportunity_name: '', // Invalid: empty name
          opportunity_description: 'Test description',
          status: 'draft',
          property_address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'NY',
            zip: '123', // Invalid: too short
            country: 'US'
          },
          property_type: 'invalid-type', // Invalid enum value
          total_square_feet: -1000, // Invalid: negative
          year_built: 1700, // Invalid: too old
          number_of_units: 50,
          total_project_cost: 1000000,
          equity_requirement: 300000,
          minimum_investment: 50000,
          target_raise_amount: 300000
        }),
        headers: { 'Content-Type': 'application/json' }
      })

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
          opportunity_name: 'Test Property',
          opportunity_description: 'Test description for financial validation',
          status: 'draft',
          property_address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'NY',
            zip: '10001',
            country: 'US'
          },
          property_type: 'multifamily',
          total_square_feet: 10000,
          year_built: 2020,
          number_of_units: 50,
          total_project_cost: 1000000,
          equity_requirement: 300000,
          minimum_investment: 2000000, // Invalid: exceeds target raise
          target_raise_amount: 300000
        }),
        headers: { 'Content-Type': 'application/json' }
      })

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
          opportunity_name: '', // Invalid: empty name
          opportunity_description: 'Valid description',
          status: 'draft',
          property_address: {
            street: '',  // Required field missing
            city: 'Test City',
            state: 'NY',
            zip: '10001',
            country: 'US'
          },
          property_type: 'multifamily',
          total_square_feet: 10000,
          year_built: 2020,
          number_of_units: 50,
          total_project_cost: 1000000,
          equity_requirement: 300000,
          minimum_investment: 50000,
          target_raise_amount: 300000
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
      
      const data = await response.json()
      expect(data.error).toBe('Invalid input data')
      expect(data.details).toContainEqual(
        expect.objectContaining({
          path: expect.arrayContaining(['opportunity_name']),
          message: 'Opportunity name is required'
        })
      )
      expect(data.details).toContainEqual(
        expect.objectContaining({
          path: expect.arrayContaining(['property_address', 'street']),
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
        opportunity_name: 'Test Property',
        opportunity_description: 'Test description for validation',
        property_type: 'multifamily',
        total_project_cost: 1000000,
        equity_requirement: 300000,
        minimum_investment: 50000,
        target_raise_amount: 300000,
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

      const response = await POST(validRequest)
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.opportunity).toEqual(mockOpportunity)
      
      // Verify database insert was called with correct data
      expect(mockSupabase.from).toHaveBeenCalledWith('investment_opportunities')
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          sponsor_id: 'sponsor-123',
          opportunity_name: 'Test Property',
          opportunity_description: 'Test description for validation',
          property_type: 'multifamily',
          total_project_cost: 1000000,
          equity_requirement: 300000,
          minimum_investment: 50000,
          target_raise_amount: 300000
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

      const response = await POST(request)
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Failed to create opportunity')
    })

    it('should return created opportunity with ID', async () => {
      const mockOpportunity = {
        id: 'opp-456',
        sponsor_id: 'sponsor-123',
        opportunity_name: 'Premium Office Building',
        opportunity_description: 'Premium office building in prime downtown location',
        property_type: 'office',
        total_project_cost: 2500000,
        equity_requirement: 750000,
        minimum_investment: 75000,
        target_raise_amount: 750000,
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
          opportunity_name: 'Premium Office Building',
          opportunity_description: 'Premium office building in prime downtown location',
          status: 'draft',
          property_address: {
            street: '456 Business Ave',
            city: 'Downtown',
            state: 'CA',
            zip: '90210',
            country: 'US'
          },
          property_type: 'office',
          total_square_feet: 25000,
          year_built: 2018,
          number_of_units: 100,
          total_project_cost: 2500000,
          equity_requirement: 750000,
          minimum_investment: 75000,
          target_raise_amount: 750000,
          projected_irr: 0.105,
          projected_hold_period_months: 72
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
      
      const data = await response.json()
      expect(data.opportunity).toEqual(mockOpportunity)
      expect(data.opportunity.id).toBe('opp-456')
      expect(data.message).toBe('Opportunity created successfully')
    })
  })
})