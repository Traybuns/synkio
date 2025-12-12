'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Image from 'next/image'
import FAQSection from './FAQSection'
import Footer from './Footer'
import { HOW_IT_WORKS_STEPS, FEATURES } from '../../libs/constants'

interface HeroProps {
  onAction: (action: string) => void
}

export default function Hero({ onAction }: HeroProps) {
  const router = useRouter()
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const ctaRef = useRef(null)

  const heroInView = useInView(heroRef, { once: true, margin: '-100px' })
  const featuresInView = useInView(featuresRef, { once: true, margin: '-50px' })
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: '-50px' })
  const ctaInView = useInView(ctaRef, { once: true, margin: '-50px' })

  const [activeTab, setActiveTab] = useState<'marketplace' | 'payments' | 'security'>('marketplace')
  const { isAuthenticated: hasUser } = useAuth()
  const carouselRef = useRef<HTMLDivElement>(null)
  const lastSwitchTimeRef = useRef<number>(0)
  const [isNearEdge, setIsNearEdge] = useState<'left' | 'right' | null>(null)
  const edgeDetectionZone = 100
  const switchCooldown = 800

  const tabs: Array<'marketplace' | 'payments' | 'security'> = ['marketplace', 'payments', 'security']
  const activeTabRef = useRef(activeTab)
  
  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  const goToNextTab = useCallback(() => {
    const now = Date.now()
    if (now - lastSwitchTimeRef.current < switchCooldown) return
    
    const currentIndex = tabs.indexOf(activeTabRef.current)
    if (currentIndex < tabs.length - 1) {
      lastSwitchTimeRef.current = now
      setActiveTab(tabs[currentIndex + 1])
    }
  }, [])
  
  const goToPreviousTab = useCallback(() => {
    const now = Date.now()
    if (now - lastSwitchTimeRef.current < switchCooldown) return
    
    const currentIndex = tabs.indexOf(activeTabRef.current)
    if (currentIndex > 0) {
      lastSwitchTimeRef.current = now
      setActiveTab(tabs[currentIndex - 1])
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!carouselRef.current) return
      
      const rect = carouselRef.current.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const relativeY = e.clientY - rect.top
      
      const isInCarouselArea = 
        relativeX >= 0 && 
        relativeX <= rect.width && 
        relativeY >= 0 && 
        relativeY <= rect.height
      
      if (!isInCarouselArea) {
        setIsNearEdge(null)
        return
      }
      
      const isNearLeftEdge = relativeX < edgeDetectionZone
      const isNearRightEdge = relativeX > rect.width - edgeDetectionZone
      
      if (isNearLeftEdge) {
        setIsNearEdge('left')
        goToPreviousTab()
      } else if (isNearRightEdge) {
        setIsNearEdge('right')
        goToNextTab()
      } else {
        setIsNearEdge(null)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [goToNextTab, goToPreviousTab])

  return (
    <div className="w-full overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#101322] via-[#0f1525] to-[#0a0e1a]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: ['-50%', '-30%', '-50%'],
            y: ['-50%', '-40%', '-50%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-linka-emerald/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: ['50%', '60%', '50%'],
            y: ['50%', '60%', '50%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-linka-blue/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative flex min-h-screen w-full flex-col">
        <div className="flex flex-1 justify-center px-4 md:px-10 lg:px-20 xl:px-40 py-5">
          <div className="flex flex-col w-full max-w-[1100px] flex-1">
            <main className="flex flex-col gap-16 md:gap-24">
              <section className="w-full pt-20 md:pt-32" ref={heroRef}>
                <div className="grid gap-10 px-4 py-12 sm:gap-14 lg:gap-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
                  <div className="flex flex-col gap-6 sm:min-w-[400px] sm:gap-8 relative z-10 text-center lg:text-left mx-auto lg:mx-0 w-full max-w-2xl">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={heroInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6 }}
                      className="flex flex-col gap-5"
                    >
                      <h1 className="text-white/95 text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl md:text-6xl lg:text-7xl text-balance">
                        <span className="block">The Safer Way to</span>
                        <span className="block bg-gradient-to-r from-linka-emerald via-emerald-400 to-linka-emerald bg-clip-text text-transparent">
                          Buy, Sell, Make Payments
                        </span>
                      </h1>
                      <h2 className="text-[#929bc9] text-lg font-medium leading-relaxed sm:text-xl max-w-2xl mx-auto lg:mx-0">
                        From daily purchases to big deals, Synkio protects your money and makes every payment simple—no matter who you're dealing with.
                      </h2>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={heroInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="flex flex-wrap gap-4 justify-center lg:justify-start"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (hasUser) {
                            onAction('go-to-chat')
                          } else {
                            router.push('/login')
                          }
                        }}
                        className="group relative flex min-w-[160px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 sm:h-14 px-8 bg-linka-emerald hover:bg-emerald-500 text-white text-sm font-bold leading-normal tracking-[0.02em] sm:text-base transition-all duration-300 touch-manipulation shadow-lg shadow-linka-emerald/25"
                      >
                        <span className="relative z-10 truncate">{hasUser ? 'Go to Dashboard' : 'Get Started'}</span>
                        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        <motion.div
                          className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                          initial={false}
                        />
                      </motion.button>
                    </motion.div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={heroInView ? { opacity: 1, scale: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative w-full max-w-[480px] justify-self-center hidden lg:block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-linka-emerald/30 via-emerald-500/10 to-transparent blur-3xl" />
                    <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#0f1729]/90 to-[#08101f]/80 shadow-2xl shadow-emerald-900/40">
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                          backgroundSize: '20px 20px',
                        }}
                      />
                      <Image
                        src="/hero.png"
                        alt="Synkio chat commerce preview"
                        width={640}
                        height={640}
                        priority
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </motion.div>
                </div>
              </section>

              <section className="flex flex-col gap-10" ref={featuresRef}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col gap-4 px-4 text-center"
                >
                  <h2 className="text-white/95 text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">
                    Everything you need in{' '}
                    <span className="bg-gradient-to-r from-linka-emerald to-emerald-400 bg-clip-text text-transparent">
                      one place
                    </span>
                  </h2>
                  <p className="text-[#929bc9] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                    Discover powerful features designed to make commerce conversational and transparent
                  </p>
                </motion.div>
                <div className="pb-2">
                  <div className="flex border-b border-white/10 px-4 justify-between gap-2">
                    {(['marketplace', 'payments', 'security'] as const).map((tab) => (
                      <motion.button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        whileHover={{ y: -2 }}
                        className={`relative flex flex-col items-center justify-center border-b-[3px] pb-4 pt-5 flex-1 transition-all ${
                          activeTab === tab
                            ? 'border-b-linka-emerald text-white'
                            : 'border-b-transparent text-[#929bc9] hover:text-white/80'
                        }`}
                      >
                        <p className="text-sm font-bold leading-normal tracking-[0.015em] capitalize">{tab}</p>
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-linka-emerald rounded-t-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div 
                  ref={carouselRef}
                  className="flex flex-col gap-12 px-4 py-12 relative"
                >
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex flex-col gap-5"
                  >
                    {activeTab === 'marketplace' && (
                      <>
                        <h3 className="text-white tracking-tight text-3xl md:text-4xl font-black leading-tight sm:tracking-[-0.033em] max-w-3xl">
                          Shop and sell right where you chat
                        </h3>
                        <p className="text-[#929bc9] text-lg font-normal leading-relaxed max-w-3xl">
                          Find what you need or sell what you have—all through simple conversations. No apps to switch, no forms to fill. Just talk, agree, and transact.
                        </p>
                      </>
                    )}
                    {activeTab === 'payments' && (
                      <>
                        <h3 className="text-white tracking-tight text-3xl md:text-4xl font-black leading-tight sm:tracking-[-0.033em] max-w-3xl">
                          Pay however you want, whenever you want
                        </h3>
                        <p className="text-[#929bc9] text-lg font-normal leading-relaxed max-w-3xl">
                          Use your card, bank account, or digital wallet—all in one place. See exactly what you're paying and when it's confirmed, without the guesswork.
                        </p>
                      </>
                    )}
                    {activeTab === 'security' && (
                      <>
                        <h3 className="text-white tracking-tight text-3xl md:text-4xl font-black leading-tight sm:tracking-[-0.033em] max-w-3xl">
                          Your money stays safe until everyone's happy
                        </h3>
                        <p className="text-[#929bc9] text-lg font-normal leading-relaxed max-w-3xl">
                          Every transaction is protected automatically. Your funds are held securely until you get what you paid for, with a clear record you can always check.
                        </p>
                      </>
                    )}
                  </motion.div>
                  <motion.div
                    key={`features-${activeTab}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
                  >
                    {FEATURES[activeTab]?.map((feature, idx) => {
                        const IllustrationIcon = feature.icon ?? ShoppingBag
                        return (
                        <motion.div
                          key={`${activeTab}-${idx}`}
                          initial={{ opacity: 0, y: 30 }}
                          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          whileHover={{ y: -10, scale: 1.02 }}
                          className={`group flex flex-col gap-5 p-6 rounded-3xl bg-gradient-to-b from-white/7 to-white/0 backdrop-blur-sm border border-white/10 hover:border-linka-emerald/30 transition-all duration-300 ${feature.glow}`}
                        >
                          <div className="w-full aspect-[3/2] rounded-[32px] overflow-hidden relative border border-white/10 bg-gradient-to-br from-[#0f1729]/60 to-[#08101f]/40">
                            <div
                              className="absolute inset-0 opacity-30"
                              style={{ background: feature.gradient }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                  <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                                    <IllustrationIcon className="w-10 h-10 text-white/80" strokeWidth={1.5} />
                                  </div>
                                  <span
                                    className="absolute -left-6 -bottom-5 w-12 h-12 rounded-full blur-2xl opacity-40"
                                    style={{ background: feature.highlight }}
                                  />
                                  <span
                                    className="absolute -right-4 -top-4 w-9 h-9 rounded-full blur-xl opacity-30"
                                    style={{ background: feature.highlight }}
                                  />
                                </div>
                              </div>
                            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-white/60">
                              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/10 text-[11px] font-bold tracking-[0.12em] text-white/70">{feature.pill}</span>
                              <span className="text-white/30">Synkio</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <p className="text-white/95 text-lg font-bold leading-tight">{feature.title}</p>
                            <p className="text-[#929bc9] text-sm font-normal leading-relaxed">{feature.description}</p>
                          </div>
                        </motion.div>
                        )
                      })}
                  </motion.div>
                  
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 w-[100px] pointer-events-none bg-gradient-to-r from-linka-emerald/20 via-linka-emerald/10 to-transparent"
                    animate={{ opacity: isNearEdge === 'left' ? 0.6 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div 
                    className="absolute right-0 top-0 bottom-0 w-[100px] pointer-events-none bg-gradient-to-l from-linka-emerald/20 via-linka-emerald/10 to-transparent"
                    animate={{ opacity: isNearEdge === 'right' ? 0.6 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </section>

              <section className="flex flex-col gap-16 px-4 py-24" ref={howItWorksRef}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6 }}
                  className="text-center max-w-3xl mx-auto flex flex-col gap-4"
                >
                  <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    How it works
                  </span>
                  <h2 className="text-white/95 text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                    Secure payments through conversation.
                  </h2>
                  <p className="text-linka-emerald text-base font-semibold tracking-[0.08em] uppercase">
                    Turn your chat into commerce!
                  </p>
                  <p className="text-[#929bc9] text-lg md:text-xl leading-relaxed">
                    From discovery to payment, everything happens through natural conversation. No complex forms, no crypto expertise needed.
                  </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {HOW_IT_WORKS_STEPS.map((step, idx) => {
                    const IconComponent = step.icon
                    return (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-7 backdrop-blur-lg"
                      >
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-white/60">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-linka-emerald" />
                            {step.tag}
                          </span>
                          <span className="text-white/30">Step {idx + 1}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-linka-emerald/10 border border-linka-emerald/30 flex items-center justify-center text-linka-emerald">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-white/95 text-xl font-bold leading-snug">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-[#929bc9] text-sm leading-relaxed">{step.description}</p>

                        {step.actionLabel && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              if (hasUser) {
                                onAction('go-to-chat')
                              } else {
                                router.push('/login')
                              }
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-linka-emerald/30 bg-linka-emerald/10 px-4 py-2 text-sm font-semibold text-linka-emerald transition-colors hover:bg-linka-emerald/20"
                          >
                            {step.actionLabel}
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        )}

                        {step.statuses && (
                          <div className="flex flex-col gap-3 pt-2">
                            {step.statuses.map((status, statusIdx) => (
                              <div
                                key={statusIdx}
                                className={`rounded-2xl px-4 py-3 text-left text-sm border ${
                                  status.align === 'end' ? 'self-end text-right' : 'self-start text-left'
                                } ${
                                  status.variant === 'accent'
                                    ? 'bg-linka-emerald/15 border-linka-emerald/40 text-white'
                                    : 'bg-white/5 border-white/10 text-white/80'
                                }`}
                              >
                                {status.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {step.statusCard && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">{step.tag}</span>
                              {step.statusCard.badge && (
                                <span
                                  className={`text-xs font-semibold rounded-full px-3 py-1 ${
                                    step.statusCard.tone === 'emerald'
                                      ? 'bg-linka-emerald/15 text-linka-emerald'
                                      : 'bg-white/10 text-white/70'
                                  }`}
                                >
                                  {step.statusCard.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-white font-semibold">{step.statusCard.label}</p>
                            <p className="text-white/70 text-sm">{step.statusCard.subtitle}</p>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </section>

              <section className="relative my-16 rounded-3xl overflow-hidden" ref={ctaRef}>
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-linka-emerald via-emerald-500 to-emerald-600" />
                <div 
                  className="absolute inset-0 opacity-20" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                />
                
                <div className="relative p-12 md:p-20 flex flex-col items-center text-center gap-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col gap-6 max-w-3xl"
                  >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6 }}
                      className="text-white/95 text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]"
                >
                      Join the Future of Commerce
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 }}
                      className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                >
                  Ready to revolutionize your transactions? Get started now and experience the simplest, most secure way to trade.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={ctaInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (hasUser) {
                      onAction('go-to-chat')
                    } else {
                      router.push('/login')
                    }
                  }}
                      className="group flex min-w-[180px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-14 px-8 bg-white text-linka-emerald text-lg font-bold leading-normal tracking-[0.015em] hover:bg-gray-50 transition-all duration-300 touch-manipulation shadow-2xl"
                >
                      <span className="truncate">Get Started Free</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                  </motion.div>
                </div>
              </section>

              <FAQSection />
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}