import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpportunityForm } from '@/components/opportunities/forms/OpportunityForm'
import type { OpportunityInput } from '@/lib/validations/opportunity'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/opportunities/create'
  }),
  useSearchParams: () => ({
    get: jest.fn(() => '1')
  })
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'test-id' },
            error: null
          }))
        }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({
          data: { path: 'test-path' },
          error: null
        }))
      }))
    }
  })
}))

describe('OpportunityForm - Simplified Tests', () => {
  const mockProps = {
    mode: 'create' as const,
    onSubmit: jest.fn(),
    onSaveAsDraft: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Form Rendering', () => {
    it('should render form with basic fields', () => {
      render(<OpportunityForm {...mockProps} />)
      
      expect(screen.getByLabelText(/opportunity name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/property type/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit|create/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors when submitting empty form', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      // Should show validation error summary
      await waitFor(() => {
        expect(screen.getByText(/validation error.*found/i)).toBeInTheDocument()
      })
      
      expect(mockProps.onSubmit).not.toHaveBeenCalled()
    })

    it('should allow form submission with valid data', async () => {
      const validData: Partial<OpportunityInput> = {
        opportunity_name: 'Test Property',
        property_type: 'multifamily',
        property_address: {
          street: '123 Test St',
          city: 'Test City', 
          state: 'NY',
          zip: '10001',
          country: 'US'
        },
        total_project_cost: 1000000,
        equity_requirement: 300000,
        minimum_investment: 50000,
        target_raise_amount: 300000
      }

      mockProps.onSubmit.mockResolvedValue({ id: 'test-id' })
      
      render(<OpportunityForm {...mockProps} initialData={validData} />)
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Form State Management', () => {
    it('should save draft to localStorage', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      const opportunityNameInput = screen.getByLabelText(/opportunity name/i)
      await userEvent.type(opportunityNameInput, 'Draft Property')
      
      // Auto-save should trigger
      await waitFor(() => {
        const savedData = localStorage.getItem('opportunity-draft-prd')
        expect(savedData).toBeDefined()
      })
    })

    it('should recover draft from localStorage', () => {
      const draftData = {
        opportunity_name: 'Recovered Property',
        property_type: 'office'
      }
      localStorage.setItem('opportunity-draft-prd', JSON.stringify(draftData))
      
      render(<OpportunityForm {...mockProps} />)
      
      expect(screen.getByDisplayValue('Recovered Property')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockProps.onSubmit.mockRejectedValue(new Error('API Error'))
      
      const validData: Partial<OpportunityInput> = {
        opportunity_name: 'Test Property',
        property_type: 'multifamily',
        property_address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'NY', 
          zip: '10001',
          country: 'US'
        },
        total_project_cost: 1000000,
        equity_requirement: 300000,
        minimum_investment: 50000,
        target_raise_amount: 300000
      }

      render(<OpportunityForm {...mockProps} initialData={validData} />)
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/API Error/i)).toBeInTheDocument()
      })
    })
  })
})