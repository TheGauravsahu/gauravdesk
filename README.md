<div align="center">

# 🤖 GauravDesk

**High-Trust AI Customer Support Platform with Grounded RAG & Real-Time Human Escalation**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![Neon Postgres](https://img.shields.io/badge/Neon-pgvector-00e599?logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

<br /><br />

<img src="docs/image.png" alt="GauravDesk - Customer Support Grounded in Truth" width="100%" />

</div>

---

## 📖 Overview

**GauravDesk** is a customer support automation platform engineered to solve the core dilemmas of modern live chat:
* **The Hallucination Problem:** Generic AI chatbots speculate or make up false information when unsure. GauravDesk enforces **strict document grounding**, synthesizing answers exclusively from internal documents with verbatim citations.
* **The Token Burn Problem:** Attackers and non-customers flood chatbots with homework questions or jailbreak attempts. GauravDesk features a **sub-millisecond deterministic intent classifier** that politely deflects off-topic queries with **0 RAG tokens burned**.
* **The Trapped User Problem:** When the AI lacks documentation or the visitor requests a human, the conversation smoothly transitions to the **Operator Inbox** in under 3 seconds without losing chat history.

---

## ⚡ Core Capabilities

* 🎯 **Strict Knowledge Grounding:** Supports PDF, Markdown, and TXT parsing up to 10 MB, semantic chunking (~1,200 chars / 200 char overlap), and 768-dimensional vector embeddings with Neon `pgvector`.
* 🛡️ **Zero-Token Guardrails:** Deterministic regex and AI classification intercept off-topic or abusive inquiries before vector retrieval.
* 👥 **Seamless Human Takeover:** The moment an inquiry is flagged or a human is requested, the conversation enters the `Waiting` queue for live human takeover.
* 📦 **1-Line Embeddable Widget:** Isolated iframe architecture (`widget.js`) with zero CSS bleeding, window `postMessage` protocol, custom avatars, and domain whitelisting.
* 📥 **Real-Time Operator Inbox:** Dual-pane triage workspace featuring *All open*, *Waiting*, *Agent*, *You*, and *Closed* tabs, visitor device telemetry, and live composer.
* 🔐 **Enterprise Neon Auth:** Managed Better Auth with email/password, magic links, session cookies, and Google OAuth.
* ☁️ **Neon Object Storage (S3):** Native bucket storage for agent avatars and media assets.

---

## 📐 System Architecture (7 Moving Pieces)

Built using Ryan Singer's "Fewer than 10 Moving Pieces" architectural principle:

```mermaid
flowchart TD
    Visitor[Website Visitor] -->|Asks Question| Widget[Piece 1: Embed Widget]
    Widget -->|Classify Message| Classifier{Piece 4: Guardrail Classifier}
    
    Classifier -->|Off-topic / Abuse| PoliteDecline[Polite Refusal: 0 Tokens Burned]
    Classifier -->|Escalate Request| Handoff[Piece 6: Escalation Controller]
    
    Classifier -->|Support Query| RAG[Piece 3: Neon pgvector RAG]
    RAG --> Confidence{Similarity >= 0.65?}
    
    Confidence -->|Yes| GroundedGen[Piece 5: Grounded Answer + Citations]
    Confidence -->|No / Ambiguous| Handoff
    
    Handoff -->|Alerts Queue| Inbox[Piece 7: Operator Inbox]
    Inbox -->|Live Reply| HumanAgent[Piece 2: Human Takes Over]
```

| Piece | Description | Core Implementation |
| :--- | :--- | :--- |
| **1. Embeddable Widget** | Lightweight fixed iframe client with zero CSS bleed | [`public/widget.js`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/public/widget.js) & [`/widget/[workspaceId]`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/app/widget/%5BworkspaceId%5D/page.tsx) |
| **2. Real-Time Messaging Core** | Fast HTTP session sync & message event dispatch | [`app/api/chat/route.ts`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/app/api/chat/route.ts) & [`/api/conversations`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/app/api/conversations/route.ts) |
| **3. Knowledge Ingestion (RAG)** | Document parser, chunker, and Neon `pgvector` store | [`lib/ai/chunking.ts`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/lib/ai/chunking.ts) & [`app/api/knowledge/route.ts`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/app/api/knowledge/route.ts) |
| **4. Intent Classifier & Guardrails**| Sub-millisecond deflection of off-topic queries | [`lib/ai/gemini.ts`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/lib/ai/gemini.ts) (`classifyIntent`) |
| **5. Grounded Answer Generator** | Zero-hallucination synthesis with document citations | [`lib/ai/gemini.ts`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/lib/ai/gemini.ts) (`generateGroundedAnswer`) |
| **6. Escalation Controller** | Manages `Agent` $\rightarrow$ `Waiting` queue transitions | [`app/api/chat/route.ts`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/app/api/chat/route.ts#L200-L256) |
| **7. Operator Inbox & Dashboard** | Two-pane triage workspace with telemetry & takeover | [`components/operator-inbox/OperatorInbox.tsx`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/components/operator-inbox/OperatorInbox.tsx) |

---

## 🚀 Quick Start

### Prerequisites
* **Node.js:** `v20.x` or later
* **Package Manager:** `pnpm` (`v9`+)
* **Neon PostgreSQL Database:** [Neon Account](https://neon.tech/) with `pgvector`
* **Google Gemini API Key:** [Google AI Studio](https://ai.google.dev/)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/gauravdesk.git
cd gauravdesk
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Neon PostgreSQL Connection URL (Requires SSL)
DATABASE_URL="postgresql://user:password@ep-branch.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Google Gemini API Key
GEMINI_API_KEY="AIzaSy..."

# Neon Auth Configuration
NEON_AUTH_BASE_URL="https://auth.myneon.app"
NEON_AUTH_COOKIE_SECRET="dev-secret-key-for-neon-auth-min-32-chars-long"

# (Optional) Neon Object Storage / AWS S3 for Custom Avatars
AWS_ENDPOINT_URL_S3="https://s3.us-east-1.amazonaws.com"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="secret_..."
AWS_REGION="us-east-1"
NEON_OBJECT_STORAGE_BUCKET="avatars"
```

### 3. Initialize Database & Run Migrations
Run the automated initialization script to enable `vector`, create tables, and seed the default workspace:
```bash
node scripts/init-db.mjs
```

Verify your database connectivity:
```bash
node scripts/check-db.mjs
```

### 4. Launch Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application:
* **Landing Page:** [`http://localhost:3000/`](http://localhost:3000/)
* **Operator Dashboard:** [`http://localhost:3000/dashboard`](http://localhost:3000/dashboard)
* **Operator Inbox:** [`http://localhost:3000/dashboard/inbox`](http://localhost:3000/dashboard/inbox)
* **Embed Testbed:** [`http://localhost:3000/test-embed`](http://localhost:3000/test-embed)

---

## 💻 Embedding the Widget

Add GauravDesk to any external webpage by pasting this snippet right before `</body>`:

```html
<script 
  src="https://your-domain.com/widget.js" 
  data-workspace="01a0ecb4-78d1-71ff-aa11-1d673314e5df"
  data-position="bottom-right"
  async
></script>
```

### Programmatic SDK Control
Once loaded, interact with the widget directly from client-side JavaScript:
```javascript
// Open, close, or toggle the widget programmatically
window.GauravDesk.toggle();
window.GauravDesk.open();
window.GauravDesk.close();
```

---

## 📁 Project Structure

```
gauravdesk/
├── app/
│   ├── api/
│   │   ├── auth/[...path]/route.ts     # Neon Auth catch-all proxy
│   │   ├── avatar/upload/route.ts      # S3 avatar upload endpoint
│   │   ├── chat/route.ts               # Core RAG, guardrails & chat handler
│   │   ├── conversations/route.ts      # Operator inbox messaging & triage
│   │   ├── knowledge/route.ts          # Knowledge base ingestion & indexing
│   │   └── workspace/route.ts          # Widget customization & settings
│   ├── dashboard/
│   │   ├── inbox/page.tsx              # Operator Inbox route
│   │   ├── profile/page.tsx            # Operator Profile settings
│   │   └── page.tsx                    # Main Dashboard & Customizer
│   ├── login/ & signup/                # Split-screen Neon Auth pages
│   ├── test-embed/page.tsx             # Live embed simulator page
│   └── widget/[workspaceId]/           # Standalone isolated widget frame
├── components/
│   ├── dashboard/
│   │   ├── ChatbotCustomizer.tsx       # Live appearance, settings & doc manager
│   │   ├── DashboardShell.tsx          # Minimal dashboard sidebar & frame
│   │   └── WidgetPreview.tsx           # Real-time interactive widget sandbox
│   ├── operator-inbox/
│   │   ├── ConversationListPanel.tsx   # Triage queues (Waiting, Agent, You)
│   │   ├── CustomerPreviewModal.tsx    # Visitor metadata & telemetry modal
│   │   └── OperatorInbox.tsx           # Live transcript & takeover composer
│   └── ui/                             # Shadcn UI primitives
├── docs/                               # Comprehensive project documentation
├── lib/
│   ├── ai/
│   │   ├── chunking.ts                 # 1,200 char semantic chunking engine
│   │   └── gemini.ts                   # Gemini classifier, embeddings & RAG
│   ├── auth/                           # Client & server Neon Auth helpers
│   └── db.ts                           # Neon serverless SQL client
├── public/
│   └── widget.js                       # Non-blocking embeddable script
├── scripts/
│   ├── init-db.mjs                     # Database table creation & pgvector setup
│   └── check-db.mjs                    # Database health-check utility
├── PRD.md                              # Product Requirements Document
└── package.json
```

---

## 📚 Documentation Reference

For in-depth guides, explore the [`docs/`](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/README.md) directory:

* [**Documentation Hub**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/README.md) - Central table of contents
* [**Architecture & System Design**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/architecture.md) - Detailed data flows & ER diagrams
* [**Authentication Guide**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/authentication.md) - Neon Auth integration & session management
* [**RAG Pipeline & Knowledge Ingestion**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/rag-and-knowledge-base.md) - Vector embeddings & retrieval
* [**Guardrails & Intent Classification**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/guardrails-and-classification.md) - Fast-path heuristics & prompt defense
* [**Widget Integration & Customization**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/widget-integration.md) - Embedding instructions & styling options
* [**Operator Inbox & Live Takeover**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/operator-inbox.md) - Triage workflows & human handoff
* [**REST API Reference**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/api-reference.md) - Full endpoint contracts with cURL examples
* [**Deployment & Configuration**](file:///c:/Users/Ishika%20Sahu/Desktop/gauravdesk/docs/deployment-and-configuration.md) - Production rollout on Vercel

---

## 📜 Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Development** | `pnpm dev` | Starts local Next.js dev server on port 3000 |
| **Production Build** | `pnpm build` | Compiles optimized Next.js production build |
| **Production Start** | `pnpm start` | Serves production build |
| **Lint** | `pnpm lint` | Runs ESLint analysis across the project |
| **Database Migration** | `node scripts/init-db.mjs` | Applies tables and verifies pgvector extension |
| **Database Check** | `node scripts/check-db.mjs` | Verifies database connectivity and counts records |

---

## 📄 License

This project is licensed under the MIT License.
