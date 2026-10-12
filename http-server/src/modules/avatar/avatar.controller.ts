import type { FastifyRequest, FastifyReply } from "fastify"
import { avatarService } from "./avatar.service.js"

export class AvatarController {
  async uploadAvatar(req: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await req.file()
      if (!data) {
        return reply.status(400).send({ error: "No file provided" })
      }

      const buffer = await data.toBuffer()
      const workspaceId =
        (data.fields?.workspaceId as any)?.value || undefined

      const result = await avatarService.uploadAvatar({
        file: buffer,
        filename: data.filename,
        mimetype: data.mimetype,
        workspaceId,
      })

      return reply.send({ success: true, ...result })
    } catch (err: any) {
      req.log.error(err)
      return reply
        .status(400)
        .send({ error: err?.message || "Failed to upload avatar" })
    }
  }

  async deleteAvatar(
    req: FastifyRequest<{ Querystring: { workspaceId?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const result = await avatarService.deleteAvatar(req.query.workspaceId)
      return reply.send(result)
    } catch (err: any) {
      req.log.error(err)
      return reply
        .status(400)
        .send({ error: err?.message || "Failed to delete avatar" })
    }
  }
}

export const avatarController = new AvatarController()
