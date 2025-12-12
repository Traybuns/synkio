import type { LucideIcon } from 'lucide-react'
import { 
  MessageCircleIcon, 
  Lock, 
  CheckCircle2, 
  ShoppingBag, 
  Users, 
  Zap, 
  Wallet, 
  Eye, 
  Bell, 
  Shield, 
  FileText, 
  Brain 
} from 'lucide-react'

export type ChatStatus = {
  text: string
  align: 'start' | 'end'
  variant: 'accent' | 'subtle'
}

export type StatusCard = {
  label: string
  subtitle: string
  badge?: string
  tone: 'emerald' | 'neutral'
}

export type HowItWorksStep = {
  tag: string
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  statuses?: ChatStatus[]
  statusCard?: StatusCard
}

export type Feature = {
  gradient: string
  pill: string
  glow: string
  icon: LucideIcon
  highlight: string
  title: string
  description: string
}

export type FeaturesByCategory = {
  marketplace: Feature[]
  payments: Feature[]
  security: Feature[]
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    tag: 'Explore',
    icon: MessageCircleIcon,
    title: 'Discover & Chat',
    description: 'Browse vendors or find products using chat messages. Simply say what you need and our AI assistant helps you find the perfect match.',
    actionLabel: 'Get started now',
    statuses: [
      { text: 'I want to buy a laptop for 2 ETH', align: 'end', variant: 'accent' },
      { text: 'Great! I found 3 verified vendors with laptops in that price range. Would you like to see them?', align: 'start', variant: 'subtle' },
    ]
  },
  {
    tag: 'Invest',
    icon: Lock,
    title: 'Secure Escrow',
    description: 'Once you confirm your intent to purchase, Synkio creates a blockchain escrow automatically. Funds are locked safely until delivery is confirmed.',
    statusCard: {
      label: 'Escrow Active',
      subtitle: '2 ETH locked safely onchain',
      badge: 'Looks good!',
      tone: 'emerald'
    }
  },
  {
    tag: 'Earn',
    icon: CheckCircle2,
    title: 'Receive & Verify',
    description: 'Get your product and review it. When satisfied, approve the release in chat by saying "Looks good!" and payment completes automatically.',
    statusCard: {
      label: 'Payment Released Successfully',
      subtitle: 'Transaction completed',
      badge: 'Looks good! 👍',
      tone: 'neutral'
    }
  }
]

export const FEATURES: FeaturesByCategory = {
  marketplace: [
    {
      gradient: 'linear-gradient(135deg, #fdf1f0 0%, #f8d9d2 100%)',
      pill: 'Marketplace',
      glow: 'shadow-[0_25px_65px_rgba(248,217,211,0.25)]',
      icon: ShoppingBag,
      highlight: '#f8d9d2',
      title: 'Browse and Connect',
      description: 'Find real people selling real things. Every seller is verified, so you know who you\'re dealing with before you even start chatting.'
    },
    {
      gradient: 'linear-gradient(135deg, #f2ecff 0%, #dcd7ff 100%)',
      pill: 'Conversations',
      glow: 'shadow-[0_25px_65px_rgba(220,215,255,0.25)]',
      icon: Users,
      highlight: '#dcd7ff',
      title: 'Negotiate in Plain English',
      description: 'Talk about prices, delivery, and terms just like you would in person. No confusing forms or complicated checkout processes.'
    },
    {
      gradient: 'linear-gradient(135deg, #e4f5ff 0%, #c9e7ff 100%)',
      pill: 'Instant Wins',
      glow: 'shadow-[0_25px_65px_rgba(201,231,255,0.25)]',
      icon: Zap,
      highlight: '#c9e7ff',
      title: 'Close Deals Instantly',
      description: 'Once you agree, everything happens right there in your chat. Get invoices, track orders, and handle everything without leaving the conversation.'
    }
  ],
  payments: [
    {
      gradient: 'linear-gradient(135deg, #e4fff3 0%, #b7f5d8 100%)',
      pill: 'Choice',
      glow: 'shadow-[0_25px_65px_rgba(183,245,216,0.25)]',
      icon: Wallet,
      highlight: '#b7f5d8',
      title: 'Choose Your Payment Method',
      description: 'Pay with your credit card, debit card, bank transfer, or digital wallet. Pick what works for you—we support them all in one simple flow.'
    },
    {
      gradient: 'linear-gradient(135deg, #fff5e4 0%, #ffd6a5 100%)',
      pill: 'Transparency',
      glow: 'shadow-[0_25px_65px_rgba(255,214,165,0.25)]',
      icon: Eye,
      highlight: '#ffd6a5',
      title: 'See Everything Up Front',
      description: 'No hidden fees, no surprises. You\'ll see the exact amount, any fees, and when the money will arrive—all before you confirm.'
    },
    {
      gradient: 'linear-gradient(135deg, #f2f5ff 0%, #d6dcff 100%)',
      pill: 'Live Status',
      glow: 'shadow-[0_25px_65px_rgba(214,220,255,0.25)]',
      icon: Bell,
      highlight: '#d6dcff',
      title: 'Get Instant Updates',
      description: 'Know exactly where your payment stands. Get notified when it\'s sent, when it\'s received, and when everything is complete.'
    }
  ],
  security: [
    {
      gradient: 'linear-gradient(135deg, #e0f3ff 0%, #c7f0ff 100%)',
      pill: 'Protected',
      glow: 'shadow-[0_25px_65px_rgba(199,240,255,0.25)]',
      icon: Shield,
      highlight: '#c7f0ff',
      title: 'Money Held Safely',
      description: 'Your payment is protected from the moment you send it. The money stays secure until you confirm you got what you paid for—or until you both agree to cancel.'
    },
    {
      gradient: 'linear-gradient(135deg, #fdf0ff 0%, #f2d4ff 100%)',
      pill: 'Proof',
      glow: 'shadow-[0_25px_65px_rgba(242,212,255,0.25)]',
      icon: FileText,
      highlight: '#f2d4ff',
      title: 'Every Transaction Recorded',
      description: 'Nothing gets lost or forgotten. Every deal, payment, and agreement is automatically saved and easy to find whenever you need it.'
    },
    {
      gradient: 'linear-gradient(135deg, #fff9e6 0%, #ffe7b7 100%)',
      pill: 'Automatic',
      glow: 'shadow-[0_25px_65px_rgba(255,231,183,0.25)]',
      icon: Brain,
      highlight: '#ffe7b7',
      title: 'No Tech Knowledge Needed',
      description: 'All the protection happens automatically behind the scenes. You don\'t need to understand how it works—just know that your money and deals are safe.'
    }
  ]
}

