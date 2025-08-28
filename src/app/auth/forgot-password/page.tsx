import { Metadata } from 'next'
import Link from 'next/link'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Reset Password | DealRoom Network',
  description: 'Reset your DealRoom Network account password.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              DealRoom Network
            </Link>
            <div className="text-sm text-muted-foreground">
              Professional Real Estate Networking
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a reset link
            </p>
          </div>
          
          {/* Forgot Password Form */}
          <div className="space-y-4">
            <ForgotPasswordForm />
          </div>
          
          {/* Navigation Links */}
          <div className="space-y-4">
            <Separator />
            
            <div className="text-center space-y-3">
              <div className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Back to Sign In
                </Link>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up for DealRoom Network
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}