import React from "react"
import { CircleUserRound } from "lucide-react"

export default function ProfileLoading() {
  return (
    <div className="w-full h-screen overflow-hidden flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none animate-in fade-in duration-100">
      {/* =========================================================================
          1. MINIMAL SIDEBAR SKELETON (w-16)
          ========================================================================= */}
      <aside className="w-16 shrink-0 flex flex-col justify-between items-center py-4 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-[#0c0c0e] z-30">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo Squircle Skeleton */}
          <div className="size-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid place-items-center shadow-xs animate-pulse">
            <div className="size-5 rounded-md bg-blue-500/30" />
          </div>

          <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

          {/* Navigation Item 1: Home (Inactive) */}
          <div className="size-10 rounded-xl grid place-items-center">
            <div className="size-5 rounded bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
          </div>

          {/* Navigation Item 2: Inbox (Inactive) */}
          <div className="size-10 rounded-xl grid place-items-center">
            <div className="size-5 rounded bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
          </div>
        </div>

        {/* User Profile Avatar at Bottom (ACTIVE with Blue Accent ring/indicator) */}
        <div className="size-10 rounded-full border-2 border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 grid place-items-center shadow-sm animate-pulse">
          <CircleUserRound className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN WORKSPACE SKELETON
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Skeleton */}
        <header className="h-14 px-4 md:px-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c0c0e]/90 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100 dark:bg-zinc-900/60 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-18 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <div className="h-4 w-20 bg-blue-500/20 dark:bg-blue-400/20 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-7 w-36 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 animate-pulse hidden sm:block" />
            <div className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </header>

        {/* Profile Content Body Skeleton */}
        <main className="h-full flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-[#09090b] p-5 text-foreground sm:p-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            {/* Header: Title + Subtitle */}
            <div className="space-y-2">
              <div className="h-7 w-28 bg-zinc-300 dark:bg-zinc-700 rounded-md animate-pulse" />
              <div className="h-4 w-80 max-w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Profile Card Skeleton */}
            <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#111114] shadow-xs overflow-hidden">
              {/* Card Header */}
              <div className="p-6 space-y-2 border-b border-zinc-100 dark:border-zinc-850">
                <div className="h-5 w-36 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-3.5 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-6">
                {/* User Info Row: Avatar + Name/Email + Badge */}
                <div className="flex items-center gap-4">
                  {/* Avatar Skeleton */}
                  <div className="size-12 rounded-full bg-blue-500/20 border border-blue-500/30 shrink-0 animate-pulse" />
                  
                  {/* Name and Email lines */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="h-4 w-40 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-3.5 w-56 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </div>

                  {/* Status Badge Skeleton */}
                  <div className="h-6 w-20 rounded-full bg-blue-500/15 border border-blue-500/20 shrink-0 animate-pulse" />
                </div>

                {/* Details Grid: Email + Member Since */}
                <div className="grid gap-4 border-t border-zinc-200/70 dark:border-zinc-800/70 pt-5 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="size-5 rounded bg-zinc-200 dark:bg-zinc-800 mt-0.5 shrink-0 animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3.5 w-44 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="size-5 rounded bg-zinc-200 dark:bg-zinc-800 mt-0.5 shrink-0 animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3.5 w-36 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Sign out button */}
              <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between gap-4">
                <div className="h-3 w-56 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-9 w-28 rounded-lg bg-red-500/15 border border-red-500/20 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
