'use server';

/**
 * @fileOverview Generates initial post content based on a short prompt.
 *
 * - generateInitialPostContent - A function that generates initial post content.
 * - GenerateInitialPostContentInput - The input type for the generateInitialPostContent function.
 * - GenerateInitialPostContentOutput - The return type for the generateInitialPostContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialPostContentInputSchema = z.object({
  prompt: z.string().describe('A short prompt to generate initial post content.'),
});
export type GenerateInitialPostContentInput = z.infer<typeof GenerateInitialPostContentInputSchema>;

const GenerateInitialPostContentOutputSchema = z.object({
  content: z.string().describe('The generated initial post content.'),
});
export type GenerateInitialPostContentOutput = z.infer<typeof GenerateInitialPostContentOutputSchema>;

export async function generateInitialPostContent(input: GenerateInitialPostContentInput): Promise<GenerateInitialPostContentOutput> {
  return generateInitialPostContentFlow(input);
}

const initialPostContentPrompt = ai.definePrompt({
  name: 'initialPostContentPrompt',
  input: {schema: GenerateInitialPostContentInputSchema},
  output: {schema: GenerateInitialPostContentOutputSchema},
  prompt: `Generate an initial post based on the following prompt: {{{prompt}}}`,
});

const generateInitialPostContentFlow = ai.defineFlow(
  {
    name: 'generateInitialPostContentFlow',
    inputSchema: GenerateInitialPostContentInputSchema,
    outputSchema: GenerateInitialPostContentOutputSchema,
  },
  async input => {
    const {output} = await initialPostContentPrompt(input);
    return output!;
  }
);
