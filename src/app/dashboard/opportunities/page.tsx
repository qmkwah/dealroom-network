'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Opportunity {
  id: string
  title: string
  property_type: string
  total_investment: number
  minimum_investment: number
  target_return: number
  status: string
  created_at: string
  city: string
  state: string
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOpportunities = async () => {
      const response = await fetch('/api/opportunities')
      if (response.ok) {
        const data = await response.json()
        setOpportunities(data.opportunities || [])
      }
      setLoading(false)
    }

    fetchOpportunities()
  }, [])

  if (loading) {
    return <div>Loading opportunities...</div>
  }

  const publishedOpportunities = opportunities.filter(opp => opp.status === 'active' || opp.status === 'review')
  const draftOpportunities = opportunities.filter(opp => opp.status === 'draft')
  const archivedOpportunities = opportunities.filter(opp => opp.status === 'archived')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-600">
            Manage your investment opportunities and drafts
          </p>
        </div>
        <Link href="/dashboard/opportunities/create">
          <Button>Create Opportunity</Button>
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold">No opportunities found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first opportunity</p>
            <Link href="/dashboard/opportunities/create">
              <Button>Create Opportunity</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Draft Opportunities */}
          {draftOpportunities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Drafts</h2>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {draftOpportunities.length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {draftOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-400">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Draft
                        </Badge>
                      </div>
                      <CardDescription>
                        {opportunity.city}, {opportunity.state} • {opportunity.property_type}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Investment</span>
                          <span className="font-medium">{formatCurrency(opportunity.total_investment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Minimum Investment</span>
                          <span className="font-medium">{formatCurrency(opportunity.minimum_investment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Target Return</span>
                          <span className="font-medium">{opportunity.target_return}%</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/dashboard/opportunities/${opportunity.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Continue Editing
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Published Opportunities */}
          {publishedOpportunities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Published Opportunities</h2>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {publishedOpportunities.length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publishedOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-400">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {opportunity.status === 'active' ? 'Active' : 'Under Review'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {opportunity.city}, {opportunity.state} • {opportunity.property_type}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Investment</span>
                          <span className="font-medium">{formatCurrency(opportunity.total_investment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Minimum Investment</span>
                          <span className="font-medium">{formatCurrency(opportunity.minimum_investment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Target Return</span>
                          <span className="font-medium">{opportunity.target_return}%</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link href={`/dashboard/opportunities/${opportunity.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Archived Opportunities */}
          {archivedOpportunities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Archived Opportunities</h2>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  {archivedOpportunities.length}
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {archivedOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="hover:shadow-md transition-shadow border-l-4 border-l-gray-400 opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-gray-600">{opportunity.title}</CardTitle>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Archived
                        </Badge>
                      </div>
                      <CardDescription>
                        {opportunity.city}, {opportunity.state} • {opportunity.property_type}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Investment</span>
                          <span className="font-medium">{formatCurrency(opportunity.total_investment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Minimum Investment</span>
                          <span className="font-medium">{formatCurrency(opportunity.minimum_investment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Target Return</span>
                          <span className="font-medium">{opportunity.target_return}%</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link href={`/dashboard/opportunities/${opportunity.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}