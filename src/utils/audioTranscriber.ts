import fs from "fs";
import { openai } from "../config/openai";

/**
 * Transcribes audio file to text using OpenAI Whisper API with automatic language detection
 * Currently configured for English and Hindi language support
 * @param audioFilePath - Path to the audio file (mp3, mp4, mpeg, mpga, m4a, wav, webm, ogg)
 * @returns Transcribed text in the detected language
 */
export const transcribeAudio = async (audioFilePath: string): Promise<string> => {
  console.log("🎤 Starting audio transcription with Whisper API...");
  console.log("🌐 Supported languages: English & Hindi");
  console.log(`📁 Audio file: ${audioFilePath}`);

  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found at path: ${audioFilePath}`);
    }

    const fileStats = fs.statSync(audioFilePath);
    console.log(`📊 File size: ${(fileStats.size / 1024).toFixed(2)} KB`);

    // Create a read stream for the audio file
    const audioFile = fs.createReadStream(audioFilePath);

    console.log("☁️  Sending audio to OpenAI Whisper API (auto-detecting English/Hindi)...");

    // Call OpenAI Whisper API for transcription with automatic language detection
    // Note: Whisper doesn't support restricting to specific languages, but it will
    // accurately detect and transcribe English and Hindi when present
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      // language parameter omitted for automatic language detection between English and Hindi
      response_format: "text",
    });

    console.log(`✅ Transcription successful! (${transcription.length} characters)`);
    console.log("📝 Transcription preview:", transcription.substring(0, 100) + (transcription.length > 100 ? "..." : ""));

    return transcription;

  } catch (error: any) {
    console.error("❌ Error transcribing audio:");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);

    if (error.response) {
      console.error("API response error:", error.response.data);
    }

    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }

    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
};

/**
 * Checks if the mimetype is an audio format
 * @param mimetype - MIME type of the file
 * @returns true if audio format
 */
export const isAudio = (mimetype: string): boolean => {
  const audioFormats = [
    "audio/mpeg",      // MP3
    "audio/mp4",       // M4A, MP4
    "audio/ogg",       // OGG
    "audio/wav",       // WAV
    "audio/webm",      // WEBM
    "audio/x-m4a",     // M4A (alternate)
    "audio/aac",       // AAC
    "audio/opus",      // OPUS
  ];

  return audioFormats.some(format => mimetype.includes(format));
};

/**
 * Gets the appropriate file extension for an audio mimetype
 * @param mimetype - MIME type of the audio file
 * @returns File extension (e.g., "ogg", "mp3", "m4a")
 */
export const getAudioExtension = (mimetype: string): string => {
  if (mimetype.includes("ogg")) return "ogg";
  if (mimetype.includes("mp3") || mimetype.includes("mpeg")) return "mp3";
  if (mimetype.includes("m4a") || mimetype.includes("x-m4a")) return "m4a";
  if (mimetype.includes("mp4")) return "mp4";
  if (mimetype.includes("wav")) return "wav";
  if (mimetype.includes("webm")) return "webm";
  if (mimetype.includes("aac")) return "aac";
  if (mimetype.includes("opus")) return "opus";

  return "ogg"; // Default for WhatsApp voice notes
};
