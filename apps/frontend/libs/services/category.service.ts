import { getBackendUrl } from '../utils'

export interface Category {
  name: string
  slug: string
  description?: string
  icon?: string
  isActive: boolean
  order: number
}

export async function fetchCategories(isActive?: boolean): Promise<{ success: boolean; data?: { categories: Category[] }; error?: string }> {
  try {
    const isClient = typeof window !== 'undefined'
    const baseUrl = isClient ? '' : getBackendUrl()
    const params = new URLSearchParams()
    if (isActive !== undefined) params.append('isActive', isActive.toString())

    const url = `${baseUrl}/api/categories${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Categories API endpoint not found. Returning empty categories. Make sure backend server is running and routes are registered.')
        return {
          success: true,
          data: { categories: [] }
        }
      }
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error fetching categories:', error)

    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.',
        data: { categories: [] }
      }
    }

    if (error.message?.includes('404')) {
      return {
        success: true,
        data: { categories: [] }
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to fetch categories',
      data: { categories: [] }
    }
  }
}

export async function createCategory(name: string, description?: string, icon?: string, order?: number): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const isClient = typeof window !== 'undefined'
    const baseUrl = isClient ? '' : getBackendUrl()
    const response = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        icon,
        order
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to create category: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error creating category:', error)
    return {
      success: false,
      error: error.message || 'Failed to create category. Please try again.'
    }
  }
}
