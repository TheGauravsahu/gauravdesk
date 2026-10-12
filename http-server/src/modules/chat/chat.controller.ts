import type { FastifyRequest, FastifyReply } from "fastify"
import { chatService } from "./chat.service.js"
import { sendMessageSchema } from "./chat.schema.js"

export class ChatController {
  async getChat(
    req: FastifyRequest<{ Querystring: { conversationId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { conversationId } = req.query
      if (!conversationId) {
        return reply.status(400).send({ error: "conversationId is required" })
      }

      const chat = await chatService.getChat(conversationId)
      if (!chat) {
        return reply.status(404).send({ error: "Conversation not found" })
      }
      return reply.send(chat)
    } catch (err: any) {
      req.log.error(err)
      return reply.status(500).send({ error: err?.message || "Internal server error" })
    }
  }

  async postMessage(req: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) {
    try {
      const dto = sendMessageSchema.parse(req.body)
      const result = await chatService.processVisitorMessage(dto)
      return reply.send(result)
    } catch (err: any) {
      req.log.error(err)
      if (err.name === "ZodError") {
        return reply.status(400).send({ error: err.errors })
      }
      return reply.status(500).send({ error: err?.message || "Internal server error" })
    }
  }
}

export const chatController = new ChatController()
