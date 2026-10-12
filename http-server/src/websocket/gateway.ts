import { WebSocket } from "ws"

interface ClientConnection {
  ws: WebSocket
  workspaceId?: string
  conversationId?: string
  role: "visitor" | "operator"
}

class WebSocketGateway {
  private clients: Set<ClientConnection> = new Set()

  public addClient(client: ClientConnection) {
    this.clients.add(client)
    client.ws.on("close", () => {
      this.clients.delete(client)
    })
  }

  public removeClient(client: ClientConnection) {
    this.clients.delete(client)
  }

  public broadcastToConversation(
    conversationId: string,
    event: { type: string; payload: any }
  ) {
    const payloadStr = JSON.stringify(event)
    for (const client of this.clients) {
      if (
        client.ws.readyState === WebSocket.OPEN &&
        (!client.conversationId || client.conversationId === conversationId)
      ) {
        client.ws.send(payloadStr)
      }
    }
  }

  public broadcastToWorkspace(
    workspaceId: string,
    event: { type: string; payload: any }
  ) {
    const payloadStr = JSON.stringify(event)
    for (const client of this.clients) {
      if (
        client.ws.readyState === WebSocket.OPEN &&
        (!client.workspaceId || client.workspaceId === workspaceId)
      ) {
        client.ws.send(payloadStr)
      }
    }
  }

  public broadcastAll(event: { type: string; payload: any }) {
    const payloadStr = JSON.stringify(event)
    for (const client of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payloadStr)
      }
    }
  }
}

export const wsGateway = new WebSocketGateway()
