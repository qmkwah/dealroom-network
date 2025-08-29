'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OpportunityForm } from '@/components/opportunities/forms/OpportunityForm'
import { OpportunityInput } from '@/lib/validations/opportunity'
import { toast } from 'sonner'

interface OpportunityEditFormProps {
  opportunity: any
  opportunityId: string
}

export default function OpportunityEditForm({ 
  opportunity, 
  opportunityId 
}: OpportunityEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: OpportunityInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update opportunity')
      }

      const result = await response.json()
      
      toast.success('Opportunity updated successfully!')
      router.push(`/opportunities/${opportunityId}`)
      
      return { id: opportunityId }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update opportunity')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveAsDraft = async (data: Partial<OpportunityInput>) => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, status: 'draft' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save draft')
      }

      toast.success('Draft saved successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save draft')
      throw error
    }
  }

  return (
    <OpportunityForm
      mode="edit"
      initialData={opportunity}
      onSubmit={handleSubmit}
      onSaveAsDraft={handleSaveAsDraft}
    />
  )
}