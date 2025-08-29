'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, MessageCircle, Calendar, FileText, LogIn } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InvestorActionsProps {
  opportunity: any
  user: any
  isOwner: boolean
  userRole?: string
}

export default function InvestorActions({ 
  opportunity, 
  user, 
  isOwner, 
  userRole 
}: InvestorActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleExpressInterest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunity.id}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_type: 'general_interest',
          message: 'I am interested in learning more about this investment opportunity.'
        })
      })

      if (response.ok) {
        toast({
          title: "Interest Expressed",
          description: "The sponsor has been notified of your interest.",
        })
      } else {
        throw new Error('Failed to express interest')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to express interest. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestInformation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/opportunities/${opportunity.id}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_type: 'request_information',
          message: 'I would like to request additional information about this opportunity.'
        })
      })

      if (response.ok) {
        toast({
          title: "Information Requested",
          description: "Your request has been sent to the sponsor.",
        })
      } else {
        throw new Error('Failed to request information')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request information. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interested in This Deal?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Sign in to express interest and connect with the sponsor.
          </p>
          <Button className="w-full" asChild>
            <Link href="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Sign in to express interest
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Opportunity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" asChild>
            <Link href={`/opportunities/${opportunity.id}/edit`}>
              <FileText className="w-4 h-4 mr-2" />
              Edit Opportunity
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/inquiries?opportunity=${opportunity.id}`}>
              <MessageCircle className="w-4 h-4 mr-2" />
              View Inquiries
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (userRole === 'capital_partner') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Express Interest</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleExpressInterest}
            disabled={isLoading}
            className="w-full"
          >
            <Heart className="w-4 h-4 mr-2" />
            Express Interest
          </Button>
          <Button 
            onClick={handleRequestInformation}
            disabled={isLoading}
            variant="outline" 
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Request Information
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/messages/compose?to=${opportunity.sponsor_id}&subject=Regarding ${opportunity.opportunity_name}`}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Sponsor
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect with Sponsor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/messages/compose?to=${opportunity.sponsor_id}&subject=Regarding ${opportunity.opportunity_name}`}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Message Sponsor
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}