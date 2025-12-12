'use client'

import { useRouter } from 'next/navigation'
import { ArrowUpRight, Search, ShoppingBag, User as UserIcon, Wallet } from 'lucide-react'
import clsx from 'clsx'

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>
  label: string
  action: string
  description: string
  accent: string
}

interface QuickActionsProps {
  variant?: 'anonymous' | 'authenticated'
  onAction: (action: string) => void
}

export default function QuickActions({ variant = 'anonymous', onAction }: QuickActionsProps) {
  const router = useRouter()
  const anonymousActions: QuickAction[] = [
    { icon: Search, label: 'Find Vendors', action: 'find-vendors', description: 'Browse audited suppliers', accent: 'from-linka-blue/60 via-white to-linka-blue/20' },
    { icon: ShoppingBag, label: 'Become a Vendor', action: 'become-vendor', description: 'List your offerings in minutes', accent: 'from-linka-emerald/40 via-white to-linka-blue/10' },
    { icon: UserIcon, label: 'Sign In', action: 'sign-in', description: 'Resume where you left off', accent: 'from-gray-200 via-white to-linka-blue/20' }
  ]

  const authenticatedActions = [
    { icon: Search, label: 'Find vendors', action: 'search' },
    { icon: Wallet, label: 'Manage wallet', action: 'fund' }
  ]

  if (variant === 'authenticated') {
    return (
      <div className="flex flex-wrap gap-2">
        {authenticatedActions.map(item => (
          <button
            key={item.action}
            onClick={() => onAction(item.action)}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-900/60 px-3 py-2 text-xs font-semibold text-linka-black dark:text-gray-100 hover:border-linka-emerald hover:text-linka-emerald transition-colors"
          >
            <item.icon className="w-4 h-4 text-linka-emerald" />
            {item.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">Quick paths</p>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">Tap to seed the chat</span>
      </div>
      <div className="flex gap-3 overflow-x-auto quick-actions-scroll pb-1 snap-x snap-mandatory">
        {anonymousActions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              if (action.action === 'sign-in') {
                router.push('/login')
              } else {
                onAction(action.action)
              }
            }}
            className="group relative min-w-[220px] flex-1 rounded-2xl border border-white/40 dark:border-white/5 bg-white/80 dark:bg-gray-900/80 px-4 py-4 text-left shadow-[0_10px_30px_-15px_rgba(16,185,129,0.5)] hover:shadow-[0_20px_45px_-20px_rgba(16,185,129,0.7)] transition-all snap-start overflow-hidden backdrop-blur-xl"
          >
            <div className={clsx('absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity', action.accent)} />
            <div className="relative flex items-start space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-white/70 dark:bg-gray-950/70 flex items-center justify-center text-linka-emerald shadow-inner">
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-linka-black dark:text-white">{action.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-linka-emerald opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

