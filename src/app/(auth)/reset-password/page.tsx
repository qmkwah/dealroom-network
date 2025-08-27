'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })
  
  useEffect(() => {
    // Check if we have valid reset token from URL
    const checkToken = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidToken(true)
      } else {
        // Token might be invalid or expired
        toast.error('Invalid or expired reset link')
      }
    }
    
    checkToken()
  }, [supabase.auth])
  
  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })
      
      if (error) throw error
      
      setIsSuccess(true)
      toast.success('Password updated successfully!')
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Password Updated</h1>
          <p className="text-muted-foreground">
            Your password has been successfully updated
          </p>
        </div>
        
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You&apos;ll be automatically redirected to your dashboard in a few seconds.
          </AlertDescription>
        </Alert>
        
        <Link href="/dashboard">
          <Button className="w-full">
            Continue to Dashboard
          </Button>
        </Link>
      </div>
    )
  }
  
  if (!isValidToken) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Invalid Reset Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Password reset links expire after 1 hour for security reasons.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Link href="/auth/forgot-password">
            <Button className="w-full">
              Request New Reset Link
            </Button>
          </Link>
          
          <Link href="/auth/login">
            <Button variant="ghost" className="w-full">
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
        <h1 className="text-3xl font-bold tracking-tight">Set New Password</h1>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>
      
      {/* Password Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Password</CardTitle>
          <CardDescription>
            Choose a strong password with at least 8 characters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Security Note */}
      <Alert>
        <AlertDescription>
          For your security, you&apos;ll be automatically signed in after updating your password.
        </AlertDescription>
      </Alert>
    </div>
  )
}