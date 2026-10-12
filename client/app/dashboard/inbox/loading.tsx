import React from "react"
import { Loader2, MessageSquare } from "lucide-react"

export default function InboxLoading() {
  return (
    <div className="w-full h-screen overflow-hidden flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none animate-in fade-in duration-100">
      {/* 1. Global Navigation Sidebar matching DashboardShell (Inbox Active) */}
      <aside className="w-16 shrink-0 flex flex-col justify-between items-center py-4 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-[#0c0c0e] z-30">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo Squircle */}
          <div className="size-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid place-items-center animate-pulse">
            <div className="size-5 rounded-md bg-blue-500/30" />
          </div>

          <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

          {/* Navigation Item 1: Home (Inactive) */}
          <div className="size-10 rounded-xl bg-zinc-200/40 dark:bg-zinc-800/30 grid place-items-center animate-pulse">
            <div className="size-5 rounded bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Navigation Item 2: Inbox (ACTIVE with Blue Accent) */}
          <div className="relative size-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 grid place-items-center shadow-xs">
            <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
            <div className="size-5 rounded bg-blue-500/30 animate-pulse" />
          </div>
        </div>

        {/* User Profile Avatar at Bottom */}
        <div className="size-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse" />
      </aside>

      {/* 2. Main Inbox Workspace (3-Column Layout) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 px-4 md:px-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c0c0e]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                GauravDesk
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <div className="h-4 w-32 bg-blue-500/20 dark:bg-blue-400/20 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-medium">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Loading conversations...</span>
            </div>
            <div className="size-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </header>

        {/* 3-Column Operator Inbox Skeleton */}
        <div className="flex-1 overflow-hidden flex bg-white dark:bg-[#111114]">
          {/* Column 1: Conversations List Skeleton */}
          <div className="w-80 shrink-0 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col bg-zinc-50/50 dark:bg-[#0d0d10]">
            {/* Search and Filter Chips */}
            <div className="p-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
              <div className="h-8 w-full rounded-lg bg-zinc-200/70 dark:bg-zinc-800/60 animate-pulse" />
              <div className="flex gap-1.5 overflow-hidden">
                <div className="h-6 w-12 rounded-md bg-blue-500/20 animate-pulse" />
                <div className="h-6 w-16 rounded-md bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse" />
                <div className="h-6 w-14 rounded-md bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse" />
                <div className="h-6 w-16 rounded-md bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse" />
              </div>
            </div>

            {/* Conversation Card Skeletons */}
            <div className="flex-1 overflow-hidden p-2 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border transition-colors space-y-2 ${
                    i === 0
                      ? "border-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-blue-500/20 animate-pulse" />
                      <div className="h-3.5 w-24 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                    </div>
                    <div className="h-2.5 w-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-4/5 bg-zinc-200/80 dark:bg-zinc-800/70 rounded animate-pulse" />
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="h-4 w-12 rounded bg-zinc-200/60 dark:bg-zinc-800/60 animate-pulse" />
                    <div className="h-4 w-16 rounded bg-zinc-200/60 dark:bg-zinc-800/60 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Active Chat Thread Skeleton */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#111114]">
            {/* Thread Header */}
            <div className="h-14 px-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-blue-500/20 animate-pulse" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-28 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-4 w-12 rounded bg-blue-500/20 animate-pulse" />
                  </div>
                  <div className="h-2.5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="size-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="size-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>

            {/* Chat Thread Messages Skeleton */}
            <div className="flex-1 p-6 space-y-4 overflow-hidden flex flex-col justify-end">
              {/* Visitor Bubble (Left) */}
              <div className="flex gap-2.5 max-w-[70%]">
                <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 animate-pulse" />
                <div className="p-3.5 rounded-2xl rounded-tl-sm bg-zinc-100 dark:bg-zinc-800/70 space-y-1.5 w-64 animate-pulse">
                  <div className="h-3 w-4/5 bg-zinc-300 dark:bg-zinc-700 rounded" />
                  <div className="h-3 w-3/5 bg-zinc-300 dark:bg-zinc-700 rounded" />
                </div>
              </div>

              {/* Agent Bubble (Right with Blue Theme) */}
              <div className="flex gap-2.5 max-w-[70%] ml-auto justify-end">
                <div className="p-3.5 rounded-2xl rounded-tr-sm bg-blue-600/15 dark:bg-blue-600/25 border border-blue-500/30 space-y-1.5 w-72 animate-pulse">
                  <div className="h-3 w-full bg-blue-400/40 rounded" />
                  <div className="h-3 w-4/5 bg-blue-400/40 rounded" />
                  <div className="h-3 w-2/3 bg-blue-400/30 rounded" />
                </div>
                <div className="size-7 rounded-full bg-blue-600/30 shrink-0 animate-pulse" />
              </div>

              {/* Visitor Reply (Left) */}
              <div className="flex gap-2.5 max-w-[70%]">
                <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0 animate-pulse" />
                <div className="p-3.5 rounded-2xl rounded-tl-sm bg-zinc-100 dark:bg-zinc-800/70 space-y-1.5 w-48 animate-pulse">
                  <div className="h-3 w-full bg-zinc-300 dark:bg-zinc-700 rounded" />
                </div>
              </div>
            </div>

            {/* Bottom Composer Skeleton */}
            <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#0e0e11]">
              <div className="h-20 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3 flex flex-col justify-between">
                <div className="h-3.5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="size-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="size-5 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  </div>
                  <div className="h-7 w-20 rounded-lg bg-blue-600/30 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Customer Details Panel Skeleton */}
          <div className="w-72 shrink-0 hidden xl:flex flex-col bg-zinc-50/40 dark:bg-[#0c0c0e] p-5 space-y-6">
            <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="size-14 rounded-full bg-blue-500/20 animate-pulse" />
              <div className="h-4 w-28 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="h-3 w-20 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
