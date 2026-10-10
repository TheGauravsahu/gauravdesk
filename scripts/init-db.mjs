import { neon } from "@neondatabase/serverless"

const databaseUrl =
  process.env.DATABASE_URL || ""
const sql = neon(databaseUrl)

async function init() {
  console.log("Connecting to Neon...")

  // Enable pgvector extension for high-performance vector similarity search
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`
    console.log("pgvector extension verified.")
  } catch (err) {
    console.warn("pgvector extension check note:", err.message)
  }

  // Workspaces table
  await sql`
    CREATE TABLE IF NOT EXISTS workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT,
      name TEXT NOT NULL DEFAULT 'Gaurav Desk Workspace',
      agent_name TEXT NOT NULL DEFAULT 'Gaurav Desk Agent',
      accent_color TEXT NOT NULL DEFAULT '#2563eb',
      position TEXT NOT NULL DEFAULT 'bottom-right',
      greeting_message TEXT NOT NULL DEFAULT 'Hi there! How can we help you today?',
      starter_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
      allowed_domains TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      agent_enabled BOOLEAN NOT NULL DEFAULT true,
      avatar_key TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
  await sql`
    ALTER TABLE workspaces
    ALTER COLUMN starter_questions SET DEFAULT '[]'::jsonb;
  `
  console.log("Workspaces table verified/created.")

  // Knowledge documents table
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

  // Document chunks table with 768-dim vector embeddings for Gemini text-embedding-004
  await sql`
    CREATE TABLE IF NOT EXISTS document_chunks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
      workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
      chunk_index INT NOT NULL DEFAULT 0,
      content TEXT NOT NULL,
      embedding vector(768),
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
  console.log("Document chunks table verified/created.")

  // Conversations table for visitor live sessions
  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
      visitor_id TEXT NOT NULL,
      customer_name TEXT NOT NULL DEFAULT 'Anonymous Visitor',
      customer_email TEXT,
      status TEXT NOT NULL DEFAULT 'open', -- 'open', 'waiting', 'closed'
      tag TEXT NOT NULL DEFAULT 'Agent', -- 'Agent', 'Waiting', 'You'
      assigned_to TEXT,
      subject_snippet TEXT,
      last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
  console.log("Conversations table verified/created.")

  // Messages table with grounding citations and metadata
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
      sender TEXT NOT NULL, -- 'visitor', 'agent', 'operator'
      sender_name TEXT,
      text TEXT NOT NULL,
      citations JSONB DEFAULT '[]'::jsonb,
      grounding_meta JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `
  console.log("Messages table verified/created.")

  // Seed default workspace if not present
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
