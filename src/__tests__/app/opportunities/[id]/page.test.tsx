import { render, screen, waitFor } from '@testing-library/react'
import OpportunityDetailPage from '@/app/(dashboard)/opportunities/[id]/page'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))

describe('Opportunity Detail Page', () => {
  const mockOpportunity = {
    id: 'test-opportunity-id',
    opportunity_name: 'Downtown Office Building',
    opportunity_description: 'Prime office building in downtown area',
    property_type: 'office',
    property_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    },
    total_project_cost: 2000000,
    equity_requirement: 500000,
    minimum_investment: 25000,
    projected_irr: 0.12,
    status: 'fundraising',
    sponsor_id: 'sponsor-123',
    public_listing: true,
    created_at: new Date().toISOString()
  }

  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: mockOpportunity,
            error: null
          }))
        }))
      }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'user-123', role: 'capital_partner' } },
        error: null
      }))
    }
  }

  beforeEach(() => {
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Page Accessibility and Data Display', () => {
    it('should display opportunity details correctly', async () => {
      render(await OpportunityDetailPage({ params: { id: 'test-opportunity-id' } }))
      
      await waitFor(() => {
        expect(screen.getByText('Downtown Office Building')).toBeInTheDocument()
        expect(screen.getByText('Prime office building in downtown area')).toBeInTheDocument()
        expect(screen.getByText('$2,000,000.00')).toBeInTheDocument()
        expect(screen.getByText('$25,000.00')).toBeInTheDocument()
        expect(screen.getByText('12.0%')).toBeInTheDocument()
      })
    })

    it('should display property address', async () => {
      render(await OpportunityDetailPage({ params: { id: 'test-opportunity-id' } }))
      
      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeInTheDocument()
        expect(screen.getByText('New York, NY 10001')).toBeInTheDocument()
      })
    })
  })

  describe('Role-Based Action Buttons', () => {
    it('should show investor actions for capital partners', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', role: 'capital_partner' } },
        error: null
      })

      render(await OpportunityDetailPage({ params: { id: 'test-opportunity-id' } }))
      
      await waitFor(() => {
        expect(screen.getByText('Express Interest')).toBeInTheDocument()
        expect(screen.getByText('Request Information')).toBeInTheDocument()
        expect(screen.queryByText('Edit Opportunity')).not.toBeInTheDocument()
      })
    })

    it('should show edit button for deal sponsor owner', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'sponsor-123', role: 'deal_sponsor' } },
        error: null
      })

      render(await OpportunityDetailPage({ params: { id: 'test-opportunity-id' } }))
      
      await waitFor(() => {
        expect(screen.getByText('Edit Opportunity')).toBeInTheDocument()
        expect(screen.queryByText('Express Interest')).not.toBeInTheDocument()
      })
    })

    it('should show login prompt for unauthenticated users', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      render(await OpportunityDetailPage({ params: { id: 'test-opportunity-id' } }))
      
      await waitFor(() => {
        expect(screen.getByText('Sign in to express interest')).toBeInTheDocument()
        expect(screen.queryByText('Express Interest')).not.toBeInTheDocument()
      })
    })
  })
})