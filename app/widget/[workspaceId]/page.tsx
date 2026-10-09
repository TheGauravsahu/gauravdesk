import { sql } from "@/lib/db"
import { notFound } from "next/navigation"
import { EmbeddedWidgetClient } from "./EmbeddedWidgetClient"

interface WidgetPageProps {
  params: Promise<{
    workspaceId: string
  }>
}

export default async function WidgetPage({ params }: WidgetPageProps) {
  const { workspaceId } = await params

  try {
    const rows = await sql`
      SELECT 
        id, 
        name, 
        agent_name, 
        accent_color, 
        position, 
        greeting_message, 
        starter_questions, 
        avatar_url,
        allowed_domains
      FROM workspaces 
      WHERE id = ${workspaceId}::uuid
      LIMIT 1;
    `

    if (rows.length === 0) {
      notFound()
    }

    const ws = rows[0]

    return (
      <EmbeddedWidgetClient
        workspace={{
          id: ws.id,
          name: ws.name,
          agentName: ws.agent_name,
          accentColor: ws.accent_color,
          position: ws.position,
          greetingMessage: ws.greeting_message,
          starterQuestions: Array.isArray(ws.starter_questions)
            ? ws.starter_questions.filter(
                (q: any) =>
                  typeof q === "string" && !q.toLowerCase().includes("reset my password")
              )
            : [],
          avatarUrl: ws.avatar_url,
        }}
      />
    )
  } catch (error) {
    console.error("Failed to load workspace for widget:", error)
    notFound()
  }
}
