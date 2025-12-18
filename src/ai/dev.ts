import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { next } from '@genkit-ai/next';

import * as flow from './flows/translate-flow';

export default genkit({
  plugins: [
    googleAI(),
    next({
      flows: [flow.translateText],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
