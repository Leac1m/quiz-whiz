'use server';

/**
 * @fileOverview A quiz category suggestion AI agent.
 *
 * - suggestQuizCategories - A function that suggests categories to make a quiz more challenging.
 * - SuggestQuizCategoriesInput - The input type for the suggestQuizCategories function.
 * - SuggestQuizCategoriesOutput - The return type for the suggestQuizCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestQuizCategoriesInputSchema = z.object({
  quizTopic: z.string().describe('The main topic of the quiz.'),
  currentCategories: z.array(z.string()).describe('The categories already included in the quiz.'),
});
export type SuggestQuizCategoriesInput = z.infer<typeof SuggestQuizCategoriesInputSchema>;

const SuggestQuizCategoriesOutputSchema = z.object({
  suggestedCategories: z.array(z.string()).describe('Suggested categories to make the quiz more challenging.'),
});
export type SuggestQuizCategoriesOutput = z.infer<typeof SuggestQuizCategoriesOutputSchema>;

export async function suggestQuizCategories(input: SuggestQuizCategoriesInput): Promise<SuggestQuizCategoriesOutput> {
  return suggestQuizCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestQuizCategoriesPrompt',
  input: {schema: SuggestQuizCategoriesInputSchema},
  output: {schema: SuggestQuizCategoriesOutputSchema},
  prompt: `You are an expert quiz designer who helps quiz hosts make their quizzes more challenging.

The current quiz is about the topic: {{{quizTopic}}}.
The quiz currently includes these categories: {{#each currentCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Suggest categories that could be added to the quiz to make it more challenging and diverse. Provide only the category names.

{{#if currentCategories.length}}
DO NOT suggest any category that already exists in the following list: {{#each currentCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
{{/if}}

Limit your suggestions to 5 categories.`,
});

const suggestQuizCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestQuizCategoriesFlow',
    inputSchema: SuggestQuizCategoriesInputSchema,
    outputSchema: SuggestQuizCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
