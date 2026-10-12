import type { FastifyPluginAsync } from "fastify"
import { chatController } from "./chat.controller.js"

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/api/chat",
    {
      schema: {
        summary: "Get chat messages by conversation ID",
        description: "Retrieves message history, conversation status, and assigned operator.",
        tags: ["Chat"],
        querystring: {
          type: "object",
          properties: {
            conversationId: { type: "string" },
          },
          required: ["conversationId"],
        },
      },
    },
    chatController.getChat.bind(chatController)
  )

  fastify.post(
    "/api/chat",
    {
      schema: {
        summary: "Send visitor message to AI support agent",
        description: "Runs intent classification, off-topic deflection, vector search on Neon, and generates answers using Gemini.",
        tags: ["Chat"],
        body: {
          type: "object",
          required: ["message"],
          properties: {
            workspaceId: { type: "string" },
            visitorId: { type: "string" },
            message: { type: "string" },
            conversationId: { type: ["string", "null"] },
            metadata: { type: "object" },
          },
        },
      },
    },
    chatController.postMessage.bind(chatController)
  )
}
