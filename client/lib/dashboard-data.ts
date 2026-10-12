import type { Conversation } from "@/components/operator-inbox/types"

export interface KnowledgeDocItem {
  id: string
  filename: string
  fileSize: number
  fileType: string
  status: string
  createdAt: string
}

export interface WorkspaceInitialData {
  id: string
  name: string
  agentName: string
  accentColor: string
  position: "bottom-left" | "bottom-right"
  greetingMessage: string
  starterQuestions: string[]
  allowedDomains: string[]
  agentEnabled: boolean
  avatarUrl: string | null
  avatarKey: string | null
}

export interface DashboardInitialData {
  workspace: WorkspaceInitialData | null
  documents: KnowledgeDocItem[]
  suggestedQuestions: string[]
  conversations: Conversation[]
  waitingCount: number
}

import axios from "axios"

const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"

export async function getDashboardInitialData(): Promise<DashboardInitialData> {
  try {
    const [wsRes, knowRes, convRes] = await Promise.all([
      axios.get(`${BACKEND_URL}/api/workspace`, { timeout: 5000 }).catch(() => null),
      axios.get(`${BACKEND_URL}/api/knowledge`, { timeout: 5000 }).catch(() => null),
      axios.get(`${BACKEND_URL}/api/conversations`, { timeout: 5000 }).catch(() => null),
    ])

    const workspaceData = wsRes?.data || null
    const knowData = knowRes?.data || { documents: [], suggestedQuestions: [] }
    const convData = convRes?.data || { conversations: [] }

    const conversations = convData.conversations || []
    const waitingCount = conversations.filter((c: Conversation) => c.tag === "Waiting").length

    return {
      workspace: workspaceData,
      documents: knowData.documents || [],
      suggestedQuestions: knowData.suggestedQuestions || [],
      conversations,
      waitingCount,
    }
  } catch (error) {
    console.error("Failed to fetch initial dashboard data from Fastify backend:", error)
    return {
      workspace: null,
      documents: [],
      suggestedQuestions: [],
      conversations: [],
      waitingCount: 0,
    }
  }
}
