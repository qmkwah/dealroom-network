'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Users,
  Star
} from 'lucide-react'
import { propertyTypes, investmentStrategies } from '@/lib/constants/opportunities'

interface OpportunityCardProps {
  opportunity: {
    id: string
    opportunity_name: string
    opportunity_description: string
    property_type: string
    property_subtype?: string
    investment_strategy: string
    total_project_cost: number
    equity_requirement: number
    minimum_investment: number
    maximum_investment?: number
    target_raise_amount: number
    projected_irr?: number
    projected_total_return_multiple?: number
    projected_hold_period_months?: number
    cash_on_cash_return?: number
    preferred_return_rate?: number
    property_address: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
    total_square_feet?: number
    number_of_units?: number
    year_built?: number
    fundraising_deadline?: string
    expected_closing_date?: string
    featured_listing: boolean
    accredited_only: boolean
    status: string
    created_at: string
  }
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const propertyTypeLabel = propertyTypes.find(
    type => type.value === opportunity.property_type
  )?.label || opportunity.property_type

  const investmentStrategyLabel = investmentStrategies.find(
    strategy => strategy.value === opportunity.investment_strategy
  )?.label || opportunity.investment_strategy

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Card className={`h-full transition-all duration-200 hover:shadow-lg ${
      opportunity.featured_listing ? 'ring-2 ring-primary/20 bg-primary/5' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {opportunity.featured_listing && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
              <h3 className="font-semibold text-lg leading-tight">
                {opportunity.opportunity_name}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {propertyTypeLabel}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {opportunity.property_address.city}, {opportunity.property_address.state}
              </div>
            </div>
          </div>
          <Badge variant={opportunity.featured_listing ? 'default' : 'secondary'}>
            {investmentStrategyLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {truncateDescription(opportunity.opportunity_description)}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Investment:</span>
              <span className="font-medium">{formatCurrency(opportunity.total_project_cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Equity Needed:</span>
              <span className="font-medium">{formatCurrency(opportunity.equity_requirement)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min Investment:</span>
              <span className="font-medium">{formatCurrency(opportunity.minimum_investment)}</span>
            </div>
          </div>

          <div className="space-y-2">
            {opportunity.projected_irr && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Projected IRR:</span>
                <span className="font-medium text-green-600">
                  {formatPercentage(opportunity.projected_irr)}
                </span>
              </div>
            )}
            {opportunity.cash_on_cash_return && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cash-on-Cash:</span>
                <span className="font-medium text-green-600">
                  {formatPercentage(opportunity.cash_on_cash_return)}
                </span>
              </div>
            )}
            {opportunity.projected_hold_period_months && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hold Period:</span>
                <span className="font-medium">
                  {Math.round(opportunity.projected_hold_period_months / 12)} years
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
          {opportunity.total_square_feet && (
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {opportunity.total_square_feet.toLocaleString()} sq ft
            </div>
          )}
          {opportunity.number_of_units && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {opportunity.number_of_units} units
            </div>
          )}
          {opportunity.year_built && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Built {opportunity.year_built}
            </div>
          )}
        </div>

        {/* Important Notices */}
        <div className="flex flex-wrap gap-2">
          {opportunity.accredited_only && (
            <Badge variant="outline" className="text-xs">
              Accredited Investors Only
            </Badge>
          )}
          {opportunity.fundraising_deadline && (
            <Badge variant="outline" className="text-xs">
              Deadline: {new Date(opportunity.fundraising_deadline).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            Listed {new Date(opportunity.created_at).toLocaleDateString()}
          </div>
          <Button asChild size="sm">
            <Link href={`/opportunities/${opportunity.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}