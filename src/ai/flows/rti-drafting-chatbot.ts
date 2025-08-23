'use server';
/**
 * @fileOverview A multi-step chatbot to guide users through drafting an RTI request, preview the draft, export it as a PDF, and save the draft.
 *
 * - rtiDraftingChatbot - A function that handles the RTI drafting process.
 * - RTIDraftingChatbotInput - The input type for the rtiDraftingChatbot function.
 * - RTIDraftingChatbotOutput - The return type for the rtiDraftingChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RTIDraftingChatbotInputSchema = z.object({
  currentStep: z
    .string()
    .describe('The current step in the RTI drafting process.'),
  userInput: z
    .string()
    .describe('The user input for the current step.'),
  rtiDraft: z.string().optional().describe('The current draft of the RTI request.'),
  targetLanguage: z.string().describe('The target language for the response (e.g., "Malayalam", "English").'),
});
export type RTIDraftingChatbotInput = z.infer<typeof RTIDraftingChatbotInputSchema>;

const RTIDraftingChatbotOutputSchema = z.object({
  nextStep: z.string().describe('The next step in the RTI drafting process.'),
  response: z.string().describe('The chatbot response for the current step.'),
  updatedDraft: z.string().optional().describe('The updated draft of the RTI request.'),
  isDraftComplete: z.boolean().describe('Whether the RTI draft is complete.'),
});
export type RTIDraftingChatbotOutput = z.infer<typeof RTIDraftingChatbotOutputSchema>;

export async function rtiDraftingChatbot(input: RTIDraftingChatbotInput): Promise<RTIDraftingChatbotOutput> {
  return rtiDraftingChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rtiDraftingChatbotPrompt',
  input: {schema: RTIDraftingChatbotInputSchema},
  output: {schema: RTIDraftingChatbotOutputSchema},
  prompt: `You are an RTI (Right to Information) chatbot that guides users through the process of drafting an RTI request.

You will take the user through a multi-step process, asking for the necessary information to complete the RTI request.

Respond in the user's requested language: {{targetLanguage}}.

Here are the steps:
1.  **Introduction**: Introduce yourself and explain the purpose of the chatbot.
2.  **Information Authority**: Ask the user to identify the specific Information Authority/department to address the RTI to.
3.  **Subject Matter**: Ask the user to specify the subject matter or topic of the information they are seeking.
4.  **Specific Questions**: Ask the user to list specific, clear, and concise questions related to the subject matter. Emphasize the importance of being specific to avoid ambiguity.
5.  **Supporting Information**: Ask the user if they have any supporting documents or information that might be relevant to their request. If yes, request the information.
6.  **Draft Review**: Present a draft of the RTI application to the user for review. Allow them to edit or modify the draft.
7.  **Finalization**: Once the user is satisfied with the draft, confirm that they want to finalize the application.
8.  **Export Options**: Provide options to export the RTI application as a PDF or save it for later editing.

You are currently at step: {{{currentStep}}}
User input: {{{userInput}}}
Current RTI draft: {{{rtiDraft}}}

Based on the current step and user input, determine the next step, provide a relevant response, and update the RTI draft if necessary.  Set isDraftComplete to true when the draft is finalized, otherwise false.

When generating the RTI draft, always generate it in English first, and then translate the response and the draft to {{targetLanguage}} if it is not English.

Output in JSON format. nextStep and response are always required. updatedDraft is required only when changes are made. isDraftComplete should reflect the completion status of the draft.
`,
});

const rtiDraftingChatbotFlow = ai.defineFlow(
  {
    name: 'rtiDraftingChatbotFlow',
    inputSchema: RTIDraftingChatbotInputSchema,
    outputSchema: RTIDraftingChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
