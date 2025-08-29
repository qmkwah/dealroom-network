import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Calendar, Home, Ruler } from 'lucide-react'

interface PropertyDetailsProps {
  opportunity: any
}

export default function PropertyDetails({ opportunity }: PropertyDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Address</h4>
                  <p className="text-gray-600">
                    {opportunity.property_address?.street}<br />
                    {opportunity.property_address?.city}, {opportunity.property_address?.state} {opportunity.property_address?.zip}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Property Type</h4>
                  <p className="text-gray-600 capitalize">
                    {opportunity.property_type?.replace('_', ' ')}
                    {opportunity.property_subtype && (
                      <span className="text-sm text-gray-500"> - {opportunity.property_subtype}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {opportunity.total_square_feet && (
                <div className="flex items-start space-x-3">
                  <Ruler className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Size</h4>
                    <p className="text-gray-600">
                      {opportunity.total_square_feet.toLocaleString()} sq ft
                      {opportunity.number_of_units && (
                        <span className="text-sm text-gray-500"> • {opportunity.number_of_units} units</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {opportunity.year_built && (
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Year Built</h4>
                    <p className="text-gray-600">{opportunity.year_built}</p>
                  </div>
                </div>
              )}

              {opportunity.property_condition && (
                <div>
                  <h4 className="font-medium text-gray-900">Property Condition</h4>
                  <p className="text-gray-600 capitalize">{opportunity.property_condition}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      {opportunity.market_analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {typeof opportunity.market_analysis === 'string' ? (
                <p className="text-gray-600">{opportunity.market_analysis}</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(opportunity.market_analysis).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="font-medium text-gray-900 capitalize mb-1">
                        {key.replace('_', ' ')}
                      </h4>
                      <p className="text-gray-600">{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunity.expected_closing_date && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Expected Closing</span>
                <span className="font-medium">
                  {new Date(opportunity.expected_closing_date).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {opportunity.construction_start_date && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Construction Start</span>
                <span className="font-medium">
                  {new Date(opportunity.construction_start_date).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {opportunity.stabilization_date && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Stabilization</span>
                <span className="font-medium">
                  {new Date(opportunity.stabilization_date).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {opportunity.projected_exit_date && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Projected Exit</span>
                <span className="font-medium">
                  {new Date(opportunity.projected_exit_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}