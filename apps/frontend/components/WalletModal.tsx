'use client'

import { useState, useEffect } from 'react'
import { X, Wallet, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import WalletFund from './WalletFund'
import { fetchWalletBalance } from '../libs/backend'
import type { User, WalletBalance } from '../libs/types'

interface WalletModalProps {
  user: User
  onClose: () => void
}

export default function WalletModal({ user, onClose }: WalletModalProps) {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [showFundModal, setShowFundModal] = useState(false)

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const balance = await fetchWalletBalance(user.email)
        if (balance) {
          setWalletBalance(balance)
        }
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error)
      }
    }

    loadBalance()
  }, [user.email])

  const handleBalanceRefresh = async () => {
    try {
      const balance = await fetchWalletBalance(user.email)
      if (balance) {
        setWalletBalance(balance)
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linka-emerald/10 flex items-center justify-center border border-linka-emerald/20">
                <Wallet className="w-5 h-5 text-linka-emerald" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-linka-black dark:text-white">Manage Wallet</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">View balance and fund your wallet</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-br from-linka-emerald/5 to-transparent p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-2">Current balance</p>
              <h3 className="text-4xl font-bold text-linka-black dark:text-white mb-2">
                {walletBalance?.balance ?? '—'} {walletBalance?.currency ?? 'ETH'}
              </h3>
              {walletBalance?.network && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {walletBalance.network.name} · Chain ID {walletBalance.network.chainId}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowFundModal(true)}
                className="flex-1 px-4 py-3 rounded-xl bg-linka-emerald text-white font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Fund wallet
              </button>
              <button
                onClick={() => {
                  onClose()
                  window.location.href = '/chat?message=I%20want%20to%20withdraw%20funds'
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold hover:border-linka-emerald hover:text-linka-emerald transition-colors flex items-center justify-center gap-2"
              >
                Request payout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {showFundModal && walletBalance && (
          <WalletFund
            onClose={() => setShowFundModal(false)}
            walletAddress={user.walletAddress}
            networkInfo={walletBalance.network}
            onBalanceRefresh={handleBalanceRefresh}
          />
        )}
      </div>
    </AnimatePresence>
  )
}

