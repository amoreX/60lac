import fs from "fs";
import Tesseract from "tesseract.js";
import path from "path";
const pdf = require("pdf-poppler");

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    // Convert PDF to images
    const outputDir = path.join(__dirname, "../../uploads/temp");

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const opts = {
      format: "png",
      out_dir: outputDir,
      out_prefix: path.basename(filePath, path.extname(filePath)),
      page: null, // Convert all pages
    };

    // Convert PDF pages to images
    await pdf.convert(filePath, opts);

    // Find all generated images
    const files = fs.readdirSync(outputDir);
    const imageFiles = files.filter((file) =>
      file.startsWith(opts.out_prefix) && file.endsWith(".png")
    );

    let extractedText = "";

    // OCR each page image
    for (const imageFile of imageFiles) {
      const imagePath = path.join(outputDir, imageFile);
      const {
        data: { text },
      } = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => {
          // Optional: log progress
          if (m.status === "recognizing text") {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      extractedText += text + "\n\n";

      // Clean up image file
      fs.unlinkSync(imagePath);
    }

    return extractedText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF using OCR");
  }
};

export const isPDF = (mimetype: string): boolean => {
  return mimetype === "application/pdf";
};
