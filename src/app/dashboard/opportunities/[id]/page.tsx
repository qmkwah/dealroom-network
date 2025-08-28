'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface OpportunityDetail {
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
  created_at: string
  sponsor_id: string
}

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const opportunityId = params.id as string

  useEffect(() => {
    const fetchOpportunity = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Fetch opportunity
      const response = await fetch(`/api/opportunities/${opportunityId}`)
      if (response.ok) {
        const data = await response.json()
        setOpportunity(data.opportunity)
      } else {
        const error = await response.json()
        console.error('API Error:', error)
        toast.error(error.error || 'Failed to load opportunity')
      }
      setLoading(false)
    }

    if (opportunityId) {
      fetchOpportunity()
    }
  }, [opportunityId, supabase.auth])

  const handleExpressInterest = async () => {
    toast.success('Interest expressed! The sponsor will be notified.')
  }

  const handleEdit = () => {
    router.push(`/dashboard/opportunities/${opportunityId}/edit`)
  }

  const handleInactive = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'archived'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to archive opportunity')
      }

      toast.success('Opportunity archived successfully!')
      
      // Refresh the opportunity data
      const refreshResponse = await fetch(`/api/opportunities/${opportunityId}`)
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setOpportunity(data.opportunity)
      }
    } catch (error: any) {
      console.error('Archive error:', error)
      toast.error(error.message || 'Failed to archive opportunity')
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete opportunity')
      }

      toast.success('Opportunity deleted successfully!')
      router.push('/dashboard/opportunities')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to delete opportunity')
    }
  }

  const handleReactivate = async () => {
    try {
      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'active'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reactivate opportunity')
      }

      toast.success('Opportunity reactivated successfully!')
      
      // Refresh the opportunity data
      const refreshResponse = await fetch(`/api/opportunities/${opportunityId}`)
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setOpportunity(data.opportunity)
      }
    } catch (error: any) {
      console.error('Reactivate error:', error)
      toast.error(error.message || 'Failed to reactivate opportunity')
    }
  }

  if (loading) {
    return <div>Loading opportunity...</div>
  }

  if (!opportunity) {
    return <div>Opportunity not found</div>
  }

  const isOwner = user?.id === opportunity.sponsor_id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{opportunity.title}</h1>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={
              opportunity.status === 'active' ? 'default' : 
              opportunity.status === 'draft' ? 'secondary' :
              opportunity.status === 'archived' ? 'outline' :
              'secondary'
            } className={
              opportunity.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
              opportunity.status === 'draft' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              opportunity.status === 'archived' ? 'bg-gray-100 text-gray-700 border-gray-200' :
              ''
            }>
              {opportunity.status === 'active' ? 'Active' : 
               opportunity.status === 'draft' ? 'Draft' :
               opportunity.status === 'archived' ? 'Archived' :
               opportunity.status === 'review' ? 'Under Review' :
               opportunity.status}
            </Badge>
            <span className="text-gray-600">
              {opportunity.city}, {opportunity.state}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner && opportunity.status === 'draft' && (
            <>
              <Button onClick={handleEdit} variant="outline" className="border border-input">
                Edit Draft
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="border border-input">
                    Delete Draft
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Draft Opportunity</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this draft opportunity? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" className="border border-input">
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} className="border border-input">
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {isOwner && (opportunity.status === 'active' || opportunity.status === 'review') && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border border-input">
                    Archive
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Archive Opportunity</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to archive this opportunity? It will be moved to inactive status and hidden from public listings.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" className="border border-input">
                      Cancel
                    </Button>
                    <Button variant="default" onClick={handleInactive} className="border border-input">
                      Archive
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="border border-input">
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Opportunity</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete this opportunity? This action cannot be undone and all associated data will be lost.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" className="border border-input">
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} className="border border-input">
                      Delete Permanently
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {isOwner && opportunity.status === 'archived' && (
            <>
              <Button onClick={handleReactivate} variant="default" className="border border-input">
                Reactivate
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="border border-input">
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Archived Opportunity</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete this archived opportunity? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" className="border border-input">
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} className="border border-input">
                      Delete Permanently
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {!isOwner && (
            <Button onClick={handleExpressInterest} className="border border-input">
              Express Interest
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{opportunity.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Address</h4>
                  <p className="text-gray-600">
                    {opportunity.street}<br />
                    {opportunity.city}, {opportunity.state} {opportunity.zip_code}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Property Type</h4>
                  <p className="text-gray-600 capitalize">{opportunity.property_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Square Footage</h4>
                  <p className="text-gray-600">{opportunity.square_footage.toLocaleString()} sq ft</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Year Built</h4>
                  <p className="text-gray-600">{opportunity.year_built}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Units</h4>
                  <p className="text-gray-600">{opportunity.unit_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Investment</span>
                <span className="font-semibold">{formatCurrency(opportunity.total_investment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Investment</span>
                <span className="font-semibold">{formatCurrency(opportunity.minimum_investment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Return</span>
                <span className="font-semibold">{opportunity.target_return}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hold Period</span>
                <span className="font-semibold">{opportunity.hold_period} months</span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Fee Structure</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Acquisition Fee</span>
                  <span>{opportunity.acquisition_fee}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Management Fee</span>
                  <span>{opportunity.management_fee}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Disposition Fee</span>
                  <span>{opportunity.disposition_fee}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}