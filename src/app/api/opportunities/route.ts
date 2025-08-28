import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpportunitySchema, createDraftSchema } from '@/lib/validations/opportunities'

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
    
    // Determine which validation schema to use based on status
    const isDraft = body.status === 'draft'
    const validation = isDraft 
      ? createDraftSchema.safeParse(body)
      : createOpportunitySchema.safeParse(body)
    
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

    // Create database insert data
    const opportunityData: any = {
      sponsor_id: user.id,
      title: validatedData.title,
      status: validatedData.status
    }

    // For drafts, provide default values for required database fields
    if (isDraft) {
      // Required fields with default values for drafts
      opportunityData.property_type = validatedData.propertyType || 'multifamily'
      opportunityData.description = validatedData.description || 'Draft - description to be added'
      opportunityData.street = validatedData.street || 'TBD'
      opportunityData.city = validatedData.city || 'TBD'
      opportunityData.state = validatedData.state || 'TBD'
      opportunityData.zip_code = validatedData.zipCode || '00000'
      opportunityData.country = validatedData.country || 'US'
      opportunityData.square_footage = validatedData.squareFootage || 1000
      opportunityData.year_built = validatedData.yearBuilt || 2000
      opportunityData.unit_count = validatedData.unitCount || 1
      opportunityData.total_investment = validatedData.totalInvestment || 100000
      opportunityData.minimum_investment = validatedData.minimumInvestment || 10000
      opportunityData.target_return = validatedData.targetReturn || 10
      opportunityData.hold_period = validatedData.holdPeriod || 60
      opportunityData.acquisition_fee = validatedData.acquisitionFee || 0
      opportunityData.management_fee = validatedData.managementFee || 0
      opportunityData.disposition_fee = validatedData.dispositionFee || 0
    } else {
      // For published opportunities, use validated data directly
      opportunityData.property_type = validatedData.propertyType
      opportunityData.description = validatedData.description
      opportunityData.street = validatedData.street
      opportunityData.city = validatedData.city
      opportunityData.state = validatedData.state
      opportunityData.zip_code = validatedData.zipCode
      opportunityData.country = validatedData.country || 'US'
      opportunityData.square_footage = validatedData.squareFootage
      opportunityData.year_built = validatedData.yearBuilt
      opportunityData.unit_count = validatedData.unitCount || 1
      opportunityData.total_investment = validatedData.totalInvestment
      opportunityData.minimum_investment = validatedData.minimumInvestment
      opportunityData.target_return = validatedData.targetReturn
      opportunityData.hold_period = validatedData.holdPeriod
      opportunityData.acquisition_fee = validatedData.acquisitionFee || 0
      opportunityData.management_fee = validatedData.managementFee || 0
      opportunityData.disposition_fee = validatedData.dispositionFee || 0
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