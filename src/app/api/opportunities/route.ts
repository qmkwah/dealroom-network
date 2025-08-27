import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpportunitySchema } from '@/lib/validations/opportunities'

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

    // Build query with filters
    let query = (supabase as SupabaseClient)
      .from('investment_opportunities')
      .select(`
        *,
        sponsor:auth.users!sponsor_id(email, user_metadata, raw_user_meta_data)
      `)

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
    const validation = createOpportunitySchema.safeParse(body)
    
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
    const opportunityData = {
      sponsor_id: user.id,
      title: validatedData.title,
      property_type: validatedData.propertyType,
      description: validatedData.description,
      street: validatedData.street,
      city: validatedData.city,
      state: validatedData.state,
      zip_code: validatedData.zipCode,
      country: validatedData.country,
      square_footage: validatedData.squareFootage,
      year_built: validatedData.yearBuilt,
      unit_count: validatedData.unitCount,
      total_investment: validatedData.totalInvestment,
      minimum_investment: validatedData.minimumInvestment,
      target_return: validatedData.targetReturn,
      hold_period: validatedData.holdPeriod,
      acquisition_fee: validatedData.acquisitionFee,
      management_fee: validatedData.managementFee,
      disposition_fee: validatedData.dispositionFee,
      status: validatedData.status
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