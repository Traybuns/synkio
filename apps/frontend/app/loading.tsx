'use client'

export default function Loading() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark overflow-hidden p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-3xl text-primary">sync</span>
        <span className="text-xl font-bold text-slate-800 dark:text-white">Synkio</span>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <div className="relative mb-8 flex h-48 w-48 items-center justify-center rounded-xl bg-primary/10">
          <div
            className="absolute h-full w-full animate-spin rounded-full border-4 border-dashed border-primary/30"
            style={{ animationDuration: '10s' }}
          />
          <div className="flex h-36 w-36 items-center justify-center rounded-lg bg-primary/20">
            <span className="material-symbols-outlined text-6xl text-primary animate-pulse">hub</span>
          </div>
        </div>

        <h1 className="text-slate-800 dark:text-white tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
          Syncing your conversations...
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base">Getting the awesome ready for you!</p>

        <div className="w-full max-w-sm mt-8">
          <div className="flex flex-col gap-3 p-4">
            <div className="rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-primary" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

