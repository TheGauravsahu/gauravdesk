import React from "react"
import { Bot, Home, Inbox, CircleUserRound, Bell, MessageSquare, Search, Loader2 } from "lucide-react"

export default function InboxLoading() {
  return (
    <div className="w-full h-screen overflow-hidden flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 select-none">
      {/* =========================================================================
          1. MINIMAL SIDEBAR (Exact match to screenshot)
          ========================================================================= */}
      <aside className="w-16 shrink-0 flex flex-col justify-between items-center py-4 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-[#0c0c0e] z-30">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo / Brand Mark Squircle with Bot Icon */}
          <div className="size-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid place-items-center shadow-xs">
            <Bot className="size-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

          {/* Navigation Item 1: Home (Inactive) */}
          <div className="size-10 rounded-xl grid place-items-center text-zinc-400 dark:text-zinc-500">
            <Home className="size-5" />
          </div>

          {/* Navigation Item 2: Inbox (ACTIVE with Blue Highlight Pill and Badge) */}
          <div className="relative size-10 rounded-xl bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-zinc-200/80 dark:border-zinc-700/80 grid place-items-center shadow-sm">
            <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
            <Inbox className="size-5" />
            {/* Unread badge */}
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-bold grid place-items-center shadow-xs animate-pulse">
              2
            </span>
          </div>
        </div>

        {/* User Profile Avatar at Bottom */}
        <div className="grid size-10 place-items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500">
          <CircleUserRound className="size-5" />
        </div>
      </aside>

      {/* =========================================================================
          2. MAIN WORKSPACE (Header + 2-Pane Inbox)
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 px-4 md:px-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c0c0e]/90 flex items-center justify-between shrink-0 select-none z-20">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-center text-zinc-400">
              <span className="size-3.5 border-l-2 border-zinc-400 dark:border-zinc-500" />
            </div>

            {/* Breadcrumb matching exact screenshot text */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-zinc-400 dark:text-zinc-500 text-xs">
                GauravDesk
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                Inbox — Operator Conversations
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200/80 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400">
              <Bell className="size-3.5" />
              <span>Turn on notifications</span>
            </div>

            {/* Profile Avatar with status dot */}
            <div className="relative size-7 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center">
              <span>N</span>
              <span className="absolute bottom-0 right-0 size-2 rounded-full bg-emerald-500 ring-2 ring-[#0c0c0e]" />
            </div>
          </div>
        </header>

        {/* 2-Pane Body: Left Conversation List + Right Empty State */}
        <div className="flex-1 overflow-hidden flex bg-white dark:bg-[#111114]">
          {/* =========================================================================
              LEFT PANE: Inbox Conversation List
              ========================================================================= */}
          <aside className="w-80 md:w-88 shrink-0 flex flex-col overflow-hidden border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0e0e11]">
            {/* Header: "Inbox" title */}
            <div className="flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800/70 p-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Inbox
              </h2>
            </div>

            {/* Filter Tabs matching exact pills: All open, Waiting, Agent, You, Closed */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200/60 dark:border-zinc-800/60 px-3.5 py-2.5 text-xs">
              <span className="rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold px-3 py-1 shadow-xs">
                All open
              </span>
              <span className="rounded-full px-3 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                Waiting
              </span>
              <span className="rounded-full px-3 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                Agent
              </span>
              <span className="rounded-full px-3 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                You
              </span>
              <span className="rounded-full px-3 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                Closed
              </span>
            </div>

            {/* Search Input matching exact placeholder */}
            <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="relative flex items-center">
                <Search className="absolute left-3 size-3.5 text-zinc-400 pointer-events-none" />
                <div className="w-full h-8 pl-8 pr-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#16161a] text-xs text-zinc-400 flex items-center">
                  Search visitors and last messages
                </div>
              </div>
            </div>

            {/* Shimmering Conversation Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {/* Item 1 Skeleton matching Visitor "what is this ch 9 about >" */}
              <div className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center animate-pulse">
                      <span className="size-3.5 rounded-full bg-blue-400/40" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-3.5 w-16 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                      <div className="h-3 w-36 bg-zinc-200/80 dark:bg-zinc-800/80 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-2.5 w-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 pl-10.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                    You
                  </span>
                  <span className="text-[10px] text-zinc-400">Open conversation</span>
                </div>
              </div>

              {/* Item 2 Skeleton matching Visitor "hi" */}
              <div className="p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center animate-pulse">
                      <span className="size-3.5 rounded-full bg-blue-400/40" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-3.5 w-16 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                      <div className="h-3 w-20 bg-zinc-200/80 dark:bg-zinc-800/80 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-2.5 w-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 pl-10.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                    Agent
                  </span>
                  <span className="text-[10px] text-zinc-400">Open conversation</span>
                </div>
              </div>

              {/* Item 3 Skeleton */}
              <div className="p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-3.5 w-20 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-zinc-200/80 dark:bg-zinc-800/80 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-2.5 w-10 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </aside>

          {/* =========================================================================
              RIGHT PANE: Exact Match to "No conversation selected" Empty State
              ========================================================================= */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#111114]">
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#111114]">
              {/* Squircle with MessageSquare icon */}
              <div className="size-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3.5 shadow-2xs">
                <MessageSquare className="size-5.5 text-zinc-400 dark:text-zinc-500" />
              </div>

              {/* Title & Subtitle matching image 1:1 */}
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                No conversation selected
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                Pick a conversation from the list to read it and reply.
              </p>

              {/* Subtle Blue Loader Accent */}
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
