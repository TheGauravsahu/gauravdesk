import React from "react"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="flex flex-col items-center gap-4">
        {/* Glowing Orb Animation with Blue Theme */}
        <div className="relative size-12">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 blur-md opacity-70 animate-pulse" />
          <div className="relative size-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[2px] shadow-lg flex items-center justify-center">
            <div className="size-full rounded-full bg-white dark:bg-[#09090b] flex items-center justify-center">
              <Loader2 className="size-5 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
            Loading GauravDesk
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Fetching latest data...
          </p>
        </div>
      </div>
    </div>
  )
}
