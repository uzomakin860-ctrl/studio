
'use server';
/**
 * @fileOverview A flow for translating text using Genkit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "es", "fr", "en").'),
});

export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const translateTextPrompt = ai.definePrompt(
    {
      name: 'translateTextPrompt',
      input: { schema: TranslateTextInputSchema },
      output: { schema: z.string() },
      prompt: `Translate the following text to {{targetLanguage}}: {{text}}`,
    }
);

const translateTextFlow = ai.defineFlow(
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
