# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **WhatsApp AI Bank Loan Assistant** built with TypeScript, Express, OpenAI GPT-4o-mini, and whatsapp-web.js. The bot helps customers apply for various types of loans through WhatsApp conversations, extracting information from documents (PDFs and images), maintaining conversation history, and using OpenAI function calling to submit complete loan applications.

## Development Commands

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start
```

## Architecture Overview

### Functional Programming Approach
This codebase uses **plain functions** instead of classes throughout. All services, utilities, and handlers are implemented as standalone functions with module-level state where needed.

### Core Architecture Layers

1. **Entry Point** (`src/index.ts`)
   - Express server setup with morgan HTTP request logging
   - WhatsApp service initialization
   - PDF parsing test endpoint (`/parse-pdf`) with detailed error handling
   - Simple health check endpoints

2. **Configuration Layer** (`src/config/`)
   - `env.ts`: Environment config, system prompt for AI assistant
   - `loanConfig.ts`: Loan type definitions with required fields/documents
   - `openai.ts`: OpenAI client initialization

3. **Services Layer** (`src/services/`)
   - `whatsappService.ts`: WhatsApp client lifecycle, event handlers
   - `conversationService.ts`: Per-user conversation history (Map-based storage, max 100 messages)
   - `openAIService.ts`: OpenAI API calls with function calling support, eligibility response generation
   - `functionCallingService.ts`: Loan submission function schema, handler, and eligibility calculation

4. **Handlers Layer** (`src/handlers/`)
   - `messageHandler.ts`: Main message routing (text vs media)
   - Handles PDF extraction, image analysis, and text messages

5. **Utils Layer** (`src/utils/`)
   - `logger.ts`: Console logging functions
   - `fileHandler.ts`: File saving and uploads directory management
   - `phoneNumberFormatter.ts`: WhatsApp number cleaning
   - `pdfParser.ts`: PDF text extraction with comprehensive error handling
     - Primary: Direct text extraction using pdf-parse
     - Fallback: OCR extraction using Tesseract.js and pdf-poppler
     - Detailed logging at every step for debugging
     - Structured error messages with stack traces and context

6. **Types Layer** (`src/types/`)
   - TypeScript interfaces for messages, media, loan applications

### Key Data Flow

1. **WhatsApp Message → Handler**
   - Message received via whatsapp-web.js
   - Phone number cleaned and used as conversation key
   - Routes to text or media handler

2. **Media Processing**
   - **PDFs**: Two-phase text extraction approach
     - Phase 1: Direct extraction via pdf-parse (fast, works for text-based PDFs)
     - Phase 2: OCR fallback via Tesseract.js + pdf-poppler (for scanned/image PDFs)
     - Automatic fallback if direct extraction yields < 100 characters
     - Text cleaning and normalization (whitespace, newlines)
   - **Images**: Sent to OpenAI Vision API with enhanced extraction prompt
   - All media saved to `uploads/` directory
   - Files stored with comprehensive logging to console

3. **Conversation History**
   - Stored in Map per phone number (key: cleaned number)
   - Max 100 messages per user (configurable in `config/env.ts`)
   - System message includes full loan workflow and requirements
   - History passed to OpenAI for context-aware responses

4. **OpenAI Function Calling**
   - Function: `submit_loan_application`
   - Called automatically when AI determines all required fields collected
   - Calculates loan eligibility (random score 0-100, >50 = eligible)
   - Passes eligibility data back to OpenAI via system message
   - AI generates natural, contextual response (no hardcoded messages)
   - Response is added to conversation history automatically
   - Logs complete application details to console
   - Sends AI-generated response to user

### Loan Types System

Loan types defined in `src/config/loanConfig.ts`:
- Each loan has `suggestedDocuments` (optional helpers) and `requiredFields` arrays
- Documents are OPTIONAL - customers can provide info manually OR upload documents
- AI extracts information from documents and asks only for missing required fields
- System prompt dynamically includes all loan types

**Production Loan Types:**
- Gold Loan
- Two Wheeler Loan
- Personal Loan
- Home Loan
- Car Loan
- Business Loan

**Testing:**
- Student Loan is added for testing (marked with comments)
- See `STUDENT_LOAN_TESTING.md` for removal instructions

## Important Implementation Details

### Express Server & Endpoints
- **HTTP logging**: Morgan middleware logs all HTTP requests in "dev" format
- **Test endpoint**: `POST /parse-pdf` for testing PDF extraction
  - Accepts PDF files via multipart/form-data with key "file"
  - Returns extracted text with character count
  - Comprehensive error responses with error type, message, stack trace
  - Automatic file cleanup after processing (success or failure)
  - Request logging executes before any conditional logic for consistent visibility

### WhatsApp Session
- QR code displayed in terminal on first run
- Session cached by whatsapp-web.js (`.wwebjs_auth/`, `.wwebjs_cache/`)
- No need to re-scan QR on subsequent runs

### Environment Variables
Required in `.env`:
```
OPENAI_API_KEY=your_key_here
PORT=3000
```

### PDF Parser Implementation
The pdf-parse library has TypeScript typing issues. Current solution uses:
```typescript
const pdfParse = require("pdf-parse");
const data = await pdfParse(dataBuffer);
```

### PDF Extraction Details
- **Direct extraction**: Uses pdf-parse to extract text from text-based PDFs
- **OCR fallback**: Triggered automatically if < 100 characters extracted
  - Requires `pdf-poppler` npm package AND Poppler system utility installed
  - Converts PDF pages to PNG images via pdf-poppler
  - Runs Tesseract.js OCR on each page image
  - Cleans up temporary image files after processing
- **Error handling**: Multi-level try-catch blocks with detailed logging
  - File existence checks with specific errors
  - Detailed error messages including error type, message, and full stack traces
  - Hints for common issues (missing Poppler installation)
  - Boxed error output sections for easy visual identification

### HTTP Request Logging
- **Morgan middleware**: Configured with "dev" format for colored, concise logs
- **Custom endpoint logging**: Detailed request logs for `/parse-pdf` endpoint
  - Logs execute immediately when endpoint is hit (before any conditional logic)
  - Includes: timestamp, filename, file size, file path
  - Ensures visibility for both success and failure scenarios

### Image Analysis Enhancement
Images sent to OpenAI with comprehensive extraction prompt requesting:
- Personal details (name, DOB, address, phone, email)
- ID numbers (Aadhaar, PAN, etc.)
- Financial information (income, salary, bank details)
- Employment details
- Property/vehicle details
- All other visible information relevant to loan applications

### Conversation History Storage
- In-memory Map (not persistent across restarts)
- Each phone number gets isolated conversation
- Auto-trimming to last 100 messages plus system message
- Suitable for development/testing; replace with database for production

### Function Calling Flow
1. User provides information through conversation
2. AI tracks required fields for selected loan type
3. When all fields collected, AI calls `submit_loan_application`
4. Function handler logs all details to console (formatted)
5. Eligibility is calculated (random score 0-100, >50 = eligible)
6. Eligibility data is passed to OpenAI to generate a natural, contextual response
7. AI-generated response is added to conversation history as "assistant" message
8. Response sent to user via WhatsApp

## File Structure Patterns

```
src/
├── config/         # Configuration (env, loan types, OpenAI client)
├── services/       # Business logic (WhatsApp, OpenAI, conversation)
├── handlers/       # Message processing (text, media routing)
├── utils/          # Utilities (logging, file handling, PDF parsing)
├── types/          # TypeScript interfaces
└── index.ts        # Express server entry point
```

Each module uses barrel exports (`index.ts`) for clean imports.

## Adding New Loan Types

1. Add loan definition to `src/config/loanConfig.ts`
2. Add loan type to enum in `src/services/functionCallingService.ts`
3. System prompt automatically includes new type via `getLoanTypesList()`

## Modifying System Behavior

- **AI personality/workflow**: Edit system message in `src/config/env.ts`
- **Conversation length**: Change `maxHistoryLength` in `src/config/env.ts`
- **Document extraction prompts**: Edit in `src/handlers/messageHandler.ts`
- **Loan submission output**: Modify `handleLoanSubmission()` in `src/services/functionCallingService.ts`
- **Eligibility calculation**: Modify `calculateLoanEligibility()` in `src/services/functionCallingService.ts`
- **Eligibility response generation**: Edit system message prompt in `src/services/openAIService.ts` (lines 38-49)
- **HTTP request logging**: Morgan middleware in `src/index.ts` (line 26)
- **PDF extraction logging**: Detailed logging in `src/utils/pdfParser.ts`
- **Endpoint request logging**: Custom logging in `/parse-pdf` endpoint (lines 54-59)

## Debugging & Troubleshooting

### Viewing Logs
- **HTTP requests**: Morgan logs appear for all endpoints (method, URL, status, response time)
- **PDF processing**: Detailed step-by-step logs with emojis for easy scanning
- **Errors**: Boxed error sections with full context (error type, message, stack trace)

### Common Issues
1. **PDF extraction fails with Poppler error**
   - Install Poppler system utility (separate from npm package)
   - Windows: `choco install poppler` or download from poppler.freedesktop.org
   - Linux: `sudo apt-get install poppler-utils`
   - macOS: `brew install poppler`

2. **Request logs not showing**
   - Check that morgan middleware is loaded (`app.use(morgan("dev"))`)
   - Verify logs aren't buried in WhatsApp QR code output
   - Custom endpoint logs execute before any conditional logic to ensure visibility

3. **OCR extraction slow**
   - Expected behavior - OCR processes each PDF page as an image
   - Progress logged per page with percentage completion
   - Only triggered when direct extraction yields < 100 characters
