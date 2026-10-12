"use client"

import { FormEvent, useEffect, useState } from "react"
import { ArrowUp, FileText, LoaderCircle, Sparkles } from "lucide-react"

interface Workspace {
  id: string
  agentName: string
  starterQuestions: string[]
}

interface KnowledgeDocument {
  id: string
  filename: string
  status: string
}

interface PlaygroundMessage {
  id: string
  sender: "visitor" | "agent"
  text: string
  citations?: string[]
}

function getVisitorId() {
  const key = "gauravdesk_playground_visitor"

  try {
    const existingId = window.localStorage.getItem(key)
    if (existingId) return existingId

    const visitorId = `visitor_${window.crypto.randomUUID()}`
    window.localStorage.setItem(key, visitorId)
    return visitorId
  } catch (error) {
    console.warn("Unable to persist playground visitor id:", error)
    return `visitor_${window.crypto.randomUUID()}`
  }
}

export function ProductPlayground() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [messages, setMessages] = useState<PlaygroundMessage[]>([])
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadWorkspace() {
      try {
        const workspaceResponse = await fetch("/api/workspace?summary=1", {
          signal: controller.signal,
        })
        const workspaceData = await workspaceResponse.json()
        if (!workspaceResponse.ok) {
          throw new Error(workspaceData.error || "Unable to load the workspace.")
        }

        const activeWorkspace = workspaceData as Workspace
        setWorkspace(activeWorkspace)

        const knowledgeResponse = await fetch(
          `/api/knowledge?workspaceId=${encodeURIComponent(activeWorkspace.id)}`,
          { signal: controller.signal }
        )
        const knowledgeData = await knowledgeResponse.json()
        if (!knowledgeResponse.ok) {
          throw new Error(knowledgeData.error || "Unable to load the knowledge base.")
        }

        setDocuments(knowledgeData.documents || [])
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the live workspace."
          )
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadWorkspace()
    return () => controller.abort()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || !workspace || isSending) return

    setError(null)
    setIsSending(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          visitorId: getVisitorId(),
          message: trimmedQuestion,
          metadata: {
            pageUrl: window.location.href,
            cameFrom: document.referrer || "Direct visit",
          },
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "The support assistant could not answer.")
      }

      setMessages((current) => [
        ...current,
        {
          id: `${data.conversationId}-visitor-${Date.now()}`,
          sender: "visitor",
          text: trimmedQuestion,
        },
        {
          id: `${data.conversationId}-agent-${Date.now()}`,
          sender: "agent",
          text: data.answer,
          citations: data.citations || [],
        },
      ])
      setQuestion("")
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The support assistant could not answer. Please try again."
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section
      id="product-section"
      className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mb-12 flex flex-col items-center space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Live workspace
        </span>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Try the support assistant
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ask a question and see the response from the workspace knowledge base.
          Answers and source names come from the live system.
        </p>
      </div>

      <div className="grid gap-6 rounded-2xl border border-white/10 bg-[#0e0e11] p-4 shadow-2xl backdrop-blur-2xl sm:p-8 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8e8e8e]">
            <FileText className="size-3.5 text-white/70" />
            <span>Workspace documents</span>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading documents…</p>
          ) : documents.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {documents.map((document) => (
                <li
                  key={document.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-3 text-xs"
                >
                  <span className="truncate font-mono text-white/90">
                    {document.filename}
                  </span>
                  <span className="shrink-0 text-[10px] text-emerald-400">
                    {document.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              No documents have been added to this workspace yet.
            </p>
          )}

          {workspace?.starterQuestions?.length ? (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8e8e8e]">
                Suggested questions
              </p>
              {workspace.starterQuestions.map((starterQuestion) => (
                <button
                  key={starterQuestion}
                  type="button"
                  onClick={() => setQuestion(starterQuestion)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left text-xs text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  {starterQuestion}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-h-[360px] flex-col gap-4 rounded-xl border border-white/10 bg-[#141418] p-4 sm:p-5 lg:col-span-7">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="grid size-8 place-items-center rounded-full bg-white text-xs font-bold text-black">
              {workspace?.agentName?.slice(0, 1) || <Sparkles className="size-4" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {workspace?.agentName || "Support assistant"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {isLoading ? "Connecting to workspace…" : "Connected to live workspace"}
              </p>
            </div>
          </div>

          <div
            aria-live="polite"
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
          >
            {messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
                Ask a question to see a real response from this workspace.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-2 ${
                    message.sender === "visitor" ? "items-end" : "items-start"
                  }`}
                >
                  <p
                    className={`max-w-[90%] whitespace-pre-wrap rounded-2xl border px-4 py-3 text-xs leading-relaxed ${
                      message.sender === "visitor"
                        ? "border-white/10 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-[#e0e0e0]"
                    }`}
                  >
                    {message.text}
                  </p>
                  {message.citations?.length ? (
                    <p className="px-1 text-[11px] text-emerald-400">
                      Sources: {message.citations.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>

          {error ? (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              aria-label="Ask the support assistant"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question about this workspace…"
              disabled={isLoading || !workspace || isSending}
              className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs text-white outline-none placeholder:text-muted-foreground focus:border-white/40 disabled:opacity-50"
            />
            <button
              type="submit"
              aria-label="Send question"
              disabled={isLoading || !workspace || isSending || !question.trim()}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
