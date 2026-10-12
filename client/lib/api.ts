import axios from "axios"

const BACKEND_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Workspace API
export const workspaceApi = {
  get: async (summary = false) => {
    const res = await api.get(`/api/workspace${summary ? "?summary=1" : ""}`)
    return res.data
  },
  getById: async (id: string) => {
    const res = await api.get(`/api/workspace/${id}`)
    return res.data
  },
  update: async (data: any) => {
    const res = await api.put("/api/workspace", data)
    return res.data
  },
}

// Knowledge Base API
export const knowledgeApi = {
  get: async (workspaceId?: string) => {
    const res = await api.get(
      `/api/knowledge${workspaceId ? `?workspaceId=${workspaceId}` : ""}`
    )
    return res.data
  },
  upload: async (formData: FormData) => {
    const res = await api.post("/api/knowledge", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },
  refreshQuestions: async (workspaceId?: string) => {
    const res = await api.post(
      `/api/knowledge/refresh-questions${workspaceId ? `?workspaceId=${workspaceId}` : ""}`
    )
    return res.data
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/knowledge?id=${id}`)
    return res.data
  },
}

// Chat API
export const chatApi = {
  getMessages: async (conversationId: string) => {
    const res = await api.get(`/api/chat?conversationId=${conversationId}`)
    return res.data
  },
  sendMessage: async (payload: {
    workspaceId?: string
    visitorId?: string
    message: string
    conversationId?: string | null
    metadata?: Record<string, any>
  }) => {
    const res = await api.post("/api/chat", payload)
    return res.data
  },
}

// Conversations API
export const conversationsApi = {
  getAll: async (workspaceId?: string) => {
    const res = await api.get(
      `/api/conversations${workspaceId ? `?workspaceId=${workspaceId}` : ""}`
    )
    return res.data
  },
  reply: async (payload: {
    conversationId: string
    replyText: string
    operatorName?: string
  }) => {
    const res = await api.post("/api/conversations", payload)
    return res.data
  },
  updateStatus: async (payload: {
    conversationId: string
    status: "open" | "waiting" | "closed"
  }) => {
    const res = await api.patch("/api/conversations", payload)
    return res.data
  },
}

// Avatar API
export const avatarApi = {
  upload: async (formData: FormData) => {
    const res = await api.post("/api/avatar/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  },
  delete: async (workspaceId?: string) => {
    const res = await api.delete(
      `/api/avatar/upload${workspaceId ? `?workspaceId=${workspaceId}` : ""}`
    )
    return res.data
  },
}
