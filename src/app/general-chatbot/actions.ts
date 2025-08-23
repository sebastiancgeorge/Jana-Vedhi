
"use server";

import { generalPlatformChatbot, type GeneralPlatformChatbotOutput } from "@/ai/flows/general-platform-chatbot";

export async function getGeneralChatbotResponse(
  query: string
): Promise<GeneralPlatformChatbotOutput> {
  if (!query || typeof query !== "string" || query.trim() === "") {
    return { answer: "Please provide a valid question.", relevantLinks: [] };
  }
  
  try {
    const response = await generalPlatformChatbot({ query });
    return response;
  } catch (error) {
    console.error("Error in getGeneralChatbotResponse:", error);
    return {
      answer: "Sorry, I encountered an error while processing your request. Please try again later.",
      relevantLinks: [],
    };
  }
}
