import { ConversationMessage } from "../types";
import { config } from "../config/env";
import { logNewConversation, logConversationHistory } from "../utils";

const conversationHistory: Map<string, ConversationMessage[]> = new Map();

export const initConversation = (phoneNumber: string): void => {
  if (!conversationHistory.has(phoneNumber)) {
    conversationHistory.set(phoneNumber, [
      {
        role: "system",
        content: config.conversation.systemMessage,
      },
    ]);
    logNewConversation(phoneNumber);
  }
};

export const addMessage = (
  phoneNumber: string,
  role: "user" | "assistant",
  content: string | any[]
): void => {
  initConversation(phoneNumber);
  const messages = conversationHistory.get(phoneNumber)!;

  messages.push({
    role,
    content,
    timestamp: Date.now(),
  });

  // Keep only last N messages (plus system message) to avoid token limits
  if (messages.length > config.conversation.maxHistoryLength + 1) {
    conversationHistory.set(phoneNumber, [
      messages[0], // Keep system message
      ...messages.slice(-config.conversation.maxHistoryLength),
    ]);
  }
};

export const getHistory = (phoneNumber: string): ConversationMessage[] => {
  initConversation(phoneNumber);
  return conversationHistory.get(phoneNumber)!;
};

export const logHistory = (phoneNumber: string): void => {
  const history = conversationHistory.get(phoneNumber);
  if (history) {
    logConversationHistory(phoneNumber, history);
  }
};

export const clearHistory = (phoneNumber: string): void => {
  conversationHistory.delete(phoneNumber);
};

export const getAllActiveConversations = (): string[] => {
  return Array.from(conversationHistory.keys());
};
