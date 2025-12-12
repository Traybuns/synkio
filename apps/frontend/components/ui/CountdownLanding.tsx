'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownLanding() {
  const launchDate = new Date()
  launchDate.setDate(launchDate.getDate() + 25)
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const [debouncedSeconds, setDebouncedSeconds] = useState(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const distance = launchDate.getTime() - now

      if (distance > 0) {
        return {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    const initialTime = calculateTimeLeft()
    setTimeLeft(initialTime)
    setDebouncedSeconds(initialTime.seconds)

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSeconds(timeLeft.seconds)
    }, 200)

    return () => clearTimeout(debounceTimer)
  }, [timeLeft.seconds])

  const TimeBox = ({ value, label, shouldAnimate = false }: { value: number; label: string; shouldAnimate?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-linka-emerald/20 blur-2xl rounded-3xl" />
        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 min-w-[100px] sm:min-w-[140px]">
          {shouldAnimate ? (
            <motion.div
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-5xl sm:text-7xl font-black text-white text-center tabular-nums"
            >
              {String(value).padStart(2, '0')}
            </motion.div>
          ) : (
            <div className="text-5xl sm:text-7xl font-black text-white text-center tabular-nums">
              {String(value).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 text-white/60 text-sm sm:text-base font-semibold uppercase tracking-[0.2em]">
        {label}
      </p>
    </motion.div>
  )

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#101322] via-[#0f1525] to-[#0a0e1a] relative overflow-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
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
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 sm:mb-16"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white text-center mb-4 bg-gradient-to-r from-white via-white to-linka-emerald bg-clip-text text-transparent">
            Synkio
          </h1>
          <p className="text-linka-emerald text-lg sm:text-xl font-semibold text-center uppercase tracking-[0.3em]">
            Coming Soon
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/80 text-lg sm:text-2xl text-center mb-12 sm:mb-16 max-w-3xl leading-relaxed"
        >
          The safer way to buy, sell, and get paid.
          <br />
          <span className="text-white/60 text-base sm:text-lg">
            We're launching something revolutionary.
          </span>
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16">
          <TimeBox value={timeLeft.days} label="Days" shouldAnimate={false} />
          <TimeBox value={timeLeft.hours} label="Hours" shouldAnimate={false} />
          <TimeBox value={timeLeft.minutes} label="Minutes" shouldAnimate={false} />
          <TimeBox value={debouncedSeconds} label="Seconds" shouldAnimate={true} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full sm:w-80 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-linka-emerald backdrop-blur-xl"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-linka-emerald text-white font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-linka-emerald/25"
          >
            Notify Me
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 text-white/40 text-sm text-center"
        >
          Be the first to know when we launch
        </motion.p>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/30 text-sm">
          © {new Date().getFullYear()} Synkio. All rights reserved.
        </p>
      </div>
    </div>
  )
}
