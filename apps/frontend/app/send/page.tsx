'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, User, Mail, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'

interface RecentContact {
  id: string
  name: string
  identifier: string
  type: 'username' | 'email' | 'phone'
  avatar?: string
}

export default function SendPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [transactionType, setTransactionType] = useState<'send' | 'request'>('send')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipient, setSelectedRecipient] = useState<RecentContact | null>(null)
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    const storedContacts = typeof window !== 'undefined' 
      ? localStorage.getItem('synkio_recent_contacts') 
      : null
    
    if (storedContacts) {
      try {
        setRecentContacts(JSON.parse(storedContacts))
      } catch (error) {
        console.error('Error parsing recent contacts:', error)
      }
    } else {
      setRecentContacts([
        {
          id: '1',
          name: 'Sarah Lee',
          identifier: '@sarahlee',
          type: 'username'
        },
        {
          id: '2',
          name: 'Mike Chen',
          identifier: 'mike@synkio.com',
          type: 'email'
        },
        {
          id: '3',
          name: 'Jordan Smith',
          identifier: '+1 (555) 123-4567',
          type: 'phone'
        }
      ])
    }
  }, [])

  const handleSelectRecipient = (contact: RecentContact) => {
    setSelectedRecipient(contact)
    setSearchQuery(contact.identifier)
  }

  const handleNext = () => {
    if (!selectedRecipient && !searchQuery.trim()) {
      return
    }

    const recipient = selectedRecipient || {
      id: 'new',
      name: searchQuery,
      identifier: searchQuery.trim(),
      type: searchQuery.includes('@') ? 'email' : searchQuery.match(/^\+?[\d\s()-]+$/) ? 'phone' : 'username'
    }

    router.push(`/send/amount?type=${transactionType}&recipient=${encodeURIComponent(recipient.identifier)}&name=${encodeURIComponent(recipient.name)}`)
  }

  const filteredContacts = recentContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.identifier.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-linka-white dark:bg-gray-950 text-linka-black dark:text-white transition-colors">
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 p-3 sm:p-4 md:p-6 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-linka-black dark:hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg sm:text-xl font-bold">Synkio</h1>
          </div>
          <div className="w-10 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] text-center">
              Send & Request
            </h2>
            
            <div className="w-full max-w-xs">
              <div className="flex h-10 items-center justify-center rounded-full bg-black/5 dark:bg-[#282b39] p-1">
                <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-[#111218] has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.1)] has-[:checked]:text-black dark:has-[:checked]:text-white text-black/60 dark:text-[#9da1b9] text-sm font-medium leading-normal transition-all">
                  <span className="truncate">Send</span>
                  <input
                    type="radio"
                    name="transaction_type"
                    value="send"
                    checked={transactionType === 'send'}
                    onChange={() => setTransactionType('send')}
                    className="sr-only"
                  />
                </label>
                <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-full px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-[#111218] has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.1)] has-[:checked]:text-black dark:has-[:checked]:text-white text-black/60 dark:text-[#9da1b9] text-sm font-medium leading-normal transition-all">
                  <span className="truncate">Request</span>
                  <input
                    type="radio"
                    name="transaction_type"
                    value="request"
                    checked={transactionType === 'request'}
                    onChange={() => setTransactionType('request')}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4 py-3">
            <div className="flex gap-6 justify-between items-center">
              <p className="text-base font-medium leading-normal text-black dark:text-white">
                Step 1 of 3: Who
              </p>
            </div>
            <div className="rounded-full bg-black/10 dark:bg-[#3b3f54] h-2 overflow-hidden">
              <motion.div
                className="h-2 rounded-full bg-linka-emerald"
                initial={{ width: '33%' }}
                animate={{ width: '33%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] bg-white dark:bg-[#1c1d27] p-4 sm:p-6">
            <div className="flex w-full flex-col items-stretch justify-center gap-4">
              <div>
                <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-black dark:text-white mb-1">
                  {transactionType === 'send' ? 'Send to' : 'Request from'}
                </h3>
                <p className="text-base font-normal leading-normal text-black/60 dark:text-[#9da1b9]">
                  Enter a @username, email, or phone number to get started.
                </p>
              </div>

              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedRecipient(null)
                  }}
                  placeholder="@username, email, or phone"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/5 dark:bg-black/20 border border-transparent focus:border-linka-emerald focus:ring-2 focus:ring-linka-emerald/20 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 text-sm sm:text-base transition-all outline-none"
                />
              </div>

              {searchQuery && filteredContacts.length === 0 && (
                <div className="pt-2">
                  <p className="text-sm text-black/60 dark:text-white/60">
                    No recent contacts found. You can continue with your search.
                  </p>
                </div>
              )}

              {(!searchQuery || filteredContacts.length > 0) && (
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-black/60 dark:text-white/60 mb-3">
                    Recent
                  </h4>
                  <div className="flex flex-col gap-3">
                    <AnimatePresence>
                      {(searchQuery ? filteredContacts : recentContacts).map((contact) => {
                        const IconComponent = 
                          contact.type === 'email' ? Mail :
                          contact.type === 'phone' ? Phone : User

                        return (
                          <motion.div
                            key={contact.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors ${
                              selectedRecipient?.id === contact.id
                                ? 'bg-linka-emerald/10 dark:bg-linka-emerald/20'
                                : 'hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            <button
                              onClick={() => handleSelectRecipient(contact)}
                              className="flex items-center gap-3 flex-1 text-left"
                            >
                              <div className="w-10 h-10 rounded-full bg-linka-emerald/10 dark:bg-linka-emerald/20 flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-5 h-5 text-linka-emerald" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-black dark:text-white truncate">
                                  {contact.name}
                                </p>
                                <p className="text-sm text-black/60 dark:text-white/60 truncate">
                                  {contact.identifier}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={() => handleSelectRecipient(contact)}
                              className="flex items-center justify-center rounded-full h-8 px-3 bg-linka-emerald/20 text-linka-emerald text-xs font-bold hover:bg-linka-emerald/30 transition-colors touch-manipulation min-h-[32px]"
                            >
                              Select
                            </button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!selectedRecipient && !searchQuery.trim()}
              className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-linka-emerald text-white text-base font-bold leading-normal tracking-[0.015em] gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors touch-manipulation"
            >
              <span className="truncate">Next</span>
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  )
}

