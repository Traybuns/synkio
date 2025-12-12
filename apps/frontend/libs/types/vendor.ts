export interface VendorData {
  name: string
  location?: string
  reputationScore?: number
  categories?: string[]
  description?: string
  walletAddress?: string
  website?: string
  totalTransactions?: number
  disputes?: number
}

export interface Vendor {
  id: string
  email: string
  username?: string
  walletAddress: string
  profile: {
    name: string
    bio: string
    categories: string[]
    location: string
    website?: string
  }
  reputation: {
    score: number
    totalTransactions: number
    completedTransactions: number
  }
}

export interface VendorDiscoveryProps {
  onClose: () => void
  onStartChat?: (vendor: Vendor) => void
}

