import React from "react"

export default function DashboardHomeLoading() {
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

          {/* Navigation Item 1: Home (ACTIVE with Blue Highlight Indicator) */}
          <div className="relative size-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 grid place-items-center shadow-sm">
            <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
            <div className="size-5 rounded bg-blue-500/30 animate-pulse" />
          </div>

          {/* Navigation Item 2: Inbox (Inactive with Unread Badge Skeleton) */}
          <div className="relative size-10 rounded-xl grid place-items-center">
            <div className="size-5 rounded bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold grid place-items-center shadow-xs">
              3
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
              <div className="h-4 w-28 bg-blue-500/20 dark:bg-blue-400/20 rounded animate-pulse" />
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

        {/* Split View Skeleton: Left Customizer + Right Live Preview */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* =========================================================================
              LEFT COLUMN: Customizer Settings Skeleton
              ========================================================================= */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-zinc-50/50 dark:bg-[#09090b]">
            {/* Widget Title + Saved Badge Skeleton */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-7 w-28 bg-zinc-300 dark:bg-zinc-700 rounded-md animate-pulse" />
                <div className="h-3.5 w-80 max-w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="h-6 w-18 rounded-full border border-emerald-500/20 bg-emerald-500/10 animate-pulse" />
            </div>

            {/* Row 1: Agent name Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-3 w-48 bg-zinc-200/80 dark:bg-zinc-800/80 rounded animate-pulse" />
              </div>
              <div className="md:col-span-2">
                <div className="h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-4 flex items-center animate-pulse">
                  <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </div>
              </div>
            </div>

            {/* Row 2: Agent avatar Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-2">
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-3 w-44 bg-zinc-200/80 dark:bg-zinc-800/80 rounded animate-pulse" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-4">
                  {/* Glossy Blue Orb Placeholder */}
                  <div className="size-12 rounded-full bg-blue-500/25 border border-blue-500/35 shrink-0 animate-pulse" />

                  {/* Dropzone Skeleton */}
                  <div className="flex-1 h-14 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#121215] flex items-center px-4 gap-3 animate-pulse">
                    <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      <div className="h-2.5 w-44 bg-zinc-200/60 dark:bg-zinc-800/60 rounded" />
                    </div>
                  </div>
                </div>
                <div className="h-2.5 w-56 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
              </div>
            </div>

            {/* Row 3: Accent color Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-2">
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-3 w-52 bg-zinc-200/80 dark:bg-zinc-800/80 rounded animate-pulse" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-full bg-blue-600/30 ring-2 ring-blue-500/40 animate-pulse" />
                  <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="size-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
                <div className="h-2.5 w-48 bg-zinc-200/60 dark:bg-zinc-800/60 rounded animate-pulse" />
              </div>
            </div>

            {/* Row 4: Position Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pt-2">
              <div className="space-y-1.5">
                <div className="h-4 w-20 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-3 w-40 bg-zinc-200/80 dark:bg-zinc-800/80 rounded animate-pulse" />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <div className="w-36 h-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-2 flex flex-col justify-end animate-pulse">
                  <div className="h-2 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="w-36 h-20 rounded-xl border-2 border-blue-500/40 bg-white dark:bg-[#121215] p-2 flex flex-col justify-end items-end animate-pulse">
                  <div className="h-2 w-12 bg-blue-500/30 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Live Preview Mockup Skeleton
              ========================================================================= */}
          <aside className="w-full lg:w-[480px] xl:w-[520px] shrink-0 border-l border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-[#0c0c0e] p-5 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="h-4 w-24 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
              <div className="h-3.5 w-18 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Browser Window Mock Skeleton */}
            <div className="flex-1 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] overflow-hidden shadow-xl">
              {/* Browser Header Bar */}
              <div className="h-10 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-100/70 dark:bg-zinc-900/60 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-500/80" />
                  <span className="size-2 rounded-full bg-amber-500/80" />
                  <span className="size-2 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-5 w-40 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] animate-pulse" />
                <div className="size-3 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
              </div>

              {/* Inside Browser: Chat Widget Card Skeleton */}
              <div className="flex-1 p-4 bg-zinc-50/50 dark:bg-[#0c0c0e] flex flex-col justify-end items-end">
                <div className="w-full max-w-[370px] h-[450px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#111114] shadow-2xl flex flex-col justify-between overflow-hidden">
                  {/* Widget Top Header in Blue Theme */}
                  <div className="bg-blue-600/85 px-4 py-3 flex items-center justify-between shrink-0 animate-pulse">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-white/20" />
                      <div className="h-3.5 w-20 bg-white/30 rounded" />
                    </div>
                    <div className="size-3.5 bg-white/30 rounded" />
                  </div>

                  {/* Widget Body with Chat Bubbles & Pills */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-hidden flex flex-col bg-[#111114]">
                    {/* Grounding Pill Placeholder */}
                    <div className="h-6 w-56 mx-auto rounded-full border border-zinc-800 bg-zinc-900/90 animate-pulse" />

                    {/* Agent Message Bubble */}
                    <div className="flex items-start gap-2 pt-1">
                      <div className="size-6 rounded-full bg-blue-500/30 shrink-0 mt-0.5 animate-pulse" />
                      <div className="p-3 rounded-2xl rounded-tl-sm bg-zinc-800/90 w-52 space-y-1.5 animate-pulse">
                        <div className="h-2.5 w-full bg-zinc-700 rounded" />
                        <div className="h-2.5 w-3/4 bg-zinc-700 rounded" />
                      </div>
                    </div>

                    {/* Starter Question Pills Skeletons */}
                    <div className="space-y-1.5 pt-2 flex flex-col items-end">
                      <div className="h-7 w-48 rounded-xl border border-zinc-800 bg-zinc-900/80 animate-pulse" />
                      <div className="h-7 w-64 rounded-xl border border-zinc-800 bg-zinc-900/80 animate-pulse" />
                      <div className="h-7 w-56 rounded-xl border border-zinc-800 bg-zinc-900/80 animate-pulse" />
                      <div className="h-7 w-52 rounded-xl border border-zinc-800 bg-zinc-900/80 animate-pulse" />
                    </div>
                  </div>

                  {/* Bottom Composer Skeleton */}
                  <div className="p-3 border-t border-zinc-800/80 bg-[#141418] flex items-center gap-2">
                    <div className="flex-1 h-9 rounded-xl border border-zinc-800 bg-zinc-900/80 animate-pulse" />
                    <div className="size-8 rounded-lg bg-blue-600/40 shrink-0 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
