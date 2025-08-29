import { NextRequest } from 'next/server'
import { POST, DELETE } from '@/app/api/uploads/documents/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('/api/uploads/documents', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'user-123' } },
        error: null
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'opportunity-123',
              sponsor_id: 'user-123',
              property_documents: []
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: { id: 'opportunity-123' },
              error: null
            }))
          }))
        }))
      }))
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({
          data: { 
            path: 'deal-packages/opportunity-123/document.pdf',
            id: 'file-123',
            fullPath: 'deal-packages/opportunity-123/document.pdf'
          },
          error: null
        })),
        remove: jest.fn(() => Promise.resolve({
          data: null,
          error: null
        })),
        getPublicUrl: jest.fn((path: string) => ({
          data: { 
            publicUrl: `https://supabase.co/storage/v1/object/public/deal-packages/${path}`
          }
        }))
      }))
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('POST - File Upload', () => {
    it('should successfully upload a document', async () => {
      const fileContent = Buffer.from('test document content')
      const file = new File([fileContent], 'test-document.pdf', { 
        type: 'application/pdf' 
      })
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('opportunityId', 'opportunity-123')

      const request = new NextRequest('http://localhost:3000/api/uploads/documents', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('url')
      expect(data.data).toHaveProperty('fileName')
      expect(data.data.fileName).toBe('test-document.pdf')
    })

    it('should reject unsupported file types', async () => {
      const fileContent = Buffer.from('malicious executable content')
      const file = new File([fileContent], 'malware.exe', { 
        type: 'application/x-msdownload' 
      })
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('opportunityId', 'opportunity-123')

      const request = new NextRequest('http://localhost:3000/api/uploads/documents', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Unsupported file type')
    })

    it('should reject files exceeding size limit', async () => {
      // Create a large buffer (>10MB)
      const largeContent = Buffer.alloc(11 * 1024 * 1024, 'a')
      const file = new File([largeContent], 'large-document.pdf', { 
        type: 'application/pdf' 
      })
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('opportunityId', 'opportunity-123')

      const request = new NextRequest('http://localhost:3000/api/uploads/documents', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('File size exceeds limit (10MB)')
    })

    it('should require authentication', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const fileContent = Buffer.from('test document content')
      const file = new File([fileContent], 'test-document.pdf', { 
        type: 'application/pdf' 
      })
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('opportunityId', 'opportunity-123')

      const request = new NextRequest('http://localhost:3000/api/uploads/documents', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should verify opportunity ownership', async () => {
      // Mock opportunity owned by different user
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: {
          id: 'opportunity-123',
          sponsor_id: 'different-user',
          property_documents: []
        },
        error: null
      })

      const fileContent = Buffer.from('test document content')
      const file = new File([fileContent], 'test-document.pdf', { 
        type: 'application/pdf' 
      })
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('opportunityId', 'opportunity-123')

      const request = new NextRequest('http://localhost:3000/api/uploads/documents', {
        method: 'POST',
        body: formData
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized: You can only upload documents to your own opportunities')
    })
  })

  describe('DELETE - File Deletion', () => {
    it('should successfully delete a document', async () => {
      // Mock opportunity with existing document
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: {
          id: 'opportunity-123',
          sponsor_id: 'user-123',
          property_documents: [
            {
              id: 'doc-123',
              fileName: 'test-document.pdf',
              url: 'https://supabase.co/storage/v1/object/public/deal-packages/opportunity-123/document.pdf',
              filePath: 'opportunity-123/document.pdf'
            }
          ]
        },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/uploads/documents', {
        method: 'DELETE',
        body: JSON.stringify({
          documentId: 'doc-123',
          opportunityId: 'opportunity-123'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSupabaseClient.storage.from().remove).toHaveBeenCalled()
    })

    it('should require authentication for deletion', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/uploads/documents', {
        method: 'DELETE',
        body: JSON.stringify({
          documentId: 'doc-123',
          opportunityId: 'opportunity-123'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })
  })
})