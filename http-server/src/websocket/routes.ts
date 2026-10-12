import type { FastifyPluginAsync } from "fastify"
import { wsGateway } from "./gateway.js"

export const websocketRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/ws", { websocket: true }, (socket, req) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`)
    const workspaceId = url.searchParams.get("workspaceId") || undefined
    const conversationId = url.searchParams.get("conversationId") || undefined
    const role = (url.searchParams.get("role") || "visitor") as
      | "visitor"
      | "operator"

    wsGateway.addClient({
      ws: socket,
      workspaceId,
      conversationId,
      role,
    })

    socket.send(
      JSON.stringify({
        type: "connected",
        payload: { status: "ok", timestamp: new Date().toISOString() },
      })
    )

    socket.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString())
        if (data.type === "ping") {
          socket.send(JSON.stringify({ type: "pong" }))
        }
      } catch (err) {
        // ignore non-json
      }
    })
  })
}
