import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// In a real app, we would handle missing API keys more gracefully in the UI.
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Generates a concise summary for a blog post.
 */
export const generateSummary = async (content: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";
  
  try {
    const prompt = `Please provide a concise, 2-sentence summary of the following blog post content. Capture the main insight or learning point:\n\n${content}`;
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
};

/**
 * Polishes the text to be more professional and clear.
 */
export const polishContent = async (content: string): Promise<string> => {
  if (!apiKey) return content;

  try {
    const prompt = `Rewrite the following text to be more clear, concise, and professional, while maintaining the original meaning and tone. Return only the rewritten text:\n\n${content}`;
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || content;
  } catch (error) {
    console.error("Error polishing content:", error);
    return content;
  }
};

/**
 * Initializes a chat session for brainstorming.
 */
export const createBrainstormChat = (): Chat => {
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: "You are a creative muse and editorial assistant for a personal blogger. Help them brainstorm topics, outline articles, and refine their ideas. Be encouraging, insightful, and ask thought-provoking questions."
    }
  });
};

/**
 * Sends a message to the chat.
 */
export const sendChatMessage = async (chat: Chat, message: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";
  
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "";
  } catch (error) {
    console.error("Error in chat:", error);
    return "Sorry, I encountered an error connecting to the AI.";
  }
};