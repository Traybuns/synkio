'use client'

import { motion } from 'framer-motion'
import Header from '../../components/ui/Header'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#101322] flex flex-col">
      <Header variant="landing" />
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-10 lg:px-20 xl:px-40 py-20">
        <div className="w-full max-w-[960px] flex flex-col gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] mb-4">
              Terms of Service
            </h1>
            <p className="text-[#929bc9] text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-8 text-[#929bc9] text-base leading-relaxed"
          >
            <section>
              <h2 className="text-white text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Synkio, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">2. Use of Service</h2>
              <p className="mb-3">
                Synkio provides a platform for buying, selling, and transacting through conversations. You agree to:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• Use the service only for lawful purposes</li>
                <li>• Provide accurate information when creating an account</li>
                <li>• Respect other users and their transactions</li>
                <li>• Not engage in fraudulent or deceptive practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">3. Transactions</h2>
              <p className="mb-3">
                All transactions on Synkio are protected by our escrow system. By using our service, you agree that:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• Funds are held securely until both parties are satisfied</li>
                <li>• Disputes will be resolved according to our dispute resolution process</li>
                <li>• Transaction fees apply as disclosed at the time of transaction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">4. User Responsibilities</h2>
              <p>
                You are responsible for maintaining the security of your account, all activities that occur under your account, 
                and for ensuring all information you provide is accurate and current.
              </p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">5. Limitation of Liability</h2>
              <p>
                Synkio provides the platform and protection services, but we are not responsible for the quality, safety, or legality 
                of items listed or sold through our service. We are not liable for any losses resulting from transactions between users.
              </p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">6. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes. 
                Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">7. Contact</h2>
              <p>
                If you have questions about these Terms of Service, please contact us through the support channels 
                available in your account dashboard.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

