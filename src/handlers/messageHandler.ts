import { Message } from "whatsapp-web.js";
import { addMessage, getHistory, logHistory } from "../services/conversationService";
import { generateResponse } from "../services/openAIService";
import {
  logMessageReceived,
  logMediaDetected,
  logDocumentDetails,
  logImageProcessing,
  logDocumentReceived,
  logBotReply,
  logError,
  cleanNumber,
  saveFile,
  generateFilename,
} from "../utils";

export const handleIncomingMessage = async (message: Message): Promise<void> => {
  const phoneNumber = message.from;
  const cleanedNumber = cleanNumber(phoneNumber);

  logMessageReceived(cleanedNumber, message.body);

  try {
    if (message.hasMedia) {
      await handleMediaMessage(message, cleanedNumber);
    } else {
      await handleTextMessage(message, cleanedNumber);
    }
  } catch (error) {
    logError("Error processing message:", error);
    await message.reply(
      "Sorry, I encountered an error processing your message."
    );
  }
};

const handleMediaMessage = async (
  message: Message,
  cleanedNumber: string
): Promise<void> => {
  logMediaDetected();

  const media = await message.downloadMedia();
  const filename = generateFilename((message as any)._data?.filename);

  // Save file
  const mediaInfo = saveFile(filename, media.data);
  mediaInfo.mimetype = media.mimetype;

  logDocumentDetails(
    filename,
    media.mimetype,
    mediaInfo.size,
    mediaInfo.filePath
  );

  let userContent: any[];
  let reply: string;

  // Handle images
  if (media.mimetype.startsWith("image/")) {
    logImageProcessing();

    userContent = [
      {
        type: "text",
        text: message.body || "What's in this image?",
      },
      {
        type: "image_url",
        image_url: {
          url: `data:${media.mimetype};base64,${media.data}`,
        },
      },
    ];

    // Add to conversation history
    addMessage(cleanedNumber, "user", userContent);

    // Get conversation and send to OpenAI
    const conversationMessages = getHistory(cleanedNumber);

    reply = await generateResponse(conversationMessages);
  } else {
    // Handle other documents
    logDocumentReceived();

    userContent = [
      {
        type: "text",
        text: `User sent a document: ${filename} (${media.mimetype}). The file has been saved.`,
      },
    ];

    // Add to conversation history
    addMessage(cleanedNumber, "user", userContent);

    // Get conversation and send to OpenAI
    const conversationMessages = getHistory(cleanedNumber);

    reply = await generateResponse(conversationMessages);

    if (!reply || reply === "Sorry, I could not process your request.") {
      reply = `📄 Got your file (${filename})! File saved successfully.`;
    }
  }

  // Add bot reply to conversation history
  addMessage(cleanedNumber, "assistant", reply);

  // Send reply
  await message.reply(reply);
  logBotReply(reply);

  // Log conversation history
  logHistory(cleanedNumber);
};

const handleTextMessage = async (
  message: Message,
  cleanedNumber: string
): Promise<void> => {
  const text = message.body?.trim();
  if (!text) return;

  console.log(`💬 Text: ${text}`);

  // Add user message to conversation history
  addMessage(cleanedNumber, "user", text);

  // Get conversation history
  const conversationMessages = getHistory(cleanedNumber);

  // Generate AI reply using OpenAI with conversation history
  const reply = await generateResponse(conversationMessages);

  // Add bot reply to conversation history
  addMessage(cleanedNumber, "assistant", reply);

  // Send reply
  await message.reply(reply);
  logBotReply(reply);

  // Log conversation history
  logHistory(cleanedNumber);
};
