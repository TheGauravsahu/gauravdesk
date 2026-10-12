# GauravDesk — Full Architecture & API Documentation

## 1. Overview & Separation of Concerns

GauravDesk has been refactored into a clean, decoupled architecture:
1. **Backend Service (`http-server/`)**: Dedicated high-performance **Fastify** server handling business logic, database queries, vector similarity search, AI pipelines, WebSocket events, and OpenAPI/Swagger documentation.
2. **Frontend Client (`client/`)**: Modern **Next.js** application utilizing **React 19, Tailwind CSS, Shadcn UI, Zustand, TanStack React Query, and React Hook Form**, proxying `/api/*` requests to the Fastify backend.
3. **Embeddable Chatbot (`client/public/widget.js` & `http-server/public/index.html`)**: Lightweight JavaScript embedder and isolated test website for third-party embedding with zero layout shift or styling conflicts.

---

## 2. Backend Layered Architecture (`http-server/`)

The backend is organized cleanly into modular, maintainable layers:

```
http-server/
├── public/
│   └── index.html               # Embeddable chatbot verification test page
├── src/
│   ├── config/
│   │   └── env.ts               # Type-safe environment variables and config loader
│   ├── db/
│   │   ├── index.ts             # Neon Serverless Postgres client & Drizzle ORM instance
│   │   ├── schema.ts            # Drizzle schemas with 768-dim pgvector custom type
│   │   └── migrate.ts           # Schema migrations and database bootstrapping
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.service.ts  # Better Auth authentication configuration
│   │   │   └── auth.routes.ts   # Better Auth HTTP endpoint handlers
│   │   ├── workspace/
│   │   │   ├── workspace.schema.ts      # Zod validation schemas
│   │   │   ├── workspace.service.ts     # Business logic & Neon DB operations
│   │   │   ├── workspace.controller.ts  # Request/response controller
│   │   │   └── workspace.routes.ts      # Fastify routes & Swagger OpenAPI schemas
│   │   ├── knowledge/
│   │   │   ├── chunking.ts              # Semantic text chunking engine
│   │   │   ├── gemini.service.ts        # Gemini AI embeddings (768-dim) & intent classifier
│   │   │   ├── knowledge.service.ts     # Document parsing (PDF/MD/TXT) & vector storage
│   │   │   ├── knowledge.controller.ts  # File upload and management controller
│   │   │   └── knowledge.routes.ts      # Fastify routes & Swagger documentation
│   │   ├── chat/
│   │   │   ├── chat.schema.ts           # Zod chat message validation
│   │   │   ├── chat.service.ts          # Intent guardrails, RAG retrieval & answer generation
│   │   │   ├── chat.controller.ts       # Chat controller
│   │   │   └── chat.routes.ts           # Fastify routes & Swagger documentation
│   │   ├── conversations/
│   │   │   ├── conversations.schema.ts  # Zod operator reply & status update schemas
│   │   │   ├── conversations.service.ts # Operator inbox queries, takeover & resolution
│   │   │   ├── conversations.controller.ts # Conversation controller
│   │   │   └── conversations.routes.ts  # Fastify routes & Swagger documentation
│   │   └── avatar/
│   │       ├── avatar.service.ts        # AWS S3 / Neon Object Storage avatar handling
│   │       ├── avatar.controller.ts     # Avatar upload/delete controller
│   │       └── avatar.routes.ts         # Fastify routes & Swagger documentation
│   ├── websocket/
│   │   ├── gateway.ts                   # WebSocket client registry & broadcast manager
│   │   └── routes.ts                    # Fastify WebSocket /ws connection handler
│   └── index.ts                         # Fastify server entry point & plugin registration
├── package.json
└── tsconfig.json
```

---

## 3. Real-Time WebSocket Gateway (`/ws`)

The server exposes a native WebSocket endpoint at `ws://localhost:4000/ws` supporting bi-directional communication between visitors and operators:
- **Query Params**:
  - `workspaceId`: Workspace UUID to scope events.
  - `conversationId`: Active chat thread UUID.
  - `role`: `visitor` | `operator`.
- **Broadcast Events**:
  - `message:new`: Dispatched whenever a visitor, agent, or operator posts a message.
  - `conversation:updated`: Dispatched when metadata or snippets are modified.
  - `conversation:status_changed`: Dispatched when tickets transition between `open`, `waiting`, or `closed`.

---

## 4. Swagger OpenAPI Documentation

The backend includes interactive Swagger UI and OpenAPI documentation at:
- **Swagger UI Interactive Explorer**: `http://localhost:4000/docs`
- **OpenAPI JSON Specification**: `http://localhost:4000/docs/json`

### Endpoints Overview

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/api/workspace` | Get workspace branding, questions, and settings |
| `GET` | `/api/workspace/:id` | Get specific workspace details |
| `PUT` | `/api/workspace` | Update workspace configuration |
| `GET` | `/api/knowledge` | Fetch indexed documents and suggested questions |
| `POST` | `/api/knowledge` | Upload PDF/Markdown/Text for chunking and vector embedding |
| `DELETE` | `/api/knowledge` | Delete knowledge document and associated vectors |
| `GET` | `/api/chat` | Get message history for a conversation |
| `POST` | `/api/chat` | Send visitor message to AI agent (with guardrails & vector RAG) |
| `GET` | `/api/conversations` | Get all conversations categorized for Operator Inbox |
| `POST` | `/api/conversations` | Post operator response |
| `PATCH` | `/api/conversations` | Update conversation state (`open`, `waiting`, `closed`) |
| `POST` | `/api/avatar/upload` | Upload chatbot avatar image |
| `DELETE` | `/api/avatar/upload` | Remove chatbot avatar |
| `GET` | `/ws` | Real-time WebSocket connection |

---

## 5. Embeddable Chatbot Testing Site (`/index.html`)

A standalone test page is provided at:
- **URL**: `http://localhost:4000/index.html`

### Features:
1. **Live Status Indicators**: Displays real-time status for the Fastify API, current Workspace, active AI agent name, and WebSocket connection.
2. **SDK Interactive Controls**: Buttons to trigger `window.GauravDesk.toggle()`, `open()`, and `close()`.
3. **Embed Code Generator**: Dynamically presents the `<script>` tag snippet configured with the active workspace UUID.
4. **Isolated Iframe Integration**: Simulates embedding on third-party websites without parent CSS bleeding.

---

## 6. Running the Stack

### Fastify Backend (`http-server/`):
```bash
cd http-server
pnpm run dev
```
- Server: `http://localhost:4000`
- Swagger UI: `http://localhost:4000/docs`
- Embed Test Page: `http://localhost:4000/index.html`

### Frontend Client (`client/`):
```bash
cd client
pnpm run dev
```
- Client App: `http://localhost:3000`
- Proxies `/api/*` to `http://localhost:4000/api/*` via Next.js rewrites.
