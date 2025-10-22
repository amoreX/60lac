import express, { Request, Response } from "express";
import { config } from "./config/env";
import { initializeWhatsApp } from "./services";

const app = express();
const PORT = config.server.port;

// Middleware
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
