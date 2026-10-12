import type { FastifyRequest, FastifyReply } from "fastify"
import { knowledgeService } from "./knowledge.service.js"

export class KnowledgeController {
  async getKnowledge(
    req: FastifyRequest<{ Querystring: { workspaceId?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const data = await knowledgeService.getKnowledge(req.query.workspaceId)
      return reply.send(data)
    } catch (err: any) {
      req.log.error(err)
      return reply.status(500).send({ error: err?.message || "Internal server error" })
    }
  }

  async uploadDocument(req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await req.file()
      if (!data) {
        return reply.status(400).send({ error: "No file provided" })
      }

      const buffer = await data.toBuffer()
      const workspaceId =
        (data.fields?.workspaceId as any)?.value || undefined

      const result = await knowledgeService.uploadDocument({
        filename: data.filename,
        buffer,
        workspaceId,
      })

      return reply.send({ success: true, ...result })
    } catch (err: any) {
      req.log.error(err)
      return reply
        .status(400)
        .send({ error: err?.message || "Failed to upload document" })
    }
  }

  async deleteDocument(
    req: FastifyRequest<{ Querystring: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      if (!req.query.id) {
        return reply.status(400).send({ error: "Missing document id" })
      }
      const result = await knowledgeService.deleteDocument(req.query.id)
      return reply.send(result)
    } catch (err: any) {
      req.log.error(err)
      return reply
        .status(400)
        .send({ error: err?.message || "Failed to delete document" })
    }
  }
}

export const knowledgeController = new KnowledgeController()
