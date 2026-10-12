import type { FastifyRequest, FastifyReply } from "fastify"
import { workspaceService } from "./workspace.service.js"
import { updateWorkspaceSchema } from "./workspace.schema.js"

export class WorkspaceController {
  async getWorkspace(
    req: FastifyRequest<{ Querystring: { summary?: string } }>,
    reply: FastifyReply
  ) {
    try {
      const isSummary = req.query.summary === "1"
      const ws = await workspaceService.getWorkspace(isSummary)
      if (!ws) {
        return reply.status(404).send({ error: "No workspace found" })
      }
      return reply.send(ws)
    } catch (err: any) {
      req.log.error(err)
      return reply.status(500).send({ error: err?.message || "Internal server error" })
    }
  }

  async getWorkspaceById(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const ws = await workspaceService.getWorkspaceById(req.params.id)
      if (!ws) {
        return reply.status(404).send({ error: "Workspace not found" })
      }
      return reply.send(ws)
    } catch (err: any) {
      req.log.error(err)
      return reply.status(500).send({ error: err?.message || "Internal server error" })
    }
  }

  async updateWorkspace(
    req: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    try {
      const parsed = updateWorkspaceSchema.parse(req.body)
      const updated = await workspaceService.updateWorkspace(parsed)
      return reply.send({ success: true, workspace: updated })
    } catch (err: any) {
      req.log.error(err)
      return reply
        .status(400)
        .send({ error: err?.message || "Failed to update workspace" })
    }
  }
}

export const workspaceController = new WorkspaceController()
