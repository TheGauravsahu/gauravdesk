/**
 * Generates DiceBear avatar URLs with various stylistic seeds.
 * Default collection: notionists-neutral, bottts-neutral, or adventurer-neutral.
 */
export function getDiceBearAvatar(
  seed: string,
  style: "notionists-neutral" | "bottts-neutral" | "thumbs" | "initials" = "notionists-neutral"
): string {
  const safeSeed = encodeURIComponent(seed?.trim() || "anonymous")
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${safeSeed}`
}
