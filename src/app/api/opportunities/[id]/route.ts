import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Temporary type until database types are properly generated
type SupabaseClient = {
  from: (table: string) => any
  auth: any
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    // Get the opportunity by ID
    const { data: opportunity, error } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this opportunity
    // Allow access if user is the sponsor or if opportunity is active/review status
    const isOwner = opportunity.sponsor_id === user.id
    const isPublic = ['active', 'review'].includes(opportunity.status)

    if (!isOwner && !isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({ opportunity })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    // Check if opportunity exists and user owns it
    const { data: existingOpportunity, error: fetchError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select('sponsor_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingOpportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (existingOpportunity.sponsor_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Create update data with proper field mapping
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.propertyType !== undefined) updateData.property_type = body.propertyType
    if (body.description !== undefined) updateData.description = body.description
    if (body.street !== undefined) updateData.street = body.street
    if (body.city !== undefined) updateData.city = body.city
    if (body.state !== undefined) updateData.state = body.state
    if (body.zipCode !== undefined) updateData.zip_code = body.zipCode
    if (body.country !== undefined) updateData.country = body.country
    if (body.squareFootage !== undefined) updateData.square_footage = body.squareFootage
    if (body.yearBuilt !== undefined) updateData.year_built = body.yearBuilt
    if (body.unitCount !== undefined) updateData.unit_count = body.unitCount
    if (body.totalInvestment !== undefined) updateData.total_investment = body.totalInvestment
    if (body.minimumInvestment !== undefined) updateData.minimum_investment = body.minimumInvestment
    if (body.targetReturn !== undefined) updateData.target_return = body.targetReturn
    if (body.holdPeriod !== undefined) updateData.hold_period = body.holdPeriod
    if (body.acquisitionFee !== undefined) updateData.acquisition_fee = body.acquisitionFee
    if (body.managementFee !== undefined) updateData.management_fee = body.managementFee
    if (body.dispositionFee !== undefined) updateData.disposition_fee = body.dispositionFee
    if (body.status !== undefined) updateData.status = body.status

    updateData.updated_at = new Date().toISOString()

    // Update opportunity in database
    const { data: opportunity, error: updateError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update opportunity' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Opportunity updated successfully',
      opportunity
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    // Check if opportunity exists and user owns it
    const { data: existingOpportunity, error: fetchError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select('sponsor_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingOpportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (existingOpportunity.sponsor_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete opportunity from database
    const { error: deleteError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete opportunity' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Opportunity deleted successfully'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}