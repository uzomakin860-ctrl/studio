
'use server';
/**
 * @fileOverview A flow for translating text using Genkit.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "es", "fr", "en").'),
});

export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const translateTextPrompt = ai.definePrompt(
    {
      name: 'translateTextPrompt',
      model: googleAI.model('gemini-1.5-flash-latest'),
      input: { schema: TranslateTextInputSchema },
      output: { schema: z.string() },
      prompt: `Translate the following text to {{targetLanguage}}: {{text}}`,
    }
);

export const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await translateTextPrompt(input);
    return output!;
  }
);

export async function translateText(input: TranslateTextInput): Promise<string> {
    const result = await translateTextFlow(input);
    return result;
}
