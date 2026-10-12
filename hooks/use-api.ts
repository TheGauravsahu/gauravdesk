import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  workspaceApi,
  knowledgeApi,
  chatApi,
  conversationsApi,
  avatarApi,
} from "@/lib/api"

// Workspace Queries & Mutations
export function useWorkspace(summary = false) {
  return useQuery({
    queryKey: ["workspace", { summary }],
    queryFn: () => workspaceApi.get(summary),
  })
}

export function useWorkspaceById(id: string) {
  return useQuery({
    queryKey: ["workspace", id],
    queryFn: () => workspaceApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => workspaceApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] })
    },
  })
}

// Knowledge Base Queries & Mutations
export function useKnowledge(workspaceId?: string) {
  return useQuery({
    queryKey: ["knowledge", workspaceId],
    queryFn: () => knowledgeApi.get(workspaceId),
  })
}

export function useUploadKnowledge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => knowledgeApi.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] })
      queryClient.invalidateQueries({ queryKey: ["workspace"] })
    },
  })
}

export function useDeleteKnowledge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] })
      queryClient.invalidateQueries({ queryKey: ["workspace"] })
    },
  })
}

// Conversations Queries & Mutations
export function useConversations(workspaceId?: string) {
  return useQuery({
    queryKey: ["conversations", workspaceId],
    queryFn: () => conversationsApi.getAll(workspaceId),
    refetchInterval: 4000, // Background polling for live sync
  })
}

export function useReplyConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      conversationId: string
      replyText: string
      operatorName?: string
    }) => conversationsApi.reply(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

export function useUpdateConversationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      conversationId: string
      status: "open" | "waiting" | "closed"
    }) => conversationsApi.updateStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

// Chat Queries & Mutations
export function useChatMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["chat", conversationId],
    queryFn: () => chatApi.getMessages(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 2500,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      workspaceId?: string
      visitorId?: string
      message: string
      conversationId?: string | null
      metadata?: Record<string, any>
    }) => chatApi.sendMessage(payload),
    onSuccess: (data) => {
      if (data?.conversationId) {
        queryClient.invalidateQueries({ queryKey: ["chat", data.conversationId] })
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

// Avatar Mutations
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => avatarApi.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] })
    },
  })
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (workspaceId?: string) => avatarApi.delete(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] })
    },
  })
}
