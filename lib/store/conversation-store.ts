import { create } from "zustand"

export interface Message {
  id: string
  sender: "agent" | "visitor" | "operator"
  senderName?: string
  text: string
  citations?: string[] | { title: string }[]
  createdAt?: string
  timestamp?: string
}

export interface ConversationState {
  activeConversationId: string | null
  filter: "all" | "waiting" | "agent" | "closed" | "you"
  searchQuery: string
  isTyping: boolean
  setActiveConversationId: (id: string | null) => void
  setFilter: (filter: "all" | "waiting" | "agent" | "closed" | "you") => void
  setSearchQuery: (query: string) => void
  setIsTyping: (isTyping: boolean) => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  activeConversationId: null,
  filter: "all",
  searchQuery: "",
  isTyping: false,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsTyping: (isTyping) => set({ isTyping }),
}))
