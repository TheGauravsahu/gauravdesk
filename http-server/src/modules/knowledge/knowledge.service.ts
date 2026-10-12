import { sql } from "../../db/index.js";
import { chunkText } from "./chunking.js";
import {
  generateEmbedding,
  generateSuggestedQuestionsFromKnowledge,
} from "./gemini.service.js";
import pdfParse from "pdf-parse";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FILE_TYPES = new Set(["pdf", "md", "txt"]);

async function refreshSuggestedQuestions(workspaceId: string) {
  try {
    const documents = await sql`
      SELECT filename, extracted_text
      FROM knowledge_documents
      WHERE workspace_id = ${workspaceId}::uuid;
    `;
    const suggestedQuestions =
      await generateSuggestedQuestionsFromKnowledge(documents);

    await sql`
      UPDATE workspaces
      SET starter_questions = ${JSON.stringify(
        suggestedQuestions,
      )}::jsonb, updated_at = NOW()
      WHERE id = ${workspaceId}::uuid;
    `;

    return suggestedQuestions;
  } catch (error) {
    console.warn(
      "[Knowledge] Could not refresh suggested questions:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export class KnowledgeService {
  async getKnowledge(workspaceId?: string) {
    let wsId = workspaceId;
    if (!wsId) {
      const existing =
        await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`;
      if (existing.length === 0) {
        return { documents: [], suggestedQuestions: [] };
      }
      wsId = existing[0].id;
    }

    const [docs, workspaceRows] = await Promise.all([
      sql`
        SELECT 
          id, 
          filename, 
          file_size, 
          file_type, 
          extracted_text,
          status, 
          created_at
        FROM knowledge_documents
        WHERE workspace_id = ${wsId}::uuid
        ORDER BY created_at DESC;
      `,
      sql`
        SELECT starter_questions
        FROM workspaces
        WHERE id = ${wsId}::uuid
        LIMIT 1;
      `,
    ]);
    let suggestedQuestions =
      workspaceRows.length > 0 &&
      Array.isArray(workspaceRows[0].starter_questions)
        ? workspaceRows[0].starter_questions.filter(
            (q: unknown): q is string => typeof q === "string",
          )
        : [];

    // If documents are present but suggested questions are empty, auto-generate them now
    if (suggestedQuestions.length === 0 && docs.length > 0 && wsId) {
      const freshQuestions = await refreshSuggestedQuestions(wsId);
      if (freshQuestions && freshQuestions.length > 0) {
        suggestedQuestions = freshQuestions;
      }
    }

    return {
      documents: docs.map((d: any) => ({
        id: d.id,
        filename: d.filename,
        fileSize: d.file_size,
        fileType: d.file_type,
        status: d.status,
        createdAt: d.created_at,
      })),
      suggestedQuestions,
    };
  }

  async refreshQuestions(workspaceId?: string) {
    let wsId = workspaceId;
    if (!wsId) {
      const existing =
        await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`;
      if (existing.length === 0) {
        return [];
      }
      wsId = existing[0].id;
    }
    return (await refreshSuggestedQuestions(wsId)) || [];
  }

  async uploadDocument({
    filename,
    buffer,
    workspaceId,
  }: {
    filename: string;
    buffer: Buffer;
    workspaceId?: string;
  }) {
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error("File exceeds 10 MB limit");
    }
    if (buffer.length === 0) {
      throw new Error("The uploaded file is empty");
    }

    const fileType = filename.split(".").pop()?.toLowerCase() || "";
    if (!SUPPORTED_FILE_TYPES.has(fileType)) {
      throw new Error(
        "Only PDF, Markdown (.md), and plain-text (.txt) files are supported",
      );
    }

    let wsId = workspaceId;
    if (!wsId) {
      const existing =
        await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`;
      if (existing.length === 0) {
        throw new Error("No workspace found");
      }
      wsId = existing[0].id;
    }
    if (!wsId) {
      throw new Error("No workspace found");
    }

    let extractedText = "";
    if (fileType === "txt" || fileType === "md") {
      extractedText = buffer.toString("utf-8");
    } else {
      try {
        const parsed = await (pdfParse as any)(buffer);
        extractedText = parsed.text;
      } catch (err) {
        console.error("PDF parse error:", err);
        throw new Error("Could not extract text from the uploaded PDF");
      }
    }

    if (!extractedText.trim()) {
      throw new Error("No readable text was found in the uploaded document");
    }

    const chunks = chunkText(extractedText);
    const indexedChunks = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);
      if (!embedding || embedding.length !== 768) {
        throw new Error(`Could not generate a valid embedding for ${filename}`);
      }
      indexedChunks.push({ ...chunk, embedding });
    }

    const inserted = await sql`
      INSERT INTO knowledge_documents (
        workspace_id,
        filename,
        file_size,
        file_type,
        extracted_text,
        status
      )
      VALUES (
        ${wsId}::uuid,
        ${filename},
        ${buffer.length},
        ${fileType},
        ${extractedText},
        'indexed'
      )
      RETURNING id, filename, file_size, file_type, status, created_at;
    `;
    const doc = inserted[0];

    try {
      for (const chunk of indexedChunks) {
        const vecStr = `[${chunk.embedding.join(",")}]`;
        await sql`
          INSERT INTO document_chunks (
            document_id,
            workspace_id,
            chunk_index,
            content,
            embedding,
            metadata
          )
          VALUES (
            ${doc.id}::uuid,
            ${wsId}::uuid,
            ${chunk.index},
            ${chunk.content},
            ${vecStr}::vector,
            ${JSON.stringify({ filename: doc.filename })}::jsonb
          );
        `;
      }
    } catch (error) {
      await sql`DELETE FROM knowledge_documents WHERE id = ${doc.id}::uuid;`;
      throw error;
    }

    const suggestedQuestions = await refreshSuggestedQuestions(wsId);

    return {
      document: {
        id: doc.id,
        filename: doc.filename,
        fileSize: doc.file_size,
        fileType: doc.file_type,
        status: doc.status,
        createdAt: doc.created_at,
      },
      suggestedQuestions: suggestedQuestions ?? [],
    };
  }

  async deleteDocument(id: string) {
    const existing = await sql`
      SELECT workspace_id
      FROM knowledge_documents
      WHERE id = ${id}::uuid
      LIMIT 1;
    `;
    if (existing.length === 0) {
      throw new Error("Document not found");
    }
    const workspaceId = existing[0].workspace_id;

    await sql`DELETE FROM knowledge_documents WHERE id = ${id}::uuid;`;
    const suggestedQuestions = await refreshSuggestedQuestions(workspaceId);

    return { success: true, suggestedQuestions: suggestedQuestions ?? [] };
  }
}

export const knowledgeService = new KnowledgeService();
