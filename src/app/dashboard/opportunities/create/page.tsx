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
    const publishData = {
      ...data,
      status: 'active'
    }

    const response = await fetch('/api/opportunities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(publishData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create opportunity')
    }

    const result = await response.json()
    toast.success('Opportunity published successfully!')
    router.push(`/dashboard/opportunities/${result.opportunity.id}`)
    return { id: result.opportunity.id }
  }

  const handleSaveAsDraft = async (data: Partial<CreateOpportunityInput>) => {
    // Validate draft has at least title
    if (!data.title || data.title.trim().length === 0) {
      toast.error('Draft must have at least a title')
      return
    }

    try {
      const draftData = {
        ...data,
        status: 'draft'
      }

      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save draft')
      }

      const result = await response.json()
      toast.success('Draft saved successfully!')
      
      // Clear localStorage draft and redirect to edit page
      localStorage.removeItem('opportunity-draft')
      router.push(`/dashboard/opportunities/${result.opportunity.id}`)
    } catch (error: any) {
      console.error('Draft save error:', error)
      toast.error(error.message || 'Failed to save draft')
    }
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