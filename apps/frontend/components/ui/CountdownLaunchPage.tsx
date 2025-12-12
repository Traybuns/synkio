'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, MessageCircle, Shield, Zap, ArrowRight } from 'lucide-react'
import WaitlistModal from './WaitlistModal'
import { signupWaitlist } from '../../libs/services/waitlist.service'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownLaunchPageProps {
  launchDate: Date
}

export default function CountdownLaunchPage({ launchDate }: CountdownLaunchPageProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now()
      const launch = launchDate.getTime()
      const difference = launch - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [launchDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !name) {
      setModalType('error')
      setModalTitle('Missing Information')
      setModalMessage('Please enter both your name and email address to join the waitlist.')
      setShowModal(true)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setModalType('error')
      setModalTitle('Invalid Email')
      setModalMessage('Please enter a valid email address to continue.')
      setShowModal(true)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await signupWaitlist(email, name)

      if (!result.success) {
        throw new Error(result.error || 'Failed to join waitlist')
      }

      setSubmittedName(name)
      setSubmittedEmail(email)
      
      setModalType('success')
      setModalTitle('You\'re on the list! 🎉')
      setModalMessage('Thank you for joining the Synkio waitlist! We\'ll send you a confirmation email and notify you as soon as we launch.')
      setShowModal(true)
      
      setEmail('')
      setName('')
    } catch (error: any) {
      setModalType('error')
      setModalTitle('Something went wrong')
      setModalMessage(error.message || 'We couldn\'t add you to the waitlist right now. Please try again later.')
      setShowModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const features = [
    {
      icon: MessageCircle,
      title: 'Conversational Marketplace',
      description: 'Discover, chat, and transact with vendors all in one seamless conversation. Experience the future of commerce where every interaction happens naturally through chat, making buying and selling as easy as texting a friend.',
    },
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Hold funds safely in escrow until your transaction is complete and verified. Our smart contract-based escrow system ensures your money is protected, giving you peace of mind with every transaction you make.',
    },
    {
      icon: Zap,
      title: 'Multi-Channel Support',
      description: 'Access Synkio via WhatsApp or Web - your choice, your convenience. Whether you prefer messaging on the go or managing everything from your browser, we\'ve got you covered with seamless cross-platform access.',
    },
    {
      icon: Sparkles,
      title: 'Transparent Payments',
      description: 'Track invoices, receipts, and payouts in real-time within your chat thread. Every payment detail is visible and verifiable, ensuring complete transparency and trust throughout your entire transaction journey.',
    },
  ]

  const CountdownBox = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col items-center justify-center bg-gradient-to-br from-[#1B1B1E]/80 to-[#1B1B1E]/40 backdrop-blur-md border border-[#DFF5FF]/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 min-w-[80px] sm:min-w-[90px] md:min-w-[110px] lg:min-w-[120px] flex-1 max-w-[120px] sm:max-w-[140px] shadow-lg shadow-[#DFF5FF]/5 hover:border-[#DFF5FF]/50 hover:shadow-[#DFF5FF]/10 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#DFF5FF]/5 to-transparent rounded-xl sm:rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <motion.div
        key={value}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#DFF5FF] mb-2 sm:mb-3 tabular-nums leading-none"
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <div className="relative text-[10px] sm:text-xs md:text-sm text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium">
        {label}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-[#101322] flex flex-col overscroll-none relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#DFF5FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Synkio
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            Conversational Marketplace
          </p>
          <p className="text-lg text-gray-400">
            Let's Transact Together Securely
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-8">
            Launching Soon
          </h2>
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <CountdownBox value={timeLeft.days} label="Days" />
            <CountdownBox value={timeLeft.hours} label="Hours" />
            <CountdownBox value={timeLeft.minutes} label="Minutes" />
            <CountdownBox value={timeLeft.seconds} label="Seconds" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="w-full max-w-5xl mb-16 md:mb-20"
        >
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-3xl md:text-4xl font-bold text-white text-center mb-12 md:mb-16"
          >
            What to Expect
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="relative group bg-gradient-to-br from-[#1B1B1E]/60 to-[#1B1B1E]/40 backdrop-blur-md border border-[#DFF5FF]/20 rounded-xl p-6 md:p-8 hover:border-[#DFF5FF]/50 hover:shadow-xl hover:shadow-[#DFF5FF]/10 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#DFF5FF]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#DFF5FF]/20 to-[#DFF5FF]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#DFF5FF]/10">
                      <Icon className="w-7 h-7 text-[#DFF5FF]" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#DFF5FF] transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-gray-300 leading-relaxed text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="w-full max-w-lg mx-auto"
        >
          <div className="bg-gradient-to-br from-[#1B1B1E]/80 to-[#1B1B1E]/40 backdrop-blur-md border border-[#DFF5FF]/30 rounded-2xl p-8 md:p-10 shadow-2xl shadow-[#DFF5FF]/5">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="text-center text-lg md:text-xl text-gray-300 mb-8 font-medium"
            >
              Be the first to know when we launch
            </motion.p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                disabled={isSubmitting}
                className="w-full px-5 py-4 bg-[#101322]/60 backdrop-blur-sm border border-[#DFF5FF]/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DFF5FF]/50 focus:border-[#DFF5FF]/40 transition-all disabled:opacity-50 text-base"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
                className="w-full px-5 py-4 bg-[#101322]/60 backdrop-blur-sm border border-[#DFF5FF]/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DFF5FF]/50 focus:border-[#DFF5FF]/40 transition-all disabled:opacity-50 text-base"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#10B981] to-[#10B981]/90 hover:from-[#10B981]/90 hover:to-[#10B981] disabled:from-[#10B981]/50 disabled:to-[#10B981]/50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-xl shadow-[#10B981]/30 hover:shadow-2xl hover:shadow-[#10B981]/40"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Get Notified
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        <WaitlistModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSubmittedEmail('')
            setSubmittedName('')
          }}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          userEmail={modalType === 'success' ? submittedEmail : undefined}
          userName={modalType === 'success' ? submittedName : undefined}
        />
      </div>
    </div>
  )
}
