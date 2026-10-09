"use client"

import { Inbox, Search } from "lucide-react"
import type { Conversation } from "./types"

export type ConversationFilter = "all" | "waiting" | "agent" | "you" | "closed"

interface ConversationListPanelProps {
  conversations: Conversation[]
  selectedId: string | null
  activeFilter: ConversationFilter
  searchQuery: string
  waitingCount: number
  isLoading: boolean
  loadError: string | null
  onFilterChange: (filter: ConversationFilter) => void
  onSearchChange: (query: string) => void
  onSelect: (id: string) => void
  onRetry: () => void
  onInstallWidget: () => void
}

export function ConversationListPanel({
  conversations,
  selectedId,
  activeFilter,
  searchQuery,
  waitingCount,
  isLoading,
  loadError,
  onFilterChange,
  onSearchChange,
  onSelect,
  onRetry,
  onInstallWidget,
}: ConversationListPanelProps) {
  return (
    <aside className="flex w-80 shrink-0 select-none flex-col overflow-hidden border-r border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-[#0e0e11] md:w-88">
      <div className="flex items-center justify-between border-b border-zinc-200/70 p-4 dark:border-zinc-800/70">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Inbox
          </h2>
          {waitingCount > 0 ? (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-2xs">
              {waitingCount} waiting
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200/60 px-3.5 py-2.5 text-xs dark:border-zinc-800/60">
        {[
          { id: "all", label: "All open" },
          { id: "waiting", label: waitingCount > 0 ? `Waiting ${waitingCount}` : "Waiting" },
          { id: "agent", label: "Agent" },
          { id: "you", label: "You" },
          { id: "closed", label: "Closed" },
        ].map((tab) => {
          const isSelected = activeFilter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id as ConversationFilter)}
              aria-pressed={isSelected}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-zinc-900 text-white shadow-2xs dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="border-b border-zinc-200/60 p-3 dark:border-zinc-800/60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            aria-label="Search visitors and last messages"
            placeholder="Search visitors and last messages"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-1.5 pl-8.5 pr-3 text-xs text-zinc-900 transition-all placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100"
          />
        </div>
      </div>

      {loadError ? (
        <p
          role="alert"
          className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          {loadError}
        </p>
      ) : null}

      {conversations.length === 0 ? (
        <div className="flex flex-1 select-none flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-500 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <Inbox className="size-5" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {loadError
              ? "Couldn't load conversations"
              : isLoading
                ? "Loading conversations…"
                : "No conversations yet"}
          </h3>
          <p className="mb-4 max-w-[210px] text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {loadError ||
              "Add the widget to your site. New visitor conversations will appear here."}
          </p>
          {loadError ? (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Retry
            </button>
          ) : !isLoading ? (
            <button
              type="button"
              onClick={onInstallWidget}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <span className="font-mono text-[11px] font-semibold text-zinc-400">
                &lt;/&gt;
              </span>
              <span>Install the widget</span>
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex-1 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800/40">
          {conversations.map((conversation) => {
            const isSelected = conversation.id === selectedId
            const isWaiting = conversation.tag === "Waiting"

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation.id)}
                aria-current={isSelected ? "true" : undefined}
                className={`relative flex w-full cursor-pointer items-start gap-3 p-3.5 text-left transition-colors ${
                  isSelected
                    ? "bg-zinc-100/90 dark:bg-zinc-800/60"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                }`}
              >
                {isSelected ? (
                  <span className="absolute bottom-0 left-0 top-0 w-1 rounded-r-full bg-zinc-900 dark:bg-white" />
                ) : null}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-500 text-xs font-semibold text-white shadow-xs">
                  {conversation.customerName.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 flex items-center justify-between gap-1">
                    <span
                      className={`truncate text-xs ${
                        isSelected
                          ? "font-bold text-zinc-900 dark:text-zinc-50"
                          : "font-semibold text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {conversation.customerName}
                    </span>
                    <span className="shrink-0 text-[10px] font-medium text-zinc-400">
                      {conversation.lastActivity}
                    </span>
                  </span>
                  <span className="mb-1.5 block truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {conversation.subjectSnippet}
                  </span>
                  <span className="flex items-center gap-2">
                    {isWaiting ? (
                      <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-2xs">
                        Waiting
                      </span>
                    ) : conversation.status === "closed" ? (
                      <span className="rounded-md bg-zinc-200/80 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        Closed
                      </span>
                    ) : (
                      <span className="rounded-md bg-zinc-200/80 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {conversation.tag || "Agent"}
                      </span>
                    )}
                    <span className="truncate text-[10px] text-zinc-400">
                      {isWaiting
                        ? "Needs an operator"
                        : conversation.status === "closed"
                          ? "Resolved"
                          : "Open conversation"}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
