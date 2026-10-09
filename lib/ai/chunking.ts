/**
 * Intelligent semantic chunking engine.
 * Splits raw document text into overlapping chunks suitable for embedding models (e.g. text-embedding-004).
 */

export interface TextChunk {
  index: number
  content: string
  charCount: number
}

export function chunkText(
  text: string,
  targetChunkChars = 1200,
  overlapChars = 200
): TextChunk[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  const cleanText = text.replace(/\r\n/g, "\n").trim()

  // If text is small enough, return as single chunk
  if (cleanText.length <= targetChunkChars) {
    return [
      {
        index: 0,
        content: cleanText,
        charCount: cleanText.length,
      },
    ]
  }

  // Split by double line breaks (paragraphs) or single lines
  const paragraphs = cleanText.split(/\n\n+/)
  const chunks: TextChunk[] = []
  let currentChunk = ""
  let chunkIndex = 0

  for (const para of paragraphs) {
    const trimmedPara = para.trim()
    if (!trimmedPara) continue

    // If adding this paragraph exceeds targetChunkChars, finalize current chunk
    if (currentChunk.length + trimmedPara.length > targetChunkChars && currentChunk.length > 0) {
      chunks.push({
        index: chunkIndex++,
        content: currentChunk.trim(),
        charCount: currentChunk.length,
      })

      // Preserve trailing overlapChars for semantic continuity
      const overlapStart = Math.max(0, currentChunk.length - overlapChars)
      currentChunk = currentChunk.slice(overlapStart) + "\n\n" + trimmedPara
    } else {
      currentChunk = currentChunk
        ? currentChunk + "\n\n" + trimmedPara
        : trimmedPara
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      index: chunkIndex++,
      content: currentChunk.trim(),
      charCount: currentChunk.length,
    })
  }

  return chunks
}
