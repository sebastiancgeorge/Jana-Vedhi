'use server';

/**
 * @fileOverview A mock Aadhaar validation service.
 *
 * - validateAadhaar - A function that simulates Aadhaar number validation.
 * - ValidateAadhaarInput - The input type for the validateAadhaar function.
 * - ValidateAadhaarOutput - The return type for the validateAadhaar function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ValidateAadhaarInputSchema = z.object({
  aadhaarNumber: z.string().describe('The 12-digit Aadhaar number to validate.'),
});
export type ValidateAadhaarInput = z.infer<typeof ValidateAadhaarInputSchema>;

const ValidateAadhaarOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the Aadhaar number is valid.'),
  reason: z.string().optional().describe('The reason for invalidity.'),
});
export type ValidateAadhaarOutput = z.infer<typeof ValidateAadhaarOutputSchema>;

export async function validateAadhaar(input: ValidateAadhaarInput): Promise<ValidateAadhaarOutput> {
  return validateAadhaarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateAadhaarPrompt',
  input: { schema: ValidateAadhaarInputSchema },
  output: { schema: ValidateAadhaarOutputSchema },
  prompt: `You are an Aadhaar validation system. A valid Aadhaar number must be exactly 12 digits and contain only numbers.

  Validate the following Aadhaar number: {{{aadhaarNumber}}}

  If it is not valid, provide a reason. For example, if it contains letters, say "Aadhaar number must only contain digits." If it is not 12 digits long, say "Aadhaar number must be exactly 12 digits."
  `,
});

const validateAadhaarFlow = ai.defineFlow(
  {
    name: 'validateAadhaarFlow',
    inputSchema: ValidateAadhaarInputSchema,
    outputSchema: ValidateAadhaarOutputSchema,
  },
  async (input) => {
    // Basic regex check before hitting the LLM for more semantic validation.
    if (!/^[0-9]{12}$/.test(input.aadhaarNumber)) {
      return {
        isValid: false,
        reason: 'Aadhaar number must be exactly 12 digits and contain only numbers.',
      };
    }
    
    // For this prototype, we can assume a simple check is enough.
    // In a real application, this is where you would call the LLM prompt.
    // const { output } = await prompt(input);
    // return output!;

    return {
      isValid: true,
    };
  }
);
