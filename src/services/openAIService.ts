import { openai } from "../config/openai";
import { ConversationMessage } from "../types";

export const generateResponse = async (
  messages: ConversationMessage[],
  maxTokens: number = 500
): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      max_tokens: maxTokens,
    });

    return (
      completion.choices[0]?.message?.content ||
      "Sorry, I could not process your request."
    );
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate AI response");
  }
};

export const analyzeImage = async (
  messages: ConversationMessage[],
  imageBase64: string,
  mimetype: string,
  caption?: string
): Promise<string> => {
  const userContent = [
    {
      type: "text",
      text: caption || "What's in this image?",
    },
    {
      type: "image_url",
      image_url: {
        url: `data:${mimetype};base64,${imageBase64}`,
      },
    },
  ];

  // Create a copy of messages and add the image content
  const messagesWithImage = [
    ...messages,
    {
      role: "user" as const,
      content: userContent,
    },
  ];

  return generateResponse(messagesWithImage);
};
