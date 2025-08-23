'use server';

/**
 * @fileOverview A general chatbot for the Jana Vedhi platform.
 *
 * - generalPlatformChatbot - A function that answers user questions about the platform and provides links to relevant pages.
 * - GeneralPlatformChatbotInput - The input type for the generalPlatformChatbot function.
 * - GeneralPlatformChatbotOutput - The return type for the generalPlatformChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralPlatformChatbotInputSchema = z.object({
  query: z.string().describe('The user query about the Jana Vedhi platform.'),
});
export type GeneralPlatformChatbotInput = z.infer<typeof GeneralPlatformChatbotInputSchema>;

const GeneralPlatformChatbotOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
  relevantLinks: z.array(z.string()).describe('Links to relevant pages on the platform.'),
});
export type GeneralPlatformChatbotOutput = z.infer<typeof GeneralPlatformChatbotOutputSchema>;

export async function generalPlatformChatbot(input: GeneralPlatformChatbotInput): Promise<GeneralPlatformChatbotOutput> {
  return generalPlatformChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalPlatformChatbotPrompt',
  input: {schema: GeneralPlatformChatbotInputSchema},
  output: {schema: GeneralPlatformChatbotOutputSchema},
  prompt: `You are a helpful chatbot assistant for the Jana Vedhi platform.

  Answer the user's questions about how to use the platform and provide links to relevant pages.  Use the following as the primary source of information to create your answers. If you do not know the answer, you can say you do not know, but do not make up answers.

  Query: {{{query}}}

  Consider these example links:
  - [Home Page](/) - Access the main dashboard and overview of the platform.
  - [Funds Overview](/funds) - Track department-wise fund allocation and project details.
  - [Budget Voting](/budget) - Participate in the budget voting system.
  - [Grievance Form](/grievance) - Submit grievances with geolocation and photo upload.
  - [Grievance Heatmap](/heatmap) - View grievance density on the Kerala map.
  - [Politician Tracker](/politicians) - Find official profiles with project and fund summaries.
  - [Legal Chatbot](/legal-chatbot) - Get answers to legal questions from the legal FAQ or LLM.
  - [RTI Chatbot](/rti-chatbot) - Draft and export RTI applications.
  - [Notifications](/notifications) - Get push alerts and notifications.

  Make the links Markdown formatted.
`,
});

const generalPlatformChatbotFlow = ai.defineFlow(
  {
    name: 'generalPlatformChatbotFlow',
    inputSchema: GeneralPlatformChatbotInputSchema,
    outputSchema: GeneralPlatformChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
