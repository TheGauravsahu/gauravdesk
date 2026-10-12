"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  Suspense,
} from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { globalLoadingStore } from "@/lib/loading-store"

interface GlobalLoaderContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const GlobalLoaderContext = createContext<GlobalLoaderContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

export function useGlobalLoader() {
  return useContext(GlobalLoaderContext)
}

function NavigationWatcher({ onNavigated }: { onNavigated: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    onNavigated()
  }, [pathname, searchParams, onNavigated])

  return null
}

export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const [manualCount, setManualCount] = useState(0)
  const [storeCount, setStoreCount] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)

  // TanStack React Query active queries & mutations
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()

  // Subscribe to Axios / store loading
  useEffect(() => {
    const unsubscribe = globalLoadingStore.subscribe((count) => {
      setStoreCount(count)
    })
    return unsubscribe
  }, [])

  // Manual loading API
  const startLoading = useCallback(() => {
    setManualCount((c) => c + 1)
  }, [])

  const stopLoading = useCallback(() => {
    setManualCount((c) => Math.max(0, c - 1))
  }, [])

  const handleNavigated = useCallback(() => {
    setIsNavigating(false)
  }, [])

  // 2. Intercept internal link clicks and route navigation to start progress bar instantly
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      if (!href) return

      // Ignore hash links, mailto, tel, javascript, or external links
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      // Check if it points to the same origin
      try {
        const url = new URL(href, window.location.origin)
        if (url.origin === window.location.origin) {
          const currentUrl = new URL(window.location.href)
          // Don't trigger if it's the exact same page and query
          if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
            setIsNavigating(true)
          }
        }
      } catch {
        // invalid URL, ignore
      }
    }

    // Intercept pushState and replaceState for programmatic router.push
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      setIsNavigating(true)
      return originalPushState.apply(this, args)
    }

    window.history.replaceState = function (...args) {
      setIsNavigating(true)
      return originalReplaceState.apply(this, args)
    }

    window.addEventListener("click", handleLinkClick, { capture: true })

    return () => {
      window.removeEventListener("click", handleLinkClick, { capture: true })
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  // Safety timeout: If navigation or loading gets stuck, reset isNavigating after 8 seconds
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [isNavigating])

  const totalActive =
    storeCount + manualCount + (isNavigating ? 1 : 0) + isFetching + isMutating
  const isLoading = totalActive > 0

  return (
    <GlobalLoaderContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      <Suspense fallback={null}>
        <NavigationWatcher onNavigated={handleNavigated} />
      </Suspense>
      {children}
    </GlobalLoaderContext.Provider>
  )
}
