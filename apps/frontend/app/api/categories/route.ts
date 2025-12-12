import { NextRequest, NextResponse } from 'next/server'
import { getBackendUrl } from '../../../libs/utils/config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    
    const backendUrl = getBackendUrl()
    const params = new URLSearchParams()
    if (isActive) params.append('isActive', isActive)

    const url = `${backendUrl}/api/categories${params.toString() ? `?${params.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: { categories: [] }
        })
      }
      
      const errorText = await response.text()
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch categories: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error proxying categories request:', error)
    return NextResponse.json({
      success: true,
      data: { categories: [] }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = getBackendUrl()
    
    const response = await fetch(`${backendUrl}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || `Failed to create category: ${response.status}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error proxying category creation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create category' 
      },
      { status: 500 }
    )
  }
}
