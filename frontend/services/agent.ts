import { GoogleGenAI, Chat } from '@google/genai';

let chatSession: Chat | null = null;
let currentLanguage = 'English';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      message?: string;
      error?: { message?: string } | string;
      details?: string;
    };

    if (typeof maybeError.message === 'string' && maybeError.message) {
      return maybeError.message;
    }
    if (typeof maybeError.error === 'string' && maybeError.error) {
      return maybeError.error;
    }
    if (typeof maybeError.error === 'object' && maybeError.error?.message) {
      return maybeError.error.message;
    }
    if (typeof maybeError.details === 'string' && maybeError.details) {
      return maybeError.details;
    }
  }

  return 'Lost connection to live data feeds. Please try again.';
};

export const initAgent = (language: string = 'English') => {
  currentLanguage = language;
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing VITE_API_KEY in frontend environment.');
  }
  
  const SYSTEM_INSTRUCTION = `You are KickOut 26, a tactical escape AI for the FIFA 2026 World Cup.

CRITICAL INSTRUCTION: You MUST respond entirely in ${language}.
CRITICAL INSTRUCTION: Be extremely concise. NO conversational filler. NO introductory sentences like "Here is your route" or "I am simulating". NO concluding sentences.
Output ONLY the requested data points in a highly scannable format.

Format your response EXACTLY like this (translate the bold labels to ${language}):
🚪 **EXIT:** [Gate/Exit name] ([Wait time])
🚇 **TRANSIT:** [Line/Mode] - [Next departure] ([Crowd status])
🚕 **RIDESHARE:** [Pickup point] - [Cost/Surge]
🚶 **WALK:** [1-sentence direction to transit/pickup]

Do not add any other text.`;

  try {
    const ai = new GoogleGenAI({ apiKey, vertexai: true });
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, // Lower temperature for stricter adherence to the concise format
      },
    });
  } catch (error) {
    console.error("Failed to initialize GenAI client:", error);
    throw new Error("Failed to connect to the KickOut intelligence network.");
  }
};

export const sendAgentMessage = async (message: string, language?: string): Promise<string> => {
  if (!chatSession || (language && language !== currentLanguage)) {
    initAgent(language || currentLanguage);
  }
  
  if (!chatSession) {
    throw new Error("Agent session not initialized.");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "I couldn't process that request. Please try again.";
  } catch (error) {
    console.error("Error communicating with agent:", error);
    throw new Error(getErrorMessage(error));
  }
};
