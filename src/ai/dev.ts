import { config } from 'dotenv';
config();

import '@/ai/flows/rti-drafting-chatbot.ts';
import '@/ai/flows/general-platform-chatbot.ts';
import '@/ai/flows/legal-chatbot.ts';
import '@/ai/flows/validate-aadhaar-flow.ts';
import '@/ai/flows/seed-database-flow.ts';
import '@/ai/flows/translate-text-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
