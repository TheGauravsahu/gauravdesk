"use client"

import React, { useEffect, useState } from "react"
import Script from "next/script"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react"

export default function TestEmbedPage() {
  const [workspaceId, setWorkspaceId] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch("/api/workspace")
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setWorkspaceId(data.id)
        } else if (data.error) {
          throw new Error(data.error)
        }
      })
      .catch((err) => console.error("Failed to load workspace id", err))
  }, [])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Link>
          <div className="h-4 w-px bg-neutral-800" />
          <div>
            <h1 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="size-4 text-blue-400" />
              Live Chatbot Embed Test Page
            </h1>
            <p className="text-xs text-neutral-400">
              Simulating an external host website running <code className="text-neutral-300">widget.js</code>
            </p>
          </div>
        </div>

        {workspaceId && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Workspace:</span>
            <code className="text-xs bg-neutral-800/85 px-2 py-1 rounded text-neutral-300 border border-neutral-700/60 font-mono">
              {workspaceId.slice(0, 12)}...
            </code>
          </div>
        )}
      </header>

      {/* Main Mock Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
          <CheckCircle2 className="size-3.5" />
          Real-time Embed Verification
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Test Your Embedded GauravDesk Agent
        </h2>
        <p className="text-neutral-400 max-w-xl text-base mb-8">
          Look in the bottom-right corner of this screen. The floating launcher bubble is served directly via an iframe managed by <code className="text-blue-400 font-mono">/widget.js</code>. Click it to chat, ask questions about your uploaded documents, and verify sizing.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && (window as any).GauravDesk) {
                ;(window as any).GauravDesk.toggle()
              }
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            Trigger via SDK: GauravDesk.toggle()
          </button>

          {workspaceId && (
            <Link
              href={`/widget/${workspaceId}`}
              target="_blank"
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-medium text-sm rounded-xl border border-neutral-700 transition-all flex items-center gap-2"
            >
              Open Direct Full-Screen View
              <ExternalLink className="size-3.5 text-neutral-400" />
            </Link>
          )}
        </div>

        <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 text-left">
          <h3 className="text-sm font-semibold text-neutral-200 mb-2">How this works:</h3>
          <ul className="text-xs text-neutral-400 space-y-2 list-disc list-inside">
            <li>The script tag injects the iframe with zero parent layout shift.</li>
            <li>When closed, it occupies an 80×80px non-blocking footprint in the corner.</li>
            <li>When opened, cross-frame <code className="text-neutral-300 font-mono">postMessage</code> resizes the container to 380×640px (or 100vw/100vh on mobile screens).</li>
            <li>The agent queries your actual Neon DB workspace configuration and Knowledge Base records.</li>
          </ul>
        </div>
      </main>

      {/* Real embed script tag once workspaceId is fetched */}
      {workspaceId && mounted && (
        <Script
          src="/widget.js"
          data-workspace={workspaceId}
          strategy="afterInteractive"
        />
      )}
    </div>
  )
}
