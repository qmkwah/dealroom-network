import { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Sign In | DealRoom Network',
  description: 'Sign in to your DealRoom Network account to access professional real estate networking tools.',
}

export default function LoginPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your DealRoom Network account
            </p>
          </div>
          
          {/* Login Form */}
          <div className="space-y-4">
            <LoginForm />
          </div>
          
          {/* Navigation Links */}
          <div className="space-y-4">
            <Separator />
            
            <div className="text-center space-y-3">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-primary hover:underline block"
              >
                Forgot your password?
              </Link>
              
              <div className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign up for DealRoom Network
                </Link>
              </div>
            </div>
          </div>
          
          {/* Professional Benefits */}
          <div className="pt-6 border-t">
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>Join thousands of real estate professionals</p>
              <p>• Deal Sponsors • Capital Partners • Service Providers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}