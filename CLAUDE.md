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
   - Express server setup
   - WhatsApp service initialization
   - Simple health check endpoints

2. **Configuration Layer** (`src/config/`)
   - `env.ts`: Environment config, system prompt for AI assistant
   - `loanConfig.ts`: Loan type definitions with required fields/documents
   - `openai.ts`: OpenAI client initialization

3. **Services Layer** (`src/services/`)
   - `whatsappService.ts`: WhatsApp client lifecycle, event handlers
   - `conversationService.ts`: Per-user conversation history (Map-based storage, max 100 messages)
   - `openAIService.ts`: OpenAI API calls with function calling support
   - `functionCallingService.ts`: Loan submission function schema and handler

4. **Handlers Layer** (`src/handlers/`)
   - `messageHandler.ts`: Main message routing (text vs media)
   - Handles PDF extraction, image analysis, and text messages

5. **Utils Layer** (`src/utils/`)
   - `logger.ts`: Console logging functions
   - `fileHandler.ts`: File saving and uploads directory management
   - `phoneNumberFormatter.ts`: WhatsApp number cleaning
   - `pdfParser.ts`: PDF text extraction using pdf-parse

6. **Types Layer** (`src/types/`)
   - TypeScript interfaces for messages, media, loan applications

### Key Data Flow

1. **WhatsApp Message → Handler**
   - Message received via whatsapp-web.js
   - Phone number cleaned and used as conversation key
   - Routes to text or media handler

2. **Media Processing**
   - **PDFs**: Text extracted via pdf-parse, sent to OpenAI with full content
   - **Images**: Sent to OpenAI Vision API with enhanced extraction prompt
   - All media saved to `uploads/` directory
   - Files stored, detailed logs to console

3. **Conversation History**
   - Stored in Map per phone number (key: cleaned number)
   - Max 100 messages per user (configurable in `config/env.ts`)
   - System message includes full loan workflow and requirements
   - History passed to OpenAI for context-aware responses

4. **OpenAI Function Calling**
   - Function: `submit_loan_application`
   - Called automatically when AI determines all required fields collected
   - Logs complete application details to console
   - Sends confirmation message to user

### Loan Types System

Loan types defined in `src/config/loanConfig.ts`:
- Each loan has `requiredDocuments` and `requiredFields` arrays
- AI extracts information from documents and asks for missing fields
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

### PDF Parser Issue
The pdf-parse library has TypeScript typing issues. Current solution uses:
```typescript
import * as pdfParse from "pdf-parse";
// @ts-ignore
const data = await pdfParse.default(dataBuffer);
```

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
5. Confirmation message sent to user

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
