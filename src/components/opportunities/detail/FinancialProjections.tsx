import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface FinancialProjectionsProps {
  opportunity: any
}

export default function FinancialProjections({ opportunity }: FinancialProjectionsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Investment Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Project Cost:</span>
                    <span className="font-medium">{formatCurrency(opportunity.total_project_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equity Requirement:</span>
                    <span className="font-medium">{formatCurrency(opportunity.equity_requirement)}</span>
                  </div>
                  {opportunity.debt_amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Debt Amount:</span>
                      <span className="font-medium">{formatCurrency(opportunity.debt_amount)}</span>
                    </div>
                  )}
                  {opportunity.loan_to_cost_ratio && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loan-to-Cost:</span>
                      <span className="font-medium">{formatPercentage(opportunity.loan_to_cost_ratio)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Investment Terms</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Investment:</span>
                    <span className="font-medium">{formatCurrency(opportunity.minimum_investment)}</span>
                  </div>
                  {opportunity.maximum_investment && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maximum Investment:</span>
                      <span className="font-medium">{formatCurrency(opportunity.maximum_investment)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Raise:</span>
                    <span className="font-medium">{formatCurrency(opportunity.target_raise_amount)}</span>
                  </div>
                  {opportunity.preferred_return_rate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preferred Return:</span>
                      <span className="font-medium">{formatPercentage(opportunity.preferred_return_rate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projected Returns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunity.projected_irr && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(opportunity.projected_irr)}
                </div>
                <div className="text-sm text-gray-600">Projected IRR</div>
              </div>
            )}
            
            {opportunity.projected_total_return_multiple && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {opportunity.projected_total_return_multiple}x
                </div>
                <div className="text-sm text-gray-600">Total Return Multiple</div>
              </div>
            )}
            
            {opportunity.cash_on_cash_return && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(opportunity.cash_on_cash_return)}
                </div>
                <div className="text-sm text-gray-600">Cash-on-Cash Return</div>
              </div>
            )}
          </div>
          
          {opportunity.projected_hold_period_months && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-center">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {opportunity.projected_hold_period_months} months
                  </div>
                  <div className="text-sm text-gray-600">Projected Hold Period</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {(opportunity.value_creation_strategy || opportunity.exit_strategy) && (
        <Card>
          <CardHeader>
            <CardTitle>Strategy & Exit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunity.value_creation_strategy && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Value Creation Strategy</h4>
                <p className="text-gray-600">{opportunity.value_creation_strategy}</p>
              </div>
            )}
            
            {opportunity.exit_strategy && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Exit Strategy</h4>
                <p className="text-gray-600 capitalize">{opportunity.exit_strategy.replace('_', ' ')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}