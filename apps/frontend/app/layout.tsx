import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'

export const metadata: Metadata = {
  title: 'Synkio - Conversational Marketplace | Let’s Transact Together',
  description:
    'Synkio is the conversational marketplace for transparent buying, selling, and payouts. Hold funds in friendly escrow, share invoices in chat, and close deals without juggling apps.',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/logo.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  keywords: [
    'Synkio',
    'conversational marketplace',
    'chat commerce',
    'secure escrow',
    'transparent payments',
    'WhatsApp commerce',
    'vendor discovery',
    'multi-channel selling',
    'social commerce',
    'chat payments',
  ],
  authors: [{ name: 'Synkio' }],
  creator: 'Synkio',
  publisher: 'Synkio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_ROOT_URL || 'https://synkio.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Synkio - Conversational Marketplace | Let\'s Transact Together',
    description:
      'Meet Synkio, the conversational marketplace that keeps escrow, receipts, and payouts in one transparent chat thread.',
    url: '/',
    siteName: 'Synkio',
    images: [
      {
        url: '/synkio-hero.png',
        width: 1200,
        height: 630,
        alt: 'Synkio - Conversational Marketplace',
      },
      {
        url: '/logo.png',
        width: 960,
        height: 640,
        alt: 'Synkio Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synkio - Conversational Marketplace | Let\'s Transact Together',
    description:
      'Synkio keeps escrow, vendor chats, and payouts in one place so buyers and sellers stay aligned.',
    images: [
      {
        url: '/synkio-icon.png',
        width: 1200,
        height: 630,
        alt: 'Synkio - Conversational Marketplace',
      },
    ],
    creator: '@synkio.app',
    site: '@synkio.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

