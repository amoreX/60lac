import fs from "fs";
import Tesseract from "tesseract.js";
import path from "path";
const pdfParse = require("pdf-parse");

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  try {
    console.log("📄 Starting PDF text extraction...");
    console.log(`📂 File path: ${filePath}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`FILE_NOT_FOUND: PDF file does not exist at path: ${filePath}`);
    }

    // Read PDF file
    console.log("📖 Reading PDF file...");
    const dataBuffer = fs.readFileSync(filePath);
    console.log(`📊 File size: ${dataBuffer.length} bytes`);

    // First, try to extract text directly using pdf-parse
    console.log("🔍 Attempting direct text extraction with pdf-parse...");
    const pdfData = await pdfParse(dataBuffer);
    console.log(`📝 Raw text extracted: ${pdfData.text.length} characters`);

    let extractedText = pdfData.text.trim();

    // If very little text was extracted, the PDF might be scanned/image-based
    // In that case, we should use OCR
    if (extractedText.length < 100) {
      console.log(`⚠️  Only ${extractedText.length} characters found. PDF might be scanned. Falling back to OCR...`);
      extractedText = await extractWithOCR(filePath);
    } else {
      console.log(`✅ Successfully extracted ${extractedText.length} characters using direct extraction`);
    }

    // Clean up the extracted text
    console.log("🧹 Cleaning extracted text...");
    const cleanedText = extractedText
      .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
      .replace(/[ \t]+\n/g, "\n") // Remove trailing spaces
      .replace(/\n\n/g, " ") // Convert double newlines to spaces
      .replace(/\n/g, " ") // Convert single newlines to spaces
      .replace(/ {2,}/g, " ") // Remove multiple spaces
      .trim();

    console.log(`✅ Final extracted text: ${cleanedText.length} characters`);
    return cleanedText;

  } catch (error: any) {
    console.error("❌ ==================== DIRECT EXTRACTION FAILED ====================");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("==================================================================");

    // If pdf-parse fails, try OCR as fallback
    try {
      console.log("🔄 Attempting OCR fallback...");
      const text = await extractWithOCR(filePath);
      return text;
    } catch (ocrError: any) {
      console.error("❌ ==================== OCR FALLBACK FAILED ====================");
      console.error("OCR Error name:", ocrError.name);
      console.error("OCR Error message:", ocrError.message);
      console.error("OCR Error stack:", ocrError.stack);
      console.error("Full OCR error object:", JSON.stringify(ocrError, null, 2));
      console.error("===============================================================");

      // Return detailed error message
      throw new Error(
        `EXTRACTION_FAILED: Both direct extraction and OCR failed.\n` +
        `Direct extraction error: ${error.message}\n` +
        `OCR error: ${ocrError.message}\n` +
        `Original error stack: ${error.stack}`
      );
    }
  }
};

// OCR-based extraction for scanned PDFs (requires pdf-poppler to be installed on system)
async function extractWithOCR(filePath: string): Promise<string> {
  console.log("🔄 Using OCR to extract text from scanned PDF...");
  console.log(`📂 OCR File path: ${filePath}`);

  try {
    console.log("📦 Loading pdf-poppler module...");
    const pdf = require("pdf-poppler");

    // Convert PDF to images
    const outputDir = path.join(__dirname, "../../uploads/temp");
    console.log(`📁 Output directory: ${outputDir}`);

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      console.log("📁 Creating temp directory...");
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const opts = {
      format: "png",
      out_dir: outputDir,
      out_prefix: path.basename(filePath, path.extname(filePath)),
      page: null, // Convert all pages
    };
    console.log("⚙️ PDF conversion options:", JSON.stringify(opts, null, 2));

    // Convert PDF pages to images
    console.log("📸 Converting PDF to images using pdf-poppler...");
    await pdf.convert(filePath, opts);
    console.log("✅ PDF to image conversion completed");

    // Find all generated images
    console.log("🔍 Scanning for generated image files...");
    const files = fs.readdirSync(outputDir);
    console.log(`📂 Files in output directory: ${files.join(", ")}`);

    const imageFiles = files
      .filter((file) => file.startsWith(opts.out_prefix) && file.endsWith(".png"))
      .sort(); // Sort to maintain page order

    console.log(`📖 PDF has ${imageFiles.length} pages (images: ${imageFiles.join(", ")})`);

    if (imageFiles.length === 0) {
      throw new Error(`NO_IMAGES_GENERATED: No PNG images were generated from the PDF. Expected prefix: ${opts.out_prefix}`);
    }

    let allText = "";

    // OCR each page image
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const imagePath = path.join(outputDir, imageFile);

      console.log(`🔄 Processing page ${i + 1} of ${imageFiles.length}... (${imageFile})`);
      console.log(`📂 Image path: ${imagePath}`);

      const result = await Tesseract.recognize(imagePath, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`   OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const pageText = result.data.text.trim();
      console.log(`📝 Extracted ${pageText.length} characters from page ${i + 1}`);

      if (pageText) {
        allText += pageText + "\n\n";
      }

      // Clean up image file
      try {
        fs.unlinkSync(imagePath);
        console.log(`🗑️ Deleted temp file: ${imageFile}`);
      } catch (err: any) {
        console.warn(`⚠️ Warning: Could not delete temp file ${imagePath}: ${err.message}`);
      }
    }

    // Clean up the extracted text
    console.log("🧹 Cleaning OCR extracted text...");
    const cleanedText = allText
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/ {2,}/g, " ")
      .trim();

    console.log(`✅ OCR extracted ${cleanedText.length} characters (cleaned)`);
    return cleanedText;

  } catch (error: any) {
    console.error("❌ ==================== OCR EXTRACTION FAILED ====================");
    console.error("OCR Error name:", error.name);
    console.error("OCR Error message:", error.message);
    console.error("OCR Error stack:", error.stack);
    console.error("OCR Error code:", error.code);
    console.error("Full OCR error object:", JSON.stringify(error, null, 2));
    console.error("================================================================");

    throw new Error(
      `OCR_FAILED: ${error.message}\n` +
      `Error type: ${error.name}\n` +
      `Hint: If error mentions 'pdftoppm' or 'pdf-poppler', install Poppler on your system.\n` +
      `Stack: ${error.stack}`
    );
  }
}

export const isPDF = (mimetype: string): boolean => {
  return mimetype === "application/pdf";
};
