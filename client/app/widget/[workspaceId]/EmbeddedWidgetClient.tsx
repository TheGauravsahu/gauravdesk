"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  MessageCircle,
  ChevronDown,
  BookOpen,
  ArrowUp,
  User,
  FileText,
  Headphones,
} from "lucide-react"
import { chatApi } from "@/lib/api"
import { GlossyOrbAvatar } from "@/components/ui/GlossyOrbAvatar"

interface EmbeddedWidgetClientProps {
  workspace: {
    id: string
    name: string
    agentName: string
    accentColor: string
    position: string
    greetingMessage: string
    starterQuestions: string[]
    avatarUrl?: string | null
  }
}

function getClientMetadata() {
  if (typeof window === "undefined") return {}
  const ua = navigator.userAgent || ""
  let browser = "Chrome"
  if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari"
  else if (ua.includes("Edg")) browser = "Edge"

  let os = "Windows"
  if (ua.includes("Mac")) os = "macOS"
  else if (ua.includes("Linux")) os = "Linux"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"

  return {
    device: window.innerWidth < 768 ? "Mobile" : "Desktop",
    browser,
    os,
    language: navigator.language || "English",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    localTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    cameFrom: document.referrer || "Direct visit",
    pageUrl: window.location.href,
  }
}

export function EmbeddedWidgetClient({ workspace }: EmbeddedWidgetClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: "agent" | "visitor" | "operator"; senderName?: string; text: string; citation?: string }>
  >([
    {
      id: "initial",
      sender: "agent",
      senderName: workspace.agentName || "Gaurav Desk Agent",
      text: workspace.greetingMessage || "Hi there! How can we help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [chatStatus, setChatStatus] = useState<string>("open")
  const [chatTag, setChatTag] = useState<string>("Agent")

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const isLeft = workspace.position === "bottom-left"

  // Update initial message when workspace data loads
  useEffect(() => {
    if (workspace.agentName || workspace.greetingMessage) {
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === "initial") {
          return [
            {
              id: "initial",
              sender: "agent",
              senderName: workspace.agentName || "Gaurav Desk Agent",
              text: workspace.greetingMessage || "Hi there! How can we help you today?",
            },
          ]
        }
        return prev
      })
    }
  }, [workspace.agentName, workspace.greetingMessage])

  // Internal scroll to bottom that never scrolls parent window
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Inform parent host page about resize events
  useEffect(() => {
    if (typeof window !== "undefined" && window.parent) {
      window.parent.postMessage(
        {
          type: "gauravdesk:resize",
          open: isOpen,
          position: workspace.position,
        },
        "*"
      )
    }
  }, [isOpen, workspace.position])

  // Listen to external toggle / open commands from parent
  useEffect(() => {
    const handleParentMsg = (e: MessageEvent) => {
      if (e.data && typeof e.data === "object") {
        if (e.data.type === "gauravdesk:set_open") {
          setIsOpen(Boolean(e.data.open))
        } else if (e.data.type === "gauravdesk:toggle") {
          setIsOpen((prev) => !prev)
        }
      }
    }
    window.addEventListener("message", handleParentMsg)
    return () => window.removeEventListener("message", handleParentMsg)
  }, [])

  const [visitorId] = useState(() => {
    if (typeof window !== "undefined") {
      let vid = localStorage.getItem("gauravdesk_vid")
      if (!vid) {
        vid = "vis_" + Math.random().toString(36).substring(2, 11)
        localStorage.setItem("gauravdesk_vid", vid)
      }
      return vid
    }
    return "vis_anon"
  })

  // Poll for operator messages & status updates
  useEffect(() => {
    if (!conversationId) return

    const interval = setInterval(async () => {
      try {
        const data = await chatApi.getMessages(conversationId)
        if (data.status) setChatStatus(data.status)
        if (data.tag) setChatTag(data.tag)

        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((p) => p.id))
            const newItems: any[] = []

            for (const m of data.messages) {
              if (!existingIds.has(m.id)) {
                newItems.push({
                  id: m.id,
                  sender: m.sender === "operator" ? "operator" : m.sender === "visitor" ? "visitor" : "agent",
                  senderName: m.sender_name || (m.sender === "operator" ? "Operator" : workspace.agentName),
                  text: m.text,
                  citation: Array.isArray(m.citations) && m.citations.length > 0 ? m.citations[0] : undefined,
                })
              }
            }

            if (newItems.length > 0) {
              return [...prev, ...newItems]
            }
            return prev
          })
        }
      } catch {
        // silent sync error
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [conversationId, workspace.agentName])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text) return

    setMessages((prev) => [
      ...prev,
      { id: `vis-${Date.now()}`, sender: "visitor", text },
    ])
    if (!textToSend) setInput("")
    setIsTyping(true)

    try {
      const metadata = getClientMetadata()
      const data = await chatApi.sendMessage({
        workspaceId: workspace.id,
        visitorId,
        message: text,
        conversationId,
        metadata,
      })

      if (data.conversationId) {
        setConversationId(data.conversationId)
      }
      if (data.status) {
        setChatStatus(data.status)
      }
      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: `agt-${Date.now()}`,
            sender: "agent",
            senderName: workspace.agentName,
            text: data.answer,
            citation: Array.isArray(data.citations) && data.citations.length > 0 ? data.citations[0] : undefined,
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `agt-${Date.now()}`,
          sender: "agent",
          senderName: workspace.agentName,
          text: "I am having a brief connection issue. Our team has been notified to assist you.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const isHumanEscalated = chatStatus === "waiting" || chatTag === "Waiting" || chatTag === "You"

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col overflow-hidden bg-transparent select-none">
      {isOpen ? (
        /* 1. Chat Window Container (Permanently bounded to iframe, header top, composer bottom) */
        <div className="w-full h-full rounded-2xl shadow-2xl border border-zinc-800 bg-[#111114] flex flex-col overflow-hidden text-zinc-100">
          
          {/* Header in Workspace Accent Color (Pinned Top) */}
          <div
            className="px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-sm z-10"
            style={{ backgroundColor: workspace.accentColor || "#2563eb" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <GlossyOrbAvatar
                avatarUrl={workspace.avatarUrl}
                color={workspace.accentColor}
                alt={workspace.agentName}
                className="size-8.5 border border-white/30"
              />
              <div className="truncate">
                <h3 className="font-bold text-sm leading-tight truncate">
                  {workspace.agentName || "Gaurav Desk"}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] opacity-90 font-medium">
                    {isHumanEscalated ? "Human operator active" : "Replies right away"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>

          {/* Handover Notice Banner if Escalated (Pinned under header) */}
          {isHumanEscalated && (
            <div className="px-3.5 py-2 bg-blue-950/60 border-b border-blue-800/40 flex items-center gap-2 text-xs text-blue-200 shrink-0 z-10">
              <Headphones className="size-3.5 text-blue-400 shrink-0" />
              <span className="text-[11px] font-medium leading-tight">
                Live human operator connected. Replies will appear here directly.
              </span>
            </div>
          )}

          {/* Messages Body (Only this area scrolls) */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 bg-[#0e0e11] widget-scroll"
          >
            <div className="flex justify-center pb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-700/60 bg-zinc-900/90 text-[11px] text-zinc-300 font-medium shadow-2xs">
                <BookOpen className="size-3 text-zinc-400" />
                <span>Answers only from our knowledge base</span>
              </div>
            </div>

            {messages.map((m) => {
              const isVisitor = m.sender === "visitor"
              const isOperator = m.sender === "operator"

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isVisitor ? "items-end" : "items-start"}`}
                >
                  {!isVisitor && (
                    <div className="flex items-center gap-1.5 ml-8 mb-1">
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {isOperator ? (m.senderName || "Operator") : (workspace.agentName || "Gaurav Desk Agent")}
                      </span>
                      {isOperator && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold">
                          HUMAN
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`flex items-start gap-2 ${isVisitor ? "max-w-[85%]" : "max-w-[90%]"}`}>
                    {!isVisitor && (
                      isOperator ? (
                        <div className="size-6 rounded-full bg-blue-600 text-white font-bold text-[10px] grid place-items-center mt-0.5 shrink-0 shadow-xs">
                          OP
                        </div>
                      ) : (
                        <GlossyOrbAvatar
                          avatarUrl={workspace.avatarUrl}
                          color={workspace.accentColor}
                          alt={workspace.agentName}
                          className="size-6 mt-0.5 shrink-0"
                        />
                      )
                    )}

                    <div>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                          isVisitor
                            ? "text-white rounded-tr-sm"
                            : isOperator
                            ? "bg-blue-600 text-white rounded-tl-sm border border-blue-500/50 shadow-md"
                            : "bg-[#222226] border border-zinc-700/40 text-white rounded-tl-sm"
                        }`}
                        style={
                          isVisitor
                            ? { backgroundColor: workspace.accentColor || "#2563eb" }
                            : undefined
                        }
                      >
                        {m.text}
                      </div>

                      {m.citation && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-[10px] text-zinc-300">
                          <FileText className="size-3 text-emerald-400" />
                          <span>Answered from {m.citation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#222226] border border-zinc-700/40 w-16">
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce" />
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            {/* Suggested Starter Questions Chips (Full-width clean cards identical to dashboard preview) */}
            {messages.length <= 1 && Array.isArray(workspace.starterQuestions) && workspace.starterQuestions.length > 0 && (
              <div className="pt-2 flex flex-col gap-2 w-full">
                {workspace.starterQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-zinc-800/90 bg-[#16161a] hover:bg-[#202026] hover:border-zinc-700 text-zinc-200 text-xs transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {!isHumanEscalated && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleSend("I would like to speak with a human agent please")}
                  className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 font-medium cursor-pointer transition-colors"
                >
                  <User className="size-3" />
                  <span>Talk to a human</span>
                </button>
              </div>
            )}
          </div>

          {/* Composer (Permanently Docked Bottom - Never Hides) */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-2.5 bg-[#121215] border-t border-zinc-800 flex items-center gap-2 shrink-0 z-10"
          >
            <input
              type="text"
              placeholder={isHumanEscalated ? "Type message to operator..." : "Write a message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#1c1c21] border border-zinc-700/50 focus:border-zinc-500 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="size-7.5 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-transform active:scale-95 cursor-pointer shadow-xs shrink-0"
              style={{ backgroundColor: workspace.accentColor || "#2563eb" }}
              aria-label="Send message"
            >
              <ArrowUp className="size-3.5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      ) : (
        /* 2. Floating Launch Bubble (Centered inside transparent frame) */
        <div className="w-full h-full flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="size-14 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: workspace.accentColor || "#2563eb" }}
            aria-label="Open chat"
          >
            <MessageCircle className="size-7" />
          </button>
        </div>
      )}
    </div>
  )
}
