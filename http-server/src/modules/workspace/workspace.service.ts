import { sql } from "../../db/index.js"
import type { UpdateWorkspaceDto } from "./workspace.schema.js"

export class WorkspaceService {
  async getWorkspace(isSummary = false) {
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
      return null
    }

    const ws = rows[0]

    if (isSummary) {
      return {
        id: ws.id,
        name: ws.name,
        agentName: ws.agent_name,
        starterQuestions: Array.isArray(ws.starter_questions)
          ? ws.starter_questions
          : [],
      }
    }

    return {
      id: ws.id,
      name: ws.name,
      agentName: ws.agent_name,
      accentColor: ws.accent_color,
      position: ws.position,
      greetingMessage: ws.greeting_message,
      starterQuestions: Array.isArray(ws.starter_questions)
        ? ws.starter_questions
        : [],
      allowedDomains: Array.isArray(ws.allowed_domains)
        ? ws.allowed_domains
        : [],
      agentEnabled: ws.agent_enabled ?? true,
      avatarUrl: ws.avatar_url,
      avatarKey: ws.avatar_key,
    }
  }

  async getWorkspaceById(id: string) {
    let rows: any[] = []
    try {
      rows = await sql`
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
        WHERE id = ${id}::uuid
        LIMIT 1;
      `
    } catch {
      rows = []
    }

    if (rows.length === 0) {
      rows = await sql`
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
    }

    if (rows.length === 0) return null
    const ws = rows[0]
    return {
      id: ws.id,
      name: ws.name,
      agentName: ws.agent_name,
      accentColor: ws.accent_color,
      position: ws.position,
      greetingMessage: ws.greeting_message,
      starterQuestions: Array.isArray(ws.starter_questions)
        ? ws.starter_questions
        : [],
      allowedDomains: Array.isArray(ws.allowed_domains)
        ? ws.allowed_domains
        : [],
      agentEnabled: ws.agent_enabled ?? true,
      avatarUrl: ws.avatar_url,
      avatarKey: ws.avatar_key,
    }
  }

  async updateWorkspace(dto: UpdateWorkspaceDto) {
    const existing =
      await sql`SELECT id FROM workspaces ORDER BY created_at ASC LIMIT 1;`
    if (existing.length === 0) {
      throw new Error("No workspace found")
    }

    const workspaceId = existing[0].id

    const updated = await sql`
      UPDATE workspaces
      SET
        agent_name = COALESCE(${dto.agentName}, agent_name),
        accent_color = COALESCE(${dto.accentColor}, accent_color),
        position = COALESCE(${dto.position}, position),
        greeting_message = COALESCE(${dto.greetingMessage}, greeting_message),
        starter_questions = COALESCE(${
          dto.starterQuestions
            ? JSON.stringify(dto.starterQuestions)
            : null
        }::jsonb, starter_questions),
        allowed_domains = COALESCE(${
          dto.allowedDomains || null
        }::text[], allowed_domains),
        agent_enabled = COALESCE(${dto.agentEnabled}, agent_enabled),
        avatar_url = COALESCE(${dto.avatarUrl}, avatar_url),
        updated_at = NOW()
      WHERE id = ${workspaceId}
      RETURNING *;
    `

    const ws = updated[0]
    return {
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
    }
  }
}

export const workspaceService = new WorkspaceService()
