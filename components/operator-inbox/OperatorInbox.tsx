"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Conversation,
  Message,
} from "./types"
import { conversationsApi } from "@/lib/api"
import { CustomerPreviewModal } from "./CustomerPreviewModal"
import {
  ConversationFilter,
  ConversationListPanel,
} from "./ConversationListPanel"
import {
  Check,
  Send,
  Sparkles,
  FileText,
  User,
  PanelRightClose,
  PanelRightOpen,
  MessageSquare,
} from "lucide-react"
import { getDiceBearAvatar } from "@/lib/avatar"

function metadataText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Not captured"
}

interface OperatorInboxProps {
  initialConversations?: Conversation[]
}

export function OperatorInbox({
  initialConversations,
}: OperatorInboxProps) {
  const router = useRouter()
  // Starts with server-provided conversations immediately, or empty
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations || []
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [replyText, setReplyText] = useState<string>("")
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(true)
  const [isCustomerPreviewOpen, setIsCustomerPreviewOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(!initialConversations)
  const [isSending, setIsSending] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Fetch real conversations from Fastify backend using conversationsApi
  const fetchConversations = React.useCallback(async (silent = false) => {
    try {
      const data = await conversationsApi.getAll()
      if (!Array.isArray(data.conversations)) {
        throw new Error("The conversations response was invalid")
      }
      setConversations(data.conversations)
      setSelectedId((curr) => {
        // Only keep current selection if it still exists; otherwise keep null
        if (curr && data.conversations.some((c: Conversation) => c.id === curr)) return curr
        return null
      })
      setLoadError(null)
    } catch (error) {
      console.error("Failed to fetch conversations", error)
      setLoadError(
        error instanceof Error ? error.message : "Failed to load conversations"
      )
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [])

  const handleRetry = () => {
    setIsLoading(true)
    void fetchConversations()
  }

  const prevWaitingCountRef = React.useRef(0)

  React.useEffect(() => {
    const initialFetch = setTimeout(() => {
      void fetchConversations()
    }, 0)
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") fetchConversations(true)
    }, 3000)
    return () => {
      clearTimeout(initialFetch)
      clearInterval(timer)
    }
  }, [fetchConversations])

  // Desktop alert notification when new conversation escalates
  React.useEffect(() => {
    const currentWaiting = conversations.filter((c) => c.tag === "Waiting").length
    if (currentWaiting > prevWaitingCountRef.current) {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("New Customer Waiting!", {
          body: "A website visitor requested human assistance or needs your takeover.",
          icon: "/assets/logo.svg",
        })
      }
    }
    prevWaitingCountRef.current = currentWaiting
  }, [conversations])

  // Active selected conversation
  const activeConversation = selectedId
    ? conversations.find((c) => c.id === selectedId) || null
    : null

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    let matchesTab = true
    if (activeFilter === "all") matchesTab = c.status !== "closed"
    if (activeFilter === "waiting") matchesTab = c.tag === "Waiting"
    if (activeFilter === "agent") matchesTab = c.tag === "Agent"
    if (activeFilter === "closed") matchesTab = c.status === "closed"
    if (activeFilter === "you") matchesTab = c.tag === "You" || c.assignedTo === "Operator"

    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subjectSnippet.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const waitingCount = conversations.filter(
    (c) => c.tag === "Waiting" && c.status !== "closed"
  ).length

  // Send reply
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!replyText.trim() || !selectedId || isSending) return

    const trimmed = replyText.trim()
    const conversationId = selectedId
    const previousConversations = conversations
    setActionError(null)

    // Optimistic update
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "operator",
      senderName: "Operator",
      text: trimmed,
      timestamp: "Just now",
      seen: "Sent • Just now",
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              tag: "You",
              lastActivity: "Just now",
              messages: [...c.messages, newMsg],
            }
          : c
      )
    )

    setIsSending(true)
    try {
      await conversationsApi.reply({
        conversationId,
        replyText: trimmed,
        operatorName: "Operator",
      })
      setReplyText("")
      await fetchConversations(true)
    } catch (error) {
      console.error("Failed to send operator reply", error)
      setConversations(previousConversations)
      setReplyText(trimmed)
      setActionError(
        error instanceof Error ? error.message : "Failed to send reply"
      )
    } finally {
      setIsSending(false)
    }
  }

  // Toggle ticket status
  const handleToggleClose = async () => {
    if (!selectedId) return
    const current = conversations.find((c) => c.id === selectedId)
    const nextStatus = current?.status === "open" ? "closed" : "open"
    const previousConversations = conversations
    setActionError(null)

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              status: nextStatus,
            }
          : c
      )
    )

    try {
      await conversationsApi.updateStatus({
        conversationId: selectedId,
        status: nextStatus,
      })
      await fetchConversations(true)
    } catch (error) {
      console.error("Failed to toggle status", error)
      setConversations(previousConversations)
      setActionError(
        error instanceof Error ? error.message : "Failed to update conversation"
      )
    }
  }

  return (
    <div className="w-full h-full overflow-hidden flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      
      <ConversationListPanel
        conversations={filteredConversations}
        selectedId={selectedId}
        activeFilter={activeFilter}
        searchQuery={searchQuery}
        waitingCount={waitingCount}
        isLoading={isLoading}
        loadError={loadError}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearchQuery}
        onSelect={setSelectedId}
        onRetry={handleRetry}
        onInstallWidget={() => router.push("/dashboard")}
      />

      {/* =========================================================================
          COLUMN 2: ACTIVE THREAD & WORKSPACE OR EMPTY STATE (Middle)
          ========================================================================= */}
      {!activeConversation ? (
        /* Empty State (Matching Image 2) */
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#111114]">
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#111114] select-none">
            <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-3 shadow-2xs">
              <MessageSquare className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              No conversation selected
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pick a conversation from the list to read it and reply.
            </p>
          </div>
        </main>
      ) : (
        /* Active Conversation View */
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#111114]">
          {/* Workspace Top Bar */}
          <header className="h-14 px-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-white/90 dark:bg-[#111114]/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3 truncate">
              {/* Customer Avatar */}
              <img
                src={getDiceBearAvatar(activeConversation.customerName || activeConversation.id)}
                alt=""
                className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-800 object-cover shadow-xs shrink-0 border border-zinc-200/50 dark:border-zinc-700/50"
              />

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {activeConversation.customerName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold border border-zinc-200/60 dark:border-zinc-700/60">
                    {activeConversation.tag || "Agent"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  {metadataText(activeConversation.metadata?.pageUrl)} ·{" "}
                  {metadataText(activeConversation.metadata?.localTime)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* View customer modal */}
              <button
                type="button"
                onClick={() => setIsCustomerPreviewOpen(true)}
                title="Preview Customer Widget"
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <User className="size-4" />
              </button>

              {/* Close/Resolve Ticket */}
              <button
                type="button"
                onClick={handleToggleClose}
                title={activeConversation.status === "open" ? "Close ticket" : "Reopen ticket"}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Check className="size-4" />
              </button>

              {/* Toggle Details Panel */}
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                title="Toggle details panel"
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDetailsOpen
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {isDetailsOpen ? (
                  <PanelRightClose className="size-4" />
                ) : (
                  <PanelRightOpen className="size-4" />
                )}
              </button>
            </div>
          </header>

          {/* Message Thread Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-zinc-50/60 dark:bg-[#0c0c0e]">
            {activeConversation.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                No messages yet in this conversation.
              </div>
            ) : (
              activeConversation.messages.map((m) => {
                if (m.sender === "system") {
                  return (
                    <div key={m.id} className="flex justify-center my-2">
                      <span className="text-[11px] px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
                        {m.text}
                      </span>
                    </div>
                  )
                }

                if (m.sender === "operator") {
                  return (
                    <div key={m.id} className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] text-zinc-400">
                          {m.senderName || "Operator"}
                        </span>
                        <span className="text-[10px] text-zinc-400">• {m.timestamp}</span>
                      </div>
                      <div className="rounded-2xl rounded-tr-sm bg-blue-600 text-white px-4 py-2.5 text-xs max-w-lg leading-relaxed shadow-xs whitespace-pre-wrap">
                        {m.text}
                      </div>
                    </div>
                  )
                }

                if (m.sender === "visitor") {
                  return (
                    <div key={m.id} className="flex items-start gap-3 max-w-xl">
                      <img
                        src={getDiceBearAvatar(m.senderName || activeConversation.customerName)}
                        alt=""
                        className="size-8 rounded-full bg-zinc-200 dark:bg-zinc-800 object-cover shadow-xs shrink-0 mt-0.5 border border-zinc-200/50 dark:border-zinc-700/50"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {m.senderName || activeConversation.customerName}
                          </span>
                          <span className="text-[10px] text-zinc-400">{m.timestamp}</span>
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-medium shadow-xs whitespace-pre-wrap">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  )
                }

                // AI / Agent message
                const hasCitations = (m.citations && m.citations.length > 0) || Boolean(m.source)
                return (
                  <div key={m.id} className="flex flex-col items-start max-w-2xl space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Sparkles className="size-3" />
                        {m.senderName || "AI Agent"}
                      </span>
                      <span className="text-[10px] text-zinc-400">• {m.timestamp}</span>
                    </div>

                    <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed shadow-xs whitespace-pre-wrap">
                      {m.text}
                    </div>

                    {/* Citations & Grounding pill if available */}
                    {hasCitations && (
                      <div className="ml-1 w-full rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/70 dark:bg-zinc-900/40 p-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
                          <FileText className="size-3 text-blue-500" />
                          <span>Grounded in Knowledge Base</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {m.citations && m.citations.length > 0 ? (
                            m.citations.map((c, i) => (
                              <span
                                key={i}
                                title={typeof c === "string" ? "" : c.snippet || ""}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-300"
                              >
                                📄{" "}
                                {typeof c === "string"
                                  ? c
                                  : c.title || `Doc #${i + 1}`}
                              </span>
                            ))
                          ) : m.source ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                              📄 {m.source}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Composer Box */}
          <footer className="p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#111114]">
            {actionError ? (
              <p role="alert" className="mb-2 text-xs text-red-600 dark:text-red-400">
                {actionError}
              </p>
            ) : null}
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type your reply as operator..."
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 p-3 pr-12 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="absolute right-3 bottom-3 p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all cursor-pointer shadow-xs"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </footer>
        </main>
      )}

      {/* =========================================================================
          COLUMN 3: CUSTOMER & CONVERSATION DETAILS (Right Sidebar)
          Only displayed when a conversation is actively selected
          ========================================================================= */}
      {activeConversation && isDetailsOpen && (
        <aside className="w-72 md:w-80 shrink-0 border-l border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0e0e11] overflow-y-auto p-5 select-none space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Customer Details
            </h4>
            <button
              type="button"
              onClick={() => setIsDetailsOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <PanelRightClose className="size-4" />
            </button>
          </div>

          {/* Customer Avatar & Name */}
          <div className="flex items-center gap-3">
            <img
              src={getDiceBearAvatar(activeConversation.customerName || activeConversation.id)}
              alt=""
              className="size-11 rounded-full bg-zinc-200 dark:bg-zinc-800 object-cover shadow-xs shrink-0 border border-zinc-200/50 dark:border-zinc-700/50"
            />
            <div className="min-w-0">
              <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {activeConversation.customerName}
              </h5>
              <p className="text-xs text-zinc-400 truncate">
                {activeConversation.customerEmail || "No email captured"}
              </p>
            </div>
          </div>

          {/* Quick info list */}
          <div className="space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Status</span>
                <span className="font-semibold text-emerald-500 capitalize">
                  {activeConversation.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Assigned</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {activeConversation.assignedTo || "AI Agent"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Local time</span>
                <div className="text-right">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {metadataText(activeConversation.metadata?.localTime)}
                  </span>
                  <span className="block text-[10px] text-zinc-400">
                    {metadataText(activeConversation.metadata?.timezone)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Language</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {metadataText(activeConversation.metadata?.language)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Device</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {metadataText(activeConversation.metadata?.device)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Browser</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {metadataText(activeConversation.metadata?.browser)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">System</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {metadataText(activeConversation.metadata?.os)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Came from</span>
                <span
                  className="max-w-[140px] truncate font-medium text-zinc-800 dark:text-zinc-200"
                  title={
                    typeof activeConversation.metadata?.cameFrom === "string"
                      ? activeConversation.metadata.cameFrom
                      : "Direct visit"
                  }
                >
                  {typeof activeConversation.metadata?.cameFrom === "string"
                    ? activeConversation.metadata.cameFrom
                    : "Direct visit"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Floating Customer View Modal */}
      {activeConversation && (
        <CustomerPreviewModal
          conversation={activeConversation}
          isOpen={isCustomerPreviewOpen}
          onClose={() => setIsCustomerPreviewOpen(false)}
        />
      )}
    </div>
  )
}
