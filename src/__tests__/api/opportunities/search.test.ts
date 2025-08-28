import { NextRequest } from 'next/server'
import { GET } from '@/app/api/opportunities/search/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('/api/opportunities/search GET', () => {
  // Mock opportunity data
  const mockOpportunities = [
    {
      id: 'opp-1',
      opportunity_name: 'Downtown Office Building',
      opportunity_description: 'Prime office building in downtown area',
      property_type: 'office',
      investment_strategy: 'value_add',
      total_project_cost: 2000000,
      equity_requirement: 500000,
      minimum_investment: 25000,
      projected_irr: 0.12,
      property_address: { city: 'New York', state: 'NY' },
      status: 'published',
      public_listing: true,
      featured_listing: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'opp-2',
      opportunity_name: 'Luxury Apartments',
      opportunity_description: 'High-end multifamily development',
      property_type: 'multifamily',
      investment_strategy: 'core_plus',
      total_project_cost: 5000000,
      equity_requirement: 1500000,
      minimum_investment: 50000,
      projected_irr: 0.15,
      property_address: { city: 'Los Angeles', state: 'CA' },
      status: 'published',
      public_listing: true,
      featured_listing: true,
      created_at: new Date().toISOString()
    }
  ]

  // Create persistent mock functions
  const mockSelect = jest.fn()
  const mockEq = jest.fn()
  const mockGte = jest.fn()
  const mockLte = jest.fn()
  const mockIlike = jest.fn()
  const mockOr = jest.fn()
  const mockRange = jest.fn()
  const mockOrder = jest.fn()

  // Create a mock query builder that returns itself for chaining
  const mockQueryBuilder = {
    select: mockSelect,
    eq: mockEq,
    gte: mockGte,
    lte: mockLte,
    ilike: mockIlike,
    or: mockOr,
    range: mockRange,
    order: mockOrder
  }

  // Make all methods return the query builder for chaining
  mockSelect.mockReturnValue(mockQueryBuilder)
  mockEq.mockReturnValue(mockQueryBuilder)
  mockGte.mockReturnValue(mockQueryBuilder)
  mockLte.mockReturnValue(mockQueryBuilder)
  mockIlike.mockReturnValue(mockQueryBuilder)
  mockOr.mockReturnValue(mockQueryBuilder)
  mockRange.mockReturnValue(mockQueryBuilder)
  mockOrder.mockReturnValue(mockQueryBuilder)

  const mockFrom = jest.fn(() => mockQueryBuilder)

  const mockSupabase = {
    from: mockFrom
  }

  beforeEach(() => {
    // Only clear call history, not implementations
    mockSelect.mockClear()
    mockEq.mockClear()
    mockGte.mockClear()
    mockLte.mockClear()
    mockIlike.mockClear()
    mockOr.mockClear()
    mockRange.mockClear()
    mockOrder.mockClear()
    mockFrom.mockClear()
    
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    
    // Ensure all mock functions still return the query builder
    mockSelect.mockReturnValue(mockQueryBuilder)
    mockEq.mockReturnValue(mockQueryBuilder)
    mockGte.mockReturnValue(mockQueryBuilder)
    mockLte.mockReturnValue(mockQueryBuilder)
    mockIlike.mockReturnValue(mockQueryBuilder)
    mockOr.mockReturnValue(mockQueryBuilder)
    mockRange.mockReturnValue(mockQueryBuilder)
    
    // The final order call should resolve with data
    mockOrder.mockResolvedValue({ 
      data: mockOpportunities, 
      error: null, 
      count: mockOpportunities.length 
    })
    
    mockFrom.mockReturnValue(mockQueryBuilder)
  })

  describe('Basic Functionality', () => {
    it('should return all published opportunities without filters', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data.opportunities).toEqual(mockOpportunities)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.total).toBe(2)
    })

    it('should filter by property type', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?property_type=office')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify the filter was applied
      expect(mockEq).toHaveBeenCalledWith('property_type', 'office')
    })

    it('should filter by investment strategy', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?investment_strategy=value_add')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify the filter was applied
      expect(mockEq).toHaveBeenCalledWith('investment_strategy', 'value_add')
    })
  })

  describe('Investment Range Filtering', () => {
    it('should filter by minimum investment range', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?min_investment=30000&max_investment=60000')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify both min and max filters were applied
      expect(mockGte).toHaveBeenCalledWith('minimum_investment', 30000)
      expect(mockLte).toHaveBeenCalledWith('minimum_investment', 60000)
    })

    it('should filter by IRR range', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?min_irr=0.10&max_irr=0.20')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify IRR filters were applied
      expect(mockGte).toHaveBeenCalledWith('projected_irr', 0.10)
      expect(mockLte).toHaveBeenCalledWith('projected_irr', 0.20)
    })
  })

  describe('Location Filtering', () => {
    it('should filter by state', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?state=NY')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify state filter was applied
      expect(mockIlike).toHaveBeenCalledWith('property_address->>state', '%NY%')
    })

    it('should filter by city', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?city=New York')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify city filter was applied
      expect(mockIlike).toHaveBeenCalledWith('property_address->>city', '%New York%')
    })
  })

  describe('Keyword Search', () => {
    it('should search by keyword in multiple fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?keyword=office')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify keyword search was applied across multiple fields
      expect(mockOr).toHaveBeenCalledWith(
        'opportunity_name.ilike.%office%,opportunity_description.ilike.%office%,business_plan.ilike.%office%,value_creation_strategy.ilike.%office%'
      )
    })
  })

  describe('Combined Filters', () => {
    it('should apply multiple filters simultaneously', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/opportunities/search?property_type=multifamily&min_investment=40000&state=CA&keyword=luxury'
      )
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify all filters were applied
      expect(mockEq).toHaveBeenCalledWith('property_type', 'multifamily')
      expect(mockGte).toHaveBeenCalledWith('minimum_investment', 40000)
      expect(mockIlike).toHaveBeenCalledWith('property_address->>state', '%CA%')
      expect(mockOr).toHaveBeenCalledWith(
        'opportunity_name.ilike.%luxury%,opportunity_description.ilike.%luxury%,business_plan.ilike.%luxury%,value_creation_strategy.ilike.%luxury%'
      )
    })
  })

  describe('Pagination', () => {
    it('should handle pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search?page=2&limit=5')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify pagination was applied (page 2 with limit 5 = range 5-9)
      expect(mockRange).toHaveBeenCalledWith(5, 9)
      
      const data = await response.json()
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.limit).toBe(5)
    })

    it('should default to page 1 and limit 10', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify default pagination (page 1 with limit 10 = range 0-9)
      expect(mockRange).toHaveBeenCalledWith(0, 9)
    })
  })

  describe('Sorting', () => {
    it('should order by featured listings first, then by creation date', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify sorting was applied
      expect(mockOrder).toHaveBeenCalledWith('featured_listing', { ascending: false })
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      mockOrder.mockResolvedValue({ data: null, error: { message: 'Database error' } })
      
      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Failed to fetch opportunities')
    })

    it('should handle unexpected errors', async () => {
      mockOrder.mockRejectedValue(new Error('Unexpected error'))
      
      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Security', () => {
    it('should only return published opportunities', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify status filter is always applied
      expect(mockEq).toHaveBeenCalledWith('status', 'published')
    })

    it('should only return public listings', async () => {
      const request = new NextRequest('http://localhost:3000/api/opportunities/search')
      
      const response = await GET(request)
      expect(response.status).toBe(200)
      
      // Verify public_listing filter is always applied
      expect(mockEq).toHaveBeenCalledWith('public_listing', true)
    })
  })
})