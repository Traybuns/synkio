'use client'

import Header from './Header'
import Hero from './Hero'
import FeedbackForm from '../FeedbackForm'
import type { User } from '../../libs/types'

interface LandingPageProps {
  onAction: (action: string) => void
  showFeedback: boolean
  onCloseFeedback: () => void
}

export default function LandingPage({ onAction, showFeedback, onCloseFeedback }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#101322] flex flex-col overscroll-none relative overflow-hidden">
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
      
      <Header variant="landing" onAction={onAction} />
      <Hero onAction={onAction} />
      
      {showFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <FeedbackForm 
            user={null}
            onClose={onCloseFeedback}
          />
        </div>
      )}
    </div>
  )
}

