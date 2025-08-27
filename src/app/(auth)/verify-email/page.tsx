'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [emailResent, setEmailResent] = useState(false)
  const supabase = createClient()
  
  const handleResendEmail = async () => {
    setIsResending(true)
    
    try {
      // Get the current user's email from localStorage or session if available
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) throw error
        
        setEmailResent(true)
        toast.success('Verification email sent successfully!')
      } else {
        toast.error('Unable to resend email. Please try registering again.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Check Your Email</h1>
        <p className="text-muted-foreground">
          We've sent you a verification link to complete your registration
        </p>
      </div>
      
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Next Steps
          </CardTitle>
          <CardDescription>
            Follow these steps to activate your DealRoom Network account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the verification link we sent you</li>
            <li>You'll be automatically signed in to your dashboard</li>
            <li>Complete your professional profile to start networking</li>
          </ol>
          
          {!emailResent ? (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Didn't receive the email?
              </p>
              <Button 
                variant="outline" 
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                A new verification email has been sent. Please check your inbox.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Support Information */}
      <div className="text-center space-y-4">
        <div className="text-sm text-muted-foreground">
          Still having trouble?{' '}
          <Link 
            href="mailto:support@dealroomnetwork.com" 
            className="text-primary hover:underline"
          >
            Contact our support team
          </Link>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Want to use a different email?{' '}
          <Link 
            href="/auth/register" 
            className="text-primary hover:underline"
          >
            Register with a new account
          </Link>
        </div>
      </div>
      
      {/* Back to Login */}
      <div className="pt-6 border-t">
        <Link href="/auth/login">
          <Button variant="ghost" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  )
}