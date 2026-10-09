"use client"

import type { FormEvent } from "react"
import { ArrowUp, BookOpen, ExternalLink, RotateCcw, User } from "lucide-react"
import { GlossyOrbAvatar } from "@/components/ui/GlossyOrbAvatar"

interface PreviewMessage {
  id: string
  sender: "agent" | "visitor"
  text: string
  time: string
  citations?: string[]
}

interface WidgetPreviewProps {
  mobileTab: "settings" | "preview"
  widgetOpen: boolean
  agentName: string
  agentAvatar: string | null
  greeting: string
  accentColor: string
  position: "bottom-left" | "bottom-right"
  starterQuestions: string[]
  messages: PreviewMessage[]
  visitorInput: string
  isSending: boolean
  host: string
  onOpenChange: (open: boolean) => void
  onInputChange: (value: string) => void
  onSend: (text?: string) => void
  onReset: () => void
}

export function WidgetPreview({
  mobileTab,
  widgetOpen,
  agentName,
  agentAvatar,
  greeting,
  accentColor,
  position,
  starterQuestions,
  messages,
  visitorInput,
  isSending,
  host,
  onOpenChange,
  onInputChange,
  onSend,
  onReset,
}: WidgetPreviewProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSend()
  }

  return (
    <aside
      className={`flex h-full w-full shrink-0 flex-col overflow-hidden bg-zinc-50/70 p-4 dark:bg-[#0c0c0e] sm:p-5 lg:w-[460px] lg:p-6 xl:w-[500px] ${
        mobileTab === "settings" ? "hidden lg:flex" : "flex"
      }`}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Live preview
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw className="size-3" />
          Reset chat
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-100/70 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-300/80 bg-zinc-200/80 px-4 dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-rose-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-zinc-300/70 bg-white/80 px-4 py-1 text-[11px] font-mono text-zinc-600 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-400">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate">{host || "Loading workspace…"}</span>
          </div>
          <ExternalLink aria-hidden="true" className="size-3.5 text-zinc-400" />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white p-3 dark:bg-[#0c0c0e] sm:p-4">
          <div
            className={`flex min-h-0 flex-1 flex-col justify-end ${
              position === "bottom-left" ? "items-start" : "items-end"
            }`}
          >
            {widgetOpen ? (
              <section
                aria-label={`${agentName} widget preview`}
                className="flex h-full max-h-[440px] w-full max-w-[350px] flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-[#111114] shadow-2xl dark:border-zinc-800/90"
              >
                <header
                  className="flex shrink-0 items-center justify-between px-4 py-3 text-white shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {agentAvatar ? (
                      <img
                        src={agentAvatar}
                        alt=""
                        className="size-8 shrink-0 rounded-full border border-white/30 object-cover shadow-xs"
                      />
                    ) : (
                      <GlossyOrbAvatar className="size-8" color={accentColor} />
                    )}
                    <div className="truncate">
                      <span className="block truncate text-sm font-semibold leading-tight">
                        {agentName}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-white/90">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        Replies right away
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label="Minimize chat preview"
                    className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                  >
                    <span aria-hidden="true">⌄</span>
                  </button>
                </header>

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[#0e0e11] p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex justify-center pb-1">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-900/90 px-3 py-1 text-[11px] font-medium text-zinc-300">
                      <BookOpen className="size-3 text-zinc-400" />
                      Answers grounded in workspace documents
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    {agentAvatar ? (
                      <img
                        src={agentAvatar}
                        alt=""
                        className="mt-0.5 size-6 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <GlossyOrbAvatar className="mt-0.5 size-6 shrink-0" color={accentColor} />
                    )}
                    <div className="rounded-2xl rounded-tl-sm border border-zinc-700/40 bg-[#222226] px-3.5 py-2.5 text-xs leading-relaxed text-white">
                      {greeting}
                    </div>
                  </div>

                  {messages.slice(1).map((message) => {
                    const isAgent = message.sender === "agent"
                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col gap-1 ${
                          isAgent ? "items-start" : "items-end"
                        }`}
                      >
                        <div
                          className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            isAgent
                              ? "rounded-tl-sm border border-zinc-700/40 bg-[#222226] text-white"
                              : "rounded-tr-sm text-white"
                          }`}
                          style={!isAgent ? { backgroundColor: accentColor } : undefined}
                        >
                          {message.text}
                        </div>
                        {message.citations?.length ? (
                          <span className="text-[10px] text-emerald-400">
                            Sources: {message.citations.join(", ")}
                          </span>
                        ) : null}
                      </div>
                    )
                  })}

                  {messages.length === 1 && starterQuestions.length > 0 ? (
                    <div className="flex flex-col items-end gap-1.5 pt-2">
                      {starterQuestions
                        .filter((q) => !q.toLowerCase().includes("reset my password"))
                        .map((starterQuestion) => (
                          <button
                            key={starterQuestion}
                            type="button"
                            disabled={isSending}
                            onClick={() => onSend(starterQuestion)}
                            className="rounded-xl border border-zinc-700/70 bg-[#16161a] px-3.5 py-2 text-right text-xs text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-[#202026] disabled:opacity-50 shadow-2xs"
                          >
                            {starterQuestion}
                          </button>
                        ))}
                    </div>
                  ) : null}
                </div>

                <div className="border-t border-zinc-800/80 bg-[#121215] p-2.5">
                  <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                      aria-label="Preview message"
                      value={visitorInput}
                      onChange={(event) => onInputChange(event.target.value)}
                      placeholder="Write a message…"
                      className="min-w-0 flex-1 rounded-full border border-zinc-700/60 bg-[#1c1c21] px-3.5 py-1.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500 transition-colors"
                    />
                    <button
                      type="submit"
                      aria-label="Send preview message"
                      disabled={!visitorInput.trim() || isSending}
                      className="grid size-7.5 shrink-0 place-items-center rounded-full text-white shadow-xs transition-transform active:scale-95 disabled:opacity-40"
                      style={{ backgroundColor: accentColor }}
                    >
                      <ArrowUp className="size-3.5 stroke-[2.5]" />
                    </button>
                  </form>
                </div>

                <button
                  type="button"
                  onClick={() => onSend("I'd like to talk to a human agent please")}
                  disabled={isSending}
                  className="flex items-center justify-center gap-1.5 bg-[#121215] pb-3 text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
                >
                  <User className="size-3" />
                  Talk to a human
                </button>
              </section>
            ) : (
              <button
                type="button"
                onClick={() => onOpenChange(true)}
                aria-label="Open chat preview"
                className="grid size-14 place-items-center rounded-full text-white shadow-xl"
                style={{ backgroundColor: accentColor }}
              >
                <BookOpen className="size-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
