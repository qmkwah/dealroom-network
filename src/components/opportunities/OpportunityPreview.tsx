'use client'

import React from 'react'
import { OpportunityInput } from '@/lib/validations/opportunity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BuildingIcon, 
  MapPinIcon, 
  DollarSignIcon, 
  CalendarIcon,
  TrendingUpIcon,
  InfoIcon 
} from 'lucide-react'

interface OpportunityPreviewProps {
  opportunityData: OpportunityInput
}

export function OpportunityPreview({ opportunityData }: OpportunityPreviewProps) {
  const formatCurrency = (amount?: number | null) => {
    if (!amount && amount !== 0) return 'N/A'
    return `$${amount.toLocaleString()}`
  }

  const formatPercentage = (ratio?: number | null) => {
    if (!ratio && ratio !== 0) return 'N/A'
    return `${Math.round(ratio * 100)}%`
  }

  const formatNumber = (num?: number | null) => {
    if (!num && num !== 0) return 'N/A'
    return num.toLocaleString()
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatPropertyType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatStrategy = (strategy?: string) => {
    if (!strategy) return 'N/A'
    return strategy.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatCondition = (condition?: string) => {
    if (!condition) return 'N/A'
    return condition.charAt(0).toUpperCase() + condition.slice(1)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {opportunityData.opportunity_name || 'Untitled Opportunity'}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline">
                {formatStatus(opportunityData.status || 'draft')}
              </Badge>
              {opportunityData.property_address && (
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>
                    {opportunityData.property_address.city}, {opportunityData.property_address.state}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {opportunityData.opportunity_description && (
          <p className="text-gray-600 text-lg">
            {opportunityData.opportunity_description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="property">Property</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <InfoIcon className="h-5 w-5" />
                    Investment Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Investment Strategy</h4>
                      <p className="text-gray-600">
                        {formatStrategy(opportunityData.investment_strategy)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Exit Strategy</h4>
                      <p className="text-gray-600">
                        {formatStrategy(opportunityData.exit_strategy)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Hold Period</h4>
                      <p className="text-gray-600">
                        {opportunityData.projected_hold_period_months ? 
                          `${opportunityData.projected_hold_period_months} months` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Strategy Type</h4>
                      <p className="text-gray-600">
                        {formatStrategy(opportunityData.investment_strategy)}
                      </p>
                    </div>
                  </div>
                  
                  {opportunityData.business_plan && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Business Plan</h4>
                      <p className="text-gray-600">{opportunityData.business_plan}</p>
                    </div>
                  )}
                  
                  {opportunityData.value_creation_strategy && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Value Creation Strategy</h4>
                      <p className="text-gray-600">{opportunityData.value_creation_strategy}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="financials" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSignIcon className="h-5 w-5" />
                    Financial Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900">Total Project Cost</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(opportunityData.total_project_cost)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Equity Requirement</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(opportunityData.equity_requirement)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Debt Amount</h4>
                      <p className="text-lg text-gray-600">
                        {formatCurrency(opportunityData.debt_amount)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Debt Type</h4>
                      <p className="text-lg text-gray-600">
                        {opportunityData.debt_type ? 
                          formatStrategy(opportunityData.debt_type) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Loan-to-Cost Ratio</h4>
                      <p className="text-lg text-gray-600">
                        {formatPercentage(opportunityData.loan_to_cost_ratio)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Loan-to-Value Ratio</h4>
                      <p className="text-lg text-gray-600">
                        {formatPercentage(opportunityData.loan_to_value_ratio)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5" />
                    Investment Terms & Returns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900">Minimum Investment</h4>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(opportunityData.minimum_investment)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Maximum Investment</h4>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatCurrency(opportunityData.maximum_investment)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Target Raise</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(opportunityData.target_raise_amount)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Projected IRR</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {formatPercentage(opportunityData.projected_irr)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Return Multiple</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {opportunityData.projected_total_return_multiple ? 
                          `${opportunityData.projected_total_return_multiple}x` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Cash-on-Cash Return</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {formatPercentage(opportunityData.cash_on_cash_return)}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Preferred Return</h4>
                      <p className="text-lg text-gray-600">
                        {formatPercentage(opportunityData.preferred_return_rate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="property" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BuildingIcon className="h-5 w-5" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {opportunityData.property_address && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                        <p className="text-gray-600">
                          {opportunityData.property_address.street}
                        </p>
                        <p className="text-gray-600">
                          {opportunityData.property_address.city}, {opportunityData.property_address.state} {opportunityData.property_address.zip}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900">Property Type</h4>
                        <p className="text-gray-600">
                          {formatPropertyType(opportunityData.property_type || 'N/A')}
                        </p>
                      </div>
                      {opportunityData.property_subtype && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Subtype</h4>
                          <p className="text-gray-600">
                            {opportunityData.property_subtype}
                          </p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">Square Feet</h4>
                        <p className="text-gray-600">
                          {formatNumber(opportunityData.total_square_feet)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Number of Units</h4>
                        <p className="text-gray-600">
                          {formatNumber(opportunityData.number_of_units)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Year Built</h4>
                        <p className="text-gray-600">
                          {opportunityData.year_built || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Property Condition</h4>
                        <p className="text-gray-600">
                          {formatCondition(opportunityData.property_condition)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Documents will be available after the opportunity is published and investors express interest.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Investment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Investment</span>
                <span className="font-semibold">
                  {formatCurrency(opportunityData.minimum_investment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Raise</span>
                <span className="font-semibold">
                  {formatCurrency(opportunityData.target_raise_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Projected IRR</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(opportunityData.projected_irr)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hold Period</span>
                <span className="font-semibold">
                  {opportunityData.projected_hold_period_months ? 
                    `${opportunityData.projected_hold_period_months} months` : 'N/A'}
                </span>
              </div>
              {opportunityData.fundraising_deadline && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-orange-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-sm">
                      Fundraising Deadline: {new Date(opportunityData.fundraising_deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                  This is a preview of your opportunity
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full inline-block"></span>
                  Changes are not saved automatically
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  Save your form to publish
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}