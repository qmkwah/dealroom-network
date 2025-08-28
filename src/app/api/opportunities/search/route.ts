import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const keyword = searchParams.get('keyword') || ''
    const propertyType = searchParams.get('property_type')
    const investmentStrategy = searchParams.get('investment_strategy')
    const minInvestment = searchParams.get('min_investment')
    const maxInvestment = searchParams.get('max_investment')
    const minIrr = searchParams.get('min_irr')
    const maxIrr = searchParams.get('max_irr')
    const state = searchParams.get('state')
    const city = searchParams.get('city')
    const statusParam = searchParams.get('status') || 'active'
    // Map new statuses to old database statuses until migration is complete
    let dbStatus: 'draft' | 'review' | 'active' | 'closed' | 'archived'
    switch (statusParam) {
      case 'fundraising':
      case 'due_diligence':
        dbStatus = 'active'
        break
      case 'funded':
        dbStatus = 'closed'
        break
      case 'cancelled':
        dbStatus = 'archived'
        break
      default:
        dbStatus = statusParam as 'draft' | 'review' | 'active' | 'closed' | 'archived'
    }
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build the query
    let query = supabase
      .from('investment_opportunities')
      .select(`
        id,
        opportunity_name,
        opportunity_description,
        property_type,
        property_subtype,
        investment_strategy,
        total_project_cost,
        equity_requirement,
        minimum_investment,
        maximum_investment,
        target_raise_amount,
        projected_irr,
        projected_total_return_multiple,
        projected_hold_period_months,
        cash_on_cash_return,
        preferred_return_rate,
        property_address,
        total_square_feet,
        number_of_units,
        year_built,
        property_condition,
        business_plan,
        value_creation_strategy,
        exit_strategy,
        fundraising_deadline,
        expected_closing_date,
        public_listing,
        featured_listing,
        accredited_only,
        status,
        created_at,
        updated_at,
        sponsor_id
      `)

    // Apply filters
    if (dbStatus) {
      query = query.eq('status', dbStatus)
    }

    // Only show public listings unless authenticated user is the sponsor
    query = query.eq('public_listing', true)

    if (propertyType) {
      query = query.eq('property_type', propertyType as any)
    }

    if (investmentStrategy) {
      query = query.eq('investment_strategy', investmentStrategy as any)
    }

    if (minInvestment) {
      query = query.gte('minimum_investment', parseInt(minInvestment))
    }

    if (maxInvestment) {
      query = query.lte('minimum_investment', parseInt(maxInvestment))
    }

    if (minIrr) {
      query = query.gte('projected_irr', parseFloat(minIrr))
    }

    if (maxIrr) {
      query = query.lte('projected_irr', parseFloat(maxIrr))
    }

    // Location filters
    if (state) {
      query = query.ilike('property_address->>state', `%${state}%`)
    }

    if (city) {
      query = query.ilike('property_address->>city', `%${city}%`)
    }

    // Keyword search
    if (keyword) {
      query = query.or(
        `opportunity_name.ilike.%${keyword}%,opportunity_description.ilike.%${keyword}%,business_plan.ilike.%${keyword}%,value_creation_strategy.ilike.%${keyword}%`
      )
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    // Order by featured first, then by created date
    query = query.order('featured_listing', { ascending: false })
    query = query.order('created_at', { ascending: false })

    const { data: opportunities, error, count } = await query

    if (error) {
      console.error('Error fetching opportunities:', error)
      return NextResponse.json(
        { error: 'Failed to fetch opportunities' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const countQuery = supabase
      .from('investment_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('status', dbStatus)
      .eq('public_listing', true)

    if (propertyType) countQuery.eq('property_type', propertyType as any)
    if (investmentStrategy) countQuery.eq('investment_strategy', investmentStrategy as any)
    if (minInvestment) countQuery.gte('minimum_investment', parseInt(minInvestment))
    if (maxInvestment) countQuery.lte('minimum_investment', parseInt(maxInvestment))
    if (minIrr) countQuery.gte('projected_irr', parseFloat(minIrr))
    if (maxIrr) countQuery.lte('projected_irr', parseFloat(maxIrr))
    if (state) countQuery.ilike('property_address->>state', `%${state}%`)
    if (city) countQuery.ilike('property_address->>city', `%${city}%`)
    if (keyword) {
      countQuery.or(
        `opportunity_name.ilike.%${keyword}%,opportunity_description.ilike.%${keyword}%,business_plan.ilike.%${keyword}%,value_creation_strategy.ilike.%${keyword}%`
      )
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      opportunities,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
        hasNext: page < Math.ceil((totalCount || 0) / limit),
        hasPrev: page > 1
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