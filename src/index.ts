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
    try {
      if (!req.file) {
        return res.status(400).json({
          error:
            "No file uploaded. Please upload a PDF file with the key 'file'",
        });
      }

      const filePath = req.file.path;

      // Extract text from PDF
      const extractedText = await extractTextFromPDF(filePath);

      // Clean up - delete the uploaded file
      fs.unlinkSync(filePath);

      // Return the extracted text
      res.json({
        success: true,
        filename: req.file.originalname,
        extractedText: extractedText,
        textLength: extractedText.length,
      });
    } catch (error: any) {
      // Clean up file if it exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Error parsing PDF vbro:", error);
      res.status(500).json({
        error: "Failed to parse PDF twin",
        details: error.message,
      });
    }
  },
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
