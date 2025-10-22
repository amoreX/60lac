import { openai } from "../config/openai";
import { ConversationMessage, LoanApplication } from "../types";
import { loanApplicationFunction, handleLoanSubmission } from "./functionCallingService";

export const generateResponse = async (
  messages: ConversationMessage[],
  phoneNumber: string,
  maxTokens: number = 1000
): Promise<string> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      max_tokens: maxTokens,
      functions: [loanApplicationFunction],
      function_call: "auto",
    });

    const choice = completion.choices[0];

    // Check if the model wants to call a function
    if (choice.message.function_call) {
      const functionName = choice.message.function_call.name;
      const functionArgs = JSON.parse(choice.message.function_call.arguments);

      if (functionName === "submit_loan_application") {
        // Handle the loan submission
        const loanData: LoanApplication = {
          ...functionArgs,
          timestamp: new Date().toISOString(),
          phone_number: phoneNumber,
        };

        handleLoanSubmission(loanData, phoneNumber);

        // Return a confirmation message
        return "✅ Thank you! Your loan application has been successfully submitted. Our team will review your application and get back to you within 24-48 hours. You will receive updates on your registered phone number and email. Is there anything else I can help you with?";
      }
    }

    return (
      choice.message.content ||
      "Sorry, I could not process your request."
    );
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate AI response");
  }
};

export const analyzeImage = async (
  messages: ConversationMessage[],
  imageBase64: string,
  mimetype: string,
  caption?: string
): Promise<string> => {
  const userContent = [
    {
      type: "text",
      text: caption || "What's in this image?",
    },
    {
      type: "image_url",
      image_url: {
        url: `data:${mimetype};base64,${imageBase64}`,
      },
    },
  ];

  // Create a copy of messages and add the image content
  const messagesWithImage = [
    ...messages,
    {
      role: "user" as const,
      content: userContent,
    },
  ];

  return generateResponse(messagesWithImage, "unknown");
};
