'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Check, CheckCheck, Play, Pause } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Message } from '../../libs/types'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  const isUser = message.sender === 'user'
  const readStatus = message.readStatus || 'sent'

  const vendorInfo = useMemo(() => {
    if (isUser) return null
    
    if (message.vendorData) {
      return message.vendorData
    }
    
    if (!message.text) return null
    
    const text = message.text
    
    const nameMatch = text.match(/Name:\s*(.+?)(?:\s+-\s+Location|$|\n)/i)
    
    const locationMatch = text.match(/Location:\s*(.+?)(?:\s+-\s+Reputation|$|\n)/i)
    
    const reputationMatch = text.match(/Reputation Score:\s*(\d+)/i)
    
    const transactionsMatch = text.match(/with\s+(\d+)\s+total\s+transactions/i) ||
                              text.match(/(\d+)\s+total\s+transactions/i)
    
    const disputesMatch = text.match(/and\s+(\d+)\s+disputes?\)/i) ||
                         text.match(/\((\d+)\s+disputes?\)/i)
    
    const noDisputesMatch = text.match(/no\s+disputes?\)/i)
    
    const websiteMatch = text.match(/\[Visit[^\]]+\]\((https?:\/\/[^\)]+)\)/i) ||
                        text.match(/Website:\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/i) ||
                        text.match(/\*\*Website:\*\*\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/i)
    
    if (nameMatch) {
      let name = nameMatch[1].trim()
      if (name.includes('**')) {
        name = name.replace(/\*\*/g, '').trim()
      }
      
      const location = locationMatch ? locationMatch[1].trim().replace(/\*\*/g, '') : undefined
      const reputationScore = reputationMatch ? parseInt(reputationMatch[1], 10) : undefined
      const totalTransactions = transactionsMatch ? parseInt(transactionsMatch[1], 10) : undefined
      const disputes = noDisputesMatch ? 0 : (disputesMatch ? parseInt(disputesMatch[1], 10) : undefined)
      
      let website: string | undefined = undefined
      if (websiteMatch) {
        website = websiteMatch[2] || websiteMatch[1]
      }
      
      if (name && name.length > 0) {
        return {
          name,
          location,
          reputationScore,
          totalTransactions,
          disputes,
          website
        }
      }
    }
    
    return null
  }, [message.text, isUser])

  useEffect(() => {
    if (message.audioBlob && !audioUrl) {
      const url = URL.createObjectURL(message.audioBlob)
      setAudioUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [message.audioBlob, audioUrl])
  
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const getReadIcon = () => {
    if (!isUser) return null
    
    if (readStatus === 'read') {
      return <CheckCheck className="w-3.5 h-3.5 text-linka-emerald" />
    } else if (readStatus === 'delivered') {
      return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
    } else {
      return <Check className="w-3.5 h-3.5 text-gray-400" />
    }
  }

  const handleAudioPlay = () => {
    const audioSource = audioUrl || message.audioUrl
    
    if (!audioSource) return

    if (!audioRef.current) {
      const audio = new Audio(audioSource)
      audioRef.current = audio
      audio.onended = () => {
        setIsPlaying(false)
      }
      audio.onpause = () => {
        setIsPlaying(false)
      }
      audio.onplay = () => {
        setIsPlaying(true)
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error)
        })
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div
        className={`group relative ${vendorInfo && !isUser ? 'max-w-full sm:max-w-lg lg:max-w-xl' : 'max-w-xs sm:max-w-sm lg:max-w-md'} px-4 py-3 rounded-2xl transition-all duration-200 hover:shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-linka-emerald via-emerald-500 to-emerald-600 text-white shadow-lg shadow-linka-emerald/25 rounded-tr-sm'
            : 'bg-white dark:bg-gray-800 text-linka-black dark:text-gray-100 border border-gray-200/60 dark:border-gray-700/60 shadow-md rounded-tl-sm'
        }`}
      >
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden">
            <img 
              src={message.imageUrl} 
              alt="Message attachment" 
              className="w-full h-auto max-h-[300px] object-cover"
            />
          </div>
        )}
        
        {message.audioUrl || message.audioBlob ? (
          <div className={`flex items-center space-x-3 mb-2 ${isUser ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
            <button
              onClick={handleAudioPlay}
              className={`p-2 rounded-full transition-colors ${
                isUser 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <div className="flex-1">
              <div className="text-xs font-medium mb-1">Audio message</div>
              <div className="h-1 bg-white/20 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isUser ? 'bg-white/40' : 'bg-linka-emerald'}`}
                  style={{ width: isPlaying ? '60%' : '0%' }}
                />
              </div>
            </div>
          </div>
        ) : null}
        
        {vendorInfo && !isUser && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-linka-emerald to-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{vendorInfo.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{vendorInfo.name}</h4>
                {vendorInfo.location && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">{vendorInfo.location}</p>
                )}
              </div>
            </div>
            {vendorInfo.reputationScore !== undefined && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Reputation: <span className="font-semibold text-linka-emerald">{vendorInfo.reputationScore}</span>
                </span>
                {vendorInfo.totalTransactions !== undefined && (
                  <span className="text-gray-600 dark:text-gray-400">
                    {vendorInfo.totalTransactions} transactions
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        
        {message.text && (
          <p className={`text-sm leading-relaxed break-words ${isUser ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
            {message.text}
          </p>
        )}
        
        <div className={`flex items-center justify-end gap-1.5 mt-2 ${
          isUser ? 'text-emerald-50/90' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span className="text-[10px] font-medium tabular-nums">
            {formatTime(message.timestamp)}
          </span>
          {isUser && (
            <span className="flex items-center ml-0.5">
              {getReadIcon()}
            </span>
          )}
        </div>
        
        {isUser && (
          <div className="absolute -top-1.5 right-0 w-4 h-4 bg-gradient-to-br from-linka-emerald to-emerald-600 transform rotate-45 translate-x-1/2 rounded-sm" />
        )}
        {!isUser && (
          <div className="absolute -top-1.5 left-0 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200/60 dark:border-gray-700/60 transform rotate-45 -translate-x-1/2 rounded-sm" />
        )}
      </div>
    </motion.div>
  )
}

