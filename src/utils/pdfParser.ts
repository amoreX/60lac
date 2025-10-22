import * as pdfParse from "pdf-parse";
import fs from "fs";

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    // @ts-ignore - pdf-parse has typing issues
    const data = await pdfParse.default(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

export const isPDF = (mimetype: string): boolean => {
  return mimetype === "application/pdf";
};
