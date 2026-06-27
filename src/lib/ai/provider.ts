import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

/**
 * Swappable AI provider.
 *
 * Default: Google Gemini Flash (cheap, fast, generous free tier).
 * To swap providers later, add a branch here and change AI_PROVIDER - no
 * feature code changes.
 *
 * `hasAI` is false when no key is configured. Every AI feature has a
 * deterministic fallback, so the app fully works without a key (and costs ₹0
 * during development).
 */
export const hasAI = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

const MODEL_ID = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export function getModel(): LanguageModel {
  const provider = process.env.AI_PROVIDER ?? "gemini";
  if (provider !== "gemini") {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  return google(MODEL_ID);
}
