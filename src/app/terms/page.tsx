import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | DealRoom Network',
  description: 'Terms of Service for DealRoom Network professional real estate networking platform.',
}

export default function TermsPage() {
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
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using DealRoom Network ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Description of Service</h2>
              <p className="text-muted-foreground">
                DealRoom Network is a professional networking platform designed specifically for commercial real estate professionals, including deal sponsors, capital partners, and service providers. The platform facilitates connections, deal sharing, and professional collaboration within the commercial real estate industry.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. User Accounts and Registration</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• You must provide accurate and complete information when registering</p>
                <p>• You are responsible for maintaining the confidentiality of your account credentials</p>
                <p>• You must be at least 18 years old to use this service</p>
                <p>• Each user may only maintain one account</p>
                <p>• Professional verification may be required for certain features</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Acceptable Use Policy</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Permitted Uses:</strong></p>
                <p>• Professional networking and relationship building</p>
                <p>• Sharing legitimate investment opportunities</p>
                <p>• Engaging in business discussions and collaborations</p>
                <p>• Accessing educational and industry resources</p>
                
                <p className="mt-4"><strong>Prohibited Uses:</strong></p>
                <p>• Posting fraudulent or misleading investment opportunities</p>
                <p>• Sharing confidential information without proper authorization</p>
                <p>• Harassment, spam, or unsolicited communications</p>
                <p>• Violation of securities laws or regulations</p>
                <p>• Impersonation of other individuals or entities</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Investment Disclaimer</h2>
              <p className="text-muted-foreground">
                DealRoom Network does not provide investment advice. All investment opportunities shared on the platform are for informational purposes only. Users should conduct their own due diligence and consult with qualified professionals before making any investment decisions. Past performance does not guarantee future results.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Privacy and Data Protection</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using the Service, you consent to the collection and use of information as outlined in our Privacy Policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Service and its original content, features, and functionality are and will remain the exclusive property of DealRoom Network. The Service is protected by copyright, trademark, and other laws. Users retain rights to their own content but grant us necessary licenses to operate the platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Subscription and Payment Terms</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• Subscription fees are billed monthly in advance</p>
                <p>• Success fees may apply to completed transactions</p>
                <p>• Payment disputes must be reported within 30 days</p>
                <p>• Refunds are subject to our refund policy</p>
                <p>• Prices may be updated with 30 days advance notice</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                DealRoom Network shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to investment losses, business interruption, or data loss, arising from your use of the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">11. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at legal@dealroomnetwork.com.
              </p>
            </section>
          </div>
          
          <div className="text-center pt-8 border-t">
            <Link href="/" className="text-primary hover:underline">
              ← Back to DealRoom Network
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}