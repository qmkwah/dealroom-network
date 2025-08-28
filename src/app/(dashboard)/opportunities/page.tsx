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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-600">
            Browse and manage investment opportunities
          </p>
        </div>
        <Link href="/opportunities/create">
          <Button>Create Opportunity</Button>
        </Link>
      </div>

      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold">No opportunities found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first opportunity</p>
            <Link href="/opportunities/create">
              <Button>Create Opportunity</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <Badge variant="secondary">{opportunity.status}</Badge>
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
                  <Link href={`/opportunities/${opportunity.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}