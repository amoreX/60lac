import fs from "fs";
import path from "path";
import { MediaInfo } from "../types";

const uploadsDir = path.join(__dirname, "..", "..", "uploads");

export const ensureUploadsDirExists = (): void => {
  fs.mkdirSync(uploadsDir, { recursive: true });
};

export const saveFile = (filename: string, data: string): MediaInfo => {
  ensureUploadsDirExists();

  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(data, "base64");
  fs.writeFileSync(filePath, buffer);

  return {
    filename,
    mimetype: "",
    data,
    size: buffer.length,
    filePath,
  };
};

export const generateFilename = (originalFilename?: string): string => {
  const timestamp = Date.now();
  return originalFilename || `file_${timestamp}`;
};
