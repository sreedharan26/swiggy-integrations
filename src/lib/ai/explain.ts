import { generateText } from "ai";
import { cached } from "@/lib/cache";
import { getModel, hasAI } from "./provider";

/**
 * Generate a short, friendly one-liner from data we already have (pattern 3:
 * data -> language). Falls back to a provided default string when no AI key is
 * configured, and caches by key so it costs at most one call.
 */
export async function shortText(
  cacheKey: string,
  system: string,
  prompt: string,
  fallback: string
): Promise<string> {
  return cached(`text:${cacheKey}`, 60 * 60, async () => {
    if (!hasAI) return fallback;
    try {
      const { text } = await generateText({
        model: getModel(),
        system,
        prompt,
      });
      return text.trim() || fallback;
    } catch {
      return fallback;
    }
  });
}
