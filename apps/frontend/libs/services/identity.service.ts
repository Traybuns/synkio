import { getBackendUrl } from '../utils'
import type { CreateIdentityRequest, SignInRequest } from '../types'

export async function createIdentity(request: CreateIdentityRequest) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/identity/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    return await response.json()
  } catch (error) {
    console.error('Error creating identity:', error)
    throw error
  }
}

export async function signIn(request: SignInRequest) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/identity/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    const data = await response.json()

    // If response is not ok, return error data
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Invalid email or password'
      }
    }

    return data
  } catch (error) {
    console.error('Error signing in:', error)
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.'
    }
  }
}

