
"use server";

import { rtiDraftingChatbot, type RTIDraftingChatbotInput, type RTIDraftingChatbotOutput } from "@/ai/flows/rti-drafting-chatbot";

export async function getRtiChatbotResponse(
  input: Omit<RTIDraftingChatbotInput, 'targetLanguage'>,
  language: string
): Promise<RTIDraftingChatbotOutput> {
  try {
    const response = await rtiDraftingChatbot({ ...input, targetLanguage: language });
    return response;
  } catch (error) {
    console.error("Error in getRtiChatbotResponse:", error);
    return {
      nextStep: input.currentStep,
      response: "Sorry, I encountered an error. Please try again.",
      isDraftComplete: false,
    };
  }
}
