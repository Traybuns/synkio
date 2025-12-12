'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import FeedbackForm from '../../components/FeedbackForm'
import { FeedbackChannel } from '../../libs/types'

export default function FeedbackPage() {
  const { user, isAuthenticated } = useAuth()

  const highlightCards = useMemo(
    () => [
      {
        title: 'Under 24h response',
        description: 'We route every note straight to the product team and reply within one business day.',
      },
      {
        title: 'Built into roadmap',
        description: 'Feedback is tagged to feature requests so we can reach back out when it ships.',
      },
      {
        title: 'Private & secure',
        description: 'Only Synkio teammates can read submissions. No marketing blasts, just real humans.',
      },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-[#090f1f] text-white">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-16 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-linka-emerald font-semibold hover:text-emerald-300 transition-colors"
          >
            ← Back to homepage
          </Link>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">Feedback</div>
        </div>

        <div className="flex flex-col gap-6 text-center lg:text-left">
          <h1 className="text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            Help us shape the future of Synkio.
          </h1>
          <p className="text-base text-[#b9c0e3] sm:text-lg max-w-3xl">
            We read every message. Tell us what you love, what feels confusing, or what we should build next.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.85fr_minmax(0,1.15fr)]">
          <div className="order-2 flex flex-col gap-5 max-w-xl mx-auto w-full lg:order-1">
            {highlightCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/30 backdrop-blur-lg"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-linka-emerald/80 mb-2">Insight</p>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-[#9aa3cb]">{card.description}</p>
              </div>
            ))}
            {!isAuthenticated && (
              <p className="text-sm text-[#9aa3cb] rounded-2xl border border-dashed border-white/15 p-5 text-center">
                Want faster responses?{' '}
                <Link href="/login" className="text-linka-emerald font-semibold underline underline-offset-4">
                  Log in
                </Link>{' '}
                so we can follow up directly.
              </p>
            )}
          </div>

          <div className="order-1 w-full max-w-2xl mx-auto lg:order-2">
            <FeedbackForm user={user ?? undefined} channel={FeedbackChannel.WEB} />
          </div>
        </div>
      </div>
    </div>
  )
}

