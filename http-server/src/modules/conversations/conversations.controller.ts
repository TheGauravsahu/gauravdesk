import type { FastifyRequest, FastifyReply } from "fastify"
import { conversationService } from "./conversations.service.js"
import {
  replyOperatorSchema,
  patchConversationSchema,
} from "./conversations.schema.js"

export class ConversationController {
  async getConversations(
    req: FastifyRequest<{ Querystring: { workspaceId?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const data = await conversationService.getConversations(
        req.query.workspaceId
      )
      return reply.send(data)
    } catch (err: any) {
      req.log.error(err)
      return reply.status(500).send({ error: err?.message || "Internal server error" })
    }
  }

  async postOperatorReply(
    req: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    try {
      const dto = replyOperatorSchema.parse(req.body)
      const result = await conversationService.postOperatorReply(dto)
      return reply.send(result)
    } catch (err: any) {
      req.log.error(err)
      if (err.name === "ZodError") {
        return reply.status(400).send({ error: err.errors })
      }
      return reply.status(500).send({ error: err?.message || "Internal server error" })
    }
  }

  async patchConversationStatus(
    req: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    try {
      const dto = patchConversationSchema.parse(req.body)
      const result = await conversationService.updateConversationStatus(dto)
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

export const conversationController = new ConversationController()
