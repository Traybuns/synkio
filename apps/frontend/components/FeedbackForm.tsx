'use client'

import { useState } from 'react'
import { MessageSquare, Star, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { submitFeedback } from '../libs/backend'
import type { User } from '../libs/types'
import { FeedbackChannel } from '../libs/types'
import { sanitizeString, containsScriptTags } from '../libs/sanitize'

interface FeedbackFormProps {
  user?: User | null
  onClose?: () => void
  channel?: FeedbackChannel
}

export default function FeedbackForm({ user, onClose, channel = FeedbackChannel.WEB }: FeedbackFormProps) {
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState<number | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedMessage = message.trim()
    
    if (!trimmedMessage) {
      toast.error('Please enter your feedback')
      return
    }

    if (containsScriptTags(trimmedMessage)) {
      toast.error('Invalid characters detected in feedback message')
      return
    }

    setIsSubmitting(true)

    try {
      const sanitizedMessage = sanitizeString(trimmedMessage)
      
      const response = await submitFeedback({
        userEmail: user?.email,
        message: sanitizedMessage,
        rating,
        channel
      })

      if (response.success) {
        toast.success('Thank you for your feedback!')
        setMessage('')
        setRating(undefined)
        if (onClose) {
          onClose()
        }
      } else {
        toast.error(response.error || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 max-w-2xl w-full relative border border-linka-emerald/10">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-linka-emerald hover:bg-linka-emerald/10 rounded-full p-1.5 transition-all z-10"
          aria-label="Close feedback form"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-linka-emerald/10 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-linka-emerald" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Share Your Feedback
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            How would you rate your experience? (Optional)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const isSelected = rating !== undefined && rating >= value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`p-2.5 rounded-xl transition-all transform hover:scale-110 ${
                    isSelected
                      ? 'bg-amber-400 text-linka-black shadow-md shadow-amber-400/40'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-amber-100 dark:hover:bg-amber-400/10 hover:text-amber-400 dark:hover:text-amber-300'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${isSelected ? 'fill-current text-linka-black' : 'text-amber-400'}`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="feedback-message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Your Feedback
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={2000}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-linka-emerald focus:border-linka-emerald text-gray-900 dark:text-gray-100 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
            placeholder="Tell us what you think, what can we improve, or any issues you've encountered..."
            required
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
            <span className={message.length > 1900 ? 'text-orange-500' : ''}>
              {message.length}/2000
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linka-emerald text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-linka-emerald/30 hover:shadow-lg hover:shadow-linka-emerald/40 font-semibold"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-linka-emerald/30 transition-all font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

