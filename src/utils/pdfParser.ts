import fs from "fs";
const { PDFParse } = require("pdf-parse");

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  console.log("📄 Starting PDF text extraction...");
  console.log(`📂 File path: ${filePath}`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`FILE_NOT_FOUND: PDF file does not exist at path: ${filePath}`);
  }

  let parser: any = null;

  try {
    // Read PDF file
    console.log("📖 Reading PDF file...");
    const dataBuffer = fs.readFileSync(filePath);
    console.log(`📊 File size: ${dataBuffer.length} bytes`);

    // Create PDFParse instance
    console.log("🔍 Initializing PDF parser...");
    parser = new PDFParse({ data: dataBuffer });

    // Extract text using the new API
    console.log("🔍 Extracting text with PDFParse...");
    const textResult = await parser.getText();
    
    console.log(`📝 Raw text extracted: ${textResult.text.length} characters`);
    console.log(`📖 Number of pages: ${textResult.total}`);

    let extractedText = textResult.text.trim();

    if (!extractedText || extractedText.length === 0) {
      throw new Error("No text content found in PDF");
    }

    // Clean up the extracted text
    console.log("🧹 Cleaning extracted text...");
    const cleanedText = extractedText
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n") // Convert remaining carriage returns
      .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
      .replace(/[ \t]+\n/g, "\n") // Remove trailing spaces
      .replace(/[ \t]{2,}/g, " ") // Replace multiple spaces/tabs with single space
      .replace(/\u00A0/g, " ") // Replace non-breaking spaces
      .replace(/\s+$/gm, "") // Remove trailing whitespace from lines
      .trim();

    console.log(`✅ Successfully extracted ${cleanedText.length} characters`);
    
    if (cleanedText.length < 10) {
      console.warn("⚠️ Very little text extracted. PDF might be image-based or corrupted.");
    }

    return cleanedText;

  } catch (error: any) {
    console.error("❌ ==================== PDF EXTRACTION FAILED ====================");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("==================================================================");

    throw new Error(`PDF_EXTRACTION_FAILED: ${error.message}`);
  } finally {
    // Clean up parser resources
    if (parser) {
      try {
        await parser.destroy();
        console.log("🗑️ PDF parser resources cleaned up");
      } catch (cleanupError) {
        console.warn("⚠️ Warning: Could not clean up PDF parser:", cleanupError);
      }
    }
  }
};



export const isPDF = (mimetype: string): boolean => {
  return mimetype === "application/pdf";
};
