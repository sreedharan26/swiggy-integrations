"use server";

import { askHealthQuestion, type HealthChatResponse } from "@/lib/features/health";

export async function askHealthAction(
  question: string,
  month: string,
): Promise<HealthChatResponse> {
  if (!question || question.trim().length < 3) {
    return { answer: "Please ask a more specific question!", tips: [], instamartItems: [], restaurants: [] };
  }
  return askHealthQuestion(question.trim(), month);
}
