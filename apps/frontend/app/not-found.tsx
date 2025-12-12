'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function NotFound() {
  const router = useRouter()
  const { isAuthenticated: hasUser } = useAuth()

  const primaryCtaLabel = hasUser ? 'Take Me to My Dashboard' : 'Go to Homepage'
  const primaryCtaHref = hasUser ? '/chat' : '/'

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-20 text-center">
              <div className="flex flex-col items-center gap-6">
                <div
                  className="bg-center bg-no-repeat aspect-video bg-contain w-full max-w-[360px]"
                  data-alt="A whimsical illustration of a friendly, lost robot holding a map upside down"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAxlW2AzIWcOtZWkyFYY449A80p8QaVRA-BQNVzMBWwFU4aEzPgx7a1FcPemliAYfv3B3LfNVQQ78YVT8N1N0cJcWw21fqq6YqGPug2Lgyv3rDk32iZEOdCGtAfU_tDZlrQq0X_seCEq8VROT-2heufWwTmxIFcPwPo6CdrVQQoEUchmRD9oCEyEAFBOshGIjZBSDMQF97kiAw5fvpdeHcHj9h8IL3Vz0AhhXHFedYDpW2Bqhq_A7wd28OhUeyruat63Vb7jmFlvSVN")`,
                  }}
                />

                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                    Oops! This page went on an adventure.
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal max-w-[480px] text-center">
                    Sorry, we couldn't find the page you were looking for. It might have been moved or the link is
                    incorrect. Let's get you back on track.
                  </p>
                </div>

                <Link
                  href={primaryCtaHref}
                  className="flex min-w-[200px] max-w-[320px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                >
                  <span className="truncate">{primaryCtaLabel}</span>
                </Link>

              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

