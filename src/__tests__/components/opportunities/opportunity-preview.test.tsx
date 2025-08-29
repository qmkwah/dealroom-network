import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { OpportunityPreview } from '@/components/opportunities/OpportunityPreview'
import { OpportunityInput } from '@/lib/validations/opportunity'

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
}))

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>,
  TabsContent: ({ children, value }: any) => <div data-testid="tabs-content" data-value={value}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-testid={`tab-trigger-${value}`}>{children}</button>,
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => <span data-testid="badge" data-variant={variant}>{children}</span>
}))

describe('OpportunityPreview', () => {
  const mockOpportunityData: OpportunityInput = {
    opportunity_name: 'Downtown Apartment Complex',
    opportunity_description: 'A prime investment opportunity in downtown',
    status: 'fundraising',
    property_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US'
    },
    property_type: 'multifamily',
    property_subtype: 'apartment_complex',
    total_square_feet: 50000,
    number_of_units: 100,
    year_built: 2020,
    property_condition: 'excellent',
    total_project_cost: 5000000,
    equity_requirement: 1500000,
    debt_amount: 3500000,
    debt_type: 'bank_loan',
    loan_to_cost_ratio: 0.70,
    loan_to_value_ratio: 0.65,
    minimum_investment: 50000,
    maximum_investment: 500000,
    target_raise_amount: 1500000,
    projected_irr: 0.15,
    projected_total_return_multiple: 1.8,
    projected_hold_period_months: 60,
    cash_on_cash_return: 0.08,
    preferred_return_rate: 0.06,
    investment_strategy: 'value_add',
    business_plan: 'Acquire, renovate, and lease up',
    value_creation_strategy: 'Property improvements and management optimization',
    exit_strategy: 'sale',
    fundraising_deadline: '2024-12-31',
    expected_closing_date: '2024-06-30',
    public_listing: false,
    featured_listing: false,
    accredited_only: true,
    geographic_restrictions: ['US']
  }

  describe('Test Case 4: Comprehensive Data Display', () => {
    it('should render all basic opportunity information', () => {
      render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getByText('Downtown Apartment Complex')).toBeInTheDocument()
      expect(screen.getByText('A prime investment opportunity in downtown')).toBeInTheDocument()
      expect(screen.getByText('Fundraising')).toBeInTheDocument()
    })

    it('should display property details correctly', () => {
      render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getByText('123 Main St')).toBeInTheDocument()
      expect(screen.getByText('New York, NY 10001')).toBeInTheDocument()
      expect(screen.getAllByText('Multifamily')).toHaveLength(1) // Only appears once in property tab
      expect(screen.getByText('50,000')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('2020')).toBeInTheDocument()
      expect(screen.getByText('Excellent')).toBeInTheDocument()
    })

    it('should display financial structure correctly', () => {
      render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getByText('$5,000,000')).toBeInTheDocument()
      expect(screen.getAllByText('$1,500,000')).toHaveLength(3) // Appears in financial structure and investment summary (may be multiple locations)
      expect(screen.getByText('$3,500,000')).toBeInTheDocument()
      expect(screen.getByText('70%')).toBeInTheDocument()
      expect(screen.getByText('65%')).toBeInTheDocument()
    })

    it('should display investment terms correctly', () => {
      render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getAllByText('$50,000')).toHaveLength(2) // Appears in investment terms and sidebar
      expect(screen.getByText('$500,000')).toBeInTheDocument()
      expect(screen.getAllByText('15%')).toHaveLength(2) // Appears in investment terms and sidebar
      expect(screen.getByText('1.8x')).toBeInTheDocument()
      expect(screen.getAllByText('60 months')).toHaveLength(2) // Appears in investment terms and sidebar
      expect(screen.getByText('8%')).toBeInTheDocument()
      expect(screen.getByText('6%')).toBeInTheDocument()
    })

    it('should display strategy and timeline information', () => {
      render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getAllByText('Value Add')).toHaveLength(2) // Appears in investment strategy and strategy type
      expect(screen.getByText('Acquire, renovate, and lease up')).toBeInTheDocument()
      expect(screen.getByText('Property improvements and management optimization')).toBeInTheDocument()
      expect(screen.getByText('Sale')).toBeInTheDocument()
    })
  })

  describe('Test Case 2: Preview Display', () => {
    it('should render tabs for different sections', () => {
      render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-overview')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-financials')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-property')).toBeInTheDocument()
      expect(screen.getByTestId('tab-trigger-documents')).toBeInTheDocument()
    })

    it('should display overview tab content', () => {
      render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      const overviewTabs = screen.getAllByTestId('tabs-content')
      expect(overviewTabs[0]).toHaveAttribute('data-value', 'overview')
    })
  })

  describe('Test Case 3: Real-time Data Reflection', () => {
    it('should update preview when opportunity data changes', () => {
      const { rerender } = render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getByText('Downtown Apartment Complex')).toBeInTheDocument()
      
      const updatedData = {
        ...mockOpportunityData,
        opportunity_name: 'Updated Apartment Complex'
      }
      
      rerender(<OpportunityPreview opportunityData={updatedData} />)
      
      expect(screen.getByText('Updated Apartment Complex')).toBeInTheDocument()
      expect(screen.queryByText('Downtown Apartment Complex')).not.toBeInTheDocument()
    })

    it('should update property details when data changes', () => {
      const { rerender } = render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getByText('100')).toBeInTheDocument()
      
      const updatedData = {
        ...mockOpportunityData,
        number_of_units: 150
      }
      
      rerender(<OpportunityPreview opportunityData={updatedData} />)
      
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.queryByText('100')).not.toBeInTheDocument()
    })

    it('should update financial data when changed', () => {
      const { rerender } = render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(screen.getAllByText('$50,000')).toHaveLength(2) // Initially appears twice
      
      const updatedData = {
        ...mockOpportunityData,
        minimum_investment: 75000
      }
      
      rerender(<OpportunityPreview opportunityData={updatedData} />)
      
      expect(screen.getAllByText('$75,000')).toHaveLength(2) // Should now appear twice
      expect(screen.queryByText('$50,000')).not.toBeInTheDocument()
    })
  })

  describe('Test Case 5: Responsive Design Check', () => {
    it('should render without layout issues on different screen sizes', () => {
      // Mock window.innerWidth for different screen sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Tablet size
      })

      const { container } = render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      
      expect(container.firstChild).toBeInTheDocument()
      
      // Change to mobile size
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
      })
      
      // Re-render shouldn't break
      const { container: mobileContainer } = render(<OpportunityPreview opportunityData={mockOpportunityData} />)
      expect(mobileContainer.firstChild).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing optional fields gracefully', () => {
      const minimalData: OpportunityInput = {
        opportunity_name: 'Minimal Opportunity',
        status: 'draft',
        property_address: {
          street: '123 Main St',
          city: 'City',
          state: 'ST',
          zip: '12345',
          country: 'US'
        },
        property_type: 'multifamily',
        total_project_cost: 1000000,
        equity_requirement: 500000,
        minimum_investment: 25000,
        target_raise_amount: 500000,
        public_listing: false,
        featured_listing: false,
        accredited_only: true
      }
      
      render(<OpportunityPreview opportunityData={minimalData} />)
      
      expect(screen.getByText('Minimal Opportunity')).toBeInTheDocument()
      expect(screen.getByText('Draft')).toBeInTheDocument()
      expect(screen.getByText('$1,000,000')).toBeInTheDocument()
    })

    it('should handle zero values appropriately', () => {
      const dataWithZeros = {
        ...mockOpportunityData,
        debt_amount: 0,
        loan_to_cost_ratio: 0,
        cash_on_cash_return: 0
      }
      
      render(<OpportunityPreview opportunityData={dataWithZeros} />)
      
      expect(screen.getByText('$0')).toBeInTheDocument()
      expect(screen.getAllByText('0%')).toHaveLength(2) // Should appear for both ratios
    })
  })
})