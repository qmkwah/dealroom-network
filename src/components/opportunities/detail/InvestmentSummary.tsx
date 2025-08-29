import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface InvestmentSummaryProps {
  opportunity: any
}

export default function InvestmentSummary({ opportunity }: InvestmentSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Project Cost</p>
            <p className="text-lg font-semibold">
              {formatCurrency(opportunity.total_project_cost)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Equity Required</p>
            <p className="text-lg font-semibold">
              {formatCurrency(opportunity.equity_requirement)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Min Investment</p>
            <p className="text-lg font-semibold">
              {formatCurrency(opportunity.minimum_investment)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Target Raise</p>
            <p className="text-lg font-semibold">
              {formatCurrency(opportunity.target_raise_amount)}
            </p>
          </div>
        </div>
        
        {opportunity.projected_irr && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Projected IRR</p>
              <p className="text-lg font-semibold text-green-600">
                {formatPercentage(opportunity.projected_irr)}
              </p>
            </div>
            {opportunity.projected_total_return_multiple && (
              <div>
                <p className="text-sm text-gray-600">Return Multiple</p>
                <p className="text-lg font-semibold">
                  {opportunity.projected_total_return_multiple}x
                </p>
              </div>
            )}
          </div>
        )}
        
        {opportunity.cash_on_cash_return && (
          <div>
            <p className="text-sm text-gray-600">Cash-on-Cash Return</p>
            <p className="text-lg font-semibold">
              {formatPercentage(opportunity.cash_on_cash_return)}
            </p>
          </div>
        )}
        
        {opportunity.fundraising_deadline && (
          <div>
            <p className="text-sm text-gray-600">Fundraising Deadline</p>
            <p className="text-sm font-medium">
              {new Date(opportunity.fundraising_deadline).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}