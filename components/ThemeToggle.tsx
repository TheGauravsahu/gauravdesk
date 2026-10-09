"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors ${className}`}
      >
        <div className="h-4 w-4" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark" || theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 overflow-hidden cursor-pointer ${className}`}
      style={{
        transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
      }}
    >
      {/* Sun Icon (Visible in Dark Mode to switch to Light) */}
      <Sun
        className="h-4 w-4 absolute"
        style={{
          transform: isDark ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(90deg)",
          opacity: isDark ? 1 : 0,
          pointerEvents: isDark ? "auto" : "none",
          transition: "transform 180ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms ease-out",
        }}
      />

      {/* Moon Icon (Visible in Light Mode to switch to Dark) */}
      <Moon
        className="h-4 w-4 absolute"
        style={{
          transform: isDark ? "scale(0.8) rotate(-90deg)" : "scale(1) rotate(0deg)",
          opacity: isDark ? 0 : 1,
          pointerEvents: isDark ? "none" : "auto",
          transition: "transform 180ms cubic-bezier(0.23, 1, 0.32, 1), opacity 180ms ease-out",
        }}
      />
    </button>
  )
}
