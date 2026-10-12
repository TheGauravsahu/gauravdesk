import { NextResponse } from "next/server"
import type { PDFParse as PDFParseInstance } from "pdf-parse"
import { sql } from "@/lib/db"
import { chunkText } from "@/lib/ai/chunking"
import {
  generateEmbedding,
  generateSuggestedQuestionsFromKnowledge,
  GeminiConfigurationError,
} from "@/lib/ai/gemini"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const SUPPORTED_FILE_TYPES = new Set(["pdf", "md", "txt"])

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const wsParam = searchParams.get("workspaceId")

    let workspaceId = wsParam
    if (!workspaceId) {
      const existing = await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`
      if (existing.length === 0) {
        return NextResponse.json({
          documents: [],
          suggestedQuestions: [],
        })
      }
      workspaceId = existing[0].id
    }

    const docs = await sql`
      SELECT 
        id, 
        filename, 
        file_size, 
        file_type, 
        extracted_text,
        status, 
        created_at
      FROM knowledge_documents
      WHERE workspace_id = ${workspaceId}::uuid
      ORDER BY created_at DESC;
    `

    const workspaceRows = await sql`
      SELECT starter_questions
      FROM workspaces
      WHERE id = ${workspaceId}::uuid
      LIMIT 1;
    `
    const suggestedQuestions =
      workspaceRows.length > 0 && Array.isArray(workspaceRows[0].starter_questions)
        ? workspaceRows[0].starter_questions.filter(
            (question: unknown): question is string =>
              typeof question === "string"
          )
        : []

    return NextResponse.json({
      documents: docs.map((d) => ({
        id: d.id,
        filename: d.filename,
        fileSize: d.file_size,
        fileType: d.file_type,
        status: d.status,
        createdAt: d.created_at,
      })),
      suggestedQuestions,
    })
  } catch (error) {
    console.error("Failed to fetch knowledge documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch knowledge documents" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const wsParam = formData.get("workspaceId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10 MB limit" },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The uploaded file is empty" }, { status: 400 })
    }

    const fileType = file.name.split(".").pop()?.toLowerCase() || ""
    if (!SUPPORTED_FILE_TYPES.has(fileType)) {
      return NextResponse.json(
        { error: "Only PDF, Markdown (.md), and plain-text (.txt) files are supported" },
        { status: 415 }
      )
    }

    let workspaceId = wsParam
    if (!workspaceId) {
      const existing = await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`
      if (existing.length === 0) {
        return NextResponse.json({ error: "No workspace found" }, { status: 404 })
      }
      workspaceId = existing[0].id
    }

    // Read and extract text content from documents
    let extractedText: string
    if (fileType === "txt" || fileType === "md") {
      extractedText = await file.text()
    } else {
      let parser: PDFParseInstance | undefined
      try {
        const { PDFParse } = await import("pdf-parse")
        const arrayBuffer = await file.arrayBuffer()
        const uint8 = new Uint8Array(arrayBuffer)
        parser = new PDFParse({ data: uint8 })
        const parsed = await parser.getText()
        extractedText = parsed.text
      } catch (error) {
        console.error("PDF parse error:", error)
        return NextResponse.json(
          { error: "Could not extract text from the uploaded PDF" },
          { status: 422 }
        )
      } finally {
        if (parser) await parser.destroy()
      }
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No readable text was found in the uploaded document" },
        { status: 422 }
      )
    }

    const chunks = chunkText(extractedText)
    const indexedChunks = []
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content)
      if (!embedding || embedding.length !== 768) {
        throw new Error(`Could not generate a valid embedding for ${file.name}`)
      }
      indexedChunks.push({ ...chunk, embedding })
    }

    const existingDocs = await sql`
      SELECT filename, extracted_text
      FROM knowledge_documents
      WHERE workspace_id = ${workspaceId}::uuid;
    `
    const suggestedQuestions = await generateSuggestedQuestionsFromKnowledge([
      ...existingDocs,
      { filename: file.name, extracted_text: extractedText },
    ])

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
        ${workspaceId}::uuid,
        ${file.name},
        ${file.size},
        ${fileType},
        ${extractedText},
        'indexed'
      )
      RETURNING id, filename, file_size, file_type, status, created_at;
    `

    const doc = inserted[0]

    try {
      for (const chunk of indexedChunks) {
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
            ${workspaceId}::uuid,
            ${chunk.index},
            ${chunk.content},
            ${`[${chunk.embedding.join(",")}]`}::vector,
            ${JSON.stringify({ filename: doc.filename })}::jsonb
          );
        `
      }
    } catch (error) {
      await sql`DELETE FROM knowledge_documents WHERE id = ${doc.id}::uuid;`
      throw error
    }

    await sql`
      UPDATE workspaces
      SET starter_questions = ${JSON.stringify(suggestedQuestions)}::jsonb, updated_at = NOW()
      WHERE id = ${workspaceId}::uuid;
    `

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        filename: doc.filename,
        fileSize: doc.file_size,
        fileType: doc.file_type,
        status: doc.status,
        createdAt: doc.created_at,
      },
      suggestedQuestions,
    })
  } catch (error) {
    console.error("Failed to upload knowledge document:", error)
    if (error instanceof GeminiConfigurationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 })
    }

    const existing = await sql`
      SELECT workspace_id
      FROM knowledge_documents
      WHERE id = ${id}::uuid
      LIMIT 1;
    `
    if (existing.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    const workspaceId = existing[0].workspace_id
    const remainingDocs = await sql`
      SELECT filename, extracted_text
      FROM knowledge_documents
      WHERE workspace_id = ${workspaceId}::uuid
        AND id <> ${id}::uuid;
    `
    const suggestedQuestions =
      await generateSuggestedQuestionsFromKnowledge(remainingDocs)

    await sql`DELETE FROM knowledge_documents WHERE id = ${id}::uuid;`
    await sql`
      UPDATE workspaces
      SET starter_questions = ${JSON.stringify(suggestedQuestions)}::jsonb, updated_at = NOW()
      WHERE id = ${workspaceId}::uuid;
    `

    return NextResponse.json({ success: true, suggestedQuestions })
  } catch (error) {
    console.error("Failed to delete knowledge document:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}
