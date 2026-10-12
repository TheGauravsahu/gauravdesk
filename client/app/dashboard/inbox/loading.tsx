import React from "react"
import { MessageSquare, Loader2 } from "lucide-react"

export default function InboxLoading() {
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

          {/* Navigation Item 2: Inbox (ACTIVE with Blue Highlight Indicator) */}
          <div className="relative size-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 grid place-items-center shadow-sm">
            <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
            <div className="size-5 rounded bg-blue-500/30 animate-pulse" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold grid place-items-center shadow-xs">
              2
            </span>
          </div>
        </div>

        {/* User Profile Avatar Skeleton */}
        <div className="size-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-850 animate-pulse" />
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
              <div className="h-4 w-44 bg-blue-500/20 dark:bg-blue-400/20 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-7 w-36 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 animate-pulse hidden sm:block" />
            <div className="relative size-7 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center animate-pulse">
              <span>N</span>
              <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 ring-2 ring-[#0c0c0e]" />
            </div>
          </div>
        </header>

        {/* 2-Pane Body Skeleton */}
        <div className="flex-1 overflow-hidden flex bg-white dark:bg-[#111114]">
          {/* =========================================================================
              LEFT PANE: Conversation List Skeleton
              ========================================================================= */}
          <aside className="w-80 md:w-88 shrink-0 flex flex-col overflow-hidden border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0e0e11]">
            {/* Header: Title Skeleton */}
            <div className="p-4 border-b border-zinc-200/70 dark:border-zinc-800/70">
              <div className="h-5 w-16 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
            </div>

            {/* Filter Tabs Skeleton */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200/60 dark:border-zinc-800/60 px-3.5 py-2.5">
              <div className="h-6 w-16 rounded-full bg-blue-600/30 animate-pulse" />
              <div className="h-6 w-14 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-6 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-6 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-6 w-14 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>

            {/* Search Input Skeleton */}
            <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="h-8 w-full rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#16161a] animate-pulse" />
            </div>

            {/* Conversation Card Skeletons */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border space-y-2 ${
                    i === 0
                      ? "border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20"
                      : "border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-blue-500/20 border border-blue-500/30 shrink-0 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-16 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                        <div className="h-3 w-36 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-2.5 w-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 pl-10.5">
                    <div className="h-4 w-10 rounded bg-blue-500/20 animate-pulse" />
                    <div className="h-3 w-20 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* =========================================================================
              RIGHT PANE: Empty State Skeleton
              ========================================================================= */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#111114]">
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#111114]">
              {/* MessageSquare Squircle Skeleton */}
              <div className="size-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3.5 shadow-2xs animate-pulse">
                <MessageSquare className="size-5.5 text-zinc-400 dark:text-zinc-500" />
              </div>

              {/* Text Skeletons */}
              <div className="h-4 w-40 bg-zinc-300 dark:bg-zinc-700 rounded mb-2 animate-pulse" />
              <div className="h-3 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />

              {/* Blue Loader Accent */}
              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-medium">
                <Loader2 className="size-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                <span>Syncing inbox...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
