'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { KeyRound, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { forgotPasswordSchema, ForgotPasswordInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })
  
  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setEmailSent(true)
      toast.success('Password reset email sent!')
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Check Your Email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent password reset instructions to{' '}
            <span className="font-medium">{getValues('email')}</span>
          </p>
        </div>
        
        <Alert>
          <AlertDescription>
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </AlertDescription>
        </Alert>
        
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button 
              onClick={() => setEmailSent(false)}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </div>
          
          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <Link 
          href="/auth/login" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight">Reset Your Password</h1>
        <p className="text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password
        </p>
      </div>
      
      {/* Reset Form */}
      <Card>
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
          <CardDescription>
            We&apos;ll send reset instructions to your registered email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending Reset Email...' : 'Send Reset Instructions'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Help Information */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link 
            href="/auth/login" 
            className="text-primary hover:underline"
          >
            Sign in to your account
          </Link>
        </p>
        
        <p className="text-sm text-muted-foreground">
          Need help?{' '}
          <Link 
            href="mailto:support@dealroomnetwork.com" 
            className="text-primary hover:underline"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}