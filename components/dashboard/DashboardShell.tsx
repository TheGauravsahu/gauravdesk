"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Inbox,
  Bell,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Bot,
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ChatbotCustomizer } from "./ChatbotCustomizer"
import { OperatorInbox } from "@/components/operator-inbox/OperatorInbox"

interface DashboardShellProps {
  initialTab?: "home" | "inbox"
}

export function DashboardShell({ initialTab = "home" }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Determine active view from URL or initial state
  const isInboxRoute = pathname.includes("/inbox")
  const [activeTab, setActiveTab] = useState<"home" | "inbox">(
    isInboxRoute ? "inbox" : initialTab
  )
  const [notificationsOn, setNotificationsOn] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Keep state synced with route changes
  useEffect(() => {
    if (pathname.includes("/inbox")) {
      setActiveTab("inbox")
    } else if (pathname === "/dashboard") {
      setActiveTab("home")
    }
  }, [pathname])

  const handleTabChange = (tab: "home" | "inbox") => {
    setActiveTab(tab)
    if (tab === "inbox") {
      router.push("/dashboard/inbox", { scroll: false })
    } else {
      router.push("/dashboard", { scroll: false })
    }
  }

  return (
    <div className="w-full h-screen overflow-hidden flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* =========================================================================
          MINIMAL SIDEBAR
          Only few items as requested:
          1. Brand Logo / Home
          2. "Home" (Chatbot preview & customization options)
          3. "Inbox" (Operator inbox page)
          4. User profile avatar
          ========================================================================= */}
      <aside
        className={`shrink-0 flex flex-col justify-between items-center py-4 border-r border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-[#0c0c0e] transition-all duration-200 z-30 ${
          isSidebarCollapsed ? "w-0 p-0 overflow-hidden border-none" : "w-16"
        }`}
      >
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo / Brand Mark (Squircle with Chat Bubble) */}
          <Link
            href="/"
            title="GauravDesk Home"
            className="size-10 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid place-items-center shadow-xs hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="relative size-5 text-blue-600 dark:text-blue-400">
              <Bot className="size-5" />
            </div>
          </Link>

          <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

          {/* Navigation Item 1: Home (Chatbot Appearance & Live Preview) */}
          <button
            type="button"
            onClick={() => handleTabChange("home")}
            aria-label="Home"
            title="Home (Chatbot Customizer & Live Preview)"
            className={`relative size-10 rounded-xl grid place-items-center transition-all cursor-pointer ${
              activeTab === "home"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/80 dark:border-zinc-700/80"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <Home className="size-5" />
            {activeTab === "home" && (
              <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          {/* Navigation Item 2: Inbox (Operator Workspace) */}
          <button
            type="button"
            onClick={() => handleTabChange("inbox")}
            aria-label="Inbox — Operator Conversations"
            title="Inbox (Operator Workspace)"
            className={`relative size-10 rounded-xl grid place-items-center transition-all cursor-pointer ${
              activeTab === "inbox"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/80 dark:border-zinc-700/80"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <Inbox className="size-5" />
            {/* Unread ticket badge */}
            <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-bold grid place-items-center shadow-xs">
              6
            </span>
            {activeTab === "inbox" && (
              <span className="absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>

        {/* User Profile Avatar at Bottom */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            type="button"
            title="Gaurav Profile"
            className="relative size-10 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 grid place-items-center cursor-pointer shadow-sm ring-2 ring-transparent hover:ring-blue-500/50 transition-all border border-zinc-200 dark:border-zinc-700"
          >
            <img
              src="https://api.dicebear.com/10.x/notionists-neutral/svg?seed=Gaurav"
              alt="User Avatar"
              className="size-full object-cover"
            />
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-100 dark:ring-zinc-900" />
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION WORKSPACE
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 px-4 md:px-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur-md flex items-center justify-between shrink-0 select-none z-20">
          <div className="flex items-center gap-3">
            {/* Toggle Sidebar Collapse */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label="Toggle navigation sidebar"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                GauravDesk
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {activeTab === "home" ? "Home — Widget" : "Inbox — Operator Conversations"}
              </h1>
            </div>
          </div>

          {/* Right Header Actions: Notifications & Animated Light/Dark Mode Toggle */}
          <div className="flex items-center gap-2.5">
            {/* Turn on notifications button (from reference image) */}
            <button
              type="button"
              onClick={() => setNotificationsOn(!notificationsOn)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                notificationsOn
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-200/80 dark:border-zinc-800 bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Bell className="size-3.5" />
              <span className="hidden sm:inline">
                {notificationsOn ? "Notifications active" : "Turn on notifications"}
              </span>
            </button>

            {/* Minimal Animated Light/Dark Mode Toggle (Emil Kowalski's /animate guidelines) */}
            <ThemeToggle />
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex-1 overflow-hidden flex">
          {activeTab === "home" ? (
            <ChatbotCustomizer />
          ) : (
            <OperatorInbox hideNavRail={true} />
          )}
        </div>
      </div>
    </div>
  )
}
