import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || "https://auth.myneon.app",
  cookies: {
    secret:
      process.env.NEON_AUTH_COOKIE_SECRET ||
      "dev-secret-key-for-neon-auth-min-32-chars-long",
  },
});
