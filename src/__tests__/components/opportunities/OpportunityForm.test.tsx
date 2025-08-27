import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpportunityForm } from '@/components/opportunities/forms/OpportunityForm'
import type { CreateOpportunityInput } from '@/lib/validations/opportunities'

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

describe('OpportunityForm', () => {
  const mockProps = {
    mode: 'create' as const,
    onSubmit: jest.fn(),
    onSaveAsDraft: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  describe('Form Validation', () => {
    it('should fail validation with empty required fields', async () => {
      // This test should fail until we implement OpportunityForm component
      render(<OpportunityForm {...mockProps} />)
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      // Should show validation errors for required fields
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        expect(screen.getByText(/property type is required/i)).toBeInTheDocument()
        expect(screen.getByText(/street address is required/i)).toBeInTheDocument()
        expect(screen.getByText(/total investment/i)).toBeInTheDocument()
      })
      
      expect(mockProps.onSubmit).not.toHaveBeenCalled()
    })

    it('should validate property type selection', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Find property type field and try to submit without selection
      const propertyTypeField = screen.getByLabelText(/property type/i)
      expect(propertyTypeField).toBeInTheDocument()
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/property type is required/i)).toBeInTheDocument()
      })
    })

    it('should validate investment amount range', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Fill in a total investment below minimum
      const totalInvestmentInput = screen.getByLabelText(/total investment/i)
      await userEvent.clear(totalInvestmentInput)
      await userEvent.type(totalInvestmentInput, '50000') // Below $100,000 minimum
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/total investment must be at least/i)).toBeInTheDocument()
      })
    })

    it('should validate target return percentages', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Fill in an invalid target return
      const targetReturnInput = screen.getByLabelText(/target return/i)
      await userEvent.clear(targetReturnInput)
      await userEvent.type(targetReturnInput, '60') // Above 50% maximum
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/target return cannot exceed/i)).toBeInTheDocument()
      })
    })

    it('should validate address format and required fields', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Fill in incomplete address
      const streetInput = screen.getByLabelText(/street/i)
      const zipInput = screen.getByLabelText(/zip/i)
      
      await userEvent.clear(streetInput)
      await userEvent.type(zipInput, '123') // Too short
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/street address is required/i)).toBeInTheDocument()
        expect(screen.getByText(/zip code must be at least 5 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate financial structure completeness', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Test minimum investment exceeding total investment
      const totalInvestmentInput = screen.getByLabelText(/total investment/i)
      const minimumInvestmentInput = screen.getByLabelText(/minimum investment/i)
      
      await userEvent.clear(totalInvestmentInput)
      await userEvent.type(totalInvestmentInput, '1000000')
      await userEvent.clear(minimumInvestmentInput)
      await userEvent.type(minimumInvestmentInput, '2000000') // Exceeds total
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/minimum investment cannot exceed total investment/i)).toBeInTheDocument()
      })
    })

    it('should validate offering memorandum file requirements', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Navigate to documents step (assuming multi-step form)
      const nextButton = screen.getByRole('button', { name: /next/i })
      
      // Click through steps to reach documents
      await userEvent.click(nextButton) // Property details step
      await userEvent.click(nextButton) // Financial structure step
      
      // Now on documents step - try to upload invalid file
      const fileInput = screen.getByLabelText(/offering memorandum/i)
      
      // Mock file with invalid type
      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      await userEvent.upload(fileInput, invalidFile)
      
      await waitFor(() => {
        expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument()
      })
    })

    it('should show appropriate error messages for each field', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Fill out form with multiple validation errors
      const titleInput = screen.getByLabelText(/title/i)
      const squareFootageInput = screen.getByLabelText(/square footage/i)
      const yearBuiltInput = screen.getByLabelText(/year built/i)
      
      await userEvent.type(titleInput, 'A'.repeat(201)) // Too long
      await userEvent.clear(squareFootageInput)
      await userEvent.type(squareFootageInput, '-1000') // Negative
      await userEvent.clear(yearBuiltInput)
      await userEvent.type(yearBuiltInput, '1700') // Too old
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/title must be less than 200 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/square footage must be greater than 0/i)).toBeInTheDocument()
        expect(screen.getByText(/year built must be after 1800/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    const validFormData: Partial<CreateOpportunityInput> = {
      title: 'Test Property',
      propertyType: 'multifamily',
      description: 'Test property description',
      street: '123 Test St',
      city: 'Test City',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      squareFootage: 10000,
      yearBuilt: 2020,
      unitCount: 24,
      totalInvestment: 1000000,
      minimumInvestment: 50000,
      targetReturn: 12.5,
      holdPeriod: 60,
      acquisitionFee: 2.0,
      managementFee: 1.5,
      dispositionFee: 2.5,
      status: 'draft'
    }

    it('should prevent submission with invalid data', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Leave required fields empty and try to submit
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        // Should show validation errors and not call onSubmit
        expect(screen.getByText(/title is required/i)).toBeInTheDocument()
        expect(mockProps.onSubmit).not.toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      // Mock slow submission
      mockProps.onSubmit.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      )
      
      render(<OpportunityForm {...mockProps} initialData={validFormData} />)
      
      // Fill form and submit
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      // Should show loading state
      expect(screen.getByText(/creating|submitting/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockProps.onSubmit.mockRejectedValue(new Error('API Error'))
      
      render(<OpportunityForm {...mockProps} initialData={validFormData} />)
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/error creating opportunity/i)).toBeInTheDocument()
      })
    })

    it('should redirect to preview page on successful submission', async () => {
      mockProps.onSubmit.mockResolvedValue({ id: 'new-opportunity-id' })
      
      render(<OpportunityForm {...mockProps} initialData={validFormData} />)
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            propertyDetails: expect.objectContaining({
              title: 'Test Property'
            })
          })
        )
      })
    })

    it('should save draft data to localStorage during editing', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Fill in some form data
      const titleInput = screen.getByLabelText(/title/i)
      await userEvent.type(titleInput, 'Draft Property')
      
      // Click save as draft
      const saveDraftButton = screen.getByRole('button', { name: /save.*draft/i })
      await userEvent.click(saveDraftButton)
      
      // Should save to localStorage
      const savedData = localStorage.getItem('opportunity-draft')
      expect(savedData).toBeDefined()
      expect(JSON.parse(savedData!)).toEqual(
        expect.objectContaining({
          title: 'Draft Property'
        })
      )
    })

    it('should clear draft data on successful submission', async () => {
      // Set up localStorage data
      localStorage.setItem('opportunity-draft', JSON.stringify({ title: 'Draft' }))
      
      mockProps.onSubmit.mockResolvedValue({ id: 'success-id' })
      render(<OpportunityForm {...mockProps} initialData={validFormData} />)
      
      const submitButton = screen.getByRole('button', { name: /submit|create/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(localStorage.getItem('opportunity-draft')).toBeNull()
      })
    })
  })

  describe('Form State Management', () => {
    it('should recover form data from localStorage on page reload', async () => {
      // Set up localStorage data
      const draftData = {
        title: 'Recovered Property',
        propertyType: 'office',
        street: '456 Recovery St',
        city: 'Recovery City',
        state: 'CA',
        zipCode: '90210',
        squareFootage: 20000,
        yearBuilt: 2019,
        description: 'Recovered from localStorage'
      }
      localStorage.setItem('opportunity-draft', JSON.stringify(draftData))
      
      render(<OpportunityForm {...mockProps} />)
      
      // Should populate form with recovered data
      expect(screen.getByDisplayValue('Recovered Property')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Recovery City')).toBeInTheDocument()
      expect(screen.getByDisplayValue('20000')).toBeInTheDocument()
    })

    it('should reset form to initial state when cancelled', async () => {
      render(<OpportunityForm {...mockProps} />)
      
      // Fill in some data
      const titleInput = screen.getByLabelText(/title/i)
      await userEvent.type(titleInput, 'Test Title')
      
      // Click cancel/reset button
      const cancelButton = screen.getByRole('button', { name: /cancel|reset/i })
      await userEvent.click(cancelButton)
      
      // Form should be reset
      expect(titleInput).toHaveValue('')
    })
  })
})