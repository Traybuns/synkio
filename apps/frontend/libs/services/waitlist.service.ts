import { getBackendUrl } from '../utils'

export interface WaitlistSignupRequest {
  email: string
  name: string
}

export interface WaitlistSignupResponse {
  success: boolean
  message?: string
  error?: string
  data?: {
    email: string
    name: string
    createdAt: string
  }
}

export async function signupWaitlist(
  email: string,
  name: string
): Promise<WaitlistSignupResponse> {
  try {
    const backendUrl = getBackendUrl()
    
    if (!email || !name) {
      return {
        success: false,
        error: 'Email and name are required'
      }
    }

    const response = await fetch(`${backendUrl}/api/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, name })
    })

    let data: any
    try {
      const text = await response.text()
      if (!text) {
        return {
          success: false,
          error: 'Empty response from server'
        }
      }
      data = JSON.parse(text)
    } catch (parseError) {
      console.error('Error parsing backend response:', parseError)
      return {
        success: false,
        error: 'Invalid response from server'
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Failed to join waitlist'
      }
    }

    return data
  } catch (error: any) {
    console.error('Error joining waitlist:', error)
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return {
        success: false,
        error: 'Unable to connect to server. Please check your connection and try again.'
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to join waitlist'
    }
  }
}
