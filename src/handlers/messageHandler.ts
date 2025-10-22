import { Message } from "whatsapp-web.js";
import {
  addMessage,
  getHistory,
  logHistory,
} from "../services/conversationService";
import { generateResponse } from "../services/openAIService";
import {
  logMessageReceived,
  logMediaDetected,
  logDocumentDetails,
  logImageProcessing,
  logDocumentReceived,
  logAudioProcessing,
  logBotReply,
  logError,
  cleanNumber,
  saveFile,
  generateFilename,
  extractTextFromPDF,
  isPDF,
  transcribeAudio,
  isAudio,
  getAudioExtension,
} from "../utils";

export const handleIncomingMessage = async (
  message: Message,
): Promise<void> => {
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
      "Sorry, I encountered an error processing your message.",
    );
  }
};

const handleMediaMessage = async (
  message: Message,
  cleanedNumber: string,
): Promise<void> => {
  logMediaDetected();

  const media = await message.downloadMedia();
  let filename = generateFilename((message as any)._data?.filename);

  // Add proper extension for audio files if not present
  if (isAudio(media.mimetype) && !filename.includes(".")) {
    filename = `${filename}.${getAudioExtension(media.mimetype)}`;
  }

  // Save file
  const mediaInfo = saveFile(filename, media.data);
  mediaInfo.mimetype = media.mimetype;

  logDocumentDetails(
    filename,
    media.mimetype,
    mediaInfo.size,
    mediaInfo.filePath,
  );

  let userContent: any[];
  let reply: string;

  // Handle Audio/Voice Messages
  if (isAudio(media.mimetype)) {
    console.log("🎤 Audio/Voice message detected! Transcribing...");
    logAudioProcessing();

    try {
      const transcribedText = await transcribeAudio(mediaInfo.filePath);
      console.log(
        `✅ Transcribed ${transcribedText.length} characters from audio`,
      );
      console.log("📝 Audio Transcription:", transcribedText);

      // Send the transcribed text to OpenAI for processing
      const caption = message.body || "";
      const textContent = caption
        ? `${caption}\n\n[Voice Message Transcription]: ${transcribedText}`
        : `[Voice Message Transcription]: ${transcribedText}`;

      userContent = [
        {
          type: "text",
          text: textContent,
        },
      ];

      // Add to conversation history
      addMessage(cleanedNumber, "user", userContent);

      // Get conversation and send to OpenAI
      const conversationMessages = getHistory(cleanedNumber);
      reply = await generateResponse(conversationMessages, cleanedNumber);
    } catch (error) {
      console.error("❌ Error transcribing audio:", error);
      userContent = [
        {
          type: "text",
          text: `User sent a voice message (${filename}). Audio file saved but transcription failed.`,
        },
      ];

      addMessage(cleanedNumber, "user", userContent);
      const conversationMessages = getHistory(cleanedNumber);
      reply = await generateResponse(conversationMessages, cleanedNumber);

      if (!reply || reply === "Sorry, I could not process your request.") {
        reply =
          "🎤 I received your voice message but had trouble transcribing it. Could you please send it as text or try recording again?";
      }
    }
  }
  // Handle PDFs
  else if (isPDF(media.mimetype)) {
    console.log("📄 PDF document detected! Extracting text...");

    try {
      const extractedText = await extractTextFromPDF(mediaInfo.filePath);
      console.log(`✅ Extracted ${extractedText.length} characters from PDF`);
      console.log(
        "📝 PDF Content Preview:",
        extractedText.substring(0, 200) + "...",
      );

      // Send the PDF text to OpenAI for analysis
      const caption =
        message.body ||
        "I've uploaded a document. Please extract relevant loan application information from it.";

      userContent = [
        {
          type: "text",
          text: `${caption}\n\nDocument: ${filename}\n\nExtracted Text from PDF:\n${extractedText}`,
        },
      ];

      // Add to conversation history
      addMessage(cleanedNumber, "user", userContent);

      // Get conversation and send to OpenAI
      const conversationMessages = getHistory(cleanedNumber);
      reply = await generateResponse(conversationMessages, cleanedNumber);
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      userContent = [
        {
          type: "text",
          text: `User uploaded a PDF document: ${filename}. Unable to extract text, but file is saved.`,
        },
      ];

      addMessage(cleanedNumber, "user", userContent);
      const conversationMessages = getHistory(cleanedNumber);
      reply = await generateResponse(conversationMessages, cleanedNumber);
    }
  }
  // Handle images
  else if (media.mimetype.startsWith("image/")) {
    logImageProcessing();

    // Enhanced prompt for comprehensive detail extraction
    const imageAnalysisPrompt = message.body
      ? `${message.body}\n\nIMPORTANT: Analyze this image/document thoroughly and extract ALL relevant details including: names, dates, numbers (phone, ID, account), addresses, income figures, employment details, property information, vehicle details, financial data, signatures, stamps, and any other information that might be useful for a loan application. Be comprehensive and detailed.`
      : "I've uploaded a document image. Please analyze this document image carefully and extract ALL relevant information including: personal details (name, DOB, address, phone, email), ID numbers (Aadhaar, PAN, etc.), financial information (income, salary, bank details), employment details (company name, designation, employment type), property/vehicle details if any, and any other details visible in the document. Extract every piece of information that could be useful for a loan application.";

    userContent = [
      {
        type: "text",
        text: imageAnalysisPrompt,
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
    reply = await generateResponse(conversationMessages, cleanedNumber);
  }
  // Handle other documents
  else {
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
    reply = await generateResponse(conversationMessages, cleanedNumber);

    if (!reply || reply === "Sorry, I could not process your request.") {
      reply = `📄 Got your file (${filename})! File saved successfully. Let me know if you'd like me to help with anything else.`;
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
  cleanedNumber: string,
): Promise<void> => {
  const text = message.body?.trim();
  if (!text) return;

  console.log(`💬 Text: ${text}`);

  // Add user message to conversation history
  addMessage(cleanedNumber, "user", text);

  // Get conversation history
  const conversationMessages = getHistory(cleanedNumber);

  // Generate AI reply using OpenAI with conversation history and function calling
  const reply = await generateResponse(conversationMessages, cleanedNumber);

  // Add bot reply to conversation history
  addMessage(cleanedNumber, "assistant", reply);

  // Send reply
  await message.reply(reply);
  logBotReply(reply);

  // Log conversation history
  logHistory(cleanedNumber);
};
