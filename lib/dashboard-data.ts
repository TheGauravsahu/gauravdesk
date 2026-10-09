import { sql } from "@/lib/db"
import type { Conversation } from "@/components/operator-inbox/types"

export interface KnowledgeDocItem {
  id: string
  filename: string
  fileSize: number
  fileType: string
  status: string
  createdAt: string
}

export interface WorkspaceInitialData {
  id: string
  name: string
  agentName: string
  accentColor: string
  position: "bottom-left" | "bottom-right"
  greetingMessage: string
  starterQuestions: string[]
  allowedDomains: string[]
  agentEnabled: boolean
  avatarUrl: string | null
  avatarKey: string | null
}

export interface DashboardInitialData {
  workspace: WorkspaceInitialData | null
  documents: KnowledgeDocItem[]
  suggestedQuestions: string[]
  conversations: Conversation[]
  waitingCount: number
}

export async function getDashboardInitialData(): Promise<DashboardInitialData> {
    const wsRows = await sql`
      SELECT 
        id, 
        name, 
        agent_name, 
        accent_color, 
        position, 
        greeting_message, 
        starter_questions, 
        allowed_domains, 
        agent_enabled, 
        avatar_url,
        avatar_key
      FROM workspaces 
      ORDER BY created_at ASC 
      LIMIT 1;
    `

    if (wsRows.length === 0) {
      return {
        workspace: null,
        documents: [],
        suggestedQuestions: [],
        conversations: [],
        waitingCount: 0,
      }
    }

    const ws = wsRows[0]
    const workspaceId = ws.id

    // Fetch documents
    const docRows = await sql`
      SELECT 
        id, 
        filename, 
        file_size, 
        file_type, 
        status, 
        created_at,
        extracted_text
      FROM knowledge_documents
      WHERE workspace_id = ${workspaceId}::uuid
      ORDER BY created_at DESC;
    `

    const documents: KnowledgeDocItem[] = docRows.map((d) => ({
      id: d.id,
      filename: d.filename,
      fileSize: Number(d.file_size) || 0,
      fileType: d.file_type || "text/plain",
      status: d.status || "ready",
      createdAt: new Date(d.created_at).toISOString().split("T")[0],
    }))

    const suggestedQuestions = Array.isArray(ws.starter_questions)
      ? ws.starter_questions
          .filter(
            (question: unknown): question is string =>
              typeof question === "string" &&
              !question.toLowerCase().includes("reset my password")
          )
      : []

    // Fetch conversations and messages
    const convRows = await sql`
      SELECT 
        id, 
        workspace_id, 
        visitor_id, 
        customer_name, 
        customer_email, 
        status, 
        tag, 
        assigned_to, 
        subject_snippet, 
        metadata,
        last_activity, 
        created_at
      FROM conversations
      WHERE workspace_id = ${workspaceId}::uuid
      ORDER BY last_activity DESC;
    `

    let waitingCount = 0
    const conversations = await Promise.all(
      convRows.map(async (c) => {
        if (c.tag === "Waiting") waitingCount++

        const msgRows = await sql`
          SELECT 
            id, 
            conversation_id, 
            sender, 
            sender_name, 
            text, 
            citations, 
            grounding_meta, 
            created_at
          FROM messages
          WHERE conversation_id = ${c.id}::uuid
          ORDER BY created_at ASC;
        `

        const timeDiff = Math.max(0, Date.now() - new Date(c.last_activity).getTime())
        const minutesAgo = Math.floor(timeDiff / (1000 * 60))
        const timeStr = minutesAgo < 1 ? "Just now" : `${minutesAgo}m ago`

        return {
          id: c.id,
          customerName: c.customer_name || "Visitor",
          customerEmail: c.customer_email,
          subjectSnippet: c.subject_snippet || "Chat conversation",
          status: c.status,
          tag: c.tag,
          assignedTo: c.assigned_to,
          metadata: c.metadata || {},
          lastActivity: timeStr,
          copilot: {
            summary: c.subject_snippet || "Visitor conversation",
            linkedSource: {
              type: "knowledge_base" as const,
              label: "Knowledge Base",
            },
            draftReply: {
              text: "",
              sourcesCount: 0,
            },
          },
          messages: msgRows.map((m) => ({
            id: m.id,
            sender: m.sender,
            senderName:
              m.sender_name ||
              (m.sender === "operator"
                ? "Operator"
                : m.sender === "visitor"
                  ? c.customer_name || "Visitor"
                  : "Agent"),
            text: m.text,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            citations: m.citations || [],
            groundingMeta: m.grounding_meta || {},
          })),
        }
      })
    )

    return {
      workspace: {
        id: ws.id,
        name: ws.name,
        agentName: ws.agent_name || "Gaurav Desk Agent",
        accentColor: ws.accent_color || "#2563eb",
        position: ws.position || "bottom-right",
        greetingMessage: ws.greeting_message || "Hi there! How can we help you today?",
        starterQuestions: suggestedQuestions,
        allowedDomains: Array.isArray(ws.allowed_domains) ? ws.allowed_domains : [],
        agentEnabled: ws.agent_enabled ?? true,
        avatarUrl: ws.avatar_url || null,
        avatarKey: ws.avatar_key || null,
      },
      documents,
      suggestedQuestions,
      conversations,
      waitingCount,
    }
}
