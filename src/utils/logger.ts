import { ConversationMessage } from "../types";

export const logInfo = (message: string): void => {
  console.log(message);
};

export const logError = (message: string, error?: any): void => {
  console.error(message, error || "");
};

export const logSuccess = (message: string): void => {
  console.log(`✅ ${message}`);
};

export const logWarning = (message: string): void => {
  console.log(`⚠️  ${message}`);
};

export const logMessageReceived = (cleanNumber: string, body: string): void => {
  console.log(`📩 Message from ${cleanNumber}: ${body}`);
};

export const logMediaDetected = (): void => {
  console.log("📎 Media detected! Downloading...");
};

export const logDocumentDetails = (
  filename: string,
  mimetype: string,
  size: number,
  filePath: string
): void => {
  console.log("📄 Document Details:");
  console.log(`  - Filename: ${filename}`);
  console.log(`  - MIME Type: ${mimetype}`);
  console.log(`  - File Size: ${size} bytes`);
  console.log(`  - Saved to: ${filePath}`);
};

export const logImageProcessing = (): void => {
  console.log("🖼️  Sending image to OpenAI for analysis...");
};

export const logDocumentReceived = (): void => {
  console.log("📄 Document received (non-image)");
};

export const logBotReply = (reply: string): void => {
  console.log(`🤖 Bot: ${reply}`);
};

export const logNewConversation = (phoneNumber: string): void => {
  console.log(`🆕 New conversation started for ${phoneNumber}`);
};

export const logConversationHistory = (
  phoneNumber: string,
  history: ConversationMessage[]
): void => {
  console.log(`\n📜 Conversation History for ${phoneNumber}:`);
  history.forEach((msg, index) => {
    if (msg.role !== "system") {
      const timeStr = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString()
        : "";
      const contentPreview =
        typeof msg.content === "string"
          ? msg.content.substring(0, 50)
          : "[Media/Document]";
      console.log(
        `  ${index}. [${timeStr}] ${msg.role.toUpperCase()}: ${contentPreview}${contentPreview.length >= 50 ? "..." : ""}`
      );
    }
  });
  console.log("");
};
