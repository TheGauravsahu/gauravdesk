import type { FastifyPluginAsync } from "fastify"
import { workspaceController } from "./workspace.controller.js"

export const workspaceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/api/workspace",
    {
      schema: {
        summary: "Get current workspace configuration",
        description: "Returns the workspace settings, branding, and starter questions.",
        tags: ["Workspace"],
        querystring: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Set to 1 for summary view" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              agentName: { type: "string" },
              accentColor: { type: "string" },
              position: { type: "string" },
              greetingMessage: { type: "string" },
              starterQuestions: { type: "array", items: { type: "string" } },
              allowedDomains: { type: "array", items: { type: "string" } },
              agentEnabled: { type: "boolean" },
              avatarUrl: { type: ["string", "null"] },
              avatarKey: { type: ["string", "null"] },
            },
          },
        },
      },
    },
    workspaceController.getWorkspace.bind(workspaceController)
  )

  fastify.get(
    "/api/workspace/:id",
    {
      schema: {
        summary: "Get workspace by ID",
        description: "Returns workspace details for a specific UUID.",
        tags: ["Workspace"],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
    },
    workspaceController.getWorkspaceById.bind(workspaceController)
  )

  fastify.put(
    "/api/workspace",
    {
      schema: {
        summary: "Update workspace configuration",
        description: "Updates agent name, greeting message, accent color, questions, etc.",
        tags: ["Workspace"],
        body: {
          type: "object",
          properties: {
            agentName: { type: "string" },
            accentColor: { type: "string" },
            position: { type: "string", enum: ["bottom-left", "bottom-right"] },
            greetingMessage: { type: "string" },
            starterQuestions: { type: "array", items: { type: "string" } },
            allowedDomains: { type: "array", items: { type: "string" } },
            agentEnabled: { type: "boolean" },
            avatarUrl: { type: ["string", "null"] },
          },
        },
      },
    },
    workspaceController.updateWorkspace.bind(workspaceController)
  )
}
