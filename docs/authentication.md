# Authentication Architecture & Guide: GauravDesk

**Platform:** GauravDesk  
**Engine:** Neon Auth (Managed Better Auth) via `@neondatabase/auth`  
**Framework:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Shadcn UI  

---

## 1. Overview

GauravDesk uses **Neon Auth** (Managed Better Auth) for operator and administrator authentication. All credentials, OAuth links, verification tokens, and session records are stored directly in the `neon_auth` schema on your Neon PostgreSQL database branch, ensuring that authentication state branches seamlessly alongside your database data.

### Supported Primitives
* **Google OAuth:** One-click social sign-in with automatic account linking when the verified Google email matches an existing user.
* **Email & Password:** Standard account creation and credential sign-in with client-side validation.
* **Magic Links:** Passwordless authentication using Neon Auth's managed transactional mailer (`authClient.signIn.magicLink`), requiring zero third-party email integrations during development.
* **Session Persistence:** HTTP-only secure cookie sessions with client-side reactive hooks (`authClient.getSession()`).

---

## 2. Directory Structure

```
├── neon.ts                     # Neon infrastructure config (auth: true)
├── lib/
│   ├── auth/
│   │   ├── client.ts           # Client-side authClient (createAuthClient)
│   │   └── server.ts           # Server-side auth helper (createNeonAuth)
│   └── utils.ts                # Tailwind/shadcn utility (cn)
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...path]/
│   │           └── route.ts    # Catch-all API proxy route ({ GET, POST, PUT, DELETE, PATCH })
│   ├── login/
│   │   └── page.tsx            # Split-screen (login-02) sign-in page
│   ├── signup/
│   │   └── page.tsx            # Split-screen (login-02) operator registration
│   └── dashboard/
│       └── page.tsx            # Operator dashboard (dashboard-01) with active session state
└── components/
    ├── login-form.tsx          # Dual-mode (password / magic-link) auth form + Google OAuth
    ├── app-sidebar.tsx         # Dashboard sidebar with operator profile & logout
    └── LandingPage.tsx         # Full-bleed landing page with dynamic auth profile dropdown
```

---

## 3. Core Implementation Details

### A. Infrastructure Configuration (`neon.ts`)
```ts
import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
});
```

### B. Server-Side Client (`lib/auth/server.ts`)
```ts
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || "https://auth.myneon.app",
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "dev-secret-key-for-neon-auth-min-32-chars-long",
  },
});
```

### C. Client-Side Client (`lib/auth/client.ts`)
```ts
"use client";

import { createAuthClient } from "@neondatabase/auth/next";

export const authClient = createAuthClient();
```

### D. Next.js API Catch-All Route (`app/api/auth/[...path]/route.ts`)
```ts
import { auth } from "@/lib/auth/server";

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
```

---

## 4. UI & User Experience

### Split-Pane Layout (`login-02`)
Both `/login` and `/signup` follow the modern `login-02` split layout:
* **Left Column:** Clean authentication form using Shadcn UI primitives (`Field`, `Input`, `Button`, `FieldSeparator`) with tabs to alternate between Password and Magic Link modes.
* **Right Column:** High-contrast visual panel showcasing GauravDesk's AI support simulation, knowledge citations, and deflection metrics.
* **Seamless Navigation:** Every internal link uses Next.js `Link` (`next/link`) to ensure fast, client-side transitions without full browser reloads.

### Dynamic Landing Page Header
* **Unauthenticated:** Renders the pill-style `Sign in` button linking to `/login`.
* **Authenticated:** Renders the operator's profile badge with a Shadcn `DropdownMenu` containing:
  * Operator name and email
  * Quick link to `/dashboard`
  * One-click `Sign out` action calling `authClient.signOut()`

---

## 5. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Neon Auth Base URL (obtained via neon env pull or Neon console)
NEON_AUTH_BASE_URL="https://auth.myneon.app"

# Application cookie encryption secret (minimum 32 characters)
NEON_AUTH_COOKIE_SECRET="your-32-char-random-secret-key-goes-here"

# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@ep-development.us-east-2.aws.neon.tech/neondb?sslmode=require"
```
