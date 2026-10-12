import type { FastifyPluginAsync } from "fastify"
import { avatarController } from "./avatar.controller.js"

export const avatarRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/api/avatar/upload",
    {
      schema: {
        summary: "Upload workspace chatbot avatar",
        description: "Uploads an image file and stores in S3-compatible Neon object storage or base64 data url.",
        tags: ["Avatar"],
        consumes: ["multipart/form-data"],
      },
    },
    avatarController.uploadAvatar.bind(avatarController)
  )

  fastify.delete(
    "/api/avatar/upload",
    {
      schema: {
        summary: "Remove workspace avatar",
        description: "Deletes chatbot avatar image.",
        tags: ["Avatar"],
        querystring: {
          type: "object",
          properties: {
            workspaceId: { type: "string" },
          },
        },
      },
    },
    avatarController.deleteAvatar.bind(avatarController)
  )
}
