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
  source: z.string().optional().describe('The source of the answer (e.g., FAQ entry).'),
});
export type AskLegalQuestionOutput = z.infer<typeof AskLegalQuestionOutputSchema>;

export async function askLegalQuestion(input: AskLegalQuestionInput): Promise<AskLegalQuestionOutput> {
  return askLegalQuestionFlow(input);
}

const faq = [
  {
    question: 'What are the requirements for starting a business in Kerala?',
    answer: 'To start a business in Kerala, you need to register your business with the relevant authorities, obtain the necessary licenses and permits, and comply with the applicable laws and regulations.',
  },
  {
    question: 'How do I file a property tax appeal?',
    answer: 'You can file a property tax appeal by submitting a written request to the local municipal office within the specified time frame.',
  },
  {
    question: 'What are the procedures for obtaining a building permit?',
    answer: 'To obtain a building permit, you need to submit a detailed building plan, along with the required documents, to the local building authority.',
  },
];

const prompt = ai.definePrompt({
  name: 'askLegalQuestionPrompt',
  input: {schema: AskLegalQuestionInputSchema},
  output: {schema: AskLegalQuestionOutputSchema},
  prompt: `You are a legal chatbot that answers legal questions. First, check if the answer to the question can be found in the following legal FAQ database:

  ${faq.map(item => `Question: ${item.question}\nAnswer: ${item.answer}`).join('\n')}

  If the answer is found in the FAQ, return the answer and cite the FAQ entry as the source. If the answer is not found in the FAQ, use your own knowledge to answer the question and do not cite a source.

  Question: {{{question}}}`,
});

const askLegalQuestionFlow = ai.defineFlow(
  {
    name: 'askLegalQuestionFlow',
    inputSchema: AskLegalQuestionInputSchema,
    outputSchema: AskLegalQuestionOutputSchema,
  },
  async input => {
    for (const entry of faq) {
      if (input.question.toLowerCase().includes(entry.question.toLowerCase())) {
        return {
          answer: entry.answer,
          source: 'Legal FAQ',
        };
      }
    }

    const {output} = await prompt(input);
    return output!;
  }
);
