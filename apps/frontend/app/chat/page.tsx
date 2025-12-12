'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut } from 'lucide-react'
import ChatInterface from '../../components/ui/ChatInterface'
import FeedbackForm from '../../components/FeedbackForm'
import WalletModal from '../../components/WalletModal'
import { fetchWalletBalance } from '../../libs/backend'
import { sendAgentMessage } from '../../libs/agent'
import type { Message, WalletBalance } from '../../libs/types'
import { useAuth } from '../../contexts/AuthContext'

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading, signOut } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const historyKey = user ? `linka_chat_history_${user.email}` : null

  const persistMessages = useCallback((next: Message[]) => {
    if (!historyKey) return
    const serializable = next.map(message => {
      const { audioBlob, ...rest } = message
      return {
        ...rest,
      timestamp: message.timestamp.toISOString()
      }
    })
    localStorage.setItem(historyKey, JSON.stringify(serializable))
  }, [historyKey])

  const loadWalletBalance = useCallback(async () => {
    if (!user) return
    try {
      const balance = await fetchWalletBalance(user.email)
      if (balance) {
        setWalletBalance(balance)
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      toast.error('Failed to load wallet balance')
    }
  }, [user])

  const updateMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
    setMessages(prev => {
      const next = updater(prev)
      persistMessages(next)
      return next
    })
  }, [persistMessages])

  const handleSendMessage = useCallback(async (text?: string, imageUrl?: string, audioBlob?: Blob) => {
    const messageText = text || inputText
    if ((!messageText.trim() && !imageUrl && !audioBlob) || !user) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim() || '',
      sender: 'user',
      timestamp: new Date(),
      readStatus: 'sent',
      imageUrl: imageUrl,
      audioBlob: audioBlob
    }

    updateMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    setTimeout(() => {
      updateMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, readStatus: 'delivered' as const } : msg
      ))
    }, 500)

    try {
      let messageToSend = messageText.trim()
      if (imageUrl) {
        messageToSend = messageToSend || 'I sent an image'
      }
      if (audioBlob) {
        messageToSend = messageToSend || 'I sent an audio message'
      }

      const data = await sendAgentMessage({
        message: messageToSend,
        threadId: `web-${user.email}`,
        channel: 'web',
        userEmail: user.email
      })

      setTimeout(() => {
        updateMessages(prev => prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, readStatus: 'read' as const } : msg
        ))
      }, 1000)

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        vendorData: data.vendorData,
        timestamp: new Date()
      }

      updateMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error calling AgentKit API:', error)
      toast.error('Failed to send message. Please try again.')
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      }
      updateMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }, [user, updateMessages, inputText])

  const handleImageSelect = useCallback((file: File) => {
    if (!user) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageUrl = reader.result as string
      handleSendMessage(inputText || '', imageUrl, undefined)
    }
    reader.readAsDataURL(file)
  }, [user, inputText, handleSendMessage])

  const handleAudioRecord = useCallback((blob: Blob) => {
    if (!user) return
    handleSendMessage(inputText || '', undefined, blob)
  }, [user, inputText, handleSendMessage])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user?.walletAddress) {
      setWalletBalance(prev => prev ?? {
        walletAddress: user.walletAddress,
        balance: '—',
        currency: 'ETH',
        network: { name: 'Base Sepolia', chainId: 84532 }
      })
    }
  }, [user])

  useEffect(() => {
    if (!user || isInitialized) {
      return
    }

    const savedMessages = historyKey ? localStorage.getItem(historyKey) : null
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hydrated = parsed.map((message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp),
            readStatus: message.readStatus || (message.sender === 'user' ? 'read' : undefined)
          }))
          setMessages(hydrated)
          setIsInitialized(true)
          loadWalletBalance()
          return
        }
      } catch (error) {
        console.error('Error restoring messages:', error)
      }
    }

    const isReturningUser = user.onboardingCompleted
    const preferredName = user.username 
      ? user.username.replace(/^@+/, '')
      : user.name
    
    const welcomeMessage = isReturningUser
      ? `Welcome back, ${preferredName}! I'm here to help you discover vendors and pay for goods and services on/off-chain. What would you like to do today?`
      : `Welcome to Synkio, ${preferredName}! I'm your conversational marketplace assistant. I help you discover vendors, manage payments, and make onchain transactions through natural chat. What would you like to do today?`

    const initialMessage: Message = {
      id: 'welcome',
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }

    setMessages([initialMessage])
    persistMessages([initialMessage])
    setIsInitialized(true)
    loadWalletBalance()
  }, [user, isInitialized, historyKey, persistMessages, loadWalletBalance])

  useEffect(() => {
    if (!searchParams || !user || !isInitialized) return
    const messageParam = searchParams.get('message')
    if (!messageParam) return

    const decodedMessage = decodeURIComponent(messageParam)
    handleSendMessage(decodedMessage)
    window.history.replaceState({}, '', '/chat')
  }, [searchParams, user, isInitialized, handleSendMessage])

  const handleQuickAction = (action: string) => {
    if (action === 'fund') {
      setShowWalletModal(true)
      return
    }

    if (action === 'search') {
      router.push('/vendors')
      return
    }

    if (action === 'marketplace') {
      router.push('/vendors')
      return
    }

    const actionTexts: Record<string, string> = {
      search: 'I want to find vendors',
      fund: 'I want to fund my wallet'
    }
    handleSendMessage(actionTexts[action] || '')
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
    }

  const confirmLogout = () => {
    setMessages([])
    setIsInitialized(false)
    setWalletBalance(null)
    setShowLogoutConfirm(false)
    signOut()
    toast.success('Logged out successfully. Your conversations are saved.')
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <ChatInterface
        user={user}
        walletBalance={walletBalance}
        messages={messages}
        isTyping={isTyping}
        inputText={inputText}
        showUserMenu={showUserMenu}
        onInputChange={setInputText}
        onSendMessage={() => handleSendMessage()}
        onImageSelect={handleImageSelect}
        onAudioRecord={handleAudioRecord}
        onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
        onViewLanding={() => router.push('/')}
        onLogout={handleLogout}
        onShowFeedback={() => setShowFeedback(true)}
        onQuickAction={handleQuickAction}
      />

      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <FeedbackForm
            user={user}
            onClose={() => setShowFeedback(false)}
          />
        </div>
      )}

      {showWalletModal && user && (
        <WalletModal
          user={user}
          onClose={() => setShowWalletModal(false)}
        />
      )}

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-200/50 dark:border-red-800/50">
                    <LogOut className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-linka-black dark:text-white">Log out</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Confirm your action</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to log out? Your conversations will be saved and you can continue where you left off when you return.
                </p>
              </div>

              <div className="p-6 flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-linka-black dark:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatContent />
    </Suspense>
  )
}

