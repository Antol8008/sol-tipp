export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <h1 className="text-4xl font-bold font-heading mb-8">Terms of Service</h1>
          
          <div className="space-y-8 font-jakarta text-gray-600">
            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using SOLTIPP, you agree to be bound by these Terms of Service
                and all applicable laws and regulations. If you do not agree with any of these terms,
                you are prohibited from using or accessing this platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">2. Platform Description</h2>
              <p>
                SOLTIPP is a platform that enables users to send and receive tips using the Solana
                blockchain. The platform facilitates cryptocurrency transactions between users and
                charges a platform fee for this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to use this service</li>
                <li>You are responsible for maintaining the security of your wallet</li>
                <li>You agree not to use the platform for any illegal activities</li>
                <li>You are responsible for any taxes applicable to your transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">4. Fees and Payments</h2>
              <p>
                SOLTIPP charges a 3% platform fee on all transactions. Additional network fees may
                apply based on the Solana network&apos;s current conditions. All fees are non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">5. Content Guidelines</h2>
              <p>
                Users are responsible for all content they post on their profiles. Content must not
                violate any applicable laws or infringe on any intellectual property rights.
                SOLTIPP reserves the right to remove any content that violates these guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">6. Limitation of Liability</h2>
              <p>
                SOLTIPP is not responsible for any losses or damages resulting from the use of
                the platform, including but not limited to transaction errors, wallet
                incompatibilities, or network issues.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of
                any changes through the platform. Continued use of the platform after changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold font-heading text-black mb-4">8. Contact</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us through
                our support channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 