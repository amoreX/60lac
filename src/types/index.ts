export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string | any[];
  timestamp?: number;
}

export interface MediaInfo {
  filename: string;
  mimetype: string;
  data: string;
  size: number;
  filePath: string;
}

export interface MessageContext {
  phoneNumber: string;
  cleanNumber: string;
  text?: string;
  hasMedia: boolean;
}

export interface LoanApplication {
  loan_type: string;
  customer_details: Record<string, any>;
  documents_received: string[];
  timestamp: string;
  phone_number: string;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}
