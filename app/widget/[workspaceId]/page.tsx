import axios from "axios"
import { notFound } from "next/navigation"
import { EmbeddedWidgetClient } from "./EmbeddedWidgetClient"

interface WidgetPageProps {
  params: Promise<{
    workspaceId: string
  }>
}

const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"

export default async function WidgetPage({ params }: WidgetPageProps) {
  const { workspaceId } = await params

  try {
    const res = await axios.get(`${BACKEND_URL}/api/workspace/${workspaceId}`, {
      timeout: 5000,
    })
    const ws = res.data

    if (!ws || !ws.id) {
      notFound()
    }

    return (
      <EmbeddedWidgetClient
        workspace={{
          id: ws.id,
          name: ws.name,
          agentName: ws.agent_name,
          accentColor: ws.accent_color,
          position: ws.position,
          greetingMessage: ws.greeting_message,
          starterQuestions: Array.isArray(ws.starter_questions) ? ws.starter_questions : [],
          avatarUrl: ws.avatar_url,
        }}
      />
    )
  } catch (error) {
    console.error("Failed to load workspace for widget:", error)
    notFound()
  }
}
