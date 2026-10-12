import type { FastifyPluginAsync } from "fastify"
import { knowledgeController } from "./knowledge.controller.js"

export const knowledgeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/api/knowledge",
    {
      schema: {
        summary: "Get knowledge base documents",
        description: "Retrieves all indexed PDF, Markdown, and text knowledge docs along with starter questions.",
        tags: ["Knowledge Base"],
        querystring: {
          type: "object",
          properties: {
            workspaceId: { type: "string" },
          },
        },
      },
    },
    knowledgeController.getKnowledge.bind(knowledgeController)
  )

  fastify.post(
    "/api/knowledge",
    {
      schema: {
        summary: "Upload knowledge base document",
        description: "Extracts text from PDF/MD/TXT, chunks it, generates 768-dim embeddings, and stores in Neon pgvector.",
        tags: ["Knowledge Base"],
        consumes: ["multipart/form-data"],
      },
    },
    knowledgeController.uploadDocument.bind(knowledgeController)
  )

  fastify.post(
    "/api/knowledge/refresh-questions",
    {
      schema: {
        summary: "Regenerate suggested starter questions from knowledge base",
        tags: ["Knowledge Base"],
        querystring: {
          type: "object",
          properties: {
            workspaceId: { type: "string" },
          },
        },
      },
    },
    knowledgeController.refreshQuestions.bind(knowledgeController)
  )

  fastify.delete(
    "/api/knowledge",
    {
      schema: {
        summary: "Delete knowledge document",
        description: "Deletes a document and its associated chunks from pgvector.",
        tags: ["Knowledge Base"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
    },
    knowledgeController.deleteDocument.bind(knowledgeController)
  )
}
