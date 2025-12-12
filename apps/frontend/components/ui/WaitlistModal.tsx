'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertCircle, Mail, User } from 'lucide-react'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  userEmail?: string
  userName?: string
}

export default function WaitlistModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  userEmail,
  userName
}: WaitlistModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-12 h-12 text-[#10B981]" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />
      default:
        return <Mail className="w-12 h-12 text-[#DFF5FF]" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-[#10B981]/40'
      case 'error':
        return 'border-red-500/40'
      default:
        return 'border-[#DFF5FF]/40'
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-[#10B981]/10'
      case 'error':
        return 'bg-red-500/10'
      default:
        return 'bg-[#DFF5FF]/10'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className={`bg-[#1B1B1E] border ${getBorderColor()} rounded-xl p-6 md:p-8 shadow-2xl ${getBgColor()}`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="mb-6"
                >
                  {getIcon()}
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {title}
                </h3>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {message}
                </p>

                {(userName || userEmail) && type === 'success' && (
                  <div className="w-full bg-[#101322]/50 rounded-lg p-4 mb-6 space-y-2">
                    {userName && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <User className="w-4 h-4 text-[#DFF5FF]" />
                        <span className="text-sm">{userName}</span>
                      </div>
                    )}
                    {userEmail && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4 text-[#DFF5FF]" />
                        <span className="text-sm">{userEmail}</span>
                      </div>
                    )}
                  </div>
                )}

                {type === 'success' && (
                  <div className="w-full space-y-3">
                    <div className="bg-[#101322]/50 rounded-lg p-4 text-left">
                      <h4 className="text-sm font-semibold text-white mb-2">
                        What happens next?
                      </h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• We'll send you a confirmation email</li>
                        <li>• You'll be notified when we launch</li>
                        <li>• Get early access to all features</li>
                      </ul>
                    </div>
                  </div>
                )}

                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`mt-6 w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                    type === 'success'
                      ? 'bg-[#10B981] hover:bg-[#10B981]/90 text-white'
                      : type === 'error'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-[#DFF5FF] hover:bg-[#DFF5FF]/90 text-[#101322]'
                  }`}
                >
                  {type === 'success' ? 'Got it!' : 'Close'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
