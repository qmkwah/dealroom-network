'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  isPopular?: boolean
}

interface UserSubscription {
  id: string
  plan: string
  status: 'active' | 'inactive' | 'cancelled'
  current_period_end: string
  cancel_at_period_end: boolean
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 199,
    interval: 'month',
    features: [
      'Access to 10 opportunities per month',
      'Basic networking features',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 499,
    interval: 'month',
    features: [
      'Access to unlimited opportunities',
      'Advanced networking features',
      'Priority support',
      'Deal analytics',
      'Direct messaging'
    ],
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    interval: 'month',
    features: [
      'Everything in Professional',
      'Custom deal sourcing',
      'Dedicated account manager',
      'API access',
      'White-label options'
    ]
  }
]

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        // Mock subscription data - in real implementation, fetch from API
        const mockSubscription: UserSubscription = {
          id: 'sub_123',
          plan: 'professional',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        }
        setCurrentSubscription(mockSubscription)
      } catch (error) {
        toast.error('Failed to load subscription')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [supabase.auth])

  const handleUpgrade = async (planId: string) => {
    try {
      // Mock Stripe checkout - in real implementation, redirect to Stripe
      toast.success('Redirecting to checkout...')
      
      // Mock API call to create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      }
    } catch (error) {
      toast.error('Failed to start checkout process')
    }
  }

  const handleCancelSubscription = async () => {
    try {
      // Mock API call to cancel subscription
      await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      setCurrentSubscription(prev => prev ? {
        ...prev,
        cancel_at_period_end: true
      } : null)
      
      toast.success('Subscription cancelled. You will retain access until the end of your billing period.')
    } catch (error) {
      toast.error('Failed to cancel subscription')
    }
  }

  if (loading) {
    return <div>Loading subscription...</div>
  }

  const currentPlan = PLANS.find(p => p.id === currentSubscription?.plan)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600">
          Manage your subscription plan and billing
        </p>
      </div>

      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              Your active subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{currentPlan?.name}</h3>
                <p className="text-gray-600">
                  {formatCurrency(currentPlan?.price || 0)}/month
                </p>
              </div>
              <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                {currentSubscription.status}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Next billing date:</span>
                <span>{new Date(currentSubscription.current_period_end).toLocaleDateString()}</span>
              </div>
              {currentSubscription.cancel_at_period_end && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Cancellation pending:</span>
                  <span>Will cancel at period end</span>
                </div>
              )}
            </div>

            {!currentSubscription.cancel_at_period_end && (
              <Button variant="outline" onClick={handleCancelSubscription}>
                Cancel Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.isPopular ? 'border-blue-500 shadow-lg' : ''}`}>
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-blue-500 hover:bg-blue-600">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={currentSubscription?.plan === plan.id ? 'outline' : 'default'}
                  disabled={currentSubscription?.plan === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {currentSubscription?.plan === plan.id ? 'Current Plan' : 'Upgrade to ' + plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}