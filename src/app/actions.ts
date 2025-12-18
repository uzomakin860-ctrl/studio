'use server';

import { generateInitialPostContent, GenerateInitialPostContentOutput } from "@/ai/flows/generate-initial-post-content";

export async function handleGenerateResponse(prompt: string): Promise<GenerateInitialPostContentOutput> {
  if (!prompt) {
    throw new Error("Prompt cannot be empty.");
  }
  
  try {
    const response = await generateInitialPostContent({ prompt });
    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("An error occurred while communicating with the AI. Please try again.");
  }
}
