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

/**
 * Execute a Neon database query with retry on transient network or cold-start timeouts.
 */
async function queryWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastErr = err
      const isNetworkError =
        err?.message?.includes("fetch failed") ||
        err?.message?.includes("ETIMEDOUT") ||
        err?.message?.includes("ECONNRESET") ||
        err?.name === "NeonDbError"

      if (isNetworkError && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 250))
        continue
      }
      throw err
    }
  }
  throw lastErr
}

export async function getDashboardInitialData(): Promise<DashboardInitialData> {
  try {
    const wsRows = await queryWithRetry(() => sql`
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
    `)

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

    // Fetch documents with retry
    const docRows = await queryWithRetry(() => sql`
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
    `)

    const documents: KnowledgeDocItem[] = docRows.map((d: any) => ({
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

    // Fetch conversations with retry
    const convRows = await queryWithRetry(() => sql`
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
    `)

    // Single batched query for all messages (eliminates N+1 concurrent HTTP fetch calls)
    const convIds = convRows.map((c: any) => c.id)
    let allMsgRows: any[] = []
    if (convIds.length > 0) {
      allMsgRows = await queryWithRetry(() => sql`
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
        WHERE conversation_id = ANY(${convIds}::uuid[])
        ORDER BY created_at ASC;
      `)
    }

    const messagesByConv = new Map<string, any[]>()
    for (const m of allMsgRows) {
      const list = messagesByConv.get(m.conversation_id) || []
      list.push(m)
      messagesByConv.set(m.conversation_id, list)
    }

    let waitingCount = 0
    const conversations: Conversation[] = convRows.map((c: any) => {
      if (c.tag === "Waiting") waitingCount++
      const msgRows = messagesByConv.get(c.id) || []

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
        messages: msgRows.map((m: any) => ({
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

    return {
      workspace: {
        id: ws.id,
        name: ws.name,
        agentName: ws.agent_name || "Gaurav Desk Agent",
        accentColor: ws.accent_color || "#ea580c",
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
  } catch (error) {
    console.error("Warning: Database error in getDashboardInitialData, returning safe fallback:", error)
    return {
      workspace: {
        id: "01a0ecb4-78d1-71ff-aa11-1d673314e5df",
        name: "Default Workspace",
        agentName: "Gaurav Desk",
        accentColor: "#ea580c",
        position: "bottom-right",
        greetingMessage: "Hi there! How can we help you today?",
        starterQuestions: [],
        allowedDomains: ["localhost:3000"],
        agentEnabled: true,
        avatarUrl: null,
        avatarKey: null,
      },
      documents: [],
      suggestedQuestions: [],
      conversations: [],
      waitingCount: 0,
    }
  }
}
