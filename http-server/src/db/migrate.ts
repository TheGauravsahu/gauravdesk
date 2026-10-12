import { sql } from "./index.js";

export async function initDb() {
  console.log("Checking Neon database tables & extensions...");
  try {
    // 1. Enable pgvector
    try {
      await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
      console.log("pgvector extension verified.");
    } catch (err: any) {
      console.warn("pgvector extension notice:", err?.message);
    }

    // 2. Ensure schema tables exist (workspaces, knowledge_documents, document_chunks, conversations, messages)
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
        allowed_domains TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
        agent_enabled BOOLEAN NOT NULL DEFAULT true,
        avatar_key TEXT,
        avatar_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS knowledge_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        extracted_text TEXT,
        status TEXT NOT NULL DEFAULT 'indexed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS document_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        chunk_index INTEGER NOT NULL DEFAULT 0,
        content TEXT NOT NULL,
        embedding vector(768),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        visitor_id TEXT NOT NULL,
        customer_name TEXT NOT NULL DEFAULT 'Anonymous Visitor',
        customer_email TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        tag TEXT NOT NULL DEFAULT 'Agent',
        assigned_to TEXT,
        subject_snippet TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender TEXT NOT NULL,
        sender_name TEXT,
        text TEXT NOT NULL,
        citations JSONB DEFAULT '[]'::jsonb,
        grounding_meta JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 3. Ensure default workspace exists
    const existing = await sql`SELECT id FROM workspaces LIMIT 1;`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO workspaces (id, name, agent_name, accent_color, position, greeting_message, allowed_domains)
        VALUES ('01a0ecb4-78d1-71ff-aa11-1d673314e5df', 'Default Workspace', 'Gaurav Desk Agent', '#2563eb', 'bottom-right', 'Hi there! How can we help you today?', ARRAY['example.com', 'localhost:3000', 'localhost:4000']);
      `;
      console.log("Inserted default workspace.");
    } else {
      console.log("Found workspace:", existing[0].id);
    }
    console.log("Neon database schema and tables ready!");
  } catch (dbErr: any) {
    console.error("Database initialization failed:", dbErr?.message || dbErr);
    throw dbErr;
  }
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  initDb()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
