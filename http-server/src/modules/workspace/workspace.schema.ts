import { z } from "zod"

export const updateWorkspaceSchema = z.object({
  agentName: z.string().optional(),
  accentColor: z.string().optional(),
  position: z.enum(["bottom-left", "bottom-right"]).optional(),
  greetingMessage: z.string().optional(),
  starterQuestions: z.array(z.string()).optional(),
  allowedDomains: z.array(z.string()).optional(),
  agentEnabled: z.boolean().optional(),
  avatarUrl: z.string().nullable().optional(),
})

export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>
