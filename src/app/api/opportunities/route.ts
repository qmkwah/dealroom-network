import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { opportunitySchema, type OpportunityInput } from '@/lib/validations/opportunity'

// Temporary type until database types are properly generated
type SupabaseClient = {
  from: (table: string) => any
  auth: any
}

export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    // const status = searchParams.get('status') || 'active' // Temporarily disabled
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Status validation temporarily disabled due to type issues
    // const validStatuses = ['draft', 'review', 'active', 'closed', 'archived'] as const
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build query with filters - simplified select to avoid auth.users join issues
    let query = (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select('*')

    // Apply status filter - temporarily disabled due to type issues
    // if (status !== 'all' && validStatuses.includes(status as any)) {
    //   query = query.eq('status', status as Database['public']['Enums']['opportunity_status'])
    // }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(from, to)

    const { data: opportunities, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch opportunities' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const countQuery = (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select('*', { count: 'exact', head: true })
    
    // Status filter temporarily disabled due to type issues
    // if (status !== 'all' && validStatuses.includes(status as any)) {
    //   countQuery = countQuery.eq('status', status as Database['public']['Enums']['opportunity_status'])
    // }

    const { count } = await countQuery

    return NextResponse.json({
      opportunities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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

    // Check if user is a deal sponsor
    const userRole = user.user_metadata?.role
    if (userRole !== 'deal_sponsor') {
      return NextResponse.json(
        { error: 'Only deal sponsors can create opportunities' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    
    // Validate input data
    const validation = opportunitySchema.safeParse(body)
    
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

    // Create database insert data matching the investment_opportunities table schema
    const opportunityData: any = {
      sponsor_id: user.id,
      opportunity_name: validatedData.opportunity_name,
      opportunity_description: validatedData.opportunity_description,
      status: validatedData.status,
      
      // Property address as JSONB
      property_address: validatedData.property_address,
      property_type: validatedData.property_type,
      property_subtype: validatedData.property_subtype,
      total_square_feet: validatedData.total_square_feet,
      number_of_units: validatedData.number_of_units,
      year_built: validatedData.year_built,
      property_condition: validatedData.property_condition,
      
      // Financial structure
      total_project_cost: validatedData.total_project_cost,
      equity_requirement: validatedData.equity_requirement,
      debt_amount: validatedData.debt_amount,
      debt_type: validatedData.debt_type,
      loan_to_cost_ratio: validatedData.loan_to_cost_ratio,
      loan_to_value_ratio: validatedData.loan_to_value_ratio,
      
      // Investment terms
      minimum_investment: validatedData.minimum_investment,
      maximum_investment: validatedData.maximum_investment,
      target_raise_amount: validatedData.target_raise_amount,
      current_commitments: 0,
      fundraising_progress: 0,
      
      // Returns and timeline
      projected_irr: validatedData.projected_irr,
      projected_total_return_multiple: validatedData.projected_total_return_multiple,
      projected_hold_period_months: validatedData.projected_hold_period_months,
      cash_on_cash_return: validatedData.cash_on_cash_return,
      preferred_return_rate: validatedData.preferred_return_rate,
      
      // Investment strategy
      investment_strategy: validatedData.investment_strategy,
      business_plan: validatedData.business_plan,
      value_creation_strategy: validatedData.value_creation_strategy,
      exit_strategy: validatedData.exit_strategy,
      
      // Timeline - convert date strings to Date objects
      fundraising_deadline: validatedData.fundraising_deadline ? new Date(validatedData.fundraising_deadline) : null,
      expected_closing_date: validatedData.expected_closing_date ? new Date(validatedData.expected_closing_date) : null,
      construction_start_date: validatedData.construction_start_date ? new Date(validatedData.construction_start_date) : null,
      stabilization_date: validatedData.stabilization_date ? new Date(validatedData.stabilization_date) : null,
      projected_exit_date: validatedData.projected_exit_date ? new Date(validatedData.projected_exit_date) : null,
      
      // Visibility and access
      public_listing: validatedData.public_listing,
      featured_listing: validatedData.featured_listing,
      accredited_only: validatedData.accredited_only,
      geographic_restrictions: validatedData.geographic_restrictions,
      
      // Performance tracking defaults
      views_count: 0,
      interest_count: 0,
      inquiry_count: 0,
      meeting_requests_count: 0
    }

    // Insert opportunity into database
    const { data: opportunity, error: insertError } = await (supabase as SupabaseClient)
      .from('investment_opportunities')
      .insert(opportunityData)
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create opportunity' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Opportunity created successfully',
        id: opportunity.id,
        opportunity 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}