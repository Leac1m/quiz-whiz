"use server";

import { suggestQuizCategories } from "@/ai/flows/suggest-quiz-categories";
import { z } from "zod";

const SuggestCategoriesActionStateSchema = z.object({
  suggestions: z.array(z.string()).optional(),
  error: z.string().optional(),
});

type SuggestCategoriesActionState = z.infer<
  typeof SuggestCategoriesActionStateSchema
>;

export async function suggestCategoriesAction(
  topic: string,
  currentCategories: string[]
): Promise<SuggestCategoriesActionState> {
  if (!topic) {
    return { error: "Please provide a quiz topic to get suggestions." };
  }

  try {
    const result = await suggestQuizCategories({
      quizTopic: topic,
      currentCategories: currentCategories,
    });
    return { suggestions: result.suggestedCategories };
  } catch (e: any) {
    console.error(e);
    return {
      error: e.message || "An unexpected error occurred. Please try again.",
    };
  }
}
