import dotenv from "dotenv";

dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  server: {
    port: process.env.PORT || 3000,
  },
  whatsapp: {
    puppeteer: {
      headless: true,
    },
  },
  conversation: {
    maxHistoryLength: 20,
    systemMessage:
      "You are a helpful WhatsApp assistant. Keep responses concise and friendly. You can also analyze images and documents.",
  },
};
