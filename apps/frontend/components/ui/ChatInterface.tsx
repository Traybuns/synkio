'use client'

import clsx from 'clsx'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { useTheme } from '../../contexts/ThemeContext'
import type { User, WalletBalance } from '../../libs/types'

interface ChatInterfaceProps {
  user: User | null
  walletBalance: WalletBalance | null
  messages: any[]
  isTyping: boolean
  inputText: string
  showUserMenu: boolean
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onImageSelect?: (file: File) => void
  onAudioRecord?: (blob: Blob) => void
  onToggleUserMenu: () => void
  onViewLanding: () => void
  onLogout: () => void
  onShowFeedback: () => void
  onQuickAction: (action: string) => void
}

export default function ChatInterface({
  user,
  walletBalance,
  messages,
  isTyping,
  inputText,
  showUserMenu,
  onInputChange,
  onSendMessage,
  onImageSelect,
  onAudioRecord,
  onToggleUserMenu,
  onViewLanding,
  onLogout,
  onShowFeedback,
  onQuickAction
}: ChatInterfaceProps) {
  const { theme, scope } = useTheme()
  const applyLocalDark = scope === 'chat' && theme === 'dark'

  return (
    <div className={clsx(applyLocalDark && 'dark', 'h-screen w-full')}>
      <div className="relative h-full bg-linka-white dark:bg-gray-950 transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
          <div className="absolute -top-24 sm:-top-32 right-0 h-64 w-64 sm:h-80 sm:w-80 bg-linka-blue/60 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-64 w-64 sm:h-80 sm:w-80 bg-linka-emerald/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex h-full flex-col overscroll-none overflow-hidden">
          <ChatHeader
            user={user}
            walletBalance={walletBalance}
            showUserMenu={showUserMenu}
            onToggleUserMenu={onToggleUserMenu}
            onViewLanding={onViewLanding}
            onLogout={onLogout}
            onShowFeedback={onShowFeedback}
            onQuickAction={onQuickAction}
          />

          <ChatMessages messages={messages} isTyping={isTyping} />

          <ChatInput
            value={inputText}
            onChange={onInputChange}
            onSend={onSendMessage}
            onImageSelect={onImageSelect}
            onAudioRecord={onAudioRecord}
            disabled={false}
          />
        </div>
      </div>
    </div>
  )
}

