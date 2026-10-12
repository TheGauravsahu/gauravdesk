import { sql } from "../../db/index.js"

let cachedDefaultWorkspaceId: string | null = null

export class ChatRepository {
  async getConversationAndMessages(conversationId: string) {
    const [convRows, msgRows] = await Promise.all([
      sql`
        SELECT id, status, tag, assigned_to
        FROM conversations
        WHERE id = ${conversationId}::uuid
        LIMIT 1;
      `,
      sql`
        SELECT 
          id, 
          sender, 
          sender_name, 
          text, 
          citations, 
          created_at
        FROM messages
        WHERE conversation_id = ${conversationId}::uuid
        ORDER BY created_at ASC;
      `,
    ])

    if (convRows.length === 0) {
      return null
    }

    return {
      conversation: convRows[0],
      messages: msgRows,
    }
  }

  async resolveWorkspace(workspaceId?: string) {
    let targetWorkspaceId = workspaceId
    if (!targetWorkspaceId) {
      if (cachedDefaultWorkspaceId) {
        targetWorkspaceId = cachedDefaultWorkspaceId
      } else {
        const defaultWs =
          await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`
        if (defaultWs.length === 0) {
          throw new Error("No workspace found")
        }
        targetWorkspaceId = defaultWs[0].id
        cachedDefaultWorkspaceId = targetWorkspaceId
      }
    }

    const wsRows = await sql`
      SELECT id, name, agent_name, greeting_message
      FROM workspaces
      WHERE id = ${targetWorkspaceId}::uuid
      LIMIT 1;
    `
    if (wsRows.length === 0) {
      cachedDefaultWorkspaceId = null
      throw new Error("Workspace not found")
    }

    return wsRows[0]
  }

  async findOrCreateConversation(params: {
    conversationId?: string | null
    workspaceId: string
    visitorId: string
    message: string
    metadata?: Record<string, any>
  }) {
    const { conversationId, workspaceId, visitorId, message, metadata } = params

    if (conversationId) {
      const rows = await sql`
        SELECT id, status, tag, assigned_to
        FROM conversations
        WHERE id = ${conversationId}::uuid
        LIMIT 1;
      `
      if (rows.length > 0) {
        return { convId: rows[0].id, existingConv: rows[0] }
      }
    }

    const visitorConv = await sql`
      SELECT id, status, tag, assigned_to
      FROM conversations
      WHERE workspace_id = ${workspaceId}::uuid
        AND visitor_id = ${visitorId}
        AND status != 'closed'
      ORDER BY last_activity DESC
      LIMIT 1;
    `
    if (visitorConv.length > 0) {
      return { convId: visitorConv[0].id, existingConv: visitorConv[0] }
    }

    const newConv = await sql`
      INSERT INTO conversations (
        workspace_id,
        visitor_id,
        customer_name,
        status,
        tag,
        subject_snippet,
        metadata,
        last_activity
      )
      VALUES (
        ${workspaceId}::uuid,
        ${visitorId},
        'Visitor',
        'open',
        'Agent',
        ${message.trim().slice(0, 120)},
        ${JSON.stringify(metadata || {})}::jsonb,
        NOW()
      )
      RETURNING id, status, tag;
    `

    return { convId: newConv[0].id, existingConv: newConv[0] }
  }

  async recordVisitorMessage(params: {
    conversationId: string
    message: string
    metadata?: Record<string, any>
  }) {
    const { conversationId, message, metadata } = params

    const [insertedVisitor] = await Promise.all([
      sql`
        INSERT INTO messages (
          conversation_id,
          sender,
          sender_name,
          text
        )
        VALUES (
          ${conversationId}::uuid,
          'visitor',
          'Visitor',
          ${message.trim()}
        )
        RETURNING id, created_at;
      `,
      sql`
        UPDATE conversations
        SET
          subject_snippet = ${message.trim().slice(0, 120)},
          metadata = CASE 
            WHEN ${metadata ? true : false} THEN ${JSON.stringify(metadata || {})}::jsonb 
            ELSE metadata 
          END,
          last_activity = NOW(),
          updated_at = NOW()
        WHERE id = ${conversationId}::uuid;
      `,
    ])

    return insertedVisitor[0]
  }

  async recordAgentMessage(params: {
    conversationId: string
    senderName: string
    text: string
    citations?: any[]
    groundingMeta?: Record<string, any>
    escalate?: boolean
  }) {
    const {
      conversationId,
      senderName,
      text,
      citations = [],
      groundingMeta = {},
      escalate = false,
    } = params

    const updates: Promise<any>[] = [
      sql`
        INSERT INTO messages (
          conversation_id,
          sender,
          sender_name,
          text,
          citations,
          grounding_meta
        )
        VALUES (
          ${conversationId}::uuid,
          'agent',
          ${senderName},
          ${text},
          ${JSON.stringify(citations)}::jsonb,
          ${JSON.stringify(groundingMeta)}::jsonb
        )
        RETURNING id, created_at;
      `,
    ]

    if (escalate) {
      updates.push(
        sql`
          UPDATE conversations
          SET
            status = 'waiting',
            tag = 'Waiting',
            last_activity = NOW(),
            updated_at = NOW()
          WHERE id = ${conversationId}::uuid;
        `
      )
    }

    const [insertedAgent] = await Promise.all(updates)
    return insertedAgent[0]
  }
}

export const chatRepository = new ChatRepository()
