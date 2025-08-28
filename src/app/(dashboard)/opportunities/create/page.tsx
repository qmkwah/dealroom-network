'use client'

import { OpportunityForm } from '@/components/opportunities/forms/OpportunityForm'
import { createOpportunitySchema, type CreateOpportunityInput } from '@/lib/validations/opportunities'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CreateOpportunityPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (data: CreateOpportunityInput) => {
    const response = await fetch('/api/opportunities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create opportunity')
    }

    const result = await response.json()
    toast.success('Opportunity created successfully!')
    router.push(`/opportunities/${result.opportunity.id}`)
    return { id: result.opportunity.id }
  }

  const handleSaveAsDraft = async (data: Partial<CreateOpportunityInput>) => {
    // Save to localStorage for now
    localStorage.setItem('opportunity-draft', JSON.stringify(data))
    toast.success('Draft saved!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Investment Opportunity</h1>
        <p className="text-gray-600">
          Fill out the form below to create a new investment opportunity.
        </p>
      </div>
      
      <OpportunityForm
        mode="create"
        onSubmit={handleSubmit}
        onSaveAsDraft={handleSaveAsDraft}
      />
    </div>
  )
}