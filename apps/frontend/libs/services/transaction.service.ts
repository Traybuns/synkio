import { getBackendUrl } from '../utils'
import type { TransactionResponse } from '../types'

export async function fetchTransactions(
  email: string,
  params?: {
    page?: number
    limit?: number
    status?: string
    type?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
): Promise<TransactionResponse> {
  try {
    const backendUrl = getBackendUrl()
    const urlParams = new URLSearchParams()
    if (params?.page) urlParams.append('page', params.page.toString())
    if (params?.limit) urlParams.append('limit', params.limit.toString())
    if (params?.status) urlParams.append('status', params.status)
    if (params?.type) urlParams.append('type', params.type)
    if (params?.sortBy) urlParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) urlParams.append('sortOrder', params.sortOrder)

    const url = `${backendUrl}/api/transactions/${email}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
    const response = await fetch(url)
    return await response.json()
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return {
      success: false,
      error: 'Failed to fetch transactions'
    }
  }
}

