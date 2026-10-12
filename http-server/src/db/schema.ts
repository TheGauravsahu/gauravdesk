import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  customType,
} from "drizzle-orm/pg-core"

// Define pgvector custom type for 768-dimensional embeddings
export const vector768 = customType<{
  data: number[]
  driverData: string
}>({
  dataType() {
    return "vector(768)"
  },
  toDriver(val: number[]): string {
    return `[${val.join(",")}]`
  },
  fromDriver(val: string): number[] {
    if (!val) return []
    try {
      const trimmed = val.replace(/^\[/, "").replace(/\]$/, "")
      return trimmed ? trimmed.split(",").map(Number) : []
    } catch {
      return []
    }
  },
})

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull().default("Gaurav Desk Workspace"),
  agentName: text("agent_name").notNull().default("Gaurav Desk Agent"),
  accentColor: text("accent_color").notNull().default("#2563eb"),
  position: text("position").notNull().default("bottom-right"),
  greetingMessage: text("greeting_message")
    .notNull()
    .default("Hi there! How can we help you today?"),
  starterQuestions: jsonb("starter_questions").notNull().default([]),
  allowedDomains: text("allowed_domains").array().notNull().default([]),
  agentEnabled: boolean("agent_enabled").notNull().default(true),
  avatarKey: text("avatar_key"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  extractedText: text("extracted_text"),
  status: text("status").notNull().default("indexed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .references(() => knowledgeDocuments.id, { onDelete: "cascade" })
    .notNull(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  chunkIndex: integer("chunk_index").notNull().default(0),
  content: text("content").notNull(),
  embedding: vector768("embedding"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  visitorId: text("visitor_id").notNull(),
  customerName: text("customer_name").notNull().default("Anonymous Visitor"),
  customerEmail: text("customer_email"),
  status: text("status").notNull().default("open"), // 'open', 'waiting', 'closed'
  tag: text("tag").notNull().default("Agent"), // 'Agent', 'Waiting', 'You'
  assignedTo: text("assigned_to"),
  subjectSnippet: text("subject_snippet"),
  metadata: jsonb("metadata").default({}),
  lastActivity: timestamp("last_activity", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  sender: text("sender").notNull(), // 'visitor', 'agent', 'operator'
  senderName: text("sender_name"),
  text: text("text").notNull(),
  citations: jsonb("citations").default([]),
  groundingMeta: jsonb("grounding_meta").default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
