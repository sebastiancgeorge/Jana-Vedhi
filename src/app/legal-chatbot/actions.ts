"use server";

import { askLegalQuestion, type AskLegalQuestionOutput } from "@/ai/flows/legal-chatbot";
import { textToSpeechFlow, type TextToSpeechOutput } from "@/ai/flows/text-to-speech-flow";

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

export async function getSpokenAudio(text: string): Promise<TextToSpeechOutput> {
  if (!text.trim()) {
    throw new Error("Input text cannot be empty.");
  }
  try {
    const response = await textToSpeechFlow({ text });
    return response;
  } catch (error) {
     console.error("Error in getSpokenAudio:", error);
     throw new Error("Failed to generate audio.");
  }
}
