import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-post-content.ts';
import '@/ai/flows/summarize-trending-topics.ts';