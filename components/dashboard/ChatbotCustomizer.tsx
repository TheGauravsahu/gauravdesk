"use client"

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import {
  UploadCloud,
  Check,
  ShieldCheck,
  ExternalLink,
  X,
  Plus,
  Trash2,
  Copy,
  Globe,
  FileText,
  CheckCircle2,
  Loader2,
  FileCode,
  MessageCircleQuestion,
} from "lucide-react"
import { toast } from "sonner"
import { WidgetPreview } from "@/components/dashboard/WidgetPreview"

const subscribeToEmbedHost = () => () => {}
const getEmbedHostSnapshot = () => window.location.origin
const getServerEmbedHostSnapshot = () => "https://gauravdesk.app"

export interface AccentColor {
  id: string
  name: string
  hex: string
  bgClass: string
  borderClass: string
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: "blue", name: "Blue", hex: "#2563eb", bgClass: "bg-blue-600", borderClass: "border-blue-600" },
  { id: "indigo", name: "Indigo", hex: "#4f46e5", bgClass: "bg-indigo-600", borderClass: "border-indigo-600" },
  { id: "violet", name: "Violet", hex: "#9333ea", bgClass: "bg-purple-600", borderClass: "border-purple-600" },
  { id: "pink", name: "Pink", hex: "#db2777", bgClass: "bg-pink-600", borderClass: "border-pink-600" },
  { id: "red", name: "Red", hex: "#dc2626", bgClass: "bg-red-600", borderClass: "border-red-600" },
  { id: "orange", name: "Orange", hex: "#ea580c", bgClass: "bg-orange-600", borderClass: "border-orange-600" },
  { id: "green", name: "Green", hex: "#16a34a", bgClass: "bg-emerald-600", borderClass: "border-emerald-600" },
]

interface KnowledgeDoc {
  id: string
  filename: string
  fileSize: number
  fileType: string
  status: string
  createdAt: string
}

import { GlossyOrbAvatar } from "@/components/ui/GlossyOrbAvatar"

import type { WorkspaceInitialData, KnowledgeDocItem } from "@/lib/dashboard-data"

export interface ChatbotCustomizerProps {
  initialWorkspace?: WorkspaceInitialData | null
  initialDocuments?: KnowledgeDocItem[]
  initialSuggestedQuestions?: string[]
}

