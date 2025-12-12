import { getBackendUrl } from '../utils'
import type { WalletBalance } from '../types'

export async function fetchWalletBalance(email: string): Promise<WalletBalance | null> {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/identity/${email}/wallet/balance`)
    const data = await response.json()

    if (data.success) {
      return data.data || null
    }
    return null
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return null
  }
}

