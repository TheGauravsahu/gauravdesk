"use client"

import React, { useState, useEffect } from "react"
import {
  MessageCircle,
  ChevronDown,
  BookOpen,
  ArrowUp,
  User,
  FileText,
} from "lucide-react"

interface EmbeddedWidgetClientProps {
  workspace: {
    id: string
    name: string
    agentName: string
    accentColor: string
    position: string
    greetingMessage: string
    starterQuestions: string[]
    avatarUrl?: string
  }
}

function GlossyOrbAvatar({ className = "size-9" }: { className?: string }) {
  return (
    <div
      className={`rounded-full shrink-0 relative overflow-hidden shadow-inner ${className}`}
      style={{
        background: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 45%, #1d4ed8 75%, #1e40af 100%)",
        boxShadow: "inset -2px -2px 6px rgba(0, 0, 0, 0.4), inset 2px 2px 4px rgba(255, 255, 255, 0.7), 0 2px 5px rgba(0,0,0,0.25)",
      }}
    >
      <div
        className="absolute top-0.5 left-1 w-1/3 h-1/4 rounded-full opacity-80 blur-[0.3px]"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 80%)",
        }}
      />
    </div>
  )
}

export function EmbeddedWidgetClient({ workspace }: EmbeddedWidgetClientProps) {
  // Start open by default or collapsed
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: "agent" | "visitor"; text: string; citation?: string }>
  >([
    {
      id: "initial",
      sender: "agent",
      text: workspace.greetingMessage || "Hi there! How can we help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const isLeft = workspace.position === "bottom-left"

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

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text) return

    setMessages((prev) => [
      ...prev,
      { id: `vis-${Date.now()}`, sender: "visitor", text },
    ])
    if (!textToSend) setInput("")

    setIsTyping(true)
    setTimeout(() => {
      let reply = `Thanks for reaching out! Grounded from your knowledge base for "${text}".`
      let citation = undefined

      const lower = text.toLowerCase()
      if (lower.includes("canada") || lower.includes("ship")) {
        reply =
          "Yes! We ship to all Canadian provinces via standard tracked delivery (4–6 business days) or express courier. Duties & taxes are calculated at checkout so there are no surprise fees."
        citation = "shipping-zones.md"
      } else if (lower.includes("refund") || lower.includes("money")) {
        reply =
          "We offer a full 30-day money-back guarantee with zero hassle. Simply ping support or visit your billing dashboard to initiate a refund."
        citation = "refund-policy.pdf"
      } else if (lower.includes("password") || lower.includes("reset") || lower.includes("login")) {
        reply =
          "To reset your password, visit your login screen, click 'Forgot Password' and check your registered email for the 6-digit verification code."
        citation = "account-help.md"
      } else if (lower.includes("plan") || lower.includes("team") || lower.includes("pricing")) {
        reply =
          "For teams of 5 or more, our Growth tier includes unlimited document grounding, custom knowledge sources, and instant human operator handoff."
        citation = "pricing-guide.md"
      }

      setMessages((prev) => [
        ...prev,
        { id: `agt-${Date.now()}`, sender: "agent", text: reply, citation },
      ])
      setIsTyping(false)
    }, 650)
  }

  return (
    <div
      className={`w-full h-full flex flex-col ${
        isLeft ? "items-start" : "items-end"
      } justify-end font-sans select-none overflow-hidden p-2`}
    >
      {/* 1. Chat Window */}
      {isOpen ? (
        <div className="w-full h-full max-w-[380px] max-h-[600px] rounded-2xl shadow-2xl border border-zinc-800 bg-[#111114] flex flex-col overflow-hidden transition-all text-zinc-100">
          
          {/* Header in Workspace Accent Color */}
          <div
            className="px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-sm"
            style={{ backgroundColor: workspace.accentColor || "#2563eb" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {workspace.avatarUrl ? (
                <img
                  src={workspace.avatarUrl}
                  alt={workspace.agentName}
                  className="size-8.5 rounded-full object-cover shrink-0 shadow-xs border border-white/30"
                />
              ) : (
                <GlossyOrbAvatar className="size-8.5 shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold text-sm leading-tight text-white drop-shadow-xs truncate">
                  {workspace.agentName || "Gaurav Desk Agent"}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full bg-white/90" />
                  <span className="text-[11px] text-white/90 font-medium">Replies right away</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Minimize chat"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[#0e0e11]">
            <div className="flex justify-center pb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-700/60 bg-zinc-900/90 text-[11px] text-zinc-300 font-medium shadow-2xs">
                <BookOpen className="size-3 text-zinc-400" />
                <span>Answers only from our knowledge base</span>
              </div>
            </div>

            {messages.map((m) => {
              const isAgent = m.sender === "agent"
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}
                >
                  {isAgent && (
                    <span className="text-[10px] font-semibold text-zinc-400 ml-8 mb-1">
                      {workspace.agentName || "Gaurav Desk Agent"}
                    </span>
                  )}
                  <div className={`flex items-start gap-2 ${isAgent ? "max-w-[90%]" : "max-w-[85%]"}`}>
                    {isAgent && (
                      workspace.avatarUrl ? (
                        <img
                          src={workspace.avatarUrl}
                          alt={workspace.agentName}
                          className="size-6 rounded-full object-cover mt-0.5 shrink-0"
                        />
                      ) : (
                        <GlossyOrbAvatar className="size-6 mt-0.5 shrink-0" />
                      )
                    )}
                    <div>
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                          isAgent
                            ? "bg-[#222226] border border-zinc-700/40 text-white rounded-tl-sm"
                            : "text-white rounded-tr-sm"
                        }`}
                        style={
                          !isAgent
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

            {/* Starter chips */}
            {messages.length <= 1 && workspace.starterQuestions?.length > 0 && (
              <div className="pt-2 flex flex-col items-end gap-1.5">
                {workspace.starterQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="text-right px-3.5 py-2 rounded-xl border border-zinc-700/70 bg-[#16161a] text-zinc-200 text-xs hover:border-zinc-500 hover:bg-[#202026] transition-all cursor-pointer shadow-2xs hover:scale-[1.01]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

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
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-2.5 bg-[#121215] border-t border-zinc-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Write a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#1c1c21] border border-zinc-700/50 focus:border-zinc-500 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="size-7 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-transform active:scale-95 cursor-pointer shadow-xs shrink-0"
              style={{ backgroundColor: workspace.accentColor || "#2563eb" }}
            >
              <ArrowUp className="size-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      ) : (
        /* 2. Floating Launcher Button when Minimized */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
          className="size-14 rounded-full text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          style={{ backgroundColor: workspace.accentColor || "#2563eb" }}
        >
          <MessageCircle className="size-7 fill-white stroke-none" />
        </button>
      )}
    </div>
  )
}
