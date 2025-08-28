import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRightIcon, BuildingIcon, UsersIcon, TrendingUpIcon } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">DealRoom Network</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Connect. Invest. Grow.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              The premier professional networking platform for commercial real estate deal makers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Join the Network
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Role Badges */}
          <div className="flex justify-center gap-3 flex-wrap">
            <Badge variant="secondary" className="px-4 py-2">
              <BuildingIcon className="h-4 w-4 mr-2" />
              Deal Sponsors
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Capital Partners
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <UsersIcon className="h-4 w-4 mr-2" />
              Service Providers
            </Badge>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BuildingIcon className="h-6 w-6 mr-3 text-blue-600" />
                Investment Opportunities
              </CardTitle>
              <CardDescription>
                Access exclusive commercial real estate deals from verified sponsors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multifamily properties</li>
                <li>• Office buildings</li>
                <li>• Retail centers</li>
                <li>• Industrial assets</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="h-6 w-6 mr-3 text-blue-600" />
                Professional Network
              </CardTitle>
              <CardDescription>
                Connect with verified professionals in commercial real estate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Deal sponsors</li>
                <li>• Capital partners</li>
                <li>• Property managers</li>
                <li>• Legal & accounting</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUpIcon className="h-6 w-6 mr-3 text-blue-600" />
                Deal Management
              </CardTitle>
              <CardDescription>
                Streamline your investment process from discovery to closing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Due diligence tools</li>
                <li>• Document sharing</li>
                <li>• Communication hub</li>
                <li>• Progress tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center space-y-6 bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Join the Network?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of real estate professionals who are already connecting, 
            investing, and growing their portfolios through DealRoom Network.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="px-12">
              Get Started Today
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 DealRoom Network. Professional Real Estate Networking Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
