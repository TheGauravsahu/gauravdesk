import type { FastifyPluginAsync } from "fastify"
import { conversationController } from "./conversations.controller.js"

export const conversationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/api/conversations",
    {
      schema: {
        summary: "Get all customer conversations and full message transcripts",
        description: "Returns open, waiting, and closed customer conversations categorized for the Operator Inbox.",
        tags: ["Conversations"],
        querystring: {
          type: "object",
          properties: {
            workspaceId: { type: "string" },
          },
        },
      },
    },
    conversationController.getConversations.bind(conversationController)
  )

  fastify.post(
    "/api/conversations",
    {
      schema: {
        summary: "Post live operator reply",
        description: "Sends a human agent response into the visitor conversation and marks status as You.",
        tags: ["Conversations"],
        body: {
          type: "object",
          required: ["conversationId", "replyText"],
          properties: {
            conversationId: { type: "string", format: "uuid" },
            replyText: { type: "string" },
            operatorName: { type: "string" },
          },
        },
      },
    },
    conversationController.postOperatorReply.bind(conversationController)
  )

  fastify.patch(
    "/api/conversations",
    {
      schema: {
        summary: "Update conversation status",
        description: "Change state between open, waiting, or closed.",
        tags: ["Conversations"],
        body: {
          type: "object",
          required: ["conversationId"],
          properties: {
            conversationId: { type: "string", format: "uuid" },
            status: { type: "string", enum: ["open", "waiting", "closed"] },
          },
        },
      },
    },
    conversationController.patchConversationStatus.bind(conversationController)
  )
}
