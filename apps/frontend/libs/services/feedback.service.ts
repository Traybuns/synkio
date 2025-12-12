import { getBackendUrl } from '../utils'
import type { SubmitFeedbackRequest } from '../types'
import { FeedbackChannel } from '../types'

export { FeedbackChannel }

export async function submitFeedback(request: SubmitFeedbackRequest) {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...request,
        channel: request.channel || FeedbackChannel.WEB
      })
    })
    return await response.json()
  } catch (error) {
    console.error('Error submitting feedback:', error)
    throw error
  }
}

export async function fetchFeedback(
  page = 1,
  limit = 50,
  status?: string,
  channel?: string
) {
  try {
    const backendUrl = getBackendUrl()
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    if (status) params.append('status', status)
    if (channel) params.append('channel', channel)

    const response = await fetch(`${backendUrl}/api/feedback?${params.toString()}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching feedback:', error)
    throw error
  }
}

export async function fetchFeedbackStats() {
  try {
    const backendUrl = getBackendUrl()
    const response = await fetch(`${backendUrl}/api/feedback/stats`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching feedback stats:', error)
    throw error
  }
}

