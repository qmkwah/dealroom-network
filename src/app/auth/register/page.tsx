import { Metadata } from 'next'
import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Join DealRoom Network | Professional Real Estate Networking',
  description: 'Join DealRoom Network to connect with deal sponsors, capital partners, and service providers in commercial real estate.',
}

export default function RegisterPage() {
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
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Join DealRoom Network</h1>
            <p className="text-muted-foreground">
              Connect with the best professionals in commercial real estate
            </p>
            
            {/* Role Badges */}
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">Deal Sponsors</Badge>
              <Badge variant="secondary" className="text-xs">Capital Partners</Badge>
              <Badge variant="secondary" className="text-xs">Service Providers</Badge>
            </div>
          </div>
          
          {/* Registration Form */}
          <div className="space-y-4">
            <RegisterForm />
          </div>
          
          {/* Terms and Navigation */}
          <div className="space-y-4">
            <Separator />
            
            <div className="text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
              
              <div className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign in to DealRoom Network
                </Link>
              </div>
            </div>
          </div>
          
          {/* Platform Benefits */}
          <div className="pt-6 border-t">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-center">Why Join DealRoom Network?</h3>
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Access exclusive investment opportunities</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Network with verified professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Streamlined partnership management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}