import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL || "postgresql://gauravdesk_owner:npg_sLKm9TRkrlM2@ep-long-sun-b35r1cd8-pooler.c-4.ap-southeast-1.aws.neon.tech/gauravdesk?sslmode=require&channel_binding=require"
const sql = neon(databaseUrl)

async function init() {
  console.log("Connecting to Neon...")
  await sql`
    CREATE TABLE IF NOT EXISTS workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT,
      name TEXT NOT NULL DEFAULT 'Gaurav Desk Workspace',
      agent_name TEXT NOT NULL DEFAULT 'Gaurav Desk Agent',
      accent_color TEXT NOT NULL DEFAULT '#2563eb',
      position TEXT NOT NULL DEFAULT 'bottom-right',
      greeting_message TEXT NOT NULL DEFAULT 'Hi there! How can we help you today?',
      starter_questions JSONB NOT NULL DEFAULT '["Do you ship to Canada?", "What''s your refund policy?", "How do I reset my password?", "Which plan is right for my team?"]'::jsonb,
      allowed_domains TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      agent_enabled BOOLEAN NOT NULL DEFAULT true,
      avatar_key TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
  console.log("Workspaces table verified/created.")

  await sql`
    CREATE TABLE IF NOT EXISTS knowledge_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      file_size INT NOT NULL,
      file_type TEXT NOT NULL,
      extracted_text TEXT,
      status TEXT NOT NULL DEFAULT 'indexed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
  console.log("Knowledge documents table verified/created.")

  const existing = await sql`SELECT id FROM workspaces LIMIT 1;`
  if (existing.length === 0) {
    await sql`
      INSERT INTO workspaces (id, name, agent_name, accent_color, position, greeting_message, allowed_domains)
      VALUES ('01a0ecb4-78d1-71ff-aa11-1d673314e5df', 'Default Workspace', 'Gaurav Desk Agent', '#2563eb', 'bottom-right', 'Hi there! How can we help you today?', ARRAY['example.com', 'localhost:3000']);
    `
    console.log("Inserted default workspace: 01a0ecb4-78d1-71ff-aa11-1d673314e5df")
  } else {
    console.log("Existing workspace found:", existing[0].id)
  }
}

init()
  .then(() => {
    console.log("Database initialized successfully!")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Database migration error:", err)
    process.exit(1)
  })
