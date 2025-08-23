// Legal Chatbot: Retrieve answers from legal FAQ or LLM; cite sources from legal FAQ.

'use server';

/**
 * @fileOverview A legal question answering AI agent.
 *
 * - askLegalQuestion - A function that handles the legal question answering process.
 * - AskLegalQuestionInput - The input type for the askLegalQuestion function.
 * - AskLegalQuestionOutput - The return type for the askLegalQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskLegalQuestionInputSchema = z.object({
  question: z.string().describe('The legal question to be answered.'),
});
export type AskLegalQuestionInput = z.infer<typeof AskLegalQuestionInputSchema>;

const AskLegalQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the legal question.'),
});
export type AskLegalQuestionOutput = z.infer<typeof AskLegalQuestionOutputSchema>;

export async function askLegalQuestion(input: AskLegalQuestionInput): Promise<AskLegalQuestionOutput> {
  return askLegalQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askLegalQuestionPrompt',
  input: {schema: AskLegalQuestionInputSchema},
  output: {schema: AskLegalQuestionOutputSchema},
  prompt: `You are a legal chatbot that answers legal questions and gives advice. Provide a comprehensive and helpful answer to the user's question.

  Question: {{{question}}}`,
});

const askLegalQuestionFlow = ai.defineFlow(
  {
    name: 'askLegalQuestionFlow',
    inputSchema: AskLegalQuestionInputSchema,
    outputSchema: AskLegalQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
