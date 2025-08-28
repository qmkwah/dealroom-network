import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateOpportunitySchema } from '@/lib/validations/opportunity'

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
    // Allow access if user is the sponsor or if opportunity is fundraising/due_diligence status
    const isOwner = opportunity.sponsor_id === user.id
    const isPublic = ['fundraising', 'due_diligence', 'funded'].includes(opportunity.status)

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
    
    // Validate update data using PRD schema
    const validation = updateOpportunitySchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const validatedData = validation.data
    
    // Create update data matching PRD schema
    const updateData: any = {}
    
    if (validatedData.opportunity_name !== undefined) updateData.opportunity_name = validatedData.opportunity_name
    if (validatedData.opportunity_description !== undefined) updateData.opportunity_description = validatedData.opportunity_description
    if (validatedData.property_type !== undefined) updateData.property_type = validatedData.property_type
    if (validatedData.property_address !== undefined) updateData.property_address = validatedData.property_address
    if (validatedData.property_subtype !== undefined) updateData.property_subtype = validatedData.property_subtype
    if (validatedData.total_square_feet !== undefined) updateData.total_square_feet = validatedData.total_square_feet
    if (validatedData.number_of_units !== undefined) updateData.number_of_units = validatedData.number_of_units
    if (validatedData.year_built !== undefined) updateData.year_built = validatedData.year_built
    if (validatedData.property_condition !== undefined) updateData.property_condition = validatedData.property_condition
    if (validatedData.total_project_cost !== undefined) updateData.total_project_cost = validatedData.total_project_cost
    if (validatedData.equity_requirement !== undefined) updateData.equity_requirement = validatedData.equity_requirement
    if (validatedData.debt_amount !== undefined) updateData.debt_amount = validatedData.debt_amount
    if (validatedData.debt_type !== undefined) updateData.debt_type = validatedData.debt_type
    if (validatedData.minimum_investment !== undefined) updateData.minimum_investment = validatedData.minimum_investment
    if (validatedData.maximum_investment !== undefined) updateData.maximum_investment = validatedData.maximum_investment
    if (validatedData.target_raise_amount !== undefined) updateData.target_raise_amount = validatedData.target_raise_amount
    if (validatedData.projected_irr !== undefined) updateData.projected_irr = validatedData.projected_irr
    if (validatedData.projected_hold_period_months !== undefined) updateData.projected_hold_period_months = validatedData.projected_hold_period_months
    if (validatedData.investment_strategy !== undefined) updateData.investment_strategy = validatedData.investment_strategy
    if (validatedData.business_plan !== undefined) updateData.business_plan = validatedData.business_plan
    if (validatedData.value_creation_strategy !== undefined) updateData.value_creation_strategy = validatedData.value_creation_strategy
    if (validatedData.exit_strategy !== undefined) updateData.exit_strategy = validatedData.exit_strategy
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.public_listing !== undefined) updateData.public_listing = validatedData.public_listing
    if (validatedData.featured_listing !== undefined) updateData.featured_listing = validatedData.featured_listing
    if (validatedData.accredited_only !== undefined) updateData.accredited_only = validatedData.accredited_only

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