'use client'

import { motion } from 'framer-motion'
import Header from '../../components/ui/Header'

export default function PrivacyPage() {
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
              Privacy Policy
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
              <h2 className="text-white text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="mb-3">We collect information necessary to provide our service:</p>
              <ul className="space-y-2 ml-4">
                <li>• Account information (name, email, username)</li>
                <li>• Transaction data (payment methods, transaction history)</li>
                <li>• Communication data (messages, conversations)</li>
                <li>• Device and usage information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="space-y-2 ml-4">
                <li>• Provide and improve our services</li>
                <li>• Process transactions and payments</li>
                <li>• Protect against fraud and abuse</li>
                <li>• Communicate with you about your account</li>
                <li>• Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">3. Information Sharing</h2>
              <p className="mb-3">
                We do not sell your personal information. We may share information only:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• With your consent</li>
                <li>• To complete transactions (with the other party)</li>
                <li>• With service providers who help us operate</li>
                <li>• When required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your information, including encryption, 
                secure storage, and access controls. However, no system is 100% secure, and we cannot guarantee 
                absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">5. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="space-y-2 ml-4">
                <li>• Access your personal information</li>
                <li>• Correct inaccurate information</li>
                <li>• Delete your account and data</li>
                <li>• Opt out of certain communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to improve your experience, analyze usage, and provide 
                personalized content. You can control cookies through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">7. Children's Privacy</h2>
              <p>
                Our service is not intended for users under 18 years of age. We do not knowingly collect 
                information from children.
              </p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes 
                and update the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">9. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact 
                us through the support channels available in your account dashboard.
              </p>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

