'use client'

import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import type { Message } from '../../libs/types'

interface ChatMessagesProps {
  messages: Message[]
  isTyping: boolean
}

export default function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 bg-linka-white dark:bg-gray-950 transition-colors duration-300 scrollbar-thin">
      {messages.map((message, index) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isTyping && <TypingIndicator />}
    </div>
  )
}

