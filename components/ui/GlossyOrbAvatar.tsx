"use client"

import React from "react"

interface GlossyOrbAvatarProps {
  className?: string
  color?: string
}

export function GlossyOrbAvatar({
  className = "size-8.5",
  color = "#ea580c",
}: GlossyOrbAvatarProps) {
  const accent = color && color.trim() ? color.trim() : "#ea580c"

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        background: `radial-gradient(circle at 35% 28%, color-mix(in srgb, ${accent} 42%, #ffffff) 0%, ${accent} 48%, color-mix(in srgb, ${accent} 62%, #000000) 80%, color-mix(in srgb, ${accent} 35%, #000000) 100%)`,
        boxShadow:
          "inset -2.5px -2.5px 6px rgba(0, 0, 0, 0.55), inset 2px 2px 4.5px rgba(255, 255, 255, 0.75), 0 3px 8px rgba(0, 0, 0, 0.3)",
      }}
      aria-hidden="true"
    >
      {/* Specular high-gloss sheen reflection */}
      <div
        className="absolute top-0.5 left-1 w-2/5 h-1/4 rounded-full opacity-90 blur-[0.2px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 85%)",
        }}
      />
      {/* Subtle bottom ambient bounce reflection */}
      <div
        className="absolute bottom-0 right-1 w-1/3 h-1/5 rounded-full opacity-35 blur-[0.6px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 80%)",
        }}
      />
    </div>
  )
}
