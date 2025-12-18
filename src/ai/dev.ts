import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { next } from '@genkit-ai/next';

import * as translateFlow from './flows/translate-flow';

export default genkit({
  plugins: [
    googleAI(),
    next({
      flows: [translateFlow.translateTextFlow],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
