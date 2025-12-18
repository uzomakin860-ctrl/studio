'use server';
/**
 * @fileOverview A flow for translating text using Genkit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { defineFlow, run } from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "es", "fr", "en").'),
});

export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const translateTextFlow = defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: z.string(),
  },
  async ({ text, targetLanguage }) => {
    const llm = ai.getLlm('googleai/gemini-1.5-flash-latest');
    const response = await llm.generate({
      prompt: `Translate the following text to ${targetLanguage}: ${text}`,
    });

    return response.text;
  }
);

export async function translateText(input: TranslateTextInput): Promise<string> {
    return run(translateTextFlow, input);
}
