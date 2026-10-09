export interface Message {
  id: string
  sender: "customer" | "ai" | "operator" | "system"
  senderName: string
  senderAvatar?: string
  text: string
  translatedText?: string
  originalLanguage?: string
  timestamp: string
  seen?: string
  source?: string
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
  customerEmail: string
  customerAvatar?: string
  customerAvatarBg?: string
  subjectSnippet: string
  status: "open" | "closed" | "snoozed"
  lastActivity: string
  tag?: string
  language?: string
  isAutoTranslating?: boolean
  assignedTo?: string
  messages: Message[]
  copilot: CopilotData
}
