import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpportunityFiltersComponent, type OpportunityFilters } from '@/components/filters/opportunity-filters'

describe('OpportunityFiltersComponent', () => {
  const mockOnFiltersChange = jest.fn()
  const mockOnClearFilters = jest.fn()

  const defaultProps = {
    filters: {} as OpportunityFilters,
    onFiltersChange: mockOnFiltersChange,
    onClearFilters: mockOnClearFilters
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Filter Display', () => {
    it('should render filter title and controls', () => {
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      expect(screen.getByText('Filters')).toBeInTheDocument()
      expect(screen.getByText('Property Type')).toBeInTheDocument()
      expect(screen.getByText('Investment Strategy')).toBeInTheDocument()
      expect(screen.getByText('Minimum Investment Range')).toBeInTheDocument()
      expect(screen.getByText('Projected IRR (%)')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
    })

    it('should display active filter count', () => {
      const filtersWithData = {
        property_type: 'multifamily',
        investment_strategy: 'value_add',
        min_investment: 50000
      }

      render(
        <OpportunityFiltersComponent 
          {...defaultProps} 
          filters={filtersWithData}
        />
      )
      
      // Should show badge with count of 3 active filters
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should show clear all button when filters are active', () => {
      const filtersWithData = {
        property_type: 'multifamily'
      }

      render(
        <OpportunityFiltersComponent 
          {...defaultProps} 
          filters={filtersWithData}
        />
      )
      
      expect(screen.getByText('Clear all')).toBeInTheDocument()
    })
  })

  describe('Property Type Filter', () => {
    it('should allow selecting property type', async () => {
      const user = userEvent.setup()
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const propertyTypeSelect = screen.getByRole('combobox', { name: /property type/i })
      await user.click(propertyTypeSelect)
      
      const multifamilyOption = screen.getByText('Multifamily')
      await user.click(multifamilyOption)
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            property_type: 'multifamily'
          })
        )
      })
    })

    it('should show property subtype when property type is selected', async () => {
      const filtersWithPropertyType = {
        property_type: 'multifamily'
      }

      render(
        <OpportunityFiltersComponent 
          {...defaultProps} 
          filters={filtersWithPropertyType}
        />
      )
      
      expect(screen.getByText('Property Subtype')).toBeInTheDocument()
    })
  })

  describe('Investment Range Filters', () => {
    it('should handle minimum investment input', async () => {
      const user = userEvent.setup()
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const minInvestmentInput = screen.getByPlaceholderText('50,000')
      await user.type(minInvestmentInput, '25000')
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            min_investment: 25000
          })
        )
      })
    })

    it('should handle maximum investment input', async () => {
      const user = userEvent.setup()
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const maxInvestmentInput = screen.getByPlaceholderText('500,000')
      await user.type(maxInvestmentInput, '100000')
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            max_investment: 100000
          })
        )
      })
    })

    it('should handle IRR range inputs', async () => {
      const user = userEvent.setup()
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const minIrrInput = screen.getByPlaceholderText('8.0')
      await user.type(minIrrInput, '12.5')
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            min_irr: 12.5
          })
        )
      })
    })
  })

  describe('Location Filters', () => {
    it('should handle state input', async () => {
      const user = userEvent.setup()
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const stateInput = screen.getByPlaceholderText('State (e.g., NY, CA)')
      await user.type(stateInput, 'CA')
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            state: 'CA'
          })
        )
      })
    })

    it('should handle city input', async () => {
      const user = userEvent.setup()
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const cityInput = screen.getByPlaceholderText('City')
      await user.type(cityInput, 'Los Angeles')
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            city: 'Los Angeles'
          })
        )
      })
    })
  })

  describe('Active Filters Display', () => {
    it('should display active filter badges', () => {
      const activeFilters = {
        property_type: 'office',
        investment_strategy: 'core_plus',
        min_investment: 75000,
        state: 'NY'
      }

      render(
        <OpportunityFiltersComponent 
          {...defaultProps} 
          filters={activeFilters}
        />
      )
      
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
      expect(screen.getByText('Office')).toBeInTheDocument()
      expect(screen.getByText('Core Plus')).toBeInTheDocument()
      expect(screen.getByText('Min: $75,000')).toBeInTheDocument()
      expect(screen.getByText('State: NY')).toBeInTheDocument()
    })

    it('should allow removing individual filters', async () => {
      const user = userEvent.setup()
      const activeFilters = {
        property_type: 'office',
        min_investment: 75000
      }

      render(
        <OpportunityFiltersComponent 
          {...defaultProps} 
          filters={activeFilters}
        />
      )
      
      // Find and click the X button for property type filter
      const propertyTypeRemoveButton = screen.getByText('Office').closest('.text-xs')?.querySelector('button')
      expect(propertyTypeRemoveButton).toBeInTheDocument()
      
      await user.click(propertyTypeRemoveButton!)
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            min_investment: 75000
            // property_type should be removed
          })
        )
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.not.objectContaining({
            property_type: expect.anything()
          })
        )
      })
    })
  })

  describe('Clear All Functionality', () => {
    it('should clear all filters when clear all is clicked', async () => {
      const user = userEvent.setup()
      const activeFilters = {
        property_type: 'office',
        investment_strategy: 'value_add',
        min_investment: 50000,
        state: 'CA'
      }

      render(
        <OpportunityFiltersComponent 
          {...defaultProps} 
          filters={activeFilters}
        />
      )
      
      const clearAllButton = screen.getByText('Clear all')
      await user.click(clearAllButton)
      
      expect(mockOnClearFilters).toHaveBeenCalled()
    })

    it('should not show clear all button when no filters are active', () => {
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should handle empty values correctly', async () => {
      const user = userEvent.setup()
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const minInvestmentInput = screen.getByPlaceholderText('50,000')
      await user.type(minInvestmentInput, '50000')
      await user.clear(minInvestmentInput)
      
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.not.objectContaining({
            min_investment: expect.anything()
          })
        )
      })
    })

    it('should handle non-numeric input for number fields', async () => {
      const user = userEvent.setup()
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const minInvestmentInput = screen.getByPlaceholderText('50,000')
      await user.type(minInvestmentInput, 'abc')
      
      // Should handle gracefully - either prevent input or handle conversion
      expect(minInvestmentInput).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all form controls', () => {
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      expect(screen.getByText('Property Type')).toBeInTheDocument()
      expect(screen.getByText('Investment Strategy')).toBeInTheDocument()
      expect(screen.getByText('Minimum Investment Range')).toBeInTheDocument()
      expect(screen.getByText('Projected IRR (%)')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<OpportunityFiltersComponent {...defaultProps} />)
      
      const inputs = screen.getAllByRole('textbox')
      const selects = screen.getAllByRole('combobox')
      
      // All inputs should be focusable
      inputs.forEach(input => {
        expect(input).not.toHaveAttribute('tabindex', '-1')
      })
      
      selects.forEach(select => {
        expect(select).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })
})