"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  Sparkles,
  UploadCloud,
  Check,
  Send,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  X,
  User,
  Plus,
  Trash2,
  Copy,
  Globe,
  FileText,
  Save,
  CheckCircle2,
  Loader2,
  FileCode,
  BookOpen,
  ArrowUp,
  MessageCircleQuestion,
} from "lucide-react"
import { toast } from "sonner"

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

function GlossyOrbAvatar({ className = "size-9" }: { className?: string }) {
  return (
    <div
      className={`rounded-full shrink-0 relative overflow-hidden shadow-inner ${className}`}
      style={{
        background: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 45%, #1d4ed8 75%, #1e40af 100%)",
        boxShadow: "inset -2px -2px 6px rgba(0, 0, 0, 0.4), inset 2px 2px 4px rgba(255, 255, 255, 0.7), 0 2px 5px rgba(0,0,0,0.25)",
      }}
    >
      {/* Specular highlight */}
      <div
        className="absolute top-0.5 left-1 w-1/3 h-1/4 rounded-full opacity-80 blur-[0.3px]"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 80%)",
        }}
      />
    </div>
  )
}

export function ChatbotCustomizer() {
  const [workspaceId, setWorkspaceId] = useState("01a0ecb4-78d1-71ff-aa11-1d673314e5df")
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Appearance settings
  const [agentName, setAgentName] = useState("Gaurav Desk Agent")
  const [agentAvatar, setAgentAvatar] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<AccentColor>(ACCENT_COLORS[0])
  const [position, setPosition] = useState<"bottom-left" | "bottom-right">("bottom-right")
  const [greeting, setGreeting] = useState("Hi there! How can we help you today?")
  const [starterQuestions, setStarterQuestions] = useState<string[]>([
    "Do you ship to Canada?",
    "What's your refund policy?",
    "How do I reset my password?",
    "Which plan is right for my team?",
  ])

  // Allowed domains settings
  const [allowedDomains, setAllowedDomains] = useState<string[]>([])
  const [domainInput, setDomainInput] = useState("")

  // Install code snippet
  const [isCopied, setIsCopied] = useState(false)
  const [embedHost, setEmbedHost] = useState("https://gauravdesk.app")

  // Real knowledge base documents from Neon DB
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([])
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)

  // Interactive live preview state
  const [isWidgetOpen, setIsWidgetOpen] = useState(true)
  const [previewScenario, setPreviewScenario] = useState<"new" | "after">("new")
  const [mobileTab, setMobileTab] = useState<"settings" | "preview">("settings")
  const [previewMessages, setPreviewMessages] = useState<
    Array<{ id: string; sender: "agent" | "visitor"; text: string; time: string }>
  >([
    {
      id: "initial-greeting",
      sender: "agent",
      text: greeting,
      time: "Just now",
    },
  ])
  const [visitorInput, setVisitorInput] = useState("")
  const [isTypingReply, setIsTypingReply] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const isInitialLoadDone = useRef(false)

  // Load workspace data from Neon DB
  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch("/api/workspace")
        if (res.ok) {
          const data = await res.json()
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
          if (data.starterQuestions?.length) setStarterQuestions(data.starterQuestions)
          if (data.allowedDomains?.length) setAllowedDomains(data.allowedDomains)
          if (data.avatarUrl) setAgentAvatar(data.avatarUrl)
          if (data.accentColor) {
            const match = ACCENT_COLORS.find(
              (c) => c.hex.toLowerCase() === data.accentColor.toLowerCase()
            )
            if (match) setSelectedColor(match)
          }
        }
      } catch (err) {
        console.warn("Could not load initial workspace from Neon:", err)
      } finally {
        isInitialLoadDone.current = true
        setHasUnsavedChanges(false)
      }
    }

    async function loadDocs() {
      try {
        const res = await fetch("/api/knowledge")
        if (res.ok) {
          const data = await res.json()
          setDocuments(Array.isArray(data.documents) ? data.documents : [])
          if (Array.isArray(data.suggestedQuestions) && data.suggestedQuestions.length) {
            setStarterQuestions(data.suggestedQuestions)
          }
        }
      } catch (err) {
        console.warn("Could not load knowledge docs from Neon:", err)
      }
    }

    if (typeof window !== "undefined") {
      setEmbedHost(window.location.origin)
    }

    loadWorkspace()
    loadDocs()
  }, [])

  // Auto-save effect: automatically persists all changes to Neon DB with debouncing
  useEffect(() => {
    if (!isInitialLoadDone.current) return

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
    }, 700)

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
  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
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

        if (res.ok) {
          const json = await res.json()
          if (json.document) {
            setDocuments((prev) => [json.document, ...prev.filter((d) => d.id !== json.document.id)])
            if (Array.isArray(json.suggestedQuestions) && json.suggestedQuestions.length) {
              setStarterQuestions(json.suggestedQuestions)
            }
            toast.success(`Uploaded "${file.name}" to Knowledge Base`)
          }
        } else {
          toast.error(`Failed to upload "${file.name}"`)
        }
      } catch (err) {
        toast.error(`Upload error for "${file.name}"`)
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/json": [".json"],
      "text/csv": [".csv"],
    },
  })

  // Delete knowledge document
  const handleDeleteDoc = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/knowledge?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        const json = await res.json()
        setDocuments((prev) => prev.filter((d) => d.id !== id))
        if (Array.isArray(json.suggestedQuestions) && json.suggestedQuestions.length) {
          setStarterQuestions(json.suggestedQuestions)
        }
        toast.success(`Removed "${name}" from Knowledge Base`)
      }
    } catch (err) {
      toast.error("Failed to delete document")
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
  const handleSendVisitorMessage = (textToSend?: string) => {
    const msgText = (textToSend || visitorInput).trim()
    if (!msgText) return

    const newVisitorMsg = {
      id: `vis-${Date.now()}`,
      sender: "visitor" as const,
      text: msgText,
      time: "Just now",
    }

    setPreviewMessages((prev) => [...prev, newVisitorMsg])
    if (!textToSend) setVisitorInput("")

    setIsTypingReply(true)
    setTimeout(() => {
      let reply = `Thanks for asking about "${msgText}". Grounded exclusively from your uploaded knowledge documents.`
      if (msgText.toLowerCase().includes("canada") || msgText.toLowerCase().includes("ship")) {
        reply = "Yes, we ship to Canada via DHL Express and Canada Post! Delivery takes 3–5 business days."
      } else if (msgText.toLowerCase().includes("refund")) {
        reply = "We offer a 30-day money-back guarantee with zero hassle. Grounded via refund-policy.pdf."
      } else if (msgText.toLowerCase().includes("password")) {
        reply = "To reset your password, visit your login screen, click 'Forgot Password' and check your inbox for the 6-digit verification code (account-help.md)."
      } else if (msgText.toLowerCase().includes("plan") || msgText.toLowerCase().includes("team")) {
        reply = "For teams of 5 or more, our Growth tier includes unlimited document grounding, dedicated SLA, and real-time operator handoff."
      }

      setPreviewMessages((prev) => [
        ...prev,
        {
          id: `agt-${Date.now()}`,
          sender: "agent",
          text: reply,
          time: "Just now",
        },
      ])
      setIsTypingReply(false)
    }, 650)
  }

  // Reset preview conversation
  const handleResetPreview = () => {
    setPreviewMessages([
      {
        id: "initial-greeting",
        sender: "agent",
        text: greeting,
        time: "Just now",
      },
    ])
    setVisitorInput("")
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
                    {isUploadingAvatar ? (
                      <Loader2 className="size-6 animate-spin text-blue-500" />
                    ) : agentAvatar ? (
                      <img
                        src={agentAvatar}
                        alt="Agent avatar"
                        className="size-full object-cover"
                      />
                    ) : (
                      <GlossyOrbAvatar className="size-full" />
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
                      {isUploadingAvatar ? (
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
                      onClick={() => {
                        setAgentAvatar(null)
                        setHasUnsavedChanges(true)
                      }}
                      className="text-[11px] text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Reset avatar
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
                            Indexed
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

        {/* =========================================================================
            RIGHT COLUMN: FIXED LIVE WEBSITE PREVIEW (Pinned to the right)
            ========================================================================= */}
      <div
        className={`w-full lg:w-[460px] xl:w-[500px] shrink-0 h-full flex flex-col p-4 sm:p-5 lg:p-6 bg-zinc-50/70 dark:bg-[#0c0c0e] overflow-hidden select-none ${
          mobileTab === "settings" ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Preview
            </h2>
          </div>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-200/90 dark:bg-zinc-800/80 border border-zinc-300/80 dark:border-zinc-700/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setPreviewScenario("new")
                handleResetPreview()
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                previewScenario === "new"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              New visitor
            </button>
            <button
              type="button"
              onClick={() => setPreviewScenario("after")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                previewScenario === "after"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              After a message
            </button>
          </div>
        </div>

        {/* Mock Browser Container */}
        <div className="flex-1 min-h-0 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-950 flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Browser Header Bar */}
            <div className="h-10 px-4 bg-zinc-200/80 dark:bg-zinc-900/90 border-b border-zinc-300/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500/80" />
                <span className="size-2.5 rounded-full bg-amber-500/80" />
                <span className="size-2.5 rounded-full bg-emerald-500/80" />
              </div>
              
              {/* URL Pill */}
              <div className="px-4 py-1 rounded-full bg-white/80 dark:bg-zinc-950/80 border border-zinc-300/70 dark:border-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 shadow-2xs">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>yourwebsite.com</span>
              </div>

              <div className="w-10 flex justify-end">
                <ExternalLink className="size-3.5 text-zinc-400" />
              </div>
            </div>

            {/* Mock Website Canvas */}
            <div className="flex-1 min-h-0 bg-white dark:bg-[#0c0c0e] relative overflow-hidden flex flex-col p-3 sm:p-4 select-none">
              
              {/* Mock website content background skeleton */}
              <div className="absolute top-4 left-4 opacity-30 dark:opacity-20 space-y-4 max-w-xs pointer-events-none">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-6 rounded-md bg-zinc-900 dark:bg-white" />
                  <div className="h-3 w-20 rounded bg-zinc-300 dark:bg-zinc-700" />
                </div>
                <div className="h-5 w-40 rounded-md bg-zinc-400 dark:bg-zinc-600" />
                <div className="h-3 w-56 rounded bg-zinc-300 dark:bg-zinc-700" />
                <div className="h-3 w-48 rounded bg-zinc-300 dark:bg-zinc-700" />
              </div>

              {/* FLOATING CHATBOT WIDGET AREA */}
              <div
                className={`relative z-20 flex-1 min-h-0 flex flex-col justify-end ${
                  position === "bottom-left" ? "items-start" : "items-end"
                } transition-all duration-200 w-full`}
              >
                {/* 1. Open Chat Window */}
                {isWidgetOpen ? (
                  <div className="w-full max-w-[340px] sm:max-w-[350px] h-full max-h-[440px] rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-[#111114] flex flex-col overflow-hidden transition-all">
                    
                    {/* Chat Header in Chosen Accent Color */}
                    <div
                      className="px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-sm"
                      style={{ backgroundColor: selectedColor.hex }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {agentAvatar ? (
                          <img
                            src={agentAvatar}
                            alt={agentName}
                            className="size-8.5 rounded-full object-cover shrink-0 shadow-xs border border-white/30"
                          />
                        ) : (
                          <GlossyOrbAvatar className="size-8.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm leading-tight text-white drop-shadow-xs truncate">
                            {agentName || "Gaurav Desk Agent"}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="size-1.5 rounded-full bg-white/90" />
                            <span className="text-[11px] text-white/90 font-medium">Replies right away</span>
                          </div>
                        </div>
                      </div>

                      {/* Minimize Button */}
                      <button
                        type="button"
                        onClick={() => setIsWidgetOpen(false)}
                        className="p-1 rounded text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                        title="Minimize chat"
                      >
                        <ChevronDown className="size-5" />
                      </button>
                    </div>

                    {/* Chat Body & Messages */}
                    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none p-4 space-y-3 bg-[#0e0e11]">
                      
                      {/* Grounding Trust Badge */}
                      <div className="flex justify-center pb-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-700/60 bg-zinc-900/90 text-[11px] text-zinc-300 font-medium shadow-2xs">
                          <BookOpen className="size-3 text-zinc-400" />
                          <span>Answers only from our knowledge base</span>
                        </div>
                      </div>

                      {/* Scenario: New visitor */}
                      {previewScenario === "new" ? (
                        <>
                          {/* Agent Greeting */}
                          <div className="flex flex-col items-start space-y-1">
                            <span className="text-[10px] font-semibold text-zinc-400 ml-8">
                              {agentName || "Gaurav Desk Agent"}
                            </span>
                            <div className="flex items-start gap-2 max-w-[90%]">
                              {agentAvatar ? (
                                <img src={agentAvatar} alt={agentName} className="size-6 rounded-full object-cover mt-0.5 shrink-0" />
                              ) : (
                                <GlossyOrbAvatar className="size-6 mt-0.5 shrink-0" />
                              )}
                              <div className="bg-[#222226] text-white text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-zinc-700/40 shadow-xs">
                                {greeting}
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Visitor & Agent message exchanges if user typed any */}
                          {previewMessages.slice(1).map((msg) => {
                            const isAgent = msg.sender === "agent"
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}
                              >
                                {isAgent && (
                                  <span className="text-[10px] font-semibold text-zinc-400 ml-8 mb-1">
                                    {agentName}
                                  </span>
                                )}
                                <div className={`flex items-start gap-2 ${isAgent ? "max-w-[90%]" : "max-w-[85%]"}`}>
                                  {isAgent && (
                                    agentAvatar ? (
                                      <img src={agentAvatar} alt={agentName} className="size-6 rounded-full object-cover mt-0.5 shrink-0" />
                                    ) : (
                                      <GlossyOrbAvatar className="size-6 mt-0.5 shrink-0" />
                                    )
                                  )}
                                  <div
                                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                                      isAgent
                                        ? "bg-[#222226] border border-zinc-700/40 text-white rounded-tl-sm"
                                        : "text-white rounded-tr-sm"
                                    }`}
                                    style={!isAgent ? { backgroundColor: selectedColor.hex } : undefined}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {/* Starter Suggestion Pills (Right-aligned, matching reference image) */}
                          {previewMessages.length <= 1 && (
                            <div className="pt-2 flex flex-col items-end gap-1.5">
                              {starterQuestions.map((q, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSendVisitorMessage(q)}
                                  className="text-right px-3.5 py-2 rounded-xl border border-zinc-700/70 bg-[#16161a] text-zinc-200 text-xs hover:border-zinc-500 hover:bg-[#202026] transition-all cursor-pointer shadow-2xs hover:scale-[1.01]"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        /* Scenario: After a message */
                        <>
                          {/* Agent Greeting */}
                          <div className="flex flex-col items-start space-y-1">
                            <span className="text-[10px] font-semibold text-zinc-400 ml-8">
                              {agentName || "Gaurav Desk Agent"}
                            </span>
                            <div className="flex items-start gap-2 max-w-[90%]">
                              {agentAvatar ? (
                                <img src={agentAvatar} alt={agentName} className="size-6 rounded-full object-cover mt-0.5 shrink-0" />
                              ) : (
                                <GlossyOrbAvatar className="size-6 mt-0.5 shrink-0" />
                              )}
                              <div className="bg-[#222226] text-white text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-tl-sm border border-zinc-700/40 shadow-xs">
                                {greeting}
                              </div>
                            </div>
                          </div>

                          {/* Visitor question */}
                          <div className="flex flex-col items-end pt-1">
                            <div
                              className="max-w-[85%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs text-white leading-relaxed shadow-xs"
                              style={{ backgroundColor: selectedColor.hex }}
                            >
                              Do you ship to Canada?
                            </div>
                          </div>

                          {/* Grounded Agent Response */}
                          <div className="flex flex-col items-start pt-1 space-y-1">
                            <span className="text-[10px] font-semibold text-zinc-400 ml-8">
                              {agentName || "Gaurav Desk Agent"}
                            </span>
                            <div className="flex items-start gap-2 max-w-[90%]">
                              {agentAvatar ? (
                                <img src={agentAvatar} alt={agentName} className="size-6 rounded-full object-cover mt-0.5 shrink-0" />
                              ) : (
                                <GlossyOrbAvatar className="size-6 mt-0.5 shrink-0" />
                              )}
                              <div>
                                <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs leading-relaxed bg-[#222226] border border-zinc-700/40 text-white shadow-xs">
                                  Yes! We ship to all Canadian provinces via standard tracked delivery (4–6 business days) or express courier. Duties & taxes are calculated at checkout so there are no surprise fees.
                                </div>
                                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-[10px] text-zinc-300">
                                  <FileText className="size-3 text-emerald-400" />
                                  <span>Answered from shipping-zones.md</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Any extra dynamic replies */}
                          {previewMessages.slice(1).map((msg) => {
                            const isAgent = msg.sender === "agent"
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isAgent ? "items-start" : "items-end"}`}
                              >
                                {isAgent && (
                                  <span className="text-[10px] font-semibold text-zinc-400 ml-8 mb-1">
                                    {agentName}
                                  </span>
                                )}
                                <div className={`flex items-start gap-2 ${isAgent ? "max-w-[90%]" : "max-w-[85%]"}`}>
                                  {isAgent && (
                                    agentAvatar ? (
                                      <img src={agentAvatar} alt={agentName} className="size-6 rounded-full object-cover mt-0.5 shrink-0" />
                                    ) : (
                                      <GlossyOrbAvatar className="size-6 mt-0.5 shrink-0" />
                                    )
                                  )}
                                  <div
                                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                                      isAgent
                                        ? "bg-[#222226] border border-zinc-700/40 text-white rounded-tl-sm"
                                        : "text-white rounded-tr-sm"
                                    }`}
                                    style={!isAgent ? { backgroundColor: selectedColor.hex } : undefined}
                                  >
                                    {msg.text}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </>
                      )}

                      {/* Typing indicator */}
                      {isTypingReply && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#222226] border border-zinc-700/40 w-16">
                          <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce" />
                          <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                          <span className="size-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      )}

                      {/* Talk to a human option */}
                      <div className="pt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleSendVisitorMessage("I'd like to talk to a human agent please")}
                          className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 font-medium cursor-pointer transition-colors"
                        >
                          <User className="size-3" />
                          <span>Talk to a human</span>
                        </button>
                      </div>
                    </div>

                    {/* Chat Composer */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendVisitorMessage()
                      }}
                      className="p-2.5 bg-[#121215] border-t border-zinc-800 flex items-center gap-2 shrink-0"
                    >
                      <input
                        type="text"
                        placeholder="Write a message..."
                        value={visitorInput}
                        onChange={(e) => setVisitorInput(e.target.value)}
                        className="flex-1 bg-[#1c1c21] border border-zinc-700/50 focus:border-zinc-500 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={!visitorInput.trim()}
                        className="size-7 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-transform active:scale-95 cursor-pointer shadow-xs shrink-0"
                        style={{ backgroundColor: selectedColor.hex }}
                        title="Send message"
                      >
                        <ArrowUp className="size-4 stroke-[2.5]" />
                      </button>
                    </form>
                  </div>
                ) : (
                  /* 2. Floating Launcher Button when Minimized */
                  <button
                    type="button"
                    onClick={() => setIsWidgetOpen(true)}
                    aria-label="Open chatbot"
                    className="size-12 rounded-full text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: selectedColor.hex }}
                  >
                    <MessageCircle className="size-6 fill-white stroke-none" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Caption matching reference */}
            <div className="py-2 px-4 bg-zinc-100 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800/80 text-center select-none shrink-0">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                This is the widget visitors see, updated as you change settings.
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}
