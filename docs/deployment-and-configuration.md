# Deployment & Configuration Guide

**Platform:** GauravDesk  
**Recommended Hosts:** Vercel, Node.js VPS, Docker, or AWS  
**Database:** Neon Serverless PostgreSQL with `pgvector`

---

## 1. System Requirements & Prerequisites

* **Node.js:** `v20.x` or later
* **Package Manager:** `pnpm` (version 9 or later recommended)
* **PostgreSQL Database:** Neon Serverless PostgreSQL with the `pgvector` extension enabled
* **Google Gemini API Key:** Access to Google AI Studio with `gemini-2.0-flash` / `gemini-2.5-flash` and `gemini-embedding-001` permissions

---

## 2. Environment Variables Configuration

Create a `.env` file in the project root based on `.env.example`:

| Environment Variable | Required | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string with SSL required. | `postgresql://user:pass@ep-branch.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key for embeddings, completions, and classification. | `AIzaSy...` |
| `NEON_AUTH_BASE_URL` | Optional | Managed Better Auth endpoint provided by your Neon branch. | `https://auth.myneon.app` |
| `NEON_AUTH_COOKIE_SECRET`| Optional | Secret key used for signing session cookies (minimum 32 characters). | `openssl rand -base64 32` |
| `AWS_ENDPOINT_URL_S3` | Optional | Neon Object Storage S3-compatible API endpoint for custom avatar uploads. | `https://s3.us-east-1.amazonaws.com` |
| `AWS_ACCESS_KEY_ID` | Optional | S3 credentials access key. | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Optional | S3 credentials secret key. | `secret_...` |
| `AWS_REGION` | Optional | S3 region. | `us-east-1` |
| `NEON_OBJECT_STORAGE_BUCKET`| Optional | Bucket name for avatar uploads. | `avatars` |

---

## 3. Database Initialization & Schema Migrations

GauravDesk includes automated database initialization scripts that verify extensions, create tables, and seed the default workspace.

### A. Run Database Initialization
```bash
node scripts/init-db.mjs
```

This script automatically executes:
1. `CREATE EXTENSION IF NOT EXISTS vector;` (Enables vector similarity search)
2. Creates tables: `workspaces`, `knowledge_documents`, `document_chunks`, `conversations`, `messages`
3. Seeds the default workspace record (`01a0ecb4-78d1-71ff-aa11-1d673314e5df`)

### B. Verify Database Connectivity
```bash
node scripts/check-db.mjs
```

---

## 4. Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Run database migration
node scripts/init-db.mjs

# 3. Start local development server
pnpm dev
```

Visit [`http://localhost:3000`](http://localhost:3000) in your browser:
* **Landing Page:** [`http://localhost:3000/`](http://localhost:3000/)
* **Operator Dashboard:** [`http://localhost:3000/dashboard`](http://localhost:3000/dashboard)
* **Operator Inbox:** [`http://localhost:3000/dashboard/inbox`](http://localhost:3000/dashboard/inbox)
* **Widget Embed Test:** [`http://localhost:3000/test-embed`](http://localhost:3000/test-embed)

---

## 5. Production Deployment on Vercel

The fastest way to deploy GauravDesk is on Vercel:

1. Push your repository to GitHub or GitLab.
2. Import the repository in [Vercel](https://vercel.com/new).
3. In **Project Settings $\rightarrow$ Environment Variables**, configure:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `NEON_AUTH_BASE_URL`
   - `NEON_AUTH_COOKIE_SECRET`
   - *(Optional)* S3 Object Storage keys for custom avatars
4. Ensure the build command is `pnpm build` and the install command is `pnpm install`.
5. Deploy!
