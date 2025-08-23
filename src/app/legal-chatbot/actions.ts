"use server";

import { askLegalQuestion, type AskLegalQuestionOutput } from "@/ai/flows/legal-chatbot";

export async function getLegalChatbotResponse(
  question: string,
  language: string
): Promise<AskLegalQuestionOutput> {
  if (!question || typeof question !== "string" || question.trim() === "") {
    return { answer: "Please provide a valid question." };
  }
  
  try {
    const response = await askLegalQuestion({ question, targetLanguage: language });
    return response;
  } catch (error) {
    console.error("Error in getLegalChatbotResponse:", error);
    return {
      answer: "Sorry, I encountered an error while processing your request. Please try again later.",
    };
  }
}
