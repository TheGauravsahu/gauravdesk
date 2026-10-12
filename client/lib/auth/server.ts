import { createNeonAuth } from "@neondatabase/auth/next/server";

// Sanitize NEON_AUTH_BASE_URL to prevent common deployment pitfalls in Vercel
// (wrapping quotes, trailing slashes, or duplicate /api/auth paths)
const rawBaseUrl = (process.env.NEON_AUTH_BASE_URL || "")
  .trim()
  .replace(/^["']|["']$/g, "")
  .replace(/\/+$/, "")
  .replace(/\/api\/auth$/, "");

const cookieSecret = (process.env.NEON_AUTH_COOKIE_SECRET || "")
  .trim()
  .replace(/^["']|["']$/g, "");

export const auth = createNeonAuth({
  baseUrl: rawBaseUrl,
  cookies: {
    secret: cookieSecret,
  },
});
