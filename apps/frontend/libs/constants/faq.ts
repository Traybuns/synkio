import type { LucideIcon } from 'lucide-react'
import { ShieldCheck, MessageSquare, LockKeyhole, Globe2 } from 'lucide-react'

export type FaqEntry = {
  question: string
  answer: string
  highlights?: string[]
}

export type FaqSection = {
  title: string
  description: string
  icon: LucideIcon
  accent: string
  entries: FaqEntry[]
}

export const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Payments & Transactions',
    description: 'See how Synkio keeps every payment protected from the moment you make a request until you approve delivery.',
    icon: ShieldCheck,
    accent: 'from-linka-emerald/30 via-linka-emerald/5 to-transparent',
    entries: [
      {
        question: 'How does Synkio protect my payments?',
        answer: 'Every payment flows into Synkio escrow the moment you approve an order. Funds stay on hold until you confirm everything looks good, giving both sides peace of mind.',
        highlights: [
          'Escrow releases only after you approve delivery',
          'Live updates show exactly where the payment stands'
        ]
      },
      {
        question: 'How do I send money out of my account?',
        answer: 'Tell Synkio who to pay and how much, review the confirmation screen, and authorize the request. We deliver the funds or send a simple claim link if the recipient is new—no wallet addresses or tricky steps.',
        highlights: [
          'Use plain language like "Send $50 to john@example.com"',
          'Confirm the amount and recipient before anything moves',
          'Track the payment status in the same chat thread'
        ]
      }
    ]
  },
  {
    title: 'Getting Started',
    description: 'You can run your entire transaction in chat form—Synkio handles every structured step behind the scenes.',
    icon: MessageSquare,
    accent: 'from-cyan-400/30 via-sky-500/5 to-transparent',
    entries: [
      {
        question: 'Do I need technical knowledge?',
        answer: 'No. Just message Synkio like you would a teammate. We spin up invoices, holds, reminders, and receipts automatically while you stay focused on the conversation.',
        highlights: [
          'Describe what you need in plain language',
          'We turn chats into quotes, holds, and receipts automatically'
        ]
      },
      {
        question: 'Do I need to understand crypto?',
        answer: 'Not at all. Synkio routes transactions across the right networks for you, so you never worry about addresses, gas, or conversions.',
        highlights: [
          'Use everyday language—Synkio handles the rails',
          'Automatic network selection keeps fees low',
          'Funds settle in the format you expect without extra steps'
        ]
      }
    ]
  },
  {
    title: 'Wallet & Security',
    description: 'Your wallet is fully managed by Synkio with continuous monitoring and proactive alerts.',
    icon: LockKeyhole,
    accent: 'from-orange-400/30 via-amber-500/10 to-transparent',
    entries: [
      {
        question: 'Is my wallet information safe?',
        answer: 'Yes. Wallet access is locked down, every transaction requires your approval, and we watch account activity around the clock with instant alerts if something seems off.',
        highlights: [
          'Approvals happen in-chat so you stay in control',
          'Suspicious activity triggers fast notifications',
          'You can freeze funds from the chat if needed'
        ]
      },
      {
        question: 'How do I fund my wallet?',
        answer: 'Use a Bread.africa transfer (coming soon) or send supported tokens directly to your Synkio wallet. Your guide can share the right instructions in seconds.',
        highlights: [
          'Ask your guide for your wallet address or payment link',
          'Deposits appear in chat as soon as they post'
        ]
      }
    ]
  },
  {
    title: 'Channels & Vendors',
    description: 'Work with Synkio on the channel you prefer, then grow into a verified vendor when you\'re ready.',
    icon: Globe2,
    accent: 'from-purple-500/30 via-indigo-600/5 to-transparent',
    entries: [
      {
        question: 'Where does Synkio work?',
        answer: 'Synkio meets you in WhatsApp, on the web, and across new channels as they launch. Start in one place and continue anywhere without losing context.',
        highlights: [
          'Everything stays synced between WhatsApp and web',
          'Receipts and reminders follow you automatically',
          'Switch devices mid-conversation with zero setup'
        ]
      },
      {
        question: 'How do I become a vendor?',
        answer: 'Sign up, choose "Become a Vendor," and share what you sell. Your listings go live with escrow protection, and your reputation grows with every successful order.',
        highlights: [
          'Profile, pricing, and fulfillment all live in one flow',
          'Escrow-backed payouts unlock when buyers approve delivery'
        ]
      }
    ]
  }
]

