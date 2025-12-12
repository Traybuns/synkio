import { getBackendUrl } from '../utils'
import type { CreateProductRequest, UpdateProductRequest } from '../types'

export async function createProduct(request: CreateProductRequest) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    return await response.json()
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function getProducts(params?: {
  category?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  try {
    const backendUrl = getBackendUrl()
    const urlParams = new URLSearchParams()
    if (params?.category) urlParams.append('category', params.category)
    if (params?.status) urlParams.append('status', params.status)
    if (params?.search) urlParams.append('search', params.search)
    if (params?.page) urlParams.append('page', params.page.toString())
    if (params?.limit) urlParams.append('limit', params.limit.toString())

    const url = `${backendUrl}/api/products${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
    const response = await fetch(url)
    return await response.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function getProduct(productId: string) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/products/${productId}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function updateProduct(productId: string, request: UpdateProductRequest) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    return await response.json()
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(productId: string, vendorEmail: string) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vendorEmail })
    })
    return await response.json()
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

export async function getVendorProducts(
  email: string,
  params?: { status?: string; page?: number; limit?: number }
) {
  try {
    const backendUrl = getBackendUrl()
    const urlParams = new URLSearchParams()
    if (params?.status) urlParams.append('status', params.status)
    if (params?.page) urlParams.append('page', params.page.toString())
    if (params?.limit) urlParams.append('limit', params.limit.toString())

    const url = `${backendUrl}/api/vendors/${email}/products${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
    const response = await fetch(url)
    return await response.json()
  } catch (error) {
    console.error('Error fetching vendor products:', error)
    throw error
  }
}

