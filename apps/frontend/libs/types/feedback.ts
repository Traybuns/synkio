export enum FeedbackChannel {
  WEB = 'web',
  WHATSAPP = 'whatsapp'
}

export interface SubmitFeedbackRequest {
  userEmail?: string
  message: string
  rating?: number
  channel?: FeedbackChannel
}

