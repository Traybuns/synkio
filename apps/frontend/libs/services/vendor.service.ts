import { getBackendUrl } from '../utils'

export async function fetchVendors(category?: string, minReputation?: number) {
  try {
    const backendUrl = getBackendUrl()
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (minReputation !== undefined) params.append('minReputation', minReputation.toString())

    const url = `${backendUrl}/api/vendors${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch vendors: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error fetching vendors:', error)

    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.',
        data: { vendors: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }
      }
    }

    throw error
  }
}

