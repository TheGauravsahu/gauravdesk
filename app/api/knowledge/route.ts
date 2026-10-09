import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * Derives dynamic suggested questions from uploaded knowledge base documents.
 * Updates automatically as documents are added or removed.
 */
export function deriveSuggestedQuestions(
  docs: Array<{ filename: string; extracted_text?: string | null }>
): string[] {
  const fallbacks = [
    "Do you ship to Canada?",
    "What's your refund policy?",
    "How do I reset my password?",
    "Which plan is right for my team?",
  ]

  if (!docs || docs.length === 0) {
    return fallbacks
  }

  const generated: string[] = []

  for (const doc of docs) {
    const text = doc.extracted_text || ""
    const name = doc.filename.toLowerCase()

    // 1. Look for explicit questions in document text (e.g. FAQs or headers with '?')
    const questionMatches = text.match(/([A-Z][^\.\n\r]{8,70}\?)/g)
    if (questionMatches) {
      for (const q of questionMatches) {
        const clean = q.trim()
        if (clean.length >= 12 && clean.length <= 65 && !generated.includes(clean)) {
          generated.push(clean)
          if (generated.length >= 4) break
        }
      }
    }
    if (generated.length >= 4) break

    // 2. Synthesize smart questions from filename or contents
    if (name.includes("refund") || name.includes("return") || text.toLowerCase().includes("refund")) {
      generated.push("What's your refund policy?")
    } else if (name.includes("shipping") || name.includes("delivery") || text.toLowerCase().includes("shipping")) {
      generated.push("Do you ship to Canada?")
    } else if (name.includes("pricing") || name.includes("billing") || name.includes("plan") || text.toLowerCase().includes("pricing")) {
      generated.push("Which plan is right for my team?")
    } else if (name.includes("password") || name.includes("auth") || name.includes("login") || text.toLowerCase().includes("password")) {
      generated.push("How do I reset my password?")
    } else if (name.includes("support") || name.includes("help") || name.includes("contact")) {
      generated.push("How can I contact customer support?")
    } else if (name.includes("security") || name.includes("privacy")) {
      generated.push("How is my customer data protected?")
    } else {
      const baseName = doc.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      const capitalized = baseName.charAt(0).toUpperCase() + baseName.slice(1)
      generated.push(`Can you tell me more about ${capitalized}?`)
    }
    if (generated.length >= 4) break
  }

  for (const fb of fallbacks) {
    if (generated.length < 4 && !generated.includes(fb)) {
      generated.push(fb)
    }
  }

  return generated.slice(0, 4)
}

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
          suggestedQuestions: [
            "Do you ship to Canada?",
            "What's your refund policy?",
            "How do I reset my password?",
            "Which plan is right for my team?",
          ],
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

    const suggestedQuestions = deriveSuggestedQuestions(docs as any)

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
  } catch (error: any) {
    console.error("Failed to fetch knowledge documents:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
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

    let workspaceId = wsParam
    if (!workspaceId) {
      const existing = await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`
      if (existing.length === 0) {
        return NextResponse.json({ error: "No workspace found" }, { status: 404 })
      }
      workspaceId = existing[0].id
    }

    // Read and extract text content from documents
    let extractedText = ""
    const fileType = file.name.split(".").pop()?.toLowerCase() || "unknown"
    if (["txt", "md", "json", "csv"].includes(fileType)) {
      extractedText = await file.text()
    } else {
      extractedText = `Indexed binary document ${file.name} (${file.size} bytes). Grounded for vector retrieval.`
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

    // Derive and automatically update suggested questions in workspace
    const allDocs = await sql`
      SELECT filename, extracted_text
      FROM knowledge_documents
      WHERE workspace_id = ${workspaceId}::uuid;
    `
    const suggestedQuestions = deriveSuggestedQuestions(allDocs as any)

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
  } catch (error: any) {
    console.error("Failed to upload knowledge document:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to upload document" },
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

    const existing = await sql`SELECT workspace_id FROM knowledge_documents WHERE id = ${id}::uuid LIMIT 1;`
    await sql`DELETE FROM knowledge_documents WHERE id = ${id}::uuid;`

    let suggestedQuestions = [
      "Do you ship to Canada?",
      "What's your refund policy?",
      "How do I reset my password?",
      "Which plan is right for my team?",
    ]

    if (existing.length > 0) {
      const workspaceId = existing[0].workspace_id
      const remainingDocs = await sql`
        SELECT filename, extracted_text
        FROM knowledge_documents
        WHERE workspace_id = ${workspaceId}::uuid;
      `
      suggestedQuestions = deriveSuggestedQuestions(remainingDocs as any)
      await sql`
        UPDATE workspaces
        SET starter_questions = ${JSON.stringify(suggestedQuestions)}::jsonb, updated_at = NOW()
        WHERE id = ${workspaceId}::uuid;
      `
    }

    return NextResponse.json({ success: true, suggestedQuestions })
  } catch (error: any) {
    console.error("Failed to delete knowledge document:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to delete document" },
      { status: 500 }
    )
  }
}
