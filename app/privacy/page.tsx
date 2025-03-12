export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <h1 className="text-4xl font-bold font-heading mb-8">Privacy Policy</h1>
          
          <div className="space-y-8 font-jakarta text-gray-600">
            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect the following information when you use SOLTIPP:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Public wallet addresses</li>
                <li>Transaction data (amounts, timestamps, messages)</li>
                <li>Profile information you choose to provide</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use the collected information for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processing transactions</li>
                <li>Maintaining and improving the platform</li>
                <li>Providing customer support</li>
                <li>Complying with legal obligations</li>
                <li>Preventing fraud and abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">3. Blockchain Data</h2>
              <p>
                Please note that all transactions on the Solana blockchain are public and
                permanent. While we protect your private information, transaction data including
                wallet addresses, amounts, and timestamps are publicly visible on the blockchain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your information. However,
                no internet transmission is completely secure. We cannot guarantee the security
                of data transmitted to our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">5. Third-Party Services</h2>
              <p>
                We may use third-party services for analytics, payment processing, and other
                functions. These services have their own privacy policies and may collect
                information according to their own practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">6. Your Rights</h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information (where possible)</li>
                <li>Object to certain data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">7. Changes to Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify users of any
                material changes through the platform. Your continued use of SOLTIPP after such
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">8. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or your personal information,
                please contact us through our support channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 