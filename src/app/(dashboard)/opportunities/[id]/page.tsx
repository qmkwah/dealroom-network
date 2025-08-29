import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OpportunityHeader from '@/components/opportunities/detail/OpportunityHeader'
import InvestmentSummary from '@/components/opportunities/detail/InvestmentSummary'
import FinancialProjections from '@/components/opportunities/detail/FinancialProjections'
import InvestorActions from '@/components/opportunities/detail/InvestorActions'
import PropertyDetails from '@/components/opportunities/detail/PropertyDetails'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function OpportunityDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient()
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch opportunity details
  const { data: opportunity, error } = await supabase
    .from('investment_opportunities')
    .select(`
      *,
      sponsor:sponsor_id (
        id,
        first_name,
        last_name,
        company_name,
        email
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !opportunity) {
    notFound()
  }

  // Check if user is the sponsor
  const isOwner = user?.id === opportunity.sponsor_id
  const userRole = user?.user_metadata?.role

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <OpportunityHeader 
        opportunity={opportunity}
        isOwner={isOwner}
        userRole={userRole}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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
                  <CardTitle>Investment Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{opportunity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Investment Strategy</h4>
                      <p className="text-gray-600 capitalize">{(opportunity as any).strategy?.replace('_', ' ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Hold Period</h4>
                      <p className="text-gray-600">{opportunity.hold_period || 'Not specified'} {opportunity.hold_period ? 'months' : ''}</p>
                    </div>
                  </div>
                  
                  {(opportunity as any).business_plan && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Business Plan</h4>
                      <p className="text-gray-600">{(opportunity as any).business_plan}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="financials">
              <FinancialProjections opportunity={opportunity} />
            </TabsContent>
            
            <TabsContent value="property">
              <PropertyDetails opportunity={opportunity} />
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {user ? 'Documents will be available after expressing interest.' : 'Sign in to view documents.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <InvestmentSummary opportunity={opportunity} />
          <InvestorActions 
            opportunity={opportunity}
            user={user}
            isOwner={isOwner}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  )
}