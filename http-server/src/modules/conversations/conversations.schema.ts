import { z } from "zod"

export const replyOperatorSchema = z.object({
  conversationId: z.string().uuid("Valid UUID is required"),
  replyText: z.string().min(1, "replyText is required"),
  operatorName: z.string().optional().default("Operator"),
})

export const patchConversationSchema = z.object({
  conversationId: z.string().uuid("Valid UUID is required"),
  status: z.enum(["open", "waiting", "closed"]).optional().default("closed"),
})

export type ReplyOperatorDto = z.infer<typeof replyOperatorSchema>
export type PatchConversationDto = z.infer<typeof patchConversationSchema>
