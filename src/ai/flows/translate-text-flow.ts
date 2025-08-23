'use server';

/**
 * @fileOverview A flow to translate text to a specified language.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.string().describe('The target language (e.g., "Malayalam").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translation: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `Translate the following text to {{targetLanguage}}.

Text:
{{{text}}}

Only return the translated text.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    // Do not translate if the text is a special key, short, or looks like code
    if (input.text.startsWith('grievance.type.') || /[{}[\]()]/.test(input.text) || input.text.startsWith("across_projects") || !/[a-zA-Z]/.test(input.text) || input.text.trim().split(/\s+/).length <= 2) {
        return { translation: input.text };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
