import { sql } from "../../db/index.js"

export const MINIMUM_RELEVANCE = 0.65

export interface RetrievedChunk {
  filename: string
  content: string
  similarity: number
}

export class ChatRag {
  async searchSimilarChunks(
    workspaceId: string,
    queryEmbedding: number[],
    limit = 4
  ): Promise<RetrievedChunk[]> {
    const queryVecStr = `[${queryEmbedding.join(",")}]`
    const vectorResults = await sql`
      SELECT 
        content,
        COALESCE(metadata->>'filename', 'Knowledge Document') as filename,
        (1 - (embedding <=> ${queryVecStr}::vector)) as similarity
      FROM document_chunks
      WHERE workspace_id = ${workspaceId}::uuid
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${queryVecStr}::vector
      LIMIT ${limit};
    `

    return vectorResults.map((result: any) => {
      const similarity = Number(result.similarity)
      return {
        filename: result.filename,
        content: result.content,
        similarity: Number.isFinite(similarity) ? similarity : 0,
      }
    })
  }
}

export const chatRag = new ChatRag()
