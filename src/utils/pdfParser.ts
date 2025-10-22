import fs from "fs";
import Tesseract from "tesseract.js";
import path from "path";
const pdfParse = require("pdf-parse");

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    console.log("📄 Starting PDF text extraction...");

    // Read PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // First, try to extract text directly using pdf-parse
    console.log("🔍 Attempting direct text extraction...");
    const pdfData = await pdfParse(dataBuffer);

    let extractedText = pdfData.text.trim();

    // If very little text was extracted, the PDF might be scanned/image-based
    // In that case, we should use OCR
    if (extractedText.length < 100) {
      console.log("⚠️  Little text found. PDF might be scanned. Falling back to OCR...");
      extractedText = await extractWithOCR(filePath);
    } else {
      console.log(`✅ Extracted ${extractedText.length} characters using direct extraction`);
    }

    // Clean up the extracted text
    const cleanedText = extractedText
      .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
      .replace(/[ \t]+\n/g, "\n") // Remove trailing spaces
      .replace(/\n\n/g, " ") // Convert double newlines to spaces
      .replace(/\n/g, " ") // Convert single newlines to spaces
      .replace(/ {2,}/g, " ") // Remove multiple spaces
      .trim();

    console.log(`✅ Final extracted text: ${cleanedText.length} characters`);
    return cleanedText;

  } catch (error) {
    console.error("❌ Direct extraction failed. Trying OCR fallback...");
    console.error("Error:", error);

    // If pdf-parse fails, try OCR as fallback
    try {
      const text = await extractWithOCR(filePath);
      return text;
    } catch (ocrError) {
      console.error("❌ OCR fallback also failed:", ocrError);
      throw new Error("Failed to extract text from PDF using both direct extraction and OCR");
    }
  }
};

// OCR-based extraction for scanned PDFs (requires pdf-poppler to be installed on system)
async function extractWithOCR(filePath: string): Promise<string> {
  console.log("🔄 Using OCR to extract text from scanned PDF...");

  try {
    const pdf = require("pdf-poppler");

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
    console.log("📸 Converting PDF to images...");
    await pdf.convert(filePath, opts);

    // Find all generated images
    const files = fs.readdirSync(outputDir);
    const imageFiles = files
      .filter((file) => file.startsWith(opts.out_prefix) && file.endsWith(".png"))
      .sort(); // Sort to maintain page order

    console.log(`📖 PDF has ${imageFiles.length} pages`);

    let allText = "";

    // OCR each page image
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const imagePath = path.join(outputDir, imageFile);

      console.log(`🔄 Processing page ${i + 1} of ${imageFiles.length}...`);

      const result = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`   OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const pageText = result.data.text.trim();
      if (pageText) {
        allText += pageText + "\n\n";
      }

      // Clean up image file
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.warn(`Warning: Could not delete temp file ${imagePath}`);
      }
    }

    // Clean up the extracted text
    const cleanedText = allText
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/ {2,}/g, " ")
      .trim();

    console.log(`✅ OCR extracted ${cleanedText.length} characters`);
    return cleanedText;

  } catch (error) {
    console.error("❌ OCR extraction failed:", error);
    throw new Error("Failed to extract text using OCR. Please ensure pdf-poppler is installed on your system.");
  }
}

export const isPDF = (mimetype: string): boolean => {
  return mimetype === "application/pdf";
};
