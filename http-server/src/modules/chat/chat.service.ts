import {
  generateEmbedding,
  classifyIntent,
  generateGroundedAnswer,
} from "../knowledge/gemini.service.js"
import { wsGateway } from "../../websocket/gateway.js"
import type { SendMessageDto } from "./chat.schema.js"
import { chatRepository } from "./chat.repository.js"
import { chatRag, MINIMUM_RELEVANCE } from "./chat.rag.js"

export class ChatService {
  async getChat(conversationId: string) {
    const data = await chatRepository.getConversationAndMessages(conversationId)
    if (!data) return null

    const { conversation: conv, messages: msgRows } = data

    return {
      conversationId: conv.id,
      status: conv.status,
      tag: conv.tag,
      assignedTo: conv.assigned_to,
      messages: msgRows.map((m: any) => ({
        id: m.id,
        sender: m.sender,
        senderName:
          m.sender_name ||
          (m.sender === "operator"
            ? "Operator"
            : m.sender === "visitor"
            ? "You"
            : "Agent"),
        text: m.text,
        citations: m.citations || [],
        createdAt: m.created_at,
      })),
    }
  }

  async processVisitorMessage(dto: SendMessageDto) {
    const startTime = Date.now()
    const { workspaceId, visitorId, message, conversationId, metadata } = dto
    const trimmedMessage = message.trim()

    // 1. Resolve workspace
    const workspace = await chatRepository.resolveWorkspace(workspaceId)
    const targetWorkspaceId = workspace.id
    const agentName = workspace.agent_name || "Gaurav Desk Agent"
    const activeVisitorId = visitorId || "anonymous-visitor"

    // 2. Resolve or create active conversation
    const { convId, existingConv } =
      await chatRepository.findOrCreateConversation({
        conversationId,
        workspaceId: targetWorkspaceId,
        visitorId: activeVisitorId,
        message: trimmedMessage,
        metadata,
      })

    // 3. Record visitor message & broadcast via WebSocket
    const insertedVisitor = await chatRepository.recordVisitorMessage({
      conversationId: convId,
      message: trimmedMessage,
      metadata,
    })

    const visitorMsgPayload = {
      id: insertedVisitor.id,
      sender: "visitor",
      senderName: "Visitor",
      text: trimmedMessage,
      citations: [],
      createdAt: insertedVisitor.created_at,
    }

    if (convId) {
      wsGateway.broadcastToConversation(convId, {
        type: "message:new",
        payload: { conversationId: convId, message: visitorMsgPayload },
      })
    }
    if (targetWorkspaceId) {
      wsGateway.broadcastToWorkspace(targetWorkspaceId, {
        type: "conversation:updated",
        payload: {
          conversationId: convId,
          subjectSnippet: trimmedMessage.slice(0, 120),
          lastActivity: "Just now",
        },
      })
    }

    // Check if human takeover is active
    const isHumanOperatorActive =
      existingConv &&
      (existingConv.tag === "Waiting" ||
        existingConv.tag === "You" ||
        existingConv.status === "waiting")

    // 4. Instant Intent Classification
    const classification = await classifyIntent(trimmedMessage, agentName)

    // CASE A: Human takeover active
    if (isHumanOperatorActive && classification.intent !== "OFF_TOPIC") {
      return {
        conversationId: convId,
        answer: null,
        status: existingConv.status || "waiting",
        tag: existingConv.tag || "Waiting",
        isHumanActive: true,
      }
    }

    // CASE B: Escalate to human operator
    if (classification.intent === "ESCALATE") {
      const handoverMessage =
        "I'm looping in a human support operator to help you with this right now. Please hold on a moment."

      const insertedAgent = await chatRepository.recordAgentMessage({
        conversationId: convId,
        senderName: agentName,
        text: handoverMessage,
        groundingMeta: {
          reason: classification.reason,
          intent: "ESCALATE",
        },
        escalate: true,
      })

      const agentMsgPayload = {
        id: insertedAgent.id,
        sender: "agent",
        senderName: agentName,
        text: handoverMessage,
        citations: [],
        createdAt: insertedAgent.created_at,
      }

      if (convId) {
        wsGateway.broadcastToConversation(convId, {
          type: "message:new",
          payload: { conversationId: convId, message: agentMsgPayload },
        })
      }
      if (targetWorkspaceId) {
        wsGateway.broadcastToWorkspace(targetWorkspaceId, {
          type: "conversation:status_changed",
          payload: { conversationId: convId, status: "waiting", tag: "Waiting" },
        })
      }

      return {
        conversationId: convId,
        answer: handoverMessage,
        intent: "ESCALATE",
        citations: [],
        status: "waiting",
        groundingExplanation: `Visitor requested human operator. Escalated to queue in ${
          Date.now() - startTime
        }ms.`,
      }
    }

    // CASE C: Off-topic query guardrail
    if (classification.intent === "OFF_TOPIC") {
      const cannedRefusal = `I am ${agentName}. I can only assist with questions regarding our products, services, and documentation. How can I help you with those today?`

      const insertedAgent = await chatRepository.recordAgentMessage({
        conversationId: convId,
        senderName: agentName,
        text: cannedRefusal,
        groundingMeta: {
          reason: classification.reason,
          guardrail: "rejected_off_topic",
        },
      })

      const agentMsgPayload = {
        id: insertedAgent.id,
        sender: "agent",
        senderName: agentName,
        text: cannedRefusal,
        citations: [],
        createdAt: insertedAgent.created_at,
      }

      if (convId) {
        wsGateway.broadcastToConversation(convId, {
          type: "message:new",
          payload: { conversationId: convId, message: agentMsgPayload },
        })
      }

      return {
        conversationId: convId,
        answer: cannedRefusal,
        intent: "OFF_TOPIC",
        citations: [],
        status: "open",
        groundingExplanation: `Off-topic query intercepted by guardrail in ${
          Date.now() - startTime
        }ms.`,
      }
    }

    // CASE GREETING: Fast conversational greeting
    if (classification.intent === "GREETING") {
      const greetingReply = `Hello! I'm ${agentName}. How can I assist you today? Feel free to ask any question about our services or documentation.`

      const insertedAgent = await chatRepository.recordAgentMessage({
        conversationId: convId,
        senderName: agentName,
        text: greetingReply,
        groundingMeta: {
          intent: "GREETING",
          reason: classification.reason,
        },
      })

      const agentMsgPayload = {
        id: insertedAgent.id,
        sender: "agent",
        senderName: agentName,
        text: greetingReply,
        citations: [],
        createdAt: insertedAgent.created_at,
      }

      if (convId) {
        wsGateway.broadcastToConversation(convId, {
          type: "message:new",
          payload: { conversationId: convId, message: agentMsgPayload },
        })
      }

      return {
        conversationId: convId,
        answer: greetingReply,
        intent: "GREETING",
        citations: [],
        status: "open",
        groundingExplanation: `Greeting handled directly in ${Date.now() - startTime}ms.`,
      }
    }

    // CASE GRATITUDE: Polite closing or thank you
    if (classification.intent === "GRATITUDE") {
      const gratitudeReply = `You're very welcome! If there is anything else you need assistance with, please let me know.`

      const insertedAgent = await chatRepository.recordAgentMessage({
        conversationId: convId,
        senderName: agentName,
        text: gratitudeReply,
        groundingMeta: {
          intent: "GRATITUDE",
          reason: classification.reason,
        },
      })

      const agentMsgPayload = {
        id: insertedAgent.id,
        sender: "agent",
        senderName: agentName,
        text: gratitudeReply,
        citations: [],
        createdAt: insertedAgent.created_at,
      }

      if (convId) {
        wsGateway.broadcastToConversation(convId, {
          type: "message:new",
          payload: { conversationId: convId, message: agentMsgPayload },
        })
      }

      return {
        conversationId: convId,
        answer: gratitudeReply,
        intent: "GRATITUDE",
        citations: [],
        status: "open",
        groundingExplanation: `Gratitude response handled in ${Date.now() - startTime}ms.`,
      }
    }

    // CASE D: Support Inquiry -> Vector Retrieval & RAG
    const queryEmbedding = await generateEmbedding(trimmedMessage).catch(() => null)
    if (!queryEmbedding || queryEmbedding.length !== 768) {
      throw new Error("Could not generate a valid query embedding")
    }

    const retrievedChunks = await chatRag.searchSimilarChunks(
      targetWorkspaceId,
      queryEmbedding,
      4
    )

    const bestSimilarity = retrievedChunks[0]?.similarity ?? 0
    if (bestSimilarity < MINIMUM_RELEVANCE) {
      const handoffMessage =
        "I couldn't find a sufficiently relevant answer in the knowledge base. I'm transferring this conversation to a human operator."

      const insertedAgent = await chatRepository.recordAgentMessage({
        conversationId: convId,
        senderName: agentName,
        text: handoffMessage,
        groundingMeta: {
          reason: "No sufficiently relevant knowledge source was found.",
          bestSimilarity,
          minimumRelevance: MINIMUM_RELEVANCE,
          status: "escalated_to_human",
        },
        escalate: true,
      })

      const agentMsgPayload = {
        id: insertedAgent.id,
        sender: "agent",
        senderName: agentName,
        text: handoffMessage,
        citations: [],
        createdAt: insertedAgent.created_at,
      }

      if (convId) {
        wsGateway.broadcastToConversation(convId, {
          type: "message:new",
          payload: { conversationId: convId, message: agentMsgPayload },
        })
      }
      if (targetWorkspaceId) {
        wsGateway.broadcastToWorkspace(targetWorkspaceId, {
          type: "conversation:status_changed",
          payload: { conversationId: convId, status: "waiting", tag: "Waiting" },
        })
      }

      return {
        conversationId: convId,
        answer: handoffMessage,
        intent: "ESCALATE",
        citations: [],
        status: "waiting",
        tag: "Waiting",
        groundingExplanation: `No source met the ${MINIMUM_RELEVANCE} relevance threshold. Conversation added to operator queue.`,
      }
    }

    // Generate grounded answer with Gemini
    const generation = await generateGroundedAnswer({
      query: trimmedMessage,
      contextChunks: retrievedChunks,
      agentName,
    })

    const insertedAgent = await chatRepository.recordAgentMessage({
      conversationId: convId,
      senderName: agentName,
      text: generation.answer,
      citations: generation.citations,
      groundingMeta: {
        bestSimilarity,
        explanation: generation.groundingExplanation,
      },
    })

    const agentMsgPayload = {
      id: insertedAgent.id,
      sender: "agent",
      senderName: agentName,
      text: generation.answer,
      citations: generation.citations,
      createdAt: insertedAgent.created_at,
    }

    if (convId) {
      wsGateway.broadcastToConversation(convId, {
        type: "message:new",
        payload: { conversationId: convId, message: agentMsgPayload },
      })
    }

    return {
      conversationId: convId,
      answer: generation.answer,
      intent: "SUPPORT",
      citations: generation.citations,
      status: "open",
      groundingExplanation: `${generation.groundingExplanation} (processed in ${
        Date.now() - startTime
      }ms)`,
    }
  }
}

export const chatService = new ChatService()
