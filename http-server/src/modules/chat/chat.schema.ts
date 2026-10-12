import { z } from "zod"

export const sendMessageSchema = z.object({
  workspaceId: z.string().optional(),
  visitorId: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  conversationId: z.string().nullable().optional(),
  metadata: z.record(z.any()).optional(),
})

export type SendMessageDto = z.infer<typeof sendMessageSchema>
