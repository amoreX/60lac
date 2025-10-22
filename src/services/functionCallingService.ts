import { LoanApplication } from "../types";

// Define the function schema for OpenAI
export const loanApplicationFunction = {
  name: "submit_loan_application",
  description:
    "Submit a complete loan application once all required information has been collected from the customer. This should only be called when ALL required fields for the specific loan type have been gathered.",
  parameters: {
    type: "object",
    properties: {
      loan_type: {
        type: "string",
        enum: [
          "gold_loan",
          "two_wheeler_loan",
          "personal_loan",
          "home_loan",
          "car_loan",
          "business_loan",
          "student_loan", // TESTING ONLY - REMOVE AFTER TESTING
        ],
        description: "The type of loan the customer is applying for",
      },
      customer_details: {
        type: "object",
        description:
          "All collected customer information and loan-specific details. Include all fields that were gathered during the conversation.",
        properties: {
          full_name: { type: "string" },
          phone_number: { type: "string" },
          email: { type: "string" },
          address: { type: "string" },
          date_of_birth: { type: "string" },
          pan_number: { type: "string" },
          employment_type: { type: "string" },
          employer_name: { type: "string" },
          monthly_income: { type: "number" },
          loan_amount_required: { type: "number" },
          loan_tenure_months: { type: "number" },
          loan_tenure_years: { type: "number" },
        },
        additionalProperties: true,
      },
      documents_received: {
        type: "array",
        items: { type: "string" },
        description:
          "List of document names/types that the customer has uploaded",
      },
    },
    required: ["loan_type", "customer_details", "documents_received"],
  },
};

// Handle the loan application submission
export const handleLoanSubmission = (
  loanData: LoanApplication,
  phoneNumber: string
): void => {
  console.log("\n" + "=".repeat(80));
  console.log("🎉 LOAN APPLICATION SUBMITTED");
  console.log("=".repeat(80));
  console.log("\n📋 APPLICATION DETAILS:\n");
  console.log(`Phone Number: ${phoneNumber}`);
  console.log(`Loan Type: ${loanData.loan_type.toUpperCase().replace(/_/g, " ")}`);
  console.log(`Submission Time: ${loanData.timestamp || new Date().toISOString()}`);

  console.log("\n👤 CUSTOMER DETAILS:");
  console.log(JSON.stringify(loanData.customer_details, null, 2));

  console.log("\n📄 DOCUMENTS RECEIVED:");
  loanData.documents_received.forEach((doc, index) => {
    console.log(`  ${index + 1}. ${doc}`);
  });

  console.log("\n" + "=".repeat(80));
  console.log("✅ Application logged successfully!");
  console.log("=".repeat(80) + "\n");
};
