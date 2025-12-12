'use client'

import { motion } from 'framer-motion'

export default function LandingPageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-linka-emerald/5 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full opacity-30"
            initial={{ x: -20, y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800) }}
            animate={{
              x: typeof window !== 'undefined' ? window.innerWidth + 20 : 1200,
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
        <motion.div
            className="relative w-32 h-32 mx-auto"
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -20, 10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-24 h-24 bg-red-600 dark:bg-red-700 rounded-full flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-yellow-400 dark:bg-yellow-500 rounded-full transform rotate-45 scale-75"></div>
                <motion.svg
                  className="relative z-10 w-16 h-16 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 4 L8 12 L12 20 L16 12 Z" />
                  <path d="M8 12 L16 12" />
                </motion.svg>
              </div>
            </div>
            
            <motion.div
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-linka-emerald to-transparent rounded-full blur-sm"></div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8"
        >
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading Synkio...</p>
        </motion.div>
      </div>
    </div>
  )
}
