import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  generateEmbedding,
  classifyIntent,
  generateGroundedAnswer,
  GeminiConfigurationError,
} from "@/lib/ai/gemini"

const MINIMUM_RELEVANCE = 0.65

/**
 * GET /api/chat?conversationId=...
 * Allows the widget to poll active conversation messages and receive live operator replies.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 })
    }

    const convRows = await sql`
      SELECT id, status, tag, assigned_to
      FROM conversations
      WHERE id = ${conversationId}::uuid
      LIMIT 1;
    `

    if (convRows.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const conv = convRows[0]

    const msgRows = await sql`
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
    `

    return NextResponse.json({
      conversationId: conv.id,
      status: conv.status,
      tag: conv.tag,
      assignedTo: conv.assigned_to,
      messages: msgRows.map((m: any) => ({
        id: m.id,
        sender: m.sender,
        senderName: m.sender_name || (m.sender === "operator" ? "Operator" : m.sender === "visitor" ? "You" : "Agent"),
        text: m.text,
        citations: m.citations || [],
        createdAt: m.created_at,
      })),
    })
  } catch (err: any) {
    console.error("[Chat API GET error]:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/chat
 * Handles visitor messages with ultra-fast sub-2s pipeline and human takeover tracking.
 */
export async function POST(req: Request) {
  const startTime = Date.now()
  try {
    const body = await req.json()
    const { workspaceId, visitorId, message, conversationId, metadata } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // 1. Resolve workspace
    let targetWorkspaceId = workspaceId
    if (!targetWorkspaceId) {
      const defaultWs = await sql`SELECT id, agent_name FROM workspaces ORDER BY created_at ASC LIMIT 1;`
      if (defaultWs.length === 0) {
        return NextResponse.json({ error: "No workspace found" }, { status: 404 })
      }
      targetWorkspaceId = defaultWs[0].id
    }

    const wsRows = await sql`
      SELECT id, name, agent_name, greeting_message
      FROM workspaces
      WHERE id = ${targetWorkspaceId}::uuid
      LIMIT 1;
    `
    if (wsRows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }
    const workspace = wsRows[0]
    const agentName = workspace.agent_name || "Gaurav Desk Agent"
    const activeVisitorId = visitorId || "anonymous-visitor"

    // 2. Resolve or create active conversation
    let convId = conversationId
    let existingConv: any = null
    if (convId) {
      const rows = await sql`
        SELECT id, status, tag, assigned_to
        FROM conversations
        WHERE id = ${convId}::uuid
        LIMIT 1;
      `
      if (rows.length > 0) {
        existingConv = rows[0]
      } else {
        convId = null
      }
    }

    if (!convId) {
      // Find latest open conversation for this visitor
      const visitorConv = await sql`
        SELECT id, status, tag, assigned_to
        FROM conversations
        WHERE workspace_id = ${targetWorkspaceId}::uuid
          AND visitor_id = ${activeVisitorId}
          AND status != 'closed'
        ORDER BY last_activity DESC
        LIMIT 1;
      `
      if (visitorConv.length > 0) {
        convId = visitorConv[0].id
        existingConv = visitorConv[0]
      } else {
        // Create new conversation with real captured metadata
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
            ${targetWorkspaceId}::uuid,
            ${activeVisitorId},
            'Visitor',
            'open',
            'Agent',
            ${message.trim().slice(0, 120)},
            ${JSON.stringify(metadata || {})}::jsonb,
            NOW()
          )
          RETURNING id, status, tag;
        `
        convId = newConv[0].id
        existingConv = newConv[0]
      }
    }

    // Update conversation metadata and activity
    await sql`
      UPDATE conversations
      SET
        subject_snippet = ${message.trim().slice(0, 120)},
        metadata = CASE 
          WHEN ${metadata ? true : false} THEN ${JSON.stringify(metadata || {})}::jsonb 
          ELSE metadata 
        END,
        last_activity = NOW(),
        updated_at = NOW()
      WHERE id = ${convId}::uuid;
    `

    // 3. Record visitor message
    await sql`
      INSERT INTO messages (
        conversation_id,
        sender,
        sender_name,
        text
      )
      VALUES (
        ${convId}::uuid,
        'visitor',
        'Visitor',
        ${message.trim()}
      );
    `

    // 4. Check if human operator has already taken over this chat
    const isHumanOperatorActive =
      existingConv && (existingConv.tag === "Waiting" || existingConv.tag === "You" || existingConv.status === "waiting")

    // Fast Intent Check (0ms sub-millisecond regex)
    const classification = await classifyIntent(message.trim(), agentName)

    // CASE A: If human takeover is active, do not overwrite the human operator with bot answers!
    if (isHumanOperatorActive && classification.intent !== "OFF_TOPIC") {
      return NextResponse.json({
        conversationId: convId,
        answer: null,
        status: existingConv.status || "waiting",
        tag: existingConv.tag || "Waiting",
        isHumanActive: true,
      })
    }

    // CASE B: Explicit Escalation Request ("talk to a human")
    if (classification.intent === "ESCALATE") {
      const handoverMessage = `I'm looping in a human support operator to help you with this right now. Please hold on a moment.`

      await sql`
        UPDATE conversations
        SET
          status = 'waiting',
          tag = 'Waiting',
          last_activity = NOW(),
          updated_at = NOW()
        WHERE id = ${convId}::uuid;
      `

      await sql`
        INSERT INTO messages (
          conversation_id,
          sender,
          sender_name,
          text,
          grounding_meta
        )
        VALUES (
          ${convId}::uuid,
          'agent',
          ${agentName},
          ${handoverMessage},
          ${JSON.stringify({ reason: classification.reason, status: "escalated_to_human" })}::jsonb
        );
      `

      return NextResponse.json({
        conversationId: convId,
        answer: handoverMessage,
        intent: "ESCALATE",
        citations: [],
        status: "waiting",
        groundingExplanation: `Visitor requested human operator. Escalated to queue in ${Date.now() - startTime}ms.`,
      })
    }

    // CASE C: Off-Topic Guardrail -> Instant polite refusal (0ms RAG tokens)
    if (classification.intent === "OFF_TOPIC") {
      const cannedRefusal = `I am ${agentName}. I can only assist with questions regarding our products, services, and documentation. How can I help you with those today?`

      await sql`
        INSERT INTO messages (
          conversation_id,
          sender,
          sender_name,
          text,
          grounding_meta
        )
        VALUES (
          ${convId}::uuid,
          'agent',
          ${agentName},
          ${cannedRefusal},
          ${JSON.stringify({ reason: classification.reason, guardrail: "rejected_off_topic" })}::jsonb
        );
      `

      return NextResponse.json({
        conversationId: convId,
        answer: cannedRefusal,
        intent: "OFF_TOPIC",
        citations: [],
        status: "open",
        groundingExplanation: `Off-topic query intercepted by guardrail in ${Date.now() - startTime}ms.`,
      })
    }

    // CASE D: Support Inquiry -> Fast Vector Retrieval & Grounded Answer
    let retrievedChunks: Array<{ filename: string; content: string; similarity: number }> = []

    const queryEmbedding = await generateEmbedding(message.trim())
    if (!queryEmbedding || queryEmbedding.length !== 768) {
      throw new Error("Could not generate a valid query embedding")
    }

    const queryVecStr = `[${queryEmbedding.join(",")}]`
    const vectorResults = await sql`
      SELECT 
        content,
        COALESCE(metadata->>'filename', 'Knowledge Document') as filename,
        (1 - (embedding <=> ${queryVecStr}::vector)) as similarity
      FROM document_chunks
      WHERE workspace_id = ${targetWorkspaceId}::uuid
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${queryVecStr}::vector
      LIMIT 4;
    `

    retrievedChunks = vectorResults.map((result: any) => {
      const similarity = Number(result.similarity)
      return {
        filename: result.filename,
        content: result.content,
        similarity: Number.isFinite(similarity) ? similarity : 0,
      }
    })

    const bestSimilarity = retrievedChunks[0]?.similarity ?? 0
    if (bestSimilarity < MINIMUM_RELEVANCE) {
      const handoffMessage =
        "I couldn't find a sufficiently relevant answer in the knowledge base. I'm transferring this conversation to a human operator."

      await sql`
        UPDATE conversations
        SET
          status = 'waiting',
          tag = 'Waiting',
          last_activity = NOW(),
          updated_at = NOW()
        WHERE id = ${convId}::uuid;
      `

      await sql`
        INSERT INTO messages (
          conversation_id,
          sender,
          sender_name,
          text,
          grounding_meta
        )
        VALUES (
          ${convId}::uuid,
          'agent',
          ${agentName},
          ${handoffMessage},
          ${JSON.stringify({
            reason: "No sufficiently relevant knowledge source was found.",
            bestSimilarity,
            minimumRelevance: MINIMUM_RELEVANCE,
            status: "escalated_to_human",
          })}::jsonb
        );
      `

      return NextResponse.json({
        conversationId: convId,
        answer: handoffMessage,
        intent: "ESCALATE",
        citations: [],
        status: "waiting",
        tag: "Waiting",
        groundingExplanation: `No source met the ${MINIMUM_RELEVANCE} relevance threshold. Conversation added to the operator queue.`,
      })
    }

    // Generate grounded answer with citations
    const generation = await generateGroundedAnswer({
      query: message.trim(),
      contextChunks: retrievedChunks,
      agentName,
    })

    // Save agent message to database
    await sql`
      INSERT INTO messages (
        conversation_id,
        sender,
        sender_name,
        text,
        citations,
        grounding_meta
      )
      VALUES (
        ${convId}::uuid,
        'agent',
        ${agentName},
        ${generation.answer},
        ${JSON.stringify(generation.citations)}::jsonb,
        ${JSON.stringify({
          bestSimilarity,
          explanation: generation.groundingExplanation,
        })}::jsonb
      );
    `

    return NextResponse.json({
      conversationId: convId,
      answer: generation.answer,
      intent: "SUPPORT",
      citations: generation.citations,
      status: "open",
      groundingExplanation: `${generation.groundingExplanation} (processed in ${Date.now() - startTime}ms)`,
    })
  } catch (error) {
    console.error("[Chat API Error]:", error)
    if (error instanceof GeminiConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return NextResponse.json(
      { error: "Unable to process this message right now" },
      { status: 500 }
    )
  }
}
