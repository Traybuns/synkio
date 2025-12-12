'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FAQ_SECTIONS } from '../../libs/constants/faq'

export default function FAQSection() {
  const [showAll, setShowAll] = useState(false)
  const visibleSections = showAll ? FAQ_SECTIONS : FAQ_SECTIONS.slice(0, 2)
  const remainingCount = Math.max(FAQ_SECTIONS.length - visibleSections.length, 0)

  return (
    <section className="relative w-full border-t border-white/10 bg-gradient-to-b from-[#0f1525]/50 via-[#101322] to-[#0a0e1a]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 right-10 h-96 w-96 rounded-full bg-linka-emerald/30 blur-[140px]" />
        <div className="absolute top-1/2 left-0 h-80 w-80 rounded-full bg-blue-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-purple-500/15 blur-[120px]" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20 sm:px-8 lg:px-10">
        <div className="text-center space-y-4">
          <p className="text-linka-emerald font-semibold uppercase tracking-[0.3em] text-xs">Resources</p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Quick answers to the top questions
          </h2>
          <p className="text-[#929bc9] max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            A fast look at how Synkio keeps conversations moving, payments safe, and teams aligned before you even create an account.
          </p>
        </div>

        <div className="space-y-6">
          {visibleSections.map((section, idx) => {
            const Icon = section.icon
            return (
              <motion.article
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl hover:border-linka-emerald/20 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${section.accent} flex items-center justify-center border border-white/10`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="absolute -bottom-2 -right-1 h-3 w-3 rounded-full bg-linka-emerald/80 blur" />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-bold">{section.title}</h3>
                      <p className="text-[#929bc9] text-sm">{section.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {section.entries.map((entry) => (
                    <div
                      key={entry.question}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-200"
                    >
                      <p className="text-white text-lg font-semibold leading-tight">{entry.question}</p>
                      <p className="text-[#c7cce6] text-sm leading-relaxed mt-3">{entry.answer}</p>
                      {entry.highlights && (
                        <ul className="mt-4 space-y-2 text-sm text-white/80">
                          {entry.highlights.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-linka-emerald flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </motion.article>
            )
          })}
        </div>
        {!showAll && remainingCount > 0 && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-full border border-linka-emerald/40 bg-linka-emerald/10 px-6 py-3 text-sm font-semibold text-linka-emerald transition hover:bg-linka-emerald/20"
            >
              See more answers
              <span className="text-white/60 text-xs uppercase tracking-[0.25em]">
                +{remainingCount}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

