import React from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="w-full h-screen overflow-hidden flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none animate-in fade-in duration-100">
      {/* 1. Exact Sidebar Skeleton matching DashboardShell */}
      <aside className="w-16 shrink-0 flex flex-col justify-between items-center py-4 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-[#0c0c0e] z-30">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo Squircle */}
          <div className="size-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid place-items-center animate-pulse">
            <div className="size-5 rounded-md bg-purple-500/30" />
          </div>

          <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

          {/* Navigation Item 1 Placeholder */}
          <div className="size-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 grid place-items-center animate-pulse">
            <div className="size-5 rounded bg-purple-500/20" />
          </div>

          {/* Navigation Item 2 Placeholder */}
          <div className="size-10 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/40 grid place-items-center animate-pulse">
            <div className="size-5 rounded bg-zinc-300 dark:bg-zinc-700" />
          </div>
        </div>

        {/* User Profile Avatar at Bottom */}
        <div className="size-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse" />
      </aside>

      {/* 2. Main Workspace Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar Skeleton */}
        <header className="h-14 px-4 md:px-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c0c0e]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <div className="h-3.5 w-28 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-7 w-32 rounded-lg bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse hidden sm:block" />
            <div className="size-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </header>

        {/* Workspace Body Skeleton */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row p-4 md:p-6 gap-6">
          {/* Left Column Settings Skeleton */}
          <div className="flex-1 space-y-6 overflow-hidden">
            {/* Top Heading */}
            <div className="space-y-2">
              <div className="h-5 w-44 bg-zinc-300 dark:bg-zinc-700 rounded-md animate-pulse" />
              <div className="h-3.5 w-72 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Shimmering Section 1 */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-4">
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
                <div className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
              </div>
            </div>

            {/* Shimmering Section 2 */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-4">
              <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 animate-pulse" />
            </div>

            {/* Subtle Loading Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-400 text-xs font-medium">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Loading workspace data...</span>
            </div>
          </div>

          {/* Right Column Chatbot Preview Skeleton (Desktop) */}
          <div className="hidden lg:flex flex-col items-center justify-center w-[380px] xl:w-[420px] shrink-0 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-[#111114]/50 p-6 space-y-4">
            <div className="w-full flex items-center justify-between">
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="size-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            {/* Widget Card Skeleton */}
            <div className="w-full h-[460px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#16161a] overflow-hidden flex flex-col justify-between p-4 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="size-8 rounded-full bg-purple-500/30 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-2 w-12 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 py-4">
                <div className="h-10 w-3/4 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
                <div className="h-8 w-1/2 ml-auto rounded-xl bg-purple-500/20 animate-pulse" />
              </div>
              <div className="h-10 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
