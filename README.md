# GauravDesk — AI Customer Support Grounded in Truth

> **High-trust, document-grounded customer support platform featuring a lightweight embeddable chat widget, strict guardrails, pgvector semantic search, and real-time human operator handover.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0_(Turbopack)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![Neon Postgres](https://img.shields.io/badge/Neon-Lakebase_Postgres-00E599?style=flat&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 Core Features

- **Document-Grounded RAG Pipeline**: Ingests internal PDFs, Markdown, and text documentation. Semantic chunking (~1,200 characters with 200 character overlap) and dense 768-dimensional embeddings via `gemini-embedding-001` stored in Neon `pgvector`.
- **Instant Guardrails**: First-line sub-millisecond intent classification. Deflects off-topic queries and prompt-injections without burning vector tokens or LLM generation cycles.
- **Real-Time Human Handover**: When a visitor requests human assistance or confidence is low, the conversation automatically escalates to `Waiting`. Operators can take over instantly from the inbox; visitor widgets stream live human operator messages in real-time.
- **Real Visitor Telemetry**: Captures client environment metadata (operating system, browser engine, device type, timezone, active local time, and referrer URL) and surfaces them in the Operator Inbox right sidebar.
- **Dynamic 3D Glossy Orb Avatar**: Dynamically calculated 3D spherical glossy avatar with specular highlights and depth that automatically matches the workspace's chosen accent color, with optional custom avatar uploads stored in Neon Object Storage.
- **Auto-Generated Suggested Questions**: Context-aware suggested question chips generated directly from indexed documentation upon upload, permanently persisted in Postgres for instant widget loading.
- **Embeddable Chat Widget**: Single-line `<script>` embed snippet providing isolated iframe styling, zero CSS collision, configurable placement (bottom-right / bottom-left), and responsive mobile drawer support.
- **Secure Authentication**: Neon-backed Managed Better Auth featuring email OTP code verification with Shadcn `input-otp` and session management.

---

## 🏗️ Architecture & Pipeline Flow

```mermaid
flowchart TD
    Visitor[Website Visitor] -->|Sends Message| Widget[Embeddable Widget /widget/:id]
    Widget -->|Client Metadata + Query| ChatAPI[/api/chat]
    
    ChatAPI --> Classifier{Instant Guardrail Classifier}
    
    Classifier -->|Off-topic / Abuse| CannedRefusal[Polite Decline: Support Focus Only]
    Classifier -->|Escalate: 'Talk to Human'| EscalateQueue[Tag Conversation as 'Waiting' & Alert Inbox]
    
    Classifier -->|On-topic Support Query| VectorSearch[Neon pgvector: Cosine Distance Search]
    VectorSearch --> MatchCheck{Relevant Doc Chunks Found?}
    
    MatchCheck -->|Yes: Grounded| AnswerGen[Gemini 3.8 Flash + Strict Grounding Prompt]
    MatchCheck -->|No / Ambiguous| EscalateQueue
    
    AnswerGen -->|Answer + Citations| Widget
    EscalateQueue --> OperatorInbox[Dashboard Operator Inbox /inbox]
    OperatorInbox -->|Operator Live Reply| Widget
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router with Turbopack), React 19, TypeScript 5 |
| **Database & Vectors** | Neon Lakebase Serverless Postgres with `pgvector` extension |
| **AI & Embeddings** | Google Gemini (`gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-embedding-001`) |
| **Authentication** | Better Auth with Neon Postgres adapter & email verification |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons, Sonner toasts, Shadcn UI primitives |
| **Document Ingestion** | `pdf-parse` (Uint8Array buffer parsing), semantic text chunker |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ (recommended v22+)
- pnpm 9+ (`npm install -g pnpm`)
- A [Neon](https://neon.tech) account (Postgres database with `pgvector`)
- A [Google AI Studio](https://aistudio.google.com/) Gemini API key

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/TheGauravsahu/gauravdesk.git
cd gauravdesk
pnpm install
```

### 3. Configure Environment Variables
Create `.env` in the root directory:

```env
# Neon Lakebase Postgres Connection
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"

# Better Auth Secret & Base URL
BETTER_AUTH_SECRET="your-secure-random-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database Schema
Run the initialization script to set up tables (`workspaces`, `knowledge_documents`, `document_chunks`, `conversations`, `messages`) and enable the `vector` extension:

```bash
node --env-file=.env scripts/init-db.mjs
```

### 5. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Embedding the Chat Widget

To embed GauravDesk on any website (HTML, React, Webflow, Shopify, WordPress), copy the snippet from your **Dashboard $\rightarrow$ Widget** tab:

```html
<!-- GauravDesk Embed Script -->
<script
  src="https://your-domain.com/widget.js"
  data-workspace-id="YOUR_WORKSPACE_ID"
  async
></script>
```

Or preview the standalone widget iframe at:
```text
https://your-domain.com/widget/[workspaceId]
```

---

## 📂 Project Structure

```text
├── app/
│   ├── api/
│   │   ├── auth/          # Better Auth authentication endpoints
│   │   ├── avatar/        # Agent avatar upload to object storage
│   │   ├── chat/          # RAG pipeline, guardrails, & conversation sync
│   │   ├── conversations/ # Conversation management & visitor telemetry
│   │   ├── knowledge/     # Document ingestion, PDF parsing, & chunking
│   │   └── workspace/     # Workspace appearance, colors, & suggested questions
│   ├── dashboard/         # Operator console (Customizer, Inbox, Profile)
│   ├── widget/[workspaceId]/ # Zero-bleed embeddable chat client
│   └── page.tsx           # High-converting landing page with hero video
├── components/
│   ├── dashboard/         # Chatbot customizer & widget live preview
│   ├── operator-inbox/    # Two-pane real-time human operator dashboard
│   ├── ui/                # Reusable UI primitives (3D Glossy Orb avatar, buttons)
│   └── LandingPage.tsx    # Responsive landing page layout
├── lib/
│   ├── ai/                # Gemini client, chunking engine, & intent classifier
│   ├── auth/              # Better Auth client & server configuration
│   ├── db.ts              # Neon Postgres SQL connection
│   └── dashboard-data.ts  # Database queries for workspace & documents
└── scripts/
    └── init-db.mjs        # Database migration & schema setup script
```

---

## 📄 License
MIT License © 2026 GauravDesk, Inc.
