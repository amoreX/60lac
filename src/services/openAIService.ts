import { openai } from "../config/openai";
import { ConversationMessage, LoanApplication } from "../types";
import { loanApplicationFunction, handleLoanSubmission } from "./functionCallingService";
import { addMessage } from "./conversationService";

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

        // Get eligibility result from loan submission handler
        const eligibilityResult = handleLoanSubmission(loanData, phoneNumber);

        // Create a new system message with eligibility data for AI to generate response
        const eligibilityMessage = {
          role: "system" as const,
          content: `LOAN APPLICATION PROCESSED:
- Application Status: Submitted Successfully
- Eligibility Check: Completed
- Eligible: ${eligibilityResult.eligible ? "YES" : "NO"}
- Eligibility Score: ${eligibilityResult.eligibilityScore}%
- Loan Type: ${loanData.loan_type.replace(/_/g, " ").toUpperCase()}
- Loan Amount Requested: ${loanData.customer_details.loan_amount_required || "N/A"}

Generate a natural, friendly response informing the customer about their eligibility status. If eligible, congratulate them and mention next steps. If not eligible, be empathetic and suggest they may reapply in the future.`,
        };

        // Call OpenAI again with eligibility data to generate natural response
        const followUpCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [...messages, eligibilityMessage] as any,
          max_tokens: maxTokens,
        });

        const aiResponse =
          followUpCompletion.choices[0].message.content ||
          "Your loan application has been submitted successfully!";

        // Add the AI response to conversation history
        addMessage(phoneNumber, "assistant", aiResponse);

        return aiResponse;
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
