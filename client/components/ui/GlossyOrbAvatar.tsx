import React from "react"

export interface GlossyOrbAvatarProps {
  color?: string
  className?: string
  avatarUrl?: string | null
  alt?: string
}

function parseHexColor(color: string): [number, number, number] {
  if (!color || typeof color !== "string") {
    return [37, 99, 235] // default blue: #2563eb
  }
  let hex = color.trim().replace(/^#/, "")
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("")
  }
  if (hex.length !== 6) {
    return [37, 99, 235]
  }
  const num = parseInt(hex, 16)
  if (Number.isNaN(num)) {
    return [37, 99, 235]
  }
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

export function getOrbGradient(accentColor?: string): string {
  const [r, g, b] = parseHexColor(accentColor || "#2563eb")

  // Top-left luminous glassy highlight (0% stop)
  const hR = Math.round(r + (255 - r) * 0.65)
  const hG = Math.round(g + (255 - g) * 0.65)
  const hB = Math.round(b + (255 - b) * 0.65)

  // Mid tone (45% stop)
  const mR = r
  const mG = g
  const mB = b

  // Dark shadow (75% stop)
  const dR = Math.round(r * 0.7)
  const dG = Math.round(g * 0.7)
  const dB = Math.round(b * 0.7)

  // Deep shadow vignette (100% stop)
  const bR = Math.round(r * 0.45)
  const bG = Math.round(g * 0.45)
  const bB = Math.round(b * 0.45)

  return `radial-gradient(circle at 35% 30%, rgb(${hR}, ${hG}, ${hB}) 0%, rgb(${mR}, ${mG}, ${mB}) 45%, rgb(${dR}, ${dG}, ${dB}) 75%, rgb(${bR}, ${bG}, ${bB}) 100%)`
}

export function GlossyOrbAvatar({
  color,
  className = "size-8.5",
  avatarUrl,
  alt = "Agent avatar",
}: GlossyOrbAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={alt}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  const gradient = getOrbGradient(color)

  return (
    <div
      className={`rounded-full shrink-0 relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        background: gradient,
        boxShadow:
          "inset -2px -2px 6px rgba(0, 0, 0, 0.45), inset 2px 2px 4px rgba(255, 255, 255, 0.7), 0 2px 5px rgba(0, 0, 0, 0.25)",
      }}
      aria-label={alt}
    >
      {/* Specular 3D highlight */}
      <div
        className="absolute top-0.5 left-1 w-1/3 h-1/4 rounded-full opacity-85 blur-[0.3px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 80%)",
        }}
      />
    </div>
  )
}
