'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { OpportunityFormPRD } from '@/components/opportunities/forms/OpportunityFormPRD'
import { type OpportunityInput } from '@/lib/validations/opportunity'
import { toast } from 'sonner'

interface OpportunityData {
  id: string
  opportunity_name: string
  opportunity_description: string
  property_type: string
  property_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  total_square_feet: number
  year_built: number
  number_of_units: number
  total_project_cost: number
  equity_requirement: number
  minimum_investment: number
  maximum_investment: number
  target_raise_amount: number
  projected_irr: number
  projected_hold_period_months: number
  investment_strategy: string
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

  const handleSubmit = async (data: OpportunityInput) => {
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

  const handlePublish = async (data: OpportunityInput) => {
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

  const handleSaveAsDraft = async (data: Partial<OpportunityInput>) => {
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
  const initialData: Partial<OpportunityInput> = {
    opportunity_name: opportunity.opportunity_name,
    opportunity_description: opportunity.opportunity_description,
    property_type: opportunity.property_type as any,
    property_address: {
      street: opportunity.property_address?.street || '',
      city: opportunity.property_address?.city || '',
      state: opportunity.property_address?.state || '',
      zip: opportunity.property_address?.zip || '',
      country: opportunity.property_address?.country || 'US'
    },
    total_square_feet: opportunity.total_square_feet,
    year_built: opportunity.year_built,
    number_of_units: opportunity.number_of_units,
    total_project_cost: opportunity.total_project_cost,
    equity_requirement: opportunity.equity_requirement,
    minimum_investment: opportunity.minimum_investment,
    maximum_investment: opportunity.maximum_investment,
    target_raise_amount: opportunity.target_raise_amount,
    projected_irr: opportunity.projected_irr,
    projected_hold_period_months: opportunity.projected_hold_period_months,
    investment_strategy: opportunity.investment_strategy as any,
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
      
      <OpportunityFormPRD
        mode="edit"
        initialData={initialData}
        onSubmit={handleSubmit}
        onSaveAsDraft={handleSaveAsDraft}
        onPublish={handlePublish}
      />
    </div>
  )
}