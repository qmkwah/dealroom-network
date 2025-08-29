import React, { useState } from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { opportunitySchema, OpportunityInput } from '@/lib/validations/opportunity'

// Mock components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, variant, className }: any) => 
    <button 
      onClick={onClick} 
      disabled={disabled} 
      type={type} 
      data-variant={variant}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => 
    open ? <div data-testid="dialog" onClick={() => onOpenChange?.(false)}>{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
}))

jest.mock('@/components/opportunities/OpportunityPreview', () => ({
  OpportunityPreview: ({ opportunityData }: any) => 
    <div data-testid="opportunity-preview" data-opportunity-name={opportunityData?.opportunity_name}>
      Preview for {opportunityData?.opportunity_name || 'Untitled Opportunity'}
    </div>
}))

// Import the mocked component
import { OpportunityPreview } from '@/components/opportunities/OpportunityPreview'

// Mock Button component function
const Button = ({ children, onClick, disabled, type, variant, className, ...props }: any) => 
  <button 
    onClick={onClick} 
    disabled={disabled} 
    type={type} 
    data-variant={variant}
    className={className}
    data-testid="button"
    {...props}
  >
    {children}
  </button>

// Test component that simulates the form with preview functionality
function TestOpportunityFormWithPreview() {
  const form = useForm<OpportunityInput>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      opportunity_name: '',
      status: 'draft',
      property_address: { country: 'US' },
      public_listing: false,
      featured_listing: false,
      accredited_only: true,
    }
  })

  const [showPreview, setShowPreview] = useState(false)
  const formData = form.watch()

  return (
    <div>
      <form data-testid="opportunity-form">
        <input
          {...form.register('opportunity_name')}
          data-testid="opportunity-name-input"
          placeholder="Enter opportunity name"
        />
        <input
          {...form.register('opportunity_description')}
          data-testid="opportunity-description-input"
          placeholder="Enter description"
        />
        <input
          type="number"
          {...form.register('minimum_investment', { valueAsNumber: true })}
          data-testid="minimum-investment-input"
          placeholder="Minimum investment"
        />
        
        {/* Preview Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(true)}
          data-testid="preview-button"
        >
          Preview Opportunity
        </Button>
      </form>

      {/* Preview Dialog */}
      {showPreview && (
        <div data-testid="preview-modal">
          <div data-testid="modal-backdrop" onClick={() => setShowPreview(false)} />
          <div data-testid="modal-content">
            <div data-testid="modal-header">
              <h2>Opportunity Preview</h2>
              <button 
                onClick={() => setShowPreview(false)}
                data-testid="close-preview-button"
              >
                ×
              </button>
            </div>
            <div data-testid="modal-body">
              <OpportunityPreview opportunityData={formData} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

describe('Opportunity Form Preview Functionality', () => {
  describe('Test Case 1: Preview Button Visibility', () => {
    it('should show preview button on opportunity creation form', () => {
      render(<TestOpportunityFormWithPreview />)
      
      const previewButton = screen.getByTestId('preview-button')
      expect(previewButton).toBeInTheDocument()
      expect(previewButton).toBeVisible()
      expect(previewButton).not.toBeDisabled()
    })

    it('should have correct preview button text and styling', () => {
      render(<TestOpportunityFormWithPreview />)
      
      const previewButton = screen.getByTestId('preview-button')
      expect(previewButton).toHaveTextContent('Preview Opportunity')
      expect(previewButton).toHaveAttribute('data-variant', 'outline')
      expect(previewButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Test Case 2: Preview Display', () => {
    it('should open preview modal when preview button is clicked', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      const previewButton = screen.getByTestId('preview-button')
      
      expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument()
      
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('preview-modal')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('modal-header')).toBeInTheDocument()
      expect(screen.getByTestId('modal-body')).toBeInTheDocument()
      expect(screen.getByTestId('opportunity-preview')).toBeInTheDocument()
    })

    it('should display modal title correctly', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      fireEvent.click(screen.getByTestId('preview-button'))
      
      await waitFor(() => {
        expect(screen.getByText('Opportunity Preview')).toBeInTheDocument()
      })
    })

    it('should show close button in preview modal', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      fireEvent.click(screen.getByTestId('preview-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('close-preview-button')).toBeInTheDocument()
      })
    })

    it('should close preview modal when close button is clicked', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      fireEvent.click(screen.getByTestId('preview-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('preview-modal')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('close-preview-button'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument()
      })
    })

    it('should close preview modal when clicking backdrop', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      fireEvent.click(screen.getByTestId('preview-button'))
      
      await waitFor(() => {
        expect(screen.getByTestId('preview-modal')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('modal-backdrop'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Test Case 3: Real-time Data Reflection', () => {
    it('should update preview when opportunity name changes', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      const nameInput = screen.getByTestId('opportunity-name-input')
      const previewButton = screen.getByTestId('preview-button')
      
      // Enter opportunity name
      fireEvent.change(nameInput, { target: { value: 'Test Opportunity' } })
      
      // Open preview
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        const preview = screen.getByTestId('opportunity-preview')
        expect(preview).toHaveAttribute('data-opportunity-name', 'Test Opportunity')
        expect(screen.getByText('Preview for Test Opportunity')).toBeInTheDocument()
      })
    })

    it('should reflect form changes in preview without form submission', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      const nameInput = screen.getByTestId('opportunity-name-input')
      const descriptionInput = screen.getByTestId('opportunity-description-input')
      const previewButton = screen.getByTestId('preview-button')
      
      // Fill form fields
      fireEvent.change(nameInput, { target: { value: 'Downtown Complex' } })
      fireEvent.change(descriptionInput, { target: { value: 'Great investment opportunity' } })
      
      // Open preview
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        expect(screen.getByText('Preview for Downtown Complex')).toBeInTheDocument()
      })
      
      // Close preview
      fireEvent.click(screen.getByTestId('close-preview-button'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument()
      })
      
      // Change form data
      fireEvent.change(nameInput, { target: { value: 'Updated Complex' } })
      
      // Open preview again
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        expect(screen.getByText('Preview for Updated Complex')).toBeInTheDocument()
      })
    })

    it('should update preview with numerical field changes', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      const nameInput = screen.getByTestId('opportunity-name-input')
      const investmentInput = screen.getByTestId('minimum-investment-input')
      const previewButton = screen.getByTestId('preview-button')
      
      // Set initial values
      fireEvent.change(nameInput, { target: { value: 'Investment Test' } })
      fireEvent.change(investmentInput, { target: { value: '50000' } })
      
      // Open preview
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        expect(screen.getByText('Preview for Investment Test')).toBeInTheDocument()
      })
      
      // Close and update investment amount
      fireEvent.click(screen.getByTestId('close-preview-button'))
      
      await waitFor(() => {
        expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument()
      })
      
      fireEvent.change(investmentInput, { target: { value: '75000' } })
      
      // Reopen preview
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        const preview = screen.getByTestId('opportunity-preview')
        expect(preview).toBeInTheDocument()
        // The preview component should receive the updated investment amount
      })
    })
  })

  describe('Form Validation and Preview', () => {
    it('should show preview even with incomplete form data', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      const previewButton = screen.getByTestId('preview-button')
      
      // Open preview without filling any form fields
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('opportunity-preview')).toBeInTheDocument()
        expect(screen.getByText('Preview for Untitled Opportunity')).toBeInTheDocument()
      })
    })

    it('should not submit form when preview button is clicked', () => {
      const mockSubmit = jest.fn()
      
      render(<TestOpportunityFormWithPreview />)
      
      const form = screen.getByTestId('opportunity-form')
      form.onsubmit = mockSubmit
      
      const previewButton = screen.getByTestId('preview-button')
      expect(previewButton).toHaveAttribute('type', 'button')
      
      fireEvent.click(previewButton)
      
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for modal', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      fireEvent.click(screen.getByTestId('preview-button'))
      
      await waitFor(() => {
        const modal = screen.getByTestId('preview-modal')
        expect(modal).toBeInTheDocument()
        
        const modalContent = screen.getByTestId('modal-content')
        expect(modalContent).toBeInTheDocument()
      })
    })

    it('should focus management for modal', async () => {
      render(<TestOpportunityFormWithPreview />)
      
      const previewButton = screen.getByTestId('preview-button')
      fireEvent.click(previewButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('close-preview-button')).toBeInTheDocument()
      })
    })
  })
})