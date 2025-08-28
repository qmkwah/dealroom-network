'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, AlertCircleIcon, LoaderIcon } from 'lucide-react'
import Link from 'next/link'

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const type = searchParams.get('type')
        
        if (!code) {
          throw new Error('No verification code found')
        }

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
          throw error
        }

        if (data.user) {
          if (type === 'signup') {
            setStatus('success')
            setMessage('Email verified successfully! Welcome to DealRoom Network.')
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          } else if (type === 'recovery') {
            setStatus('success')
            setMessage('Email verified! You can now reset your password.')
            
            // Redirect to reset password page
            setTimeout(() => {
              router.push('/auth/reset-password')
            }, 2000)
          } else {
            setStatus('success')
            setMessage('Verification successful!')
            
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else {
          throw new Error('User verification failed')
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Verification failed. Please try again.')
      }
    }

    handleAuthCallback()
  }, [searchParams, router, supabase.auth])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center">
                {status === 'loading' && (
                  <LoaderIcon className="w-6 h-6 text-blue-600 animate-spin" />
                )}
                {status === 'success' && (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircleIcon className="w-6 h-6 text-red-600" />
                  </div>
                )}
              </div>
              
              <CardTitle>
                {status === 'loading' && 'Verifying...'}
                {status === 'success' && 'Verification Successful'}
                {status === 'error' && 'Verification Failed'}
              </CardTitle>
              
              <CardDescription>{message}</CardDescription>
            </CardHeader>
            
            <CardContent>
              {status === 'loading' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Please wait while we verify your email...
                  </p>
                </div>
              )}
              
              {status === 'success' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    You will be redirected automatically in a few seconds.
                  </p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    If you continue to have issues, please contact support.
                  </p>
                  
                  <div className="flex flex-col space-y-2">
                    <Link href="/auth/login" className="w-full">
                      <Button className="w-full">
                        Go to Sign In
                      </Button>
                    </Link>
                    
                    <Link href="/auth/register" className="w-full">
                      <Button variant="outline" className="w-full">
                        Create New Account
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to DealRoom Network
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center">
                  <LoaderIcon className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
                <CardTitle>Loading...</CardTitle>
                <CardDescription>Please wait while we verify your email...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}