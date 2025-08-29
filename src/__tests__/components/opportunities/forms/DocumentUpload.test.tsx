import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentUpload from '@/components/opportunities/forms/DocumentUpload'

// Mock fetch for file uploads
global.fetch = jest.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')

describe('DocumentUpload Component', () => {
  const mockProps = {
    opportunityId: 'opportunity-123',
    documents: [],
    onDocumentUploaded: jest.fn(),
    onDocumentDeleted: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          id: 'doc-123',
          fileName: 'test-document.pdf',
          url: 'https://supabase.co/storage/v1/object/public/deal-packages/opportunity-123/document.pdf'
        }
      })
    })
  })

  describe('Upload Interface Accessibility', () => {
    it('should display file upload component', () => {
      render(<DocumentUpload {...mockProps} />)
      
      expect(screen.getByText(/upload documents/i)).toBeInTheDocument()
      expect(screen.getByText(/drag.*drop.*files.*here/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /browse files/i })).toBeInTheDocument()
    })

    it('should show supported file types and size limits', () => {
      render(<DocumentUpload {...mockProps} />)
      
      expect(screen.getByText(/PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT/)).toBeInTheDocument()
      expect(screen.getByText(/Max 10 MB per file/)).toBeInTheDocument()
    })
  })

  describe('File Upload Functionality', () => {
    it('should handle single file upload successfully', async () => {
      const user = userEvent.setup()
      
      render(<DocumentUpload {...mockProps} />)
      
      const file = new File(['test content'], 'test-document.pdf', { type: 'application/pdf' })
      const fileInput = screen.getByRole('button', { name: /browse files/i })
      
      // Simulate file selection (note: in real tests this might need more specific handling)
      const input = screen.getByText(/drag.*drop.*files.*here/i).closest('div')?.querySelector('input[type="file"]')
      if (input) {
        fireEvent.change(input, { target: { files: [file] } })
      }

      await waitFor(() => {
        expect(mockProps.onDocumentUploaded).toHaveBeenCalledWith({
          id: 'doc-123',
          fileName: 'test-document.pdf',
          url: 'https://supabase.co/storage/v1/object/public/deal-packages/opportunity-123/document.pdf'
        })
      })
    })

    it('should handle multiple file upload', async () => {
      const user = userEvent.setup()
      
      render(<DocumentUpload {...mockProps} />)
      
      const files = [
        new File(['content 1'], 'document1.pdf', { type: 'application/pdf' }),
        new File(['content 2'], 'document2.jpg', { type: 'image/jpeg' })
      ]

      const input = screen.getByText(/drag.*drop.*files.*here/i).closest('div')?.querySelector('input[type="file"]')
      if (input) {
        fireEvent.change(input, { target: { files } })
      }

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2)
        expect(mockProps.onDocumentUploaded).toHaveBeenCalledTimes(2)
      })
    })

    it('should show error for unsupported file type', async () => {
      render(<DocumentUpload {...mockProps} />)
      
      const file = new File(['malicious content'], 'malware.exe', { type: 'application/x-msdownload' })
      const input = screen.getByText(/drag.*drop.*files.*here/i).closest('div')?.querySelector('input[type="file"]')
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } })
      }

      await waitFor(() => {
        expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument()
      })
      
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should show error for files exceeding size limit', async () => {
      render(<DocumentUpload {...mockProps} />)
      
      // Create a mock file that appears large
      const largeFile = new File(['content'], 'large-document.pdf', { type: 'application/pdf' })
      Object.defineProperty(largeFile, 'size', {
        value: 11 * 1024 * 1024, // 11MB
        writable: false
      })

      const input = screen.getByText(/drag.*drop.*files.*here/i).closest('div')?.querySelector('input[type="file"]')
      
      if (input) {
        fireEvent.change(input, { target: { files: [largeFile] } })
      }

      await waitFor(() => {
        expect(screen.getByText(/file size exceeds.*limit/i)).toBeInTheDocument()
      })
      
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should show upload progress', async () => {
      // Mock fetch to simulate slow upload
      ;(fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: { id: 'doc-123', fileName: 'test.pdf', url: 'mock-url' }
            })
          }), 100)
        )
      )

      render(<DocumentUpload {...mockProps} />)
      
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByText(/drag.*drop.*files.*here/i).closest('div')?.querySelector('input[type="file"]')
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } })
      }

      // Should show uploading state
      await waitFor(() => {
        expect(screen.getByText(/uploading/i)).toBeInTheDocument()
      })

      // Should complete upload
      await waitFor(() => {
        expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument()
      }, { timeout: 200 })
    })
  })

  describe('Document List and Management', () => {
    const mockDocuments = [
      {
        id: 'doc-1',
        fileName: 'financial-model.xlsx',
        url: 'https://supabase.co/storage/v1/object/public/deal-packages/opportunity-123/financial-model.xlsx',
        fileSize: 1024000,
        uploadedAt: '2025-08-29T10:00:00Z'
      },
      {
        id: 'doc-2',
        fileName: 'property-photos.jpg',
        url: 'https://supabase.co/storage/v1/object/public/deal-packages/opportunity-123/property-photos.jpg',
        fileSize: 2048000,
        uploadedAt: '2025-08-29T11:00:00Z'
      }
    ]

    it('should display uploaded documents', () => {
      render(<DocumentUpload {...mockProps} documents={mockDocuments} />)
      
      expect(screen.getByText('financial-model.xlsx')).toBeInTheDocument()
      expect(screen.getByText('property-photos.jpg')).toBeInTheDocument()
      expect(screen.getByText(/1\.0 MB/i)).toBeInTheDocument()
      expect(screen.getByText(/2\.0 MB/i)).toBeInTheDocument()
    })

    it('should handle document deletion', async () => {
      const user = userEvent.setup()
      
      render(<DocumentUpload {...mockProps} documents={mockDocuments} />)
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockProps.onDocumentDeleted).toHaveBeenCalledWith('doc-1')
      })
    })

    it('should show document preview/download links', () => {
      render(<DocumentUpload {...mockProps} documents={mockDocuments} />)
      
      const downloadLinks = screen.getAllByRole('link')
      expect(downloadLinks).toHaveLength(2)
      expect(downloadLinks[0]).toHaveAttribute('href', mockDocuments[0].url)
      expect(downloadLinks[1]).toHaveAttribute('href', mockDocuments[1].url)
    })
  })

  describe('Error Handling', () => {
    it('should handle upload failure gracefully', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({
          error: 'Upload failed'
        })
      })

      render(<DocumentUpload {...mockProps} />)
      
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByText(/drag.*drop.*files.*here/i).closest('div')?.querySelector('input[type="file"]')
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } })
      }

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
      })
      
      expect(mockProps.onDocumentUploaded).not.toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<DocumentUpload {...mockProps} />)
      
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const input = screen.getByText(/drag.*drop.*files.*here/i).closest('div')?.querySelector('input[type="file"]')
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } })
      }

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })
})