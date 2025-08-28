'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const userRole = user?.user_metadata?.role

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to DealRoom Network
        </h1>
        <p className="text-gray-600">
          Your professional real estate investment platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Investment Opportunities</CardTitle>
            <CardDescription>
              Browse and manage investment deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/opportunities">
                <Button variant="outline" className="w-full">
                  View All Opportunities
                </Button>
              </Link>
              {userRole === 'deal_sponsor' && (
                <Link href="/opportunities/create">
                  <Button className="w-full">
                    Create New Opportunity
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Network</CardTitle>
            <CardDescription>
              Connect with industry professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/network">
              <Button variant="outline" className="w-full">
                Explore Network
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              Real-time communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/messages">
              <Button variant="outline" className="w-full">
                View Messages
              </Button>
            </Link>
          </CardContent>
        </Card>

        {userRole === 'capital_partner' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/subscription">
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}