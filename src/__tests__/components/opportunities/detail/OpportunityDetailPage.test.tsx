import { render, screen } from '@testing-library/react'
import OpportunityHeader from '@/components/opportunities/detail/OpportunityHeader'
import InvestmentSummary from '@/components/opportunities/detail/InvestmentSummary'
import InvestorActions from '@/components/opportunities/detail/InvestorActions'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => 
    <a href={href}>{children}</a>
})

// Mock hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}))

describe('Opportunity Detail Components', () => {
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
    target_raise_amount: 300000,
    projected_irr: 0.12,
    status: 'fundraising',
    sponsor_id: 'sponsor-123',
    public_listing: true,
    created_at: new Date().toISOString(),
    sponsor: {
      id: 'sponsor-123',
      first_name: 'John',
      last_name: 'Doe',
      company_name: 'Real Estate Co'
    }
  }

  describe('OpportunityHeader', () => {
    it('should display opportunity name and address', () => {
      render(
        <OpportunityHeader 
          opportunity={mockOpportunity}
          isOwner={false}
          userRole="capital_partner"
        />
      )
      
      expect(screen.getByText('Downtown Office Building')).toBeInTheDocument()
      expect(screen.getByText('123 Main St, New York, NY 10001')).toBeInTheDocument()
      expect(screen.getByText('office')).toBeInTheDocument()
    })

    it('should show edit button for opportunity owner', () => {
      render(
        <OpportunityHeader 
          opportunity={mockOpportunity}
          isOwner={true}
          userRole="deal_sponsor"
        />
      )
      
      expect(screen.getByText('Edit Opportunity')).toBeInTheDocument()
    })

    it('should not show edit button for non-owners', () => {
      render(
        <OpportunityHeader 
          opportunity={mockOpportunity}
          isOwner={false}
          userRole="capital_partner"
        />
      )
      
      expect(screen.queryByText('Edit Opportunity')).not.toBeInTheDocument()
    })
  })

  describe('InvestmentSummary', () => {
    it('should display financial information', () => {
      render(<InvestmentSummary opportunity={mockOpportunity} />)
      
      expect(screen.getByText('$2,000,000.00')).toBeInTheDocument()
      expect(screen.getByText('$500,000.00')).toBeInTheDocument()
      expect(screen.getByText('$25,000.00')).toBeInTheDocument()
      expect(screen.getByText('12.0%')).toBeInTheDocument()
    })

    it('should display investment summary card', () => {
      render(<InvestmentSummary opportunity={mockOpportunity} />)
      
      expect(screen.getByText('Investment Summary')).toBeInTheDocument()
      expect(screen.getByText('Total Project Cost')).toBeInTheDocument()
      expect(screen.getByText('Equity Required')).toBeInTheDocument()
      expect(screen.getByText('Min Investment')).toBeInTheDocument()
    })
  })

  describe('InvestorActions', () => {
    it('should show login prompt for unauthenticated users', () => {
      render(
        <InvestorActions 
          opportunity={mockOpportunity}
          user={null}
          isOwner={false}
          userRole={undefined}
        />
      )
      
      expect(screen.getByText('Sign in to express interest')).toBeInTheDocument()
      expect(screen.getByText('Interested in This Deal?')).toBeInTheDocument()
    })

    it('should show investor actions for capital partners', () => {
      const mockUser = { id: 'user-123', role: 'capital_partner' }
      
      render(
        <InvestorActions 
          opportunity={mockOpportunity}
          user={mockUser}
          isOwner={false}
          userRole="capital_partner"
        />
      )
      
      expect(screen.getByRole('button', { name: /express interest/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /request information/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /message sponsor/i })).toBeInTheDocument()
    })

    it('should show management actions for opportunity owners', () => {
      const mockUser = { id: 'sponsor-123', role: 'deal_sponsor' }
      
      render(
        <InvestorActions 
          opportunity={mockOpportunity}
          user={mockUser}
          isOwner={true}
          userRole="deal_sponsor"
        />
      )
      
      expect(screen.getByText('Manage Your Opportunity')).toBeInTheDocument()
      expect(screen.getByText('Edit Opportunity')).toBeInTheDocument()
      expect(screen.getByText('View Inquiries')).toBeInTheDocument()
    })
  })
})