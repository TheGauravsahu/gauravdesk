import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL
  const ws = await sql`SELECT id, name, agent_name, accent_color, position, greeting_message, starter_questions, avatar_url, allowed_domains FROM workspaces;`
  console.log("Workspaces in DB:", JSON.stringify(ws, null, 2))

  const docs = await sql`SELECT id, workspace_id, filename, file_size, file_type, status, created_at FROM knowledge_documents;`
  console.log("Knowledge docs in DB:", JSON.stringify(docs, null, 2))
}

check().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); })
