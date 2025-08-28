'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OpportunityForm } from '@/components/opportunities/forms/OpportunityForm'
import { type CreateOpportunityInput } from '@/lib/validations/opportunities'
import { toast } from 'sonner'

interface OpportunityData {
  id: string
  title: string
  property_type: string
  description: string
  street: string
  city: string
  state: string
  zip_code: string
  country: string
  square_footage: number
  year_built: number
  unit_count: number
  total_investment: number
  minimum_investment: number
  target_return: number
  hold_period: number
  acquisition_fee: number
  management_fee: number
  disposition_fee: number
  status: string
  sponsor_id: string
}

export default function EditOpportunityPage() {
  const params = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<OpportunityData | null>(null)
  const [loading, setLoading] = useState(true)
  const opportunityId = params.id as string

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await fetch(`/api/opportunities/${opportunityId}`)
        if (response.ok) {
          const data = await response.json()
          setOpportunity(data.opportunity)
        } else {
          const error = await response.json()
          toast.error(error.error || 'Failed to load opportunity')
          router.push('/dashboard/opportunities')
        }
      } catch (error) {
        console.error('Error fetching opportunity:', error)
        toast.error('Failed to load opportunity')
        router.push('/dashboard/opportunities')
      } finally {
        setLoading(false)
      }
    }

    if (opportunityId) {
      fetchOpportunity()
    }
  }, [opportunityId, router])

  const handleSubmit = async (data: CreateOpportunityInput) => {
    // This is for saving changes to draft, not publishing
    try {
      const submitData = {
        ...data,
        status: 'draft' // Keep as draft
      }

      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update opportunity')
      }

      const result = await response.json()
      toast.success('Draft updated successfully!')
      router.push(`/dashboard/opportunities/${opportunityId}`)
      return { id: opportunityId }
    } catch (error: any) {
      console.error('Update error:', error)
      throw error
    }
  }

  const handlePublish = async (data: CreateOpportunityInput) => {
    try {
      const submitData = {
        ...data,
        status: 'active' // Publishing the opportunity
      }

      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish opportunity')
      }

      const result = await response.json()
      toast.success('Opportunity published successfully!')
      router.push(`/dashboard/opportunities/${opportunityId}`)
      return { id: opportunityId }
    } catch (error: any) {
      console.error('Publish error:', error)
      throw error
    }
  }

  const handleSaveAsDraft = async (data: Partial<CreateOpportunityInput>) => {
    try {
      const draftData = {
        ...data,
        status: 'draft'
      }

      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save draft')
      }

      toast.success('Draft saved successfully!')
    } catch (error: any) {
      console.error('Draft save error:', error)
      toast.error(error.message || 'Failed to save draft')
      throw error
    }
  }

  if (loading) {
    return <div>Loading opportunity...</div>
  }

  if (!opportunity) {
    return <div>Opportunity not found</div>
  }

  // Transform database fields to form fields
  const initialData: Partial<CreateOpportunityInput> = {
    title: opportunity.title,
    propertyType: opportunity.property_type as any,
    description: opportunity.description,
    street: opportunity.street,
    city: opportunity.city,
    state: opportunity.state,
    zipCode: opportunity.zip_code,
    country: opportunity.country,
    squareFootage: opportunity.square_footage,
    yearBuilt: opportunity.year_built,
    unitCount: opportunity.unit_count,
    totalInvestment: opportunity.total_investment,
    minimumInvestment: opportunity.minimum_investment,
    targetReturn: opportunity.target_return,
    holdPeriod: opportunity.hold_period,
    acquisitionFee: opportunity.acquisition_fee,
    managementFee: opportunity.management_fee,
    dispositionFee: opportunity.disposition_fee,
    status: opportunity.status as any
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Opportunity</h1>
        <p className="text-gray-600">
          Update your investment opportunity details.
        </p>
      </div>
      
      <OpportunityForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        onSaveAsDraft={handleSaveAsDraft}
        onPublish={handlePublish}
      />
    </div>
  )
}