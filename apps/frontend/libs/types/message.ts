import type { VendorData } from './vendor'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  readStatus?: 'sent' | 'delivered' | 'read'
  imageUrl?: string
  audioUrl?: string
  audioBlob?: Blob
  vendorData?: VendorData
}

export interface AgentMessageRequest {
  message: string
  threadId?: string
  channel?: string
  userEmail?: string
  senderAddress?: string
  conversationId?: string
}

export interface AgentMessageResponse {
  response: string
  miniAppShared?: boolean
  miniAppUrl?: string
  miniAppType?: string
  toolResults?: any
  vendorData?: VendorData
}

