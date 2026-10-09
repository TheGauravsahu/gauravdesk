import { GoogleGenAI, type GenerateContentConfig } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY || ""

// Initialize client only when key is present
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

const GENERATION_MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash"]
const EMBEDDING_MODELS = ["gemini-embedding-001", "gemini-embedding-2"]

export class GeminiConfigurationError extends Error {
  constructor() {
    super("AI support is not configured. Set GEMINI_API_KEY to enable AI responses.")
    this.name = "GeminiConfigurationError"
  }
}

async function generateWithFallback(params: {
  contents: string
  config?: GenerateContentConfig
}) {
  if (!ai || !apiKey) throw new GeminiConfigurationError()

  let lastError: unknown
  for (const model of GENERATION_MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      })
      return res
    } catch (err) {
      lastError = err
      continue
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini text generation failed")
}

export async function generateSuggestedQuestionsFromKnowledge(
  sources: ReadonlyArray<{
    filename?: string
    extracted_text?: string | null
  }>
): Promise<string[]> {
  const excerpts: string[] = []
  let remainingCharacters = 24_000

  for (const source of sources) {
    if (remainingCharacters <= 0) break
    const text = source.extracted_text?.trim()
    if (!text) continue

    const excerpt = text.slice(0, Math.min(4_000, remainingCharacters))
    excerpts.push(`[${source.filename || "Support document"}]\n${excerpt}`)
    remainingCharacters -= excerpt.length
  }

  if (excerpts.length === 0) return []

  const response = await generateWithFallback({
    contents: `Create up to four concise questions that a customer might ask, using only information explicitly present in these support documents. Each question must be answerable from the documents. Do not invent product details or include questions that the documents cannot answer. Return only a JSON array of strings.\n\n${excerpts.join("\n\n---\n\n")}`,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  })

  const responseText = response.text?.trim()
  if (!responseText) {
    throw new Error("AI provider returned no suggested questions")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(responseText)
  } catch {
    throw new Error("AI provider returned invalid suggested-question JSON")
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI provider returned an invalid suggested-question list")
  }

  const questions = Array.from(
    new Set(
      parsed
        .filter((question): question is string => typeof question === "string")
        .map((question) => question.trim())
        .filter(
          (question) =>
            question.length >= 12 &&
            question.length <= 120 &&
            question.endsWith("?")
        )
    )
  ).slice(0, 4)

  if (questions.length === 0) {
    throw new Error("AI provider could not generate valid suggested questions")
  }

  return questions
}

/**
 * Generates dense vector embeddings using supported Gemini models (768-dim).
 * Produces 768-dimensional vectors suitable for pgvector.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text || !text.trim()) return null

  if (!ai || !apiKey) {
    throw new GeminiConfigurationError()
  }

  let lastError: unknown
  try {
    for (const model of EMBEDDING_MODELS) {
      try {
        const response = await ai.models.embedContent({
          model,
          contents: text.slice(0, 8000), // Max embedding input token limit safety
          config: {
            outputDimensionality: 768,
          },
        })

        const values = response?.embeddings?.[0]?.values
        if (values && Array.isArray(values) && values.length === 768) {
          return values
        }
        lastError = new Error(`Embedding model ${model} returned an invalid vector dimension`)
      } catch (error) {
        lastError = error
        continue
      }
    }
  } catch (error) {
    lastError = error
  }

  console.error("[Gemini AI] Embedding generation failed:", lastError)
  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to generate a document embedding")
}

/**
 * Fast First-Line Guardrail & Intent Classifier (Sub-millisecond target).
 * Categorizes incoming visitor queries to prevent burning heavy RAG tokens.
 */
export async function classifyIntent(
  userMessage: string,
  agentName = "Gaurav Desk"
): Promise<{ intent: "SUPPORT" | "OFF_TOPIC" | "ESCALATE"; reason: string }> {
  const lower = userMessage.toLowerCase().trim()

  // 1. Immediate deterministic checks for explicit human handoff requests
  if (
    /\b(human|agent|representative|talk to someone|real person|operator|speak with someone|supervisor|support person|customer care)\b/i.test(lower)
  ) {
    return {
      intent: "ESCALATE",
      reason: "Visitor explicitly requested a human support agent.",
    }
  }

  // 2. Immediate deterministic checks for off-topic requests
  if (
    /\b(write a poem|write code|python script|solve math|solve equation|homework|tell a joke|tell me a story|weather today)\b/i.test(lower)
  ) {
    return {
      intent: "OFF_TOPIC",
      reason: "General chat or homework request detected.",
    }
  }

  return { intent: "SUPPORT", reason: "Classified as customer support query." }
}

/**
 * Grounded Answer Generator:
 * Enforces strict zero-hallucination answers synthesized exclusively from retrieved knowledge chunks.
 */
export async function generateGroundedAnswer({
  query,
  contextChunks,
  agentName = "Gaurav Desk Agent",
}: {
  query: string
  contextChunks: Array<{ filename: string; content: string; similarity?: number }>
  agentName?: string
}): Promise<{
  answer: string
  citations: string[]
  groundingExplanation: string
}> {
  // If no relevant chunks retrieved
  if (!contextChunks || contextChunks.length === 0) {
    return {
      answer: `I looked through our knowledge base but couldn't find specific documentation to answer your question accurately. Would you like me to connect you with a human operator?`,
      citations: [],
      groundingExplanation: `No relevant documents found matching query "${query}". Suggested human handoff.`,
    }
  }

  const citations = Array.from(new Set(contextChunks.map((c) => c.filename)))

  try {
    const formattedContext = contextChunks
      .map(
        (chunk, idx) =>
          `[Source ${idx + 1}: ${chunk.filename}]\n${chunk.content}\n`
      )
      .join("\n---\n")

    const systemInstruction = `You are ${agentName}, an intelligent customer support assistant.
Strict Grounding Rules:
1. Answer the visitor's question ONLY using the facts present in the provided context sources below.
2. If the context does not provide sufficient facts to answer the question with certainty, politely state that you do not have that information in your knowledge base and offer to transfer them to a human team member.
3. NEVER make up external facts or assumptions.
4. Keep the tone professional, helpful, concise, and friendly.`

    const prompt = `Context Sources:
${formattedContext}

Visitor Question: "${query}"

Provide a clear, direct answer grounded in the sources above.`

    const res = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    })

    const answer = res.text?.trim()
    if (!answer) throw new Error("The AI provider returned an empty answer")

    return {
      answer,
      citations,
      groundingExplanation: `Synthesized from ${citations.join(", ")} using Gemini Flash with grounded context.`,
    }
  } catch (error) {
    console.error("[Gemini AI] Grounded answer generation error:", error)
    throw error
  }
}
