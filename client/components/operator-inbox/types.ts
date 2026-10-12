export interface Message {
  id: string
  sender: "visitor" | "agent" | "operator" | "system"
  senderName?: string
  senderAvatar?: string
  text: string
  translatedText?: string
  originalLanguage?: string
  timestamp: string
  seen?: string
  source?: string
  citations?: Array<string | { title?: string; documentId?: string; snippet?: string }>
  groundingMeta?: Record<string, unknown>
}

export interface CopilotData {
  summary: string
  linkedSource?: {
    type: "linear" | "shopify" | "knowledge_base" | "zendesk"
    label: string
    url?: string
  }
  draftReply: {
    text: string
    sourcesCount: number
  }
  followUps?: Array<{
    id: string
    label: string
    completed?: boolean
  }>
  contextQueryLog?: string
}

export interface Conversation {
  id: string
  customerName: string
  customerEmail: string | null
  customerAvatar?: string
  customerAvatarBg?: string
  subjectSnippet: string
  status: "open" | "waiting" | "closed"
  lastActivity: string
  tag?: string
  language?: string
  isAutoTranslating?: boolean
  assignedTo?: string
  metadata?: Record<string, unknown>
  messages: Message[]
  copilot: CopilotData
}