export function ChatbotCustomizer({
  initialWorkspace,
  initialDocuments,
  initialSuggestedQuestions,
}: ChatbotCustomizerProps = {}) {
  const [workspaceId, setWorkspaceId] = useState(initialWorkspace?.id || "")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Appearance settings
  const [agentName, setAgentName] = useState(initialWorkspace?.agentName || "Gaurav Desk Agent")
  const [agentAvatar, setAgentAvatar] = useState<string | null>(initialWorkspace?.avatarUrl || null)
  
  const initialColor = initialWorkspace?.accentColor
    ? ACCENT_COLORS.find((c) => c.hex.toLowerCase() === initialWorkspace.accentColor.toLowerCase()) || ACCENT_COLORS[0]
    : ACCENT_COLORS[0]
  const [selectedColor, setSelectedColor] = useState<AccentColor>(initialColor)

  const [position, setPosition] = useState<"bottom-left" | "bottom-right">(initialWorkspace?.position || "bottom-right")
  const [greeting, setGreeting] = useState(initialWorkspace?.greetingMessage || "Hi there! How can we help you today?")
  
  const sanitizeQuestions = (list?: string[] | null) =>
    Array.isArray(list)
      ? list.filter(
          (q) =>
            typeof q === "string" &&
            q.trim() &&
            !q.toLowerCase().includes("reset my password")
        )
      : []

  const computedStarterQuestions = initialSuggestedQuestions?.length
    ? sanitizeQuestions(initialSuggestedQuestions)
    : initialWorkspace?.starterQuestions?.length
    ? sanitizeQuestions(initialWorkspace.starterQuestions)
    : []
  const [starterQuestions, setStarterQuestions] = useState<string[]>(computedStarterQuestions)

  // Allowed domains settings
  const [allowedDomains, setAllowedDomains] = useState<string[]>(initialWorkspace?.allowedDomains || [])
  const [domainInput, setDomainInput] = useState("")

  // Install code snippet
  const [isCopied, setIsCopied] = useState(false)
  const embedHost = useSyncExternalStore(
    subscribeToEmbedHost,
    getEmbedHostSnapshot,
    getServerEmbedHostSnapshot
  )

  // Real knowledge base documents from Neon DB
  const [documents, setDocuments] = useState<KnowledgeDoc[]>(initialDocuments || [])
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)

  // Interactive live preview state
  const [isWidgetOpen, setIsWidgetOpen] = useState(true)
  const [mobileTab, setMobileTab] = useState<"settings" | "preview">("settings")
  const [previewMessages, setPreviewMessages] = useState<
    Array<{
      id: string
      sender: "agent" | "visitor"
      text: string
      time: string
      citations?: string[]
    }>
  >([
    {
      id: "initial-greeting",
      sender: "agent",
      text: initialWorkspace?.greetingMessage || "Hi there! How can we help you today?",
      time: "Just now",
    },
  ])
  const [visitorInput, setVisitorInput] = useState("")
  const [isTypingReply, setIsTypingReply] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isResettingAvatar, setIsResettingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const previewVisitorId = useRef<string | null>(null)
  const previewConversationId = useRef<string | null>(null)
  const isInitialLoadDone = useRef(Boolean(initialWorkspace))

  // Load workspace data if not provided via server SSR
  useEffect(() => {
    if (initialWorkspace) {
      isInitialLoadDone.current = true
      return
    }

    async function loadWorkspace() {
      try {
        const res = await fetch("/api/workspace")
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || "Could not load workspace settings")
        }
        if (data.id) setWorkspaceId(data.id)
        if (data.agentName) setAgentName(data.agentName)
        if (data.greetingMessage) {
          setGreeting(data.greetingMessage)
          setPreviewMessages([
            {
              id: "initial-greeting",
              sender: "agent",
              text: data.greetingMessage,
              time: "Just now",
            },
          ])
        }
        if (data.position) setPosition(data.position)
        setStarterQuestions(Array.isArray(data.starterQuestions) ? data.starterQuestions : [])
        if (Array.isArray(data.allowedDomains)) setAllowedDomains(data.allowedDomains)
        if (data.avatarUrl) setAgentAvatar(data.avatarUrl)
        if (data.accentColor) {
          const match = ACCENT_COLORS.find(
            (c) => c.hex.toLowerCase() === data.accentColor.toLowerCase()
          )
          if (match) setSelectedColor(match)
        }
      } catch (error) {
        console.error("Could not load initial workspace:", error)
        toast.error(
          error instanceof Error ? error.message : "Could not load workspace settings"
        )
      } finally {
        isInitialLoadDone.current = true
        setHasUnsavedChanges(false)
      }
    }

    async function loadDocs() {
      try {
        const res = await fetch("/api/knowledge")
        const data = await res.json()
        if (res.ok) {
          setDocuments(Array.isArray(data.documents) ? data.documents : [])
          if (Array.isArray(data.suggestedQuestions)) {
            setStarterQuestions(data.suggestedQuestions)
          }
        }
      } catch (err) {
        console.warn("Could not load knowledge docs from Neon:", err)
      }
    }

    loadWorkspace()
    loadDocs()
  }, [initialWorkspace])

  // Auto-save effect: automatically persists all changes to Neon DB with debouncing
  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      return
    }

    setHasUnsavedChanges(true)

    const timer = setTimeout(async () => {
      try {
        setIsSaving(true)
        const res = await fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentName,
            accentColor: selectedColor.hex,
            position,
            greetingMessage: greeting,
            starterQuestions,
            allowedDomains,
            agentEnabled: true,
            avatarUrl: agentAvatar,
          }),
        })

        if (res.ok) {
          setHasUnsavedChanges(false)
        }
      } catch (err) {
        console.error("Auto-save failed:", err)
      } finally {
        setIsSaving(false)
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [
    agentName,
    selectedColor,
    position,
    greeting,
    starterQuestions,
    allowedDomains,
    agentAvatar,
  ])

  // Sync greeting changes with initial greeting message if preview hasn't been chatted in
  const handleGreetingChange = (text: string) => {
    setGreeting(text)
    setPreviewMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "initial-greeting") {
        return [{ id: "initial-greeting", sender: "agent", text, time: "Just now" }]
      }
      return prev
    })
  }

  // Handle avatar file upload directly to Neon Object Storage
  const handleAvatarFile = async (file: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be smaller than 5 MB")
      return
    }

    try {
      setIsUploadingAvatar(true)
      const formData = new FormData()
      formData.append("file", file)
      if (workspaceId) {
        formData.append("workspaceId", workspaceId)
      }

      const res = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.avatarUrl) {
          setAgentAvatar(data.avatarUrl)
          toast.success("Avatar uploaded!")
        }
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Failed to upload avatar")
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast.error("Network error uploading avatar")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleAvatarInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleAvatarFile(file)
    }
    e.target.value = ""
  }

  const handleResetAvatar = async () => {
    if (isResettingAvatar) return

    setIsResettingAvatar(true)
    try {
      const query = workspaceId
        ? `?workspaceId=${encodeURIComponent(workspaceId)}`
        : ""
      const response = await fetch(`/api/avatar/upload${query}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset avatar")
      }

      setAgentAvatar(null)
      toast.success(
        data.storageCleanupWarning || "Avatar reset to the default"
      )
    } catch (error) {
      console.error("Avatar reset failed:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to reset avatar"
      )
    } finally {
      setIsResettingAvatar(false)
    }
  }

  // Domain management (Normalized domain extraction)
  const handleAddDomain = () => {
    let clean = domainInput.trim().toLowerCase()
    if (!clean) return

    // Strip http:// or https:// and paths/trailing slashes
    clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0].split(":")[0]

    if (!clean) return
    if (allowedDomains.includes(clean)) {
      toast.info("Domain already added")
      setDomainInput("")
      return
    }

    const updated = [...allowedDomains, clean]
    setAllowedDomains(updated)
    setDomainInput("")
    setHasUnsavedChanges(true)
    toast.success(`Domain "${clean}" added`)
  }

  const handleRemoveDomain = (domainToRemove: string) => {
    const updated = allowedDomains.filter((d) => d !== domainToRemove)
    setAllowedDomains(updated)
    setHasUnsavedChanges(true)
  }

  // Copy Install snippet (dynamically points to the real host domain)
  const installSnippet = `<script
  src="${embedHost}/widget.js"
  data-workspace="${workspaceId}"
  defer>
</script>`

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(installSnippet)
    setIsCopied(true)
    toast.success("Install snippet copied to clipboard!")
    setTimeout(() => setIsCopied(false), 2000)
  }

  // React-Dropzone configuration for Knowledge Base uploads (up to 10 MB)
  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const err = fileRejections[0].errors[0]
      if (err.code === "file-too-large") {
        toast.error("File is larger than 10 MB limit.")
      } else {
        toast.error(err.message || "Invalid file format.")
      }
      return
    }

    for (const file of acceptedFiles) {
      try {
        setIsUploadingDoc(true)
        const formData = new FormData()
        formData.append("file", file)
        if (workspaceId) {
          formData.append("workspaceId", workspaceId)
        }

        const res = await fetch("/api/knowledge", {
          method: "POST",
          body: formData,
        })

        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || `Failed to upload "${file.name}"`)
        }
        if (!json.document) {
          throw new Error("The upload response did not include a document")
        }
        setDocuments((prev) => [json.document, ...prev.filter((d) => d.id !== json.document.id)])
        if (Array.isArray(json.suggestedQuestions)) {
          setStarterQuestions(json.suggestedQuestions)
        }
        toast.success(`Uploaded "${file.name}" to Knowledge Base`)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Upload error for "${file.name}"`
        )
      } finally {
        setIsUploadingDoc(false)
      }
    }
  }, [workspaceId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10 MB
    accept: {
      "application/pdf": [".pdf"],
      "text/markdown": [".md"],
      "text/plain": [".txt"],
    },
  })

  // Delete knowledge document
  const handleDeleteDoc = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete document")
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      if (Array.isArray(json.suggestedQuestions)) {
        setStarterQuestions(json.suggestedQuestions)
      }
      toast.success(`Removed "${name}" from Knowledge Base`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete document"
      )
    }
  }

  // Format file size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  // Send message inside preview
  const handleSendVisitorMessage = async (textToSend?: string) => {
    const msgText = (textToSend || visitorInput).trim()
    if (!msgText || isTypingReply || !workspaceId) return

    const newVisitorMsg = {
      id: `vis-${Date.now()}`,
      sender: "visitor" as const,
      text: msgText,
      time: "Just now",
    }

    setPreviewMessages((prev) => [...prev, newVisitorMsg])
    if (!textToSend) setVisitorInput("")

    setIsTypingReply(true)
    try {
      previewVisitorId.current ??= `preview_${crypto.randomUUID()}`

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          visitorId: previewVisitorId.current,
          conversationId: previewConversationId.current,
          message: msgText,
          metadata: {
            pageUrl: window.location.href,
            cameFrom: document.referrer || "Dashboard preview",
          },
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Unable to send the preview message")
      }

      previewConversationId.current = data.conversationId
      setPreviewMessages((prev) => [
        ...prev,
        {
          id: `agt-${Date.now()}`,
          sender: "agent",
          text:
            data.answer ||
            "A human operator is handling this conversation and will reply here.",
          time: "Just now",
          citations: data.citations,
        },
      ])
    } catch (error) {
      console.error("Preview chat failed:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send the preview message"
      )
    } finally {
      setIsTypingReply(false)
    }
  }

  // Reset preview conversation
  const handleResetPreview = () => {
    previewConversationId.current = null
    previewVisitorId.current = null
    setVisitorInput("")
    setPreviewMessages([
      {
        id: "initial-greeting",
        sender: "agent",
        text: greeting,
        time: "Just now",
      },
    ])
    setIsTypingReply(false)
  }

  return (
    <div className="flex-1 h-full flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* Mobile Tab Switcher (shown on screens < lg) */}
      <div className="lg:hidden flex items-center border-b border-zinc-200 dark:border-zinc-800 p-2 gap-2 bg-zinc-100/70 dark:bg-zinc-900/60 shrink-0 select-none">
        <button
          type="button"
          onClick={() => setMobileTab("settings")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mobileTab === "settings"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
          }`}
        >
          Widget Settings
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            mobileTab === "preview"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* =========================================================================
          LEFT COLUMN: SCROLLABLE SETTINGS & CONFIGURATION
          ========================================================================= */}
      <div
        className={`flex-1 h-full overflow-y-auto no-scrollbar scrollbar-none p-5 sm:p-6 lg:p-8 max-w-4xl border-r border-zinc-200/80 dark:border-zinc-800/80 space-y-10 ${
          mobileTab === "preview" ? "hidden lg:block" : "block"
        }`}
      >
          {/* Top Header & Auto-Save Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
            <div>
              <h1 className="font-display text-2xl md:text-3xl tracking-wide text-zinc-900 dark:text-zinc-50">
                Widget
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Customize the widget, allowed domains, grounding sources, and embed code.
              </p>
            </div>

            {/* Auto-Save Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-xs select-none">
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-blue-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Unsaved</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Saved</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-8 divide-y divide-zinc-200 dark:divide-zinc-800/80">
            {/* 1. Agent Name */}
            <div className="pt-6 first:pt-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-1">
                <label
                  htmlFor="agent-name-input"
                  className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 block"
                >
                  Agent name
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Shown at the top of the widget and next to the agent&apos;s messages.
                </p>
              </div>
              <div className="md:col-span-2">
                <input
                  id="agent-name-input"
                  type="text"
                  value={agentName}
                  onChange={(e) => {
                    setAgentName(e.target.value)
                    setHasUnsavedChanges(true)
                  }}
                  placeholder="Gaurav Desk Agent"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* 2. Agent Avatar (Neon Object Storage) */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 block">
                  Agent avatar
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Shown next to the agent&apos;s messages. Uploaded.
                </p>
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-4">
                  {/* Current Avatar Icon or Uploaded Image */}
                  <div className="relative size-14 shrink-0 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shadow-md grid place-items-center bg-zinc-900">
                    {isUploadingAvatar || isResettingAvatar ? (
                      <Loader2 className="size-6 animate-spin text-blue-500" />
                    ) : agentAvatar ? (
                      <img
                        src={agentAvatar}
                        alt="Agent avatar"
                        className="size-full object-cover"
                      />
                    ) : (
                      <GlossyOrbAvatar className="size-full" color={selectedColor.hex} />
                    )}
                  </div>

                  {/* Dropzone Upload */}
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const file = e.dataTransfer.files?.[0]
                      if (file) handleAvatarFile(file)
                    }}
                    className="flex-1 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/60 dark:bg-zinc-900/40 p-3.5 flex items-center gap-3.5 cursor-pointer hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-all group"
                  >
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={handleAvatarInputChange}
                    />
                    <div className="size-9 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 grid place-items-center text-zinc-600 dark:text-zinc-300 group-hover:scale-105 group-hover:text-blue-500 transition-all">
                      {isUploadingAvatar || isResettingAvatar ? (
                        <Loader2 className="size-4 animate-spin text-blue-500" />
                      ) : (
                        <UploadCloud className="size-4" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                        {isUploadingAvatar ? "Uploading to Neon..." : "Drop an image or click"}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        PNG, JPEG, WebP, GIF, or SVG up to 5 MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {agentAvatar
                      ? "Stored"
                      : "Default 3D Glossy Orb avatar will be displayed."}
                  </p>
                  {agentAvatar && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      disabled={isResettingAvatar || isUploadingAvatar}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      {isResettingAvatar ? "Resetting…" : "Reset avatar"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Accent Color */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 block">
                  Accent color
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Used for the header, the launcher and visitor messages.
                </p>
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {ACCENT_COLORS.map((c) => {
                    const isSelected = selectedColor.id === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c)
                          setHasUnsavedChanges(true)
                        }}
                        aria-label={`Select ${c.name} accent color`}
                        className="relative size-8 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && (
                          <span className="size-2.5 rounded-full bg-white shadow-xs" />
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedColor.name}, with white text so it stays readable.
                </p>
              </div>
            </div>

            {/* 4. Position */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 block">
                  Position
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Which corner of the page the launcher sits in.
                </p>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bottom Left Card */}
                <button
                  type="button"
                  onClick={() => {
                    setPosition("bottom-left")
                    setHasUnsavedChanges(true)
                  }}
                  className={`rounded-2xl border p-4 text-left cursor-pointer transition-all ${
                    position === "bottom-left"
                      ? "border-zinc-900 dark:border-white ring-2 ring-zinc-900/10 dark:ring-white/20 bg-zinc-50 dark:bg-zinc-900/80 shadow-md"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="h-24 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2.5 flex flex-col justify-between relative overflow-hidden">
                    <div className="w-16 h-2 rounded bg-zinc-300 dark:bg-zinc-700" />
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="w-14 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-1 flex flex-col justify-end">
                          <div className="w-full h-1.5 rounded-xs" style={{ backgroundColor: selectedColor.hex }} />
                        </div>
                        <div
                          className="size-3.5 rounded-full shadow-xs"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                      </div>
                      <div className="w-6 h-1 rounded bg-zinc-300 dark:bg-zinc-800" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                      Bottom left
                    </span>
                    <span
                      className={`size-4 rounded-full border flex items-center justify-center ${
                        position === "bottom-left"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      {position === "bottom-left" && <Check className="size-2.5 stroke-[3]" />}
                    </span>
                  </div>
                </button>

                {/* Bottom Right Card */}
                <button
                  type="button"
                  onClick={() => {
                    setPosition("bottom-right")
                    setHasUnsavedChanges(true)
                  }}
                  className={`rounded-2xl border p-4 text-left cursor-pointer transition-all ${
                    position === "bottom-right"
                      ? "border-zinc-900 dark:border-white ring-2 ring-zinc-900/10 dark:ring-white/20 bg-zinc-50 dark:bg-zinc-900/80 shadow-md"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="h-24 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-2.5 flex flex-col justify-between relative overflow-hidden">
                    <div className="w-16 h-2 rounded bg-zinc-300 dark:bg-zinc-700" />
                    <div className="flex items-end justify-between">
                      <div className="w-6 h-1 rounded bg-zinc-300 dark:bg-zinc-800" />
                      <div className="space-y-1 flex flex-col items-end">
                        <div className="w-14 h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-1 flex flex-col justify-end">
                          <div className="w-full h-1.5 rounded-xs" style={{ backgroundColor: selectedColor.hex }} />
                        </div>
                        <div
                          className="size-3.5 rounded-full shadow-xs"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                      Bottom right
                    </span>
                    <span
                      className={`size-4 rounded-full border flex items-center justify-center ${
                        position === "bottom-right"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      {position === "bottom-right" && <Check className="size-2.5 stroke-[3]" />}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 5. Messages Section (Matching Image 1) */}
            <div className="pt-8 space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Messages
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  What visitors see when they open the widget.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-[#101013] p-5 sm:p-6 space-y-6 shadow-2xs">
                {/* Row 1: Greeting */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="space-y-1">
                    <label
                      htmlFor="greeting-message-input"
                      className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block"
                    >
                      Greeting
                    </label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[260px]">
                      The first message in every conversation. It&apos;s shown even while the agent is off.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <textarea
                      id="greeting-message-input"
                      rows={3}
                      maxLength={300}
                      value={greeting}
                      onChange={(e) => handleGreetingChange(e.target.value)}
                      placeholder="Hi there! How can we help you today?"
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#16161a] p-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all resize-none shadow-2xs"
                    />
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                        {greeting.length}/300
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtle divider */}
                <div className="border-t border-zinc-200/80 dark:border-zinc-800/80" />

                {/* Row 2: Suggested questions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Suggested questions
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[260px]">
                      Generated from your knowledge base and updated whenever it changes. Visitors can tap one before they&apos;ve typed anything.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#16161a]/80 overflow-hidden divide-y divide-zinc-200/80 dark:divide-zinc-800/80 shadow-2xs">
                      {starterQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 px-4 py-3.5 text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <MessageCircleQuestion className="size-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                          <span className="flex-1 text-sm font-normal text-zinc-800 dark:text-zinc-200 leading-snug">
                            {q}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                6. ALLOWED DOMAINS SECTION (Matching Image 1)
                ========================================================================= */}
            <div className="pt-8 space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Allowed domains
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  The widget only loads on these websites.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 block">
                      Add a domain
                    </label>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Add each subdomain on its own, for example both example.com and www.example.com.
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="example.com"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                        className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddDomain}
                        className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="size-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Pasting a full address works too. Only the domain is kept.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  {allowedDomains.length === 0 ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic py-1">
                      No allowed domains yet. The widget won&apos;t load anywhere until you add one.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {allowedDomains.map((dom) => (
                        <div
                          key={dom}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-xs font-mono text-zinc-800 dark:text-zinc-200 shadow-2xs"
                        >
                          <Globe className="size-3 text-zinc-400" />
                          <span>{dom}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDomain(dom)}
                            className="text-zinc-400 hover:text-rose-500 p-0.5 cursor-pointer ml-1"
                            title="Remove domain"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =========================================================================
                7. INSTALL SNIPPET SECTION (Matching Image 1)
                ========================================================================= */}
            <div className="pt-8 space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Install
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Paste this snippet before the closing &lt;/body&gt; tag on every page where the widget should appear.
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl overflow-hidden font-mono text-xs">
                <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <FileCode className="size-3.5 text-zinc-400" />
                    <span>index.html</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopySnippet}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 overflow-x-auto leading-relaxed">
                  <pre className="text-emerald-400/90 text-xs selection:bg-blue-500/30">
                    <code>{installSnippet}</code>
                  </pre>
                </div>
              </div>

              {/* Live Test Standalone Link */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Ready to test? Open the live standalone widget URL:
                </span>
                <a
                  href={`/widget/${workspaceId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open standalone widget</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            {/* =========================================================================
                8. KNOWLEDGE BASE SECTION (React Dropzone up to 10MB)
                ========================================================================= */}
            <div className="pt-8 space-y-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Knowledge Base (Grounding Sources)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Upload files up to 10 MB (PDF, Markdown, TXT, DOCX). The agent answers questions strictly using these documents.
                </p>
              </div>

              {/* React-Dropzone Drop area */}
              <div
                {...getRootProps()}
                className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                    : "border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <div className="size-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 grid place-items-center text-zinc-600 dark:text-zinc-300 shadow-2xs">
                    {isUploadingDoc ? (
                      <Loader2 className="size-5 animate-spin text-blue-500" />
                    ) : (
                      <UploadCloud className="size-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {isUploadingDoc
                        ? "Uploading to Neon DB..."
                        : isDragActive
                        ? "Drop the files here..."
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      PDF, Markdown, TXT, DOCX, CSV up to 10 MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden shadow-2xs">
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/60 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span>Indexed Grounding Documents ({documents.length})</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <ShieldCheck className="size-3.5" />
                    Strict Grounding Active
                  </span>
                </div>

                {documents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400 select-none">
                    <FileText className="size-8 mx-auto mb-2 text-zinc-400 dark:text-zinc-600 stroke-1" />
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">No documents indexed yet</p>
                    <p className="text-[11px] mt-1 text-zinc-500">
                      Drop your product FAQs, refund policies, or markdown guides above to ground the AI agent with real data.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="size-4 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {doc.filename}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              {formatBytes(doc.fileSize)} • {doc.status}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                            {doc.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.id, doc.filename)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Remove document"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <WidgetPreview
          mobileTab={mobileTab}
          widgetOpen={isWidgetOpen}
          agentName={agentName}
          agentAvatar={agentAvatar}
          greeting={greeting}
          accentColor={selectedColor.hex}
          position={position}
          starterQuestions={starterQuestions}
          messages={previewMessages}
          visitorInput={visitorInput}
          isSending={isTypingReply}
          host={embedHost}
          onOpenChange={setIsWidgetOpen}
          onInputChange={setVisitorInput}
          onSend={handleSendVisitorMessage}
          onReset={handleResetPreview}
        />
    </div>
  )
}
