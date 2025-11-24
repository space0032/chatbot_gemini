import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the API client
// Ideally this should be a singleton or managed via context, but valid for this scope.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the official AI Assistant for a Google Developer Club (GDSC). 
Your goal is to help students and developers learn about Google technologies (Android, Firebase, Flutter, Google Cloud, TensorFlow, Web, etc.).

Traits:
- Friendly, encouraging, and technical but accessible.
- You assume the user is interested in technology and coding.
- When providing code, use proper markdown code blocks.
- Keep responses concise unless a deep explanation is requested.
- Use emojis occasionally to keep the tone light and community-focused.
`;

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Balance creativity and accuracy
    },
  });
};

export const sendMessageStream = async (
  chatSession: Chat,
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    const responseStream = await chatSession.sendMessageStream({
      message: message,
    });
    return responseStream;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
