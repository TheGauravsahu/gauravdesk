import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        id, 
        name, 
        agent_name, 
        accent_color, 
        position, 
        greeting_message, 
        starter_questions, 
        allowed_domains, 
        agent_enabled, 
        avatar_url,
        avatar_key
      FROM workspaces 
      ORDER BY created_at ASC 
      LIMIT 1;
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    const ws = rows[0]
    return NextResponse.json({
      id: ws.id,
      name: ws.name,
      agentName: ws.agent_name,
      accentColor: ws.accent_color,
      position: ws.position,
      greetingMessage: ws.greeting_message,
      starterQuestions: Array.isArray(ws.starter_questions) ? ws.starter_questions : [],
      allowedDomains: Array.isArray(ws.allowed_domains) ? ws.allowed_domains : [],
      agentEnabled: ws.agent_enabled ?? true,
      avatarUrl: ws.avatar_url,
      avatarKey: ws.avatar_key,
    })
  } catch (error: any) {
    console.error("Failed to fetch workspace:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const {
      agentName,
      accentColor,
      position,
      greetingMessage,
      starterQuestions,
      allowedDomains,
      agentEnabled,
      avatarUrl,
    } = body

    const existing = await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`
    if (existing.length === 0) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 })
    }

    const workspaceId = existing[0].id

    const updated = await sql`
      UPDATE workspaces
      SET
        agent_name = COALESCE(${agentName}, agent_name),
        accent_color = COALESCE(${accentColor}, accent_color),
        position = COALESCE(${position}, position),
        greeting_message = COALESCE(${greetingMessage}, greeting_message),
        starter_questions = COALESCE(${JSON.stringify(starterQuestions)}::jsonb, starter_questions),
        allowed_domains = COALESCE(${allowedDomains}::text[], allowed_domains),
        agent_enabled = COALESCE(${agentEnabled}, agent_enabled),
        avatar_url = COALESCE(${avatarUrl}, avatar_url),
        updated_at = NOW()
      WHERE id = ${workspaceId}
      RETURNING *;
    `

    const ws = updated[0]
    return NextResponse.json({
      success: true,
      workspace: {
        id: ws.id,
        name: ws.name,
        agentName: ws.agent_name,
        accentColor: ws.accent_color,
        position: ws.position,
        greetingMessage: ws.greeting_message,
        starterQuestions: ws.starter_questions,
        allowedDomains: ws.allowed_domains,
        agentEnabled: ws.agent_enabled,
        avatarUrl: ws.avatar_url,
      },
    })
  } catch (error: any) {
    console.error("Failed to update workspace:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
