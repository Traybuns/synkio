import type { LucideIcon } from 'lucide-react'
import { Github, Twitter, MessageCircle } from 'lucide-react'

export type FooterLink = {
  label: string
  href: string
  external?: boolean
}

export type FooterLinkSection = {
  product: FooterLink[]
  company: FooterLink[]
  resources: FooterLink[]
  legal: FooterLink[]
}

export type SocialLink = {
  icon: LucideIcon
  href: string
  label: string
}

export const FOOTER_LINKS: FooterLinkSection = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Vendors', href: '/vendors' }
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Feedback', href: '/feedback' }
  ],
  resources: [
    { label: 'Documentation', href: 'https://github.com/geemanji/synkio', external: true },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Support', href: '/contact' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' }
  ]
}

export const SOCIAL_LINKS: SocialLink[] = [
  { icon: Twitter, href: 'https://twitter.com/synkio', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/geemanji/synkio', label: 'GitHub' },
  { icon: MessageCircle, href: '/contact', label: 'Chat with us' }
]

