import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Disable experimental caching features that cause deadlocks and panics on Windows */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
