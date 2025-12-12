'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowUpRight, ArrowDownLeft, Search, TrendingUp } from 'lucide-react'
import WalletFund from '../../components/WalletFund'
import { fetchWalletBalance, fetchTransactions } from '../../libs/backend'
import type { WalletBalance, Transaction } from '../../libs/types'
import { useAuth } from '../../contexts/AuthContext'

type FilterType = 'all' | 'sent' | 'received'

export default function WalletPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showFundModal, setShowFundModal] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!user) return
    
    const loadData = async () => {
      setLoading(true)
      try {
        const [balance, transactionsData] = await Promise.all([
          fetchWalletBalance(user.email),
          fetchTransactions(user.email, { limit: 50, sortBy: 'createdAt', sortOrder: 'desc' })
        ])
        
        if (balance) {
          setWalletBalance(balance)
        }
        
        if (transactionsData.success && transactionsData.data) {
          setTransactions(transactionsData.data.transactions)
        }
      } catch (error) {
        console.error('Failed to load wallet data:', error)
        toast.error('Unable to load wallet data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    if (filter === 'sent') {
      filtered = transactions.filter(tx => tx.buyerEmail === user?.email)
    } else if (filter === 'received') {
      filtered = transactions.filter(tx => tx.sellerEmail === user?.email)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tx => {
        const otherEmail = tx.buyerEmail === user?.email ? tx.sellerEmail : tx.buyerEmail
        const amount = tx.amount.toString()
        const currency = tx.currency.toLowerCase()
        const title = tx.metadata?.title?.toLowerCase() || ''
        
        return (
          otherEmail.toLowerCase().includes(query) ||
          amount.includes(query) ||
          currency.includes(query) ||
          title.includes(query)
        )
      })
    }

    return filtered
  }, [transactions, filter, searchQuery, user?.email])

  const assetCount = useMemo(() => {
    if (!walletBalance) return 0
    const uniqueCurrencies = new Set(transactions.map(tx => tx.currency))
    if (walletBalance.currency && !uniqueCurrencies.has(walletBalance.currency)) {
      uniqueCurrencies.add(walletBalance.currency)
    }
    return uniqueCurrencies.size || (walletBalance.balance && parseFloat(walletBalance.balance) > 0 ? 1 : 0)
  }, [transactions, walletBalance])

  const getTransactionIcon = (tx: Transaction) => {
    const isSent = tx.buyerEmail === user?.email
    const isReward = tx.metadata?.title?.toLowerCase()?.includes('reward') || tx.metadata?.title?.toLowerCase()?.includes('bonus')
    const isSwap = tx.metadata?.title?.toLowerCase()?.includes('swap')
    
    if (isReward) {
      return { icon: '🎖️', bg: 'bg-purple-500/20', color: 'text-purple-400' }
    }
    if (isSwap) {
      return { icon: '🔄', bg: 'bg-linka-emerald/20', color: 'text-linka-emerald' }
    }
    if (isSent) {
      return { icon: <ArrowUpRight className="w-5 h-5" />, bg: 'bg-red-500/20', color: 'text-red-400' }
    }
    return { icon: <ArrowDownLeft className="w-5 h-5" />, bg: 'bg-green-500/20', color: 'text-green-400' }
  }

  const getTransactionTitle = (tx: Transaction) => {
    const isSent = tx.buyerEmail === user?.email
    const currency = tx.currency
    
    if (tx.metadata?.title) {
      return tx.metadata.title
    }
    
    return isSent ? `Sent ${currency}` : `Received ${currency}`
  }

  const getTransactionSubtitle = (tx: Transaction) => {
    const isSent = tx.buyerEmail === user?.email
    const otherEmail = isSent ? tx.sellerEmail : tx.buyerEmail
    
    if (tx.metadata?.description) {
      return tx.metadata.description
    }
    
    return isSent ? `To ${otherEmail.split('@')[0]}` : `From ${otherEmail.split('@')[0]}`
  }

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'ETH' || currency === 'BTC' || currency === 'SOL') {
      return `${amount < 0 ? '-' : '+'}${Math.abs(amount).toFixed(4)} ${currency}`
    }
    return `${amount < 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)} ${currency}`
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return { text: 'text-green-400', bg: 'bg-green-400' }
      case 'pending':
      case 'funded':
        return { text: 'text-yellow-400', bg: 'bg-yellow-400' }
      case 'disputed':
        return { text: 'text-red-400', bg: 'bg-red-400' }
      default:
        return { text: 'text-gray-400', bg: 'bg-gray-400' }
    }
  }

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Pending'
      case 'funded':
        return 'Funded'
      case 'disputed':
        return 'Disputed'
      case 'cancelled':
        return 'Cancelled'
      case 'expired':
        return 'Expired'
      default:
        return status
    }
  }

  const calculateTotalBalance = () => {
    if (!walletBalance) return '0.00'
    const balance = parseFloat(walletBalance.balance || '0')
    return balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USDC' || currency === 'USDT' || currency === 'DAI') {
      return `$${Math.abs(amount).toFixed(2)}`
    }
    const rate = currency === 'ETH' ? 2000 : currency === 'BTC' ? 45000 : currency === 'SOL' ? 100 : 1
    return `$${(Math.abs(amount) * rate).toFixed(2)}`
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101322] text-gray-800 dark:text-gray-200 transition-colors">
      <main className="flex-1 p-6 lg:p-10 grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="flex flex-wrap justify-between gap-3">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
              My Wallet
            </h1>
          </div>

          <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 bg-white/5 dark:bg-black/20 border border-white/10">
            <p className="text-gray-300 dark:text-[#9da1b9] text-base font-medium leading-normal">
              Total Balance
            </p>
            <p className="text-white tracking-light text-4xl font-bold leading-tight">
              ${calculateTotalBalance()}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-[#0bda65] text-base font-medium leading-normal flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +5.2%
              </p>
              <p className="text-gray-400 dark:text-[#9da1b9] text-sm">in last 7 days</p>
            </div>
          </div>

          <div className="flex flex-1 gap-3 flex-wrap justify-between">
            <button
              onClick={() => router.push('/send')}
              className="flex-1 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-5 bg-linka-emerald text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-linka-emerald/90 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
              <span className="truncate">Send</span>
            </button>
            <button
              onClick={() => setShowFundModal(true)}
              className="flex-1 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-5 bg-white/10 dark:bg-[#282b39] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-white/20 dark:hover:bg-[#3b3f54] transition-colors"
            >
              <ArrowDownLeft className="w-5 h-5" />
              <span className="truncate">Receive / Deposit</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 rounded-lg p-6 bg-white/5 dark:bg-black/20 border border-white/10">
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              Asset Allocation
            </h3>
            <div className="flex items-center justify-center p-4">
              <div className="relative size-48">
                <svg className="size-full" viewBox="0 0 36 36">
                  <circle
                    className="stroke-current text-linka-emerald/30"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    strokeWidth="3"
                  />
                  <circle
                    className="stroke-current text-[#AE68FA]"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    strokeDasharray="25, 100"
                    strokeDashoffset="25"
                    strokeWidth="3"
                  />
                  <circle
                    className="stroke-current text-[#FFA500]"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    strokeDasharray="35, 100"
                    strokeDashoffset="0"
                    strokeWidth="3"
                  />
                  <circle
                    className="stroke-current text-linka-emerald"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    strokeDasharray="40, 100"
                    strokeDashoffset="-35"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-sm">Total Assets</span>
                  <span className="text-white font-bold text-2xl">
                    {assetCount}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-linka-emerald"></div>
                <span className="text-gray-300">Bitcoin (BTC)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#FFA500]"></div>
                <span className="text-gray-300">Ethereum (ETH)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[#AE68FA]"></div>
                <span className="text-gray-300">Solana (SOL)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-linka-emerald/30"></div>
                <span className="text-gray-300">Points (PTS)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">
              Recent Activity
            </h3>
            <div className="flex items-center gap-2 p-1 bg-white/5 dark:bg-black/20 border border-white/10 rounded-full">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-linka-emerald text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('sent')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  filter === 'sent'
                    ? 'bg-linka-emerald text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => setFilter('received')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  filter === 'received'
                    ? 'bg-linka-emerald text-white'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Received
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="w-full bg-white/5 dark:bg-black/20 border border-white/10 rounded-full h-12 pl-10 pr-4 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-linka-emerald focus:border-linka-emerald outline-none"
              placeholder="Search by recipient, asset or amount..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-400">
              <span className="col-span-5">Details</span>
              <span className="col-span-3 text-left">Type</span>
              <span className="col-span-2 text-left">Status</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>
            
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                {searchQuery ? 'No transactions found matching your search' : 'No transactions yet'}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {filteredTransactions.map((tx) => {
                  const isSent = tx.buyerEmail === user?.email
                  const iconData = getTransactionIcon(tx)
                  const statusColors = getStatusColor(tx.status)
                  const amount = isSent ? -tx.amount : tx.amount
                  
                  return (
                    <li
                      key={tx.transactionId}
                      className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg bg-white/5 dark:bg-black/20 border border-white/10 hover:bg-white/10 dark:hover:bg-black/30 transition-colors"
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        <div className={`size-10 rounded-full ${iconData.bg} flex items-center justify-center`}>
                          <span className={iconData.color}>
                            {iconData.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{getTransactionTitle(tx)}</p>
                          <p className="text-sm text-gray-400">{getTransactionSubtitle(tx)}</p>
                        </div>
                      </div>
                      <div className="col-span-3 text-sm text-gray-300 capitalize">
                        {isSent ? 'Sent' : tx.status === 'funded' ? 'Deposit' : 'Received'}
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-sm" style={{ color: statusColors.text }}>
                        <span className={`size-2 rounded-full ${statusColors.bg}`}></span>
                        {getStatusLabel(tx.status)}
                      </div>
                      <div className="col-span-2 text-right">
                        <p className={`font-semibold ${isSent ? 'text-white' : 'text-green-400'}`}>
                          {formatAmount(amount, tx.currency)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </main>

      {showFundModal && (
        <WalletFund
          onClose={() => setShowFundModal(false)}
          walletAddress={user.walletAddress}
          networkInfo={walletBalance?.network}
          onBalanceRefresh={async () => {
            if (!user) return
            try {
              const balance = await fetchWalletBalance(user.email)
              if (balance) {
                setWalletBalance(balance)
              }
            } catch (error) {
              console.error('Failed to refresh wallet balance:', error)
            }
          }}
        />
      )}
    </div>
  )
}
