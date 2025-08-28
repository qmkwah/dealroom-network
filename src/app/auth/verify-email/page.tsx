import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircleIcon, MailIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Verify Your Email | DealRoom Network',
  description: 'Please check your email to verify your account.',
}

export default function VerifyEmailPage() {
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
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MailIcon className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to verify your account and complete your registration.
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
                
                <div className="text-center">
                  <Link 
                    href="/auth/register" 
                    className="text-sm text-primary hover:underline"
                  >
                    Need to register again?
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}