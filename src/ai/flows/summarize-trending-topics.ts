'use server';
/**
 * @fileOverview Summarizes trending topics into a concise overview.
 *
 * - summarizeTrendingTopics - A function that summarizes trending topics.
 * - SummarizeTrendingTopicsInput - The input type for the summarizeTrendingTopics function.
 * - SummarizeTrendingTopicsOutput - The return type for the summarizeTrendingTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTrendingTopicsInputSchema = z.object({
  topics: z.string().describe('A list of trending topics separated by commas.'),
});
export type SummarizeTrendingTopicsInput = z.infer<typeof SummarizeTrendingTopicsInputSchema>;

const SummarizeTrendingTopicsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the trending topics.'),
});
export type SummarizeTrendingTopicsOutput = z.infer<typeof SummarizeTrendingTopicsOutputSchema>;

export async function summarizeTrendingTopics(input: SummarizeTrendingTopicsInput): Promise<SummarizeTrendingTopicsOutput> {
  return summarizeTrendingTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTrendingTopicsPrompt',
  input: {schema: SummarizeTrendingTopicsInputSchema},
  output: {schema: SummarizeTrendingTopicsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing trending topics.

  Provide a concise summary of the following trending topics:

  {{topics}}
  `,
});

const summarizeTrendingTopicsFlow = ai.defineFlow(
  {
    name: 'summarizeTrendingTopicsFlow',
    inputSchema: SummarizeTrendingTopicsInputSchema,
    outputSchema: SummarizeTrendingTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
