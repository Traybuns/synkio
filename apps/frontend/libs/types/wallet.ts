export interface WalletBalance {
  balance: string
  currency: string
  walletAddress: string
  network?: {
    name: string
    chainId: number
  }
}

export interface WalletFundProps {
  onClose: () => void
  walletAddress?: string
  networkInfo?: {
    name: string
    chainId: number
  }
  onBalanceRefresh?: () => void
}

