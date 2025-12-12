export interface Transaction {
  transactionId: string
  escrowId: string
  buyerEmail: string
  sellerEmail: string
  amount: number
  currency: string
  status: 'pending' | 'funded' | 'completed' | 'disputed' | 'cancelled' | 'expired'
  type: 'marketplace' | 'service'
  metadata?: {
    title: string
    description: string
    category?: string
  }
  createdAt: Date | string
  updatedAt: Date | string
}

export interface TransactionResponse {
  success: boolean
  data?: {
    transactions: Transaction[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  error?: string
}

