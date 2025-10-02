import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
// FIX: Module '"../types"' has no exported member 'MessageSender'.
import { Conversation, Message } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
// In-memory cache for chat sessions. This will be cleared on page refresh.
const chatSessions: { [key: string]: Chat } = {};

const getSystemInstruction = (): string => {
    return 'You are a helpful and friendly chat bot. The user is chatting with you as if you are another person. Keep your responses concise and conversational.';
}

export const getBotResponse = async (conversation: Conversation, newMessage: string): Promise<string> => {
  try {
    let chat = chatSessions[conversation.id];

    // If a session isn't cached, create one and initialize it with history.
    if (!chat) {
        // The user's UID is needed to differentiate roles in the chat history.
        // We assume the last message in the conversation is from the user, as this function
        // is called after a user sends a message.
        const userUid = conversation.messages.length > 0
            ? conversation.messages[conversation.messages.length - 1].senderUid
            : undefined;

        // The history from the conversation object includes the latest user message.
        // We must exclude it when creating the chat, as it will be sent via `sendMessage`.
        const history = conversation.messages
            .slice(0, -1)
            .filter(msg => msg.text) // History should only contain text messages for the model.
            .map(msg => ({
                // FIX: Property 'sender' does not exist on type 'Message'. Corrected to 'senderUid'.
                // 'MessageSender' is not defined, so role is determined by comparing senderUid with the current user's UID.
                role: msg.senderUid === userUid ? 'user' : 'model',
                parts: [{ text: msg.text! }]
            }));
        
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: getSystemInstruction(),
            },
        });
        chatSessions[conversation.id] = chat; // Cache the new session.
    }

    const result: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return "Sorry, I'm having trouble connecting right now. Please try again later.";
  }
};
