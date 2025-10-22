import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { config } from "./config/env";
import { initializeWhatsApp } from "./services";
import { extractTextFromPDF } from "./utils/pdfParser";

const app = express();
const PORT = config.server.port;

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Middleware
app.use(morgan("dev")); // Log HTTP requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize WhatsApp
initializeWhatsApp();

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "WhatsApp AI Bot Server",
    status: "running",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// PDF parsing test endpoint
app.post(
  "/parse-pdf",
  upload.single("file"),
  async (req: Request, res: Response) => {
    // Log request details FIRST - before any try/catch or conditional logic
    console.log("\n📥 ========== PDF PARSE REQUEST ==========");
    console.log("Timestamp:", new Date().toISOString());
    console.log("File uploaded:", req.file?.originalname);
    console.log("File size:", req.file?.size, "bytes");
    console.log("File path:", req.file?.path);
    console.log("=========================================\n");

    try {
      if (!req.file) {
        console.error("❌ No file uploaded in request");
        return res.status(400).json({
          error: "NO_FILE",
          message:
            "No file uploaded. Please upload a PDF file with the key 'file'",
        });
      }

      const filePath = req.file.path;
      console.log("🔄 Starting PDF extraction...");

      // Extract text from PDF
      const extractedText = await extractTextFromPDF(filePath);
      console.log("✅ PDF extraction successful!");

      // Clean up - delete the uploaded file
      fs.unlinkSync(filePath);
      console.log("🗑️ Cleaned up uploaded file");

      // Return the extracted text
      res.json({
        success: true,
        filename: req.file.originalname,
        extractedText: extractedText,
        textLength: extractedText.length,
      });
      console.log("✅ Response sent successfully\n");
    } catch (error: any) {
      console.error("\n❌ ========== PDF PARSE ERROR ==========");
      console.error("Error caught in Express handler");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Full error:", error);
      console.error("=======================================\n");

      // Clean up file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          console.log("🗑️ Cleaned up uploaded file after error");
        } catch (cleanupError: any) {
          console.error("⚠️ Failed to clean up file:", cleanupError.message);
        }
      }

      res.status(500).json({
        success: false,
        error: "PDF_EXTRACTION_FAILED",
        errorType: error.name || "Unknown",
        message: error.message || "Failed to extract text from PDF",
        details: {
          fileName: req.file?.originalname,
          fileSize: req.file?.size,
          stack: error.stack,
        },
      });
    }
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
