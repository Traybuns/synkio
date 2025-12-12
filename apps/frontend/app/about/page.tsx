'use client'

import Link from 'next/link'

import { motion } from 'framer-motion'
import Header from '../../components/ui/Header'
const teamMembers = [
  {
    name: 'Samson McCarthy',
    role: 'Founder & CEO',
    focus: 'Vision, partnerships, fundraising, and keeping Synkio relentlessly user-first.',
  },
  {
    name: 'Gar Manji Michael',
    role: 'Co-Founder',
    focus: 'Product direction, strategy, and ensuring our AI experiences stay conversational.',
  },
  {
    name: 'Shaibu',
    role: 'Chief Technology Officer',
    focus: 'Smart contract architecture, security reviews, and scaling the platform safely.',
  },
  // {
  //   name: 'Bunrinmwa Gobum',
  //   role: 'Head of Growth',
  //   focus: 'Community programs, go-to-market partnerships, and retention loops.',
  // },
]

const pillars = [
  {
    headline: 'Conversation first',
    detail: 'Every flow—buying, selling, paying, resolving—happens inside chat so you never switch context.',
  },
  {
    headline: 'Trust on autopilot',
    detail: 'Escrow, dispute tools, and transparent histories make commerce feel safe even with new contacts.',
  },
  {
    headline: 'Multi-channel by design',
    detail: 'Web, WhatsApp, and Farcaster experiences all connect to the same smart escrow engine.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#090f1f] text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-16 sm:px-8 lg:px-12">
        <div className="text-sm text-linka-emerald font-semibold">
          <Link href="/" className="hover:text-emerald-300 transition-colors">
            ← Back to homepage
          </Link>
        </div>

        <section className="flex flex-col gap-6 text-center lg:text-left">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">About Synkio</p>
          <h1 className="text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            Commerce that feels as simple as sending a message.
          </h1>
          <p className="text-lg text-[#b9c0e3] max-w-3xl">
            Synkio was born from a belief that trust and payment rails should never slow down a conversation.
            We orchestrate escrow, settlement, and reputation in the background so people can just agree and move on.
          </p>
        </section>

        <section className="grid gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-xl shadow-black/30 backdrop-blur">
          <h2 className="text-2xl font-bold">What guides us</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.headline} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-linka-emerald/80 mb-3">Pillar</p>
                <h3 className="text-xl font-semibold">{pillar.headline}</h3>
                <p className="text-sm text-[#9aa3cb] mt-2">{pillar.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-lg shadow-black/20 backdrop-blur">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Our approach</p>
              <h2 className="text-3xl font-bold">Why we exist</h2>
            </div>
            <p className="text-base text-[#c0c5e5]">
              Buying from a Online Store, DM or WhatsApp shouldn’t require blind trust. Our smart escrow,
              settlement system wraps every deal in transparency without forcing people into a
              heavy marketplace UI. Thatʼs why vendors and buyers stay right inside chat while Synkio handles the
              paperwork.
            </p>
            <ul className="space-y-3 text-sm text-[#9aa3cb]">
              <li>• Funds live in audited escrow contracts until both sides sign off.</li>
              <li>• Disputes run through clear chat-based flows with human backup.</li>
              <li>• Wallets spin up automatically so every user keeps on-chain identity from day one.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-[#9aa3cb]">
            <p className="font-semibold text-white mb-3">Snapshot</p>
            <p>HQ: Remote-first, distributed team</p>
            <p>Focus: Multi-channel social commerce</p>
            <p>Support: 24h response time and AI triage</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Meet the team</p>
              <h2 className="text-3xl font-bold">Builders behind Synkio</h2>
            </div>
            <Link
              href="/contact"
              className="text-sm font-semibold text-linka-emerald hover:text-emerald-300 transition-colors"
            >
              Talk with us →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {teamMembers.map((member) => (
              <div key={member.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-linka-emerald/80">Core</p>
                <h3 className="text-xl font-semibold mt-2">{member.name}</h3>
                <p className="text-[#b9c0e3]">{member.role}</p>
                <p className="text-sm text-[#9aa3cb] mt-3">{member.focus}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
