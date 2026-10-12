import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import websocket from "@fastify/websocket";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "./config/env.js";
import { initDb } from "./db/migrate.js";
import { workspaceRoutes } from "./modules/workspace/workspace.routes.js";
import { knowledgeRoutes } from "./modules/knowledge/knowledge.routes.js";
import { chatRoutes } from "./modules/chat/chat.routes.js";
import { conversationRoutes } from "./modules/conversations/conversations.routes.js";
import { avatarRoutes } from "./modules/avatar/avatar.routes.js";
import { websocketRoutes } from "./websocket/routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildServer() {
  const server = Fastify({
    logger: {
      level: config.nodeEnv === "development" ? "info" : "warn",
    },
    bodyLimit: 15 * 1024 * 1024, // 15 MB for uploads
  });

  // 1. Register CORS for client frontend communication and embedded widgets
  await server.register(cors, {
    origin: (origin, cb) => {
      // Dynamically echo back the request origin to allow credentials (cookies/auth)
      // and support any domain embedding the chat widget or frontend
      cb(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
      "baggage",
      "sentry-trace",
    ],
    exposedHeaders: ["Set-Cookie"],
    preflight: true,
    strictPreflight: false,
  });

  // 2. Register Multipart for document and image uploads
  await server.register(multipart, {
    limits: {
      fileSize: 15 * 1024 * 1024,
    },
  });

  // 3. Register WebSockets
  await server.register(websocket);

  // 4. Register Swagger OpenAPI Specification
  await server.register(swagger, {
    openapi: {
      info: {
        title: "GauravDesk API Specification",
        description:
          "Fastify high-performance REST and WebSocket API powering GauravDesk AI support assistant, Neon Lakebase pgvector RAG pipeline, and Operator live chat.",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: "Local Fastify Server",
        },
      ],
      tags: [
        {
          name: "Workspace",
          description: "Workspace customization & branding",
        },
        {
          name: "Knowledge Base",
          description: "Document ingestion, chunking, and vector search",
        },
        {
          name: "Chat",
          description: "Visitor messaging & Gemini AI grounded generation",
        },
        {
          name: "Conversations",
          description: "Operator inbox, live takeover & state updates",
        },
        { name: "Avatar", description: "Chatbot avatar upload and storage" },
      ],
    },
  });

  // 5. Register Swagger UI Documentation explorer
  await server.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  // 6. Serve static files (Testing index.html)
  const publicDir = path.join(__dirname, "..", "public");
  await server.register(fastifyStatic, {
    root: publicDir,
    prefix: "/",
  });

  // 7. Register Feature Modules
  await server.register(workspaceRoutes);
  await server.register(knowledgeRoutes);
  await server.register(chatRoutes);
  await server.register(conversationRoutes);
  await server.register(avatarRoutes);
  await server.register(websocketRoutes);

  // Root health check endpoint
  server.get("/health", async () => {
    return { status: "healthy", timestamp: new Date().toISOString() };
  });

  return server;
}

async function start() {
  try {
    // Run database migrations and Better Auth table setup before accepting requests
    await initDb();

    const server = await buildServer();
    await server.listen({ port: config.port, host: config.host });
    console.log(
      `🚀 GauravDesk Fastify Server running on http://${config.host}:${config.port}`,
    );
    console.log(
      `📖 Swagger API Docs available at http://${config.host}:${config.port}/docs`,
    );
    console.log(
      `🌐 Embed Test Page available at http://${config.host}:${config.port}/index.html`,
    );
  } catch (err) {
    console.error("Failed to start Fastify server:", err);
    process.exit(1);
  }
}

start();
