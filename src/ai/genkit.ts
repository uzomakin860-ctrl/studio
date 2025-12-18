import { genkit, Ai } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the AI instance
export const ai: Ai = genkit({
  plugins: [
    googleAI({
      // Specify the API version if needed, e.g., 'v1beta'
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
