import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | DealRoom Network',
  description: 'Privacy Policy for DealRoom Network professional real estate networking platform.',
}

export default function PrivacyPage() {
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
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 2024
            </p>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>Account Information:</strong> Name, email address, phone number, company information, and professional role.</p>
                <p><strong>Profile Information:</strong> Professional bio, experience, areas of expertise, and investment preferences.</p>
                <p><strong>Usage Data:</strong> How you interact with our platform, pages visited, and features used.</p>
                <p><strong>Communication Data:</strong> Messages sent through our platform and support interactions.</p>
                <p><strong>Financial Information:</strong> Payment information processed securely through third-party providers.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• Provide and maintain our networking platform</p>
                <p>• Facilitate professional connections and deal sharing</p>
                <p>• Process payments and subscription management</p>
                <p>• Send important service updates and communications</p>
                <p>• Improve our platform based on usage patterns</p>
                <p>• Ensure platform security and prevent fraud</p>
                <p>• Comply with legal obligations</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. Information Sharing and Disclosure</h2>
              <div className="space-y-3 text-muted-foreground">
                <p><strong>With Other Users:</strong> Your profile information is visible to other verified professionals on the platform to facilitate networking.</p>
                <p><strong>Service Providers:</strong> We work with third-party providers for hosting, payment processing, and analytics. These providers have limited access to your data for specific functions only.</p>
                <p><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and the safety of our users.</p>
                <p><strong>Business Transfers:</strong> In the event of a merger or acquisition, user data may be transferred as part of the business assets.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security audits, and access controls.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to provide our services and as required by law. When you delete your account, we will delete or anonymize your personal information, except where retention is required for legal or legitimate business purposes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Your Rights and Choices</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Access:</strong> You can access and update your account information at any time through your profile settings.</p>
                <p><strong>Correction:</strong> You can correct inaccurate information in your profile.</p>
                <p><strong>Deletion:</strong> You can request deletion of your account and personal data.</p>
                <p><strong>Portability:</strong> You can request a copy of your data in a structured format.</p>
                <p><strong>Marketing Communications:</strong> You can opt out of marketing emails at any time.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser, but some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that we have collected information from a child under 18, we will delete it immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and sending an email notification. Your continued use of the service after changes become effective constitutes acceptance of the new policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">11. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="space-y-1 text-muted-foreground">
                <p>Email: privacy@dealroomnetwork.com</p>
                <p>Address: [Company Address]</p>
                <p>Phone: [Company Phone]</p>
              </div>
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