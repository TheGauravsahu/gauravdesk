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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
              "style-src 'self' 'unsafe-inline' https: fonts.googleapis.com",
              "font-src 'self' data: https: fonts.gstatic.com cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https: http://localhost:4000 http://127.0.0.1:4000",
              "media-src 'self' data: blob: https:",
              "connect-src 'self' http://localhost:4000 ws://localhost:4000 http://127.0.0.1:4000 ws://127.0.0.1:4000 https: wss:",
              "frame-src 'self' https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return [
      {
        source: "/api/workspace/:path*",
        destination: `${backendUrl}/api/workspace/:path*`,
      },
      {
        source: "/api/workspace",
        destination: `${backendUrl}/api/workspace`,
      },
      {
        source: "/api/knowledge/:path*",
        destination: `${backendUrl}/api/knowledge/:path*`,
      },
      {
        source: "/api/knowledge",
        destination: `${backendUrl}/api/knowledge`,
      },
      {
        source: "/api/chat/:path*",
        destination: `${backendUrl}/api/chat/:path*`,
      },
      {
        source: "/api/chat",
        destination: `${backendUrl}/api/chat`,
      },
      {
        source: "/api/conversations/:path*",
        destination: `${backendUrl}/api/conversations/:path*`,
      },
      {
        source: "/api/conversations",
        destination: `${backendUrl}/api/conversations`,
      },
      {
        source: "/api/avatar/:path*",
        destination: `${backendUrl}/api/avatar/:path*`,
      },
      {
        source: "/api/avatar",
        destination: `${backendUrl}/api/avatar`,
      },
    ];
  },
};

export default nextConfig;
