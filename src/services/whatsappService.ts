import { Client, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { config } from "../config/env";
import { logSuccess } from "../utils";
import { handleIncomingMessage } from "../handlers/messageHandler";

let client: Client;

const handleQR = (qr: string): void => {
  console.log("📱 Scan this QR code with your WhatsApp:");
  qrcode.generate(qr, { small: true });
};

const handleReady = (): void => {
  logSuccess("WhatsApp AI bot is ready!");
};

const handleMessage = async (message: Message): Promise<void> => {
  await handleIncomingMessage(message);
};

const handleDisconnected = (reason: string): void => {
  console.log("❌ WhatsApp client disconnected:", reason);
};

export const initializeWhatsApp = (): Client => {
  client = new Client({
    puppeteer: config.whatsapp.puppeteer,
  });

  client.on("qr", handleQR);
  client.on("ready", handleReady);
  client.on("message", handleMessage);
  client.on("disconnected", handleDisconnected);

  client.initialize();

  return client;
};

export const getWhatsAppClient = (): Client => {
  return client;
};
