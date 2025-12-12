'use client'

import { motion } from 'framer-motion'
import Header from '../../components/ui/Header'
import Link from 'next/link'

export default function PricingPage() {
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-[#929bc9] text-lg max-w-2xl mx-auto">
              Pay only for what you use. No hidden fees, no surprises.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Buyer',
                price: 'Free',
                description: 'Perfect for making purchases',
                features: [
                  'Browse marketplace',
                  'Chat with sellers',
                  'Secure payments',
                  'Transaction protection',
                  '24/7 support'
                ]
              },
              {
                name: 'Seller',
                price: '2.5%',
                description: 'Per successful transaction',
                features: [
                  'List unlimited items',
                  'Accept all payment methods',
                  'Automated escrow',
                  'Reputation system',
                  'Analytics dashboard'
                ]
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For high-volume businesses',
                features: [
                  'Everything in Seller',
                  'Dedicated support',
                  'Custom integrations',
                  'Volume discounts',
                  'Priority processing'
                ]
              }
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white/5 dark:bg-[#1c1d27] rounded-xl p-8 border border-white/10"
              >
                <h3 className="text-white text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-white text-4xl font-black">{plan.price}</span>
                  {plan.price !== 'Free' && plan.price !== 'Custom' && (
                    <span className="text-[#929bc9] text-lg ml-2">per transaction</span>
                  )}
                </div>
                <p className="text-[#929bc9] text-sm mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-linka-emerald mt-1">✓</span>
                      <span className="text-white text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="block w-full text-center px-6 py-3 bg-linka-emerald hover:bg-emerald-600 text-white rounded-full font-bold transition-colors"
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

