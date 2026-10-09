"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Conversation,
  Message,
} from "./types"
import { INITIAL_CONVERSATIONS } from "./mock-data"
import { CustomerPreviewModal } from "./CustomerPreviewModal"
import {
  Search,
  Check,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  PanelRightClose,
  PanelRightOpen,
  ArrowUp,
  Clock,
  Globe,
  Monitor,
  Laptop,
  CheckCircle2,
  Inbox,
  MessageSquare,
} from "lucide-react"

interface OperatorInboxProps {
  hideNavRail?: boolean
}

export function OperatorInbox({ hideNavRail = false }: OperatorInboxProps) {
  const router = useRouter()
  // Starts empty by default to display the requested empty state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<"all" | "waiting" | "agent" | "you" | "closed">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [replyText, setReplyText] = useState<string>("")
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(true)
  const [isGroundingExpanded, setIsGroundingExpanded] = useState<boolean>(true)
  const [isCustomerPreviewOpen, setIsCustomerPreviewOpen] = useState<boolean>(false)

  // Active selected conversation
  const activeConversation = selectedId
    ? conversations.find((c) => c.id === selectedId) || null
    : null

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    let matchesTab = true
    if (activeFilter === "waiting") matchesTab = c.tag === "Waiting"
    if (activeFilter === "agent") matchesTab = c.tag === "Agent"
    if (activeFilter === "closed") matchesTab = c.status === "closed"
    if (activeFilter === "you") matchesTab = c.assignedTo === "Juan Lorenz" || c.status === "open"

    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subjectSnippet.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const waitingCount = conversations.filter((c) => c.tag === "Waiting").length

  // Send reply
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!replyText.trim() || !selectedId) return

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "operator",
      senderName: "Operator",
      text: replyText.trim(),
      timestamp: "Just now",
      seen: "Sent • Just now",
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              tag: "You",
              lastActivity: "Just now",
              messages: [...c.messages, newMsg],
            }
          : c
      )
    )
    setReplyText("")
  }

  // Toggle ticket status
  const handleToggleClose = () => {
    if (!selectedId) return
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              status: c.status === "open" ? "closed" : "open",
            }
          : c
      )
    )
  }

  return (
    <div className="w-full h-full overflow-hidden flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* =========================================================================
          COLUMN 1: CONVERSATION LIST (Left)
          ========================================================================= */}
      <aside className="w-80 md:w-88 shrink-0 flex flex-col border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0e0e11] overflow-hidden select-none">
        
        {/* Inbox Header & Waiting Count Badge */}
        <div className="p-4 border-b border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Inbox
            </h2>
            {waitingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold text-[11px] shadow-2xs">
                {waitingCount} waiting
              </span>
            )}
          </div>

          {/* Toggle button to load/clear mock conversations for testing */}
          <button
            type="button"
            onClick={() => {
              if (conversations.length === 0) {
                setConversations(INITIAL_CONVERSATIONS)
                setSelectedId(INITIAL_CONVERSATIONS[0].id)
              } else {
                setConversations([])
                setSelectedId(null)
              }
            }}
            className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            title="Toggle between real empty state and demo conversations"
          >
            {conversations.length === 0 ? "Load demo" : "Clear"}
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-3.5 py-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
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
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search visitors and last messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Conversation List Items OR Empty State (Matching Image 2) */}
        {filteredConversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-3 shadow-2xs">
              <Inbox className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              No conversations yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[210px] text-center mb-4">
              Add the widget to your site. When a visitor sends a message, the conversation shows up here.
            </p>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-medium border border-zinc-700/80 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <span className="font-mono text-zinc-400 text-[11px] font-semibold">&lt;/&gt;</span>
              <span>Install the widget</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/40">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedId
              const isWaiting = conv.tag === "Waiting"

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                    isSelected
                      ? "bg-zinc-100/90 dark:bg-zinc-800/60"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-white rounded-r-full" />
                  )}

                  {/* Avatar with face/initial */}
                  <div
                    className={`size-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold shadow-xs ${
                      conv.customerAvatarBg || "bg-orange-500"
                    }`}
                  >
                    <span className="text-sm">😊</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs truncate ${
                          isSelected
                            ? "font-bold text-zinc-900 dark:text-zinc-50"
                            : "font-semibold text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {conv.customerName}
                      </p>
                      <span className="text-[10px] text-zinc-400 shrink-0 font-medium">
                        {conv.lastActivity}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate mb-1.5 font-medium">
                      {conv.subjectSnippet}
                    </p>

                    {/* Status Tag Pill */}
                    <div className="flex items-center gap-2">
                      {isWaiting ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-semibold text-[10px] shadow-2xs">
                          Waiting
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[10px]">
                          Agent
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400 truncate">
                        {isWaiting
                          ? "The visitor asked for a person"
                          : "Handled autonomously"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </aside>

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
              <div className="size-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm shadow-xs shrink-0">
                😊
              </div>

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
                  Unknown location • 12:27 local time
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
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-50/60 dark:bg-[#0c0c0e]">
            {/* Top greeting bubble */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-400 mb-1 mr-1">Greeting</span>
              <div className="rounded-2xl rounded-tr-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 shadow-xs max-w-md">
                Hello from this super friendly agent 😊
              </div>
            </div>

            {/* Visitor Question Message */}
            <div className="flex items-start gap-3 max-w-xl">
              <div className="size-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm shadow-xs shrink-0 mt-0.5">
                😊
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {activeConversation.customerName}
                  </span>
                  <span className="text-[10px] text-zinc-400">6 minutes ago</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-medium shadow-xs">
                  How do I reset my password?
                </div>
              </div>
            </div>

            {/* Grounding Explanation Accordion Card */}
            <div className="ml-11 max-w-2xl rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsGroundingExpanded(!isGroundingExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-blue-500" />
                  <span>How the agent handled this</span>
                </div>
                {isGroundingExpanded ? (
                  <ChevronUp className="size-3.5 text-zinc-400" />
                ) : (
                  <ChevronDown className="size-3.5 text-zinc-400" />
                )}
              </button>

              {isGroundingExpanded && (
                <div className="p-4 pt-1 space-y-3 text-xs border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/40">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Looked up{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                      Reset Password
                    </span>{" "}
                    in documentation. Followed the standard account recovery policy.
                  </p>

                  <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="font-mono">account-recovery.md</span>
                      <span className="text-emerald-500 font-medium">98% relevance</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                      &quot;Users can reset their password via email OTP or by visiting the account settings page and verifying their email.&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Agent / Operator replies in stream */}
            {activeConversation.messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "operator" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] text-zinc-400">
                    {m.senderName || (m.sender === "operator" ? "Operator" : "Agent")}
                  </span>
                  <span className="text-[10px] text-zinc-400">• {m.timestamp}</span>
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs max-w-lg leading-relaxed shadow-xs ${
                    m.sender === "operator"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Composer Box */}
          <footer className="p-4 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#111114]">
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
            <div className="size-11 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg shadow-xs shrink-0">
              😊
            </div>
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
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">12:27</span>
                  <span className="block text-[10px] text-zinc-400">Europe/Berlin</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Language</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">American English</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Device</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">Desktop</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Browser</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">Chrome</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">System</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">Mac OS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Came from</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">Direct visit</span>
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
