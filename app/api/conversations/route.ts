import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const wsParam = searchParams.get("workspaceId")

    let workspaceId = wsParam
    if (!workspaceId) {
      const defaultWs = await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`
      if (defaultWs.length === 0) {
        return NextResponse.json({ conversations: [] })
      }
      workspaceId = defaultWs[0].id
    }

    // Fetch conversations
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

    if (convRows.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    // Fetch messages for each conversation
    const conversations = await Promise.all(
      convRows.map(async (c: any) => {
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

        // Relative timestamp
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
            citations: Array.isArray(m.citations)
              ? m.citations.map((citation: unknown) =>
                  typeof citation === "string" ? { title: citation } : citation
                )
              : [],
            groundingMeta: m.grounding_meta || {},
          })),
        }
      })
    )

    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error("[Conversations API] GET error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { conversationId, replyText, operatorName = "Operator" } = body

    if (!conversationId || !replyText?.trim()) {
      return NextResponse.json({ error: "Missing conversationId or replyText" }, { status: 400 })
    }

    // Record operator message
    const insertedMsg = await sql`
      INSERT INTO messages (
        conversation_id,
        sender,
        sender_name,
        text
      )
      VALUES (
        ${conversationId}::uuid,
        'operator',
        ${operatorName},
        ${replyText.trim()}
      )
      RETURNING id, created_at;
    `

    // Update conversation state to 'You'
    await sql`
      UPDATE conversations
      SET
        tag = 'You',
        status = 'open',
        last_activity = NOW(),
        updated_at = NOW()
      WHERE id = ${conversationId}::uuid;
    `

    return NextResponse.json({
      success: true,
      messageId: insertedMsg[0].id,
    })
  } catch (error: any) {
    console.error("[Conversations API] POST error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to post operator reply" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { conversationId, status } = body

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 })
    }

    await sql`
      UPDATE conversations
      SET
        status = ${status || 'closed'},
        updated_at = NOW()
      WHERE id = ${conversationId}::uuid;
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Conversations API] PATCH error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to update conversation status" },
      { status: 500 }
    )
  }
}
