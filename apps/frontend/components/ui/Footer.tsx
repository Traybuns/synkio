'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FOOTER_LINKS, SOCIAL_LINKS } from '../../libs/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-[#0a0e1a] to-[#070a14] mt-20">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-linka-emerald/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12 mb-12">
          {/* Brand section */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shadow-linka-emerald/15"
              >
                <Image
                  src="/logo_dark.png"
                  alt="Synkio Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </motion.div>
              <span className="text-white text-xl font-bold">Synkio</span>
            </div>
            <p className="text-[#929bc9] text-sm leading-relaxed mb-6 max-w-sm">
              The safer way to buy, sell, and get paid. Conversational commerce with blockchain-powered escrow protection.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#929bc9] hover:text-linka-emerald hover:border-linka-emerald/30 hover:bg-linka-emerald/10 transition-all duration-200"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* Product links */}
          <div className="col-span-1">
            <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#929bc9] text-sm hover:text-linka-emerald transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="col-span-1">
            <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#929bc9] text-sm hover:text-linka-emerald transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div className="col-span-1">
            <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#929bc9] text-sm hover:text-linka-emerald transition-colors duration-200 inline-block hover:translate-x-1 transform"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-[#929bc9] text-sm hover:text-linka-emerald transition-colors duration-200 inline-block hover:translate-x-1 transform"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="col-span-1">
            <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#929bc9] text-sm hover:text-linka-emerald transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#929bc9] text-sm text-center md:text-left">
              © {currentYear} Synkio. All Rights Reserved.
            </p>
            <div className="relative flex flex-wrap items-center gap-2 text-[#929bc9] text-xs justify-center md:justify-end">
              {/* Continuous gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-linka-emerald/10 via-blue-500/10 to-purple-500/10 rounded-xl opacity-50 -z-10" />
              
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-linka-emerald/20">
                <span className="text-white/70">Available on</span>
                <span className="text-linka-emerald font-semibold">Multi-chain</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-blue-400/20">
                <span className="text-blue-200/80">Powered by the 🧱⛓️</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-purple-400/20">
                <span className="text-purple-200/80">Built with ❤️ or 💎 🔒 🚀</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

