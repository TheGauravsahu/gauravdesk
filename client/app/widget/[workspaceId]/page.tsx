import axios from "axios"
import { notFound } from "next/navigation"
import { EmbeddedWidgetClient } from "./EmbeddedWidgetClient"

interface WidgetPageProps {
  params: Promise<{
    workspaceId: string
  }>
  searchParams?: Promise<{
    host?: string
  }>
}

const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"

export default async function WidgetPage({ params, searchParams }: WidgetPageProps) {
  const { workspaceId } = await params
  const search = searchParams ? await searchParams : undefined
  const host = search?.host

  try {
    let ws: any = null
    try {
      const res = await axios.get(`${BACKEND_URL}/api/workspace/${workspaceId}`, {
        timeout: 5000,
      })
      ws = res.data
    } catch {
      // Fallback to primary workspace if specific ID lookup failed
      const fallbackRes = await axios.get(`${BACKEND_URL}/api/workspace`, {
        timeout: 5000,
      })
      ws = fallbackRes.data
    }

    if (!ws || !ws.id) {
      notFound()
    }

    return (
      <EmbeddedWidgetClient
        host={host}
        workspace={{
          id: ws.id,
          name: ws.name || "Default Workspace",
          agentName: ws.agentName || ws.agent_name || "Gaurav Desk Agent",
          accentColor: ws.accentColor || ws.accent_color || "#2563eb",
          position: ws.position || "bottom-right",
          greetingMessage:
            ws.greetingMessage ||
            ws.greeting_message ||
            "Hi there! How can we help you today?",
          starterQuestions: Array.isArray(ws.starterQuestions)
            ? ws.starterQuestions
            : Array.isArray(ws.starter_questions)
            ? ws.starter_questions
            : [],
          avatarUrl: ws.avatarUrl || ws.avatar_url || null,
          allowedDomains: Array.isArray(ws.allowedDomains)
            ? ws.allowedDomains
            : Array.isArray(ws.allowed_domains)
            ? ws.allowed_domains
            : [],
        }}
      />
    )
  } catch (error) {
    console.error("Failed to load workspace for widget:", error)
    notFound()
  }
}
