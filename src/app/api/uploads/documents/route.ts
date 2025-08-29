import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

// Supported file types for documents
const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'text/plain'
]

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Temporary type until database types are properly generated
type SupabaseClient = {
  from: (table: string) => any
  auth: any
  storage: any
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const opportunityId = formData.get('opportunityId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds limit (10MB)' },
        { status: 400 }
      )
    }

    // Check if opportunity exists and user owns it
    const { data: opportunity, error: opportunityError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select('id, sponsor_id, property_documents')
      .eq('id', opportunityId)
      .single()

    if (opportunityError || !opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (opportunity.sponsor_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only upload documents to your own opportunities' },
        { status: 403 }
      )
    }

    // Generate unique file path
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = `${opportunityId}/${uniqueFileName}`

    // Upload to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const { data: uploadData, error: uploadError } = await (supabase as SupabaseClient)
      .storage
      .from('deal-packages')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        duplex: 'half'
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = await (supabase as SupabaseClient)
      .storage
      .from('deal-packages')
      .getPublicUrl(filePath)

    // Create document metadata
    const documentMetadata = {
      id: uuidv4(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      url: urlData.publicUrl,
      filePath: filePath,
      uploadedAt: new Date().toISOString()
    }

    // Update opportunity with new document
    const existingDocuments = opportunity.property_documents || []
    const updatedDocuments = [...existingDocuments, documentMetadata]

    const { error: updateError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .update({ 
        property_documents: updatedDocuments,
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId)

    if (updateError) {
      console.error('Database update error:', updateError)
      
      // Try to clean up uploaded file
      await (supabase as SupabaseClient)
        .storage
        .from('deal-packages')
        .remove([filePath])

      return NextResponse.json(
        { error: 'Failed to update opportunity with document metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: documentMetadata
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { documentId, opportunityId } = await request.json()

    if (!documentId || !opportunityId) {
      return NextResponse.json(
        { error: 'Document ID and Opportunity ID are required' },
        { status: 400 }
      )
    }

    // Get opportunity with documents
    const { data: opportunity, error: opportunityError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select('id, sponsor_id, property_documents')
      .eq('id', opportunityId)
      .single()

    if (opportunityError || !opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (opportunity.sponsor_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete documents from your own opportunities' },
        { status: 403 }
      )
    }

    // Find document to delete
    const existingDocuments = opportunity.property_documents || []
    const documentToDelete = existingDocuments.find((doc: any) => doc.id === documentId)

    if (!documentToDelete) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Remove document from storage
    const { error: storageError } = await (supabase as SupabaseClient)
      .storage
      .from('deal-packages')
      .remove([documentToDelete.filePath])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database update even if storage deletion fails
    }

    // Update opportunity documents array
    const updatedDocuments = existingDocuments.filter((doc: any) => doc.id !== documentId)

    const { error: updateError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .update({ 
        property_documents: updatedDocuments,
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update opportunity' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}