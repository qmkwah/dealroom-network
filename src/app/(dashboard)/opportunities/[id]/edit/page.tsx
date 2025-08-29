import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OpportunityEditForm from './OpportunityEditForm'

export default async function OpportunityEditPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch the opportunity to edit
  const { data: opportunity, error } = await supabase
    .from('investment_opportunities')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !opportunity) {
    notFound()
  }

  // Check if user owns this opportunity
  if (opportunity.sponsor_id !== user.id) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Edit Investment Opportunity
        </h1>
        <p className="text-gray-600">
          Update the details of your investment opportunity
        </p>
      </div>

      <OpportunityEditForm 
        opportunity={opportunity} 
        opportunityId={params.id} 
      />
    </div>
  )
}