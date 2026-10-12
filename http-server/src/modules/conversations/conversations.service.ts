import { sql } from "../../db/index.js"
import { wsGateway } from "../../websocket/gateway.js"
import type {
  ReplyOperatorDto,
  PatchConversationDto,
} from "./conversations.schema.js"

let cachedDefaultWsId: string | null = null

export class ConversationService {
  async getConversations(workspaceIdParam?: string) {
    let workspaceId: string | null = workspaceIdParam || null
    if (!workspaceId) {
      if (!cachedDefaultWsId) {
        const defaultWs =
          await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`
        if (defaultWs.length === 0) {
          return { conversations: [] }
        }
        cachedDefaultWsId = defaultWs[0].id
      }
      workspaceId = cachedDefaultWsId
    }

    const convRows = await sql`
      SELECT 
        c.id, 
        c.workspace_id, 
        c.visitor_id, 
        c.customer_name, 
        c.customer_email, 
        c.status, 
        c.tag, 
        c.assigned_to, 
        c.subject_snippet, 
        c.metadata,
        c.last_activity, 
        c.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', m.id,
              'sender', m.sender,
              'sender_name', m.sender_name,
              'text', m.text,
              'citations', m.citations,
              'grounding_meta', m.grounding_meta,
              'created_at', m.created_at
            ) ORDER BY m.created_at ASC
          ) FILTER (WHERE m.id IS NOT NULL),
          '[]'
        ) as messages
      FROM conversations c
      LEFT JOIN messages m ON m.conversation_id = c.id
      WHERE c.workspace_id = ${workspaceId}::uuid
      GROUP BY c.id
      ORDER BY c.last_activity DESC;
    `

    if (convRows.length === 0) {
      return { conversations: [] }
    }

    const conversations = convRows.map((c: any) => {
      const msgRows = Array.isArray(c.messages) ? c.messages : []
      const timeDiff = Math.max(
        0,
        Date.now() - new Date(c.last_activity).getTime()
      )
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
          timestamp: new Date(m.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          citations: Array.isArray(m.citations)
            ? m.citations.map((citation: unknown) =>
                typeof citation === "string"
                  ? { title: citation }
                  : citation
              )
            : [],
          groundingMeta: m.grounding_meta || {},
        })),
      }
    })

    return { conversations }
  }

  async postOperatorReply(dto: ReplyOperatorDto) {
    const { conversationId, replyText, operatorName } = dto

    const [insertedMsg] = await Promise.all([
      sql`
        INSERT INTO messages (
          conversation_id,
          sender,
          sender_name,
          text
        )
        VALUES (
          ${conversationId}::uuid,
          'operator',
          ${operatorName || "Operator"},
          ${replyText.trim()}
        )
        RETURNING id, created_at;
      `,
      sql`
        UPDATE conversations
        SET
          tag = 'You',
          status = 'open',
          last_activity = NOW(),
          updated_at = NOW()
        WHERE id = ${conversationId}::uuid;
      `,
    ])

    const messagePayload = {
      id: insertedMsg[0].id,
      sender: "operator",
      senderName: operatorName || "Operator",
      text: replyText.trim(),
      citations: [],
      createdAt: insertedMsg[0].created_at,
    }

    // Broadcast live to widget and other operator screens
    wsGateway.broadcastToConversation(conversationId, {
      type: "message:new",
      payload: { conversationId, message: messagePayload },
    })

    wsGateway.broadcastAll({
      type: "conversation:status_changed",
      payload: { conversationId, tag: "You", status: "open" },
    })

    return {
      success: true,
      messageId: insertedMsg[0].id,
    }
  }

  async updateConversationStatus(dto: PatchConversationDto) {
    const { conversationId, status } = dto

    await sql`
      UPDATE conversations
      SET
        status = ${status || "closed"},
        updated_at = NOW()
      WHERE id = ${conversationId}::uuid;
    `

    wsGateway.broadcastToConversation(conversationId, {
      type: "conversation:status_changed",
      payload: { conversationId, status: status || "closed" },
    })

    return { success: true }
  }
}

export const conversationService = new ConversationService()
