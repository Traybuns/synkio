export interface Product {
  productId: string
  vendorEmail: string
  name: string
  description: string
  category: string
  price: {
    amount: string
    currency: string
    tokenAddress?: string
  }
  images?: string[]
  stock?: {
    quantity: number
    available: boolean
  }
  status: 'draft' | 'active' | 'sold_out' | 'archived'
  metadata?: {
    specifications?: Record<string, any>
    shipping?: any
    tags?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductRequest {
  vendorEmail: string
  name: string
  description: string
  category: string
  price: {
    amount: string
    currency: string
    tokenAddress?: string
  }
  images?: string[]
  stock?: {
    quantity: number
    available: boolean
  }
  metadata?: {
    specifications?: Record<string, any>
    shipping?: any
    tags?: string[]
  }
}

export interface UpdateProductRequest {
  vendorEmail: string
  name?: string
  description?: string
  category?: string
  price?: {
    amount: string
    currency: string
    tokenAddress?: string
  }
  images?: string[]
  stock?: {
    quantity: number
    available: boolean
  }
  status?: 'draft' | 'active' | 'sold_out' | 'archived'
  metadata?: {
    specifications?: Record<string, any>
    shipping?: any
    tags?: string[]
  }
}

