import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, MapPin } from 'lucide-react'

interface OpportunityHeaderProps {
  opportunity: any
  isOwner: boolean
  userRole?: string
}

export default function OpportunityHeader({ 
  opportunity, 
  isOwner, 
  userRole 
}: OpportunityHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fundraising': return 'bg-green-100 text-green-800'
      case 'due_diligence': return 'bg-yellow-100 text-yellow-800'
      case 'funded': return 'bg-blue-100 text-blue-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border-b pb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {opportunity.opportunity_name}
            </h1>
            <Badge className={getStatusColor(opportunity.status)}>
              {opportunity.status?.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>
              {opportunity.property_address?.street}, {opportunity.property_address?.city}, {opportunity.property_address?.state} {opportunity.property_address?.zip}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="capitalize">{opportunity.property_type?.replace('_', ' ')}</span>
            {opportunity.total_square_feet && (
              <span>{opportunity.total_square_feet.toLocaleString()} sq ft</span>
            )}
            {opportunity.year_built && (
              <span>Built {opportunity.year_built}</span>
            )}
          </div>
        </div>
        
        {isOwner && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/opportunities/${opportunity.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Opportunity
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div>
          <span className="font-medium">Sponsored by:</span> {opportunity.sponsor?.company_name || `${opportunity.sponsor?.first_name} ${opportunity.sponsor?.last_name}`}
        </div>
        <div>
          <span className="font-medium">Listed:</span> {new Date(opportunity.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}