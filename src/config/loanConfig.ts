export interface LoanType {
  name: string;
  displayName: string;
  requiredDocuments: string[];
  requiredFields: string[];
}

export const loanTypes: Record<string, LoanType> = {
  gold_loan: {
    name: "gold_loan",
    displayName: "Gold Loan",
    requiredDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport)",
      "Gold items for assessment",
      "Address Proof",
    ],
    requiredFields: [
      "full_name",
      "phone_number",
      "email",
      "address",
      "gold_weight_grams",
      "gold_purity_carats",
      "loan_amount_required",
    ],
  },
  two_wheeler_loan: {
    name: "two_wheeler_loan",
    displayName: "Two Wheeler Loan",
    requiredDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport)",
      "Income Proof (Salary Slips/Bank Statements - Last 3 months)",
      "Address Proof",
      "Employment Proof",
    ],
    requiredFields: [
      "full_name",
      "phone_number",
      "email",
      "address",
      "date_of_birth",
      "employment_type",
      "monthly_income",
      "vehicle_model",
      "vehicle_price",
      "down_payment",
      "loan_tenure_months",
    ],
  },
  personal_loan: {
    name: "personal_loan",
    displayName: "Personal Loan",
    requiredDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport)",
      "Income Proof (Salary Slips/Bank Statements - Last 6 months)",
      "Address Proof",
      "Employment Proof",
      "Credit Score Report (if available)",
    ],
    requiredFields: [
      "full_name",
      "phone_number",
      "email",
      "address",
      "date_of_birth",
      "pan_number",
      "employment_type",
      "employer_name",
      "monthly_income",
      "existing_loans",
      "loan_amount_required",
      "loan_tenure_months",
      "purpose_of_loan",
    ],
  },
  home_loan: {
    name: "home_loan",
    displayName: "Home Loan",
    requiredDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport)",
      "Income Proof (Salary Slips/ITR - Last 2 years)",
      "Bank Statements (Last 6 months)",
      "Property Documents",
      "Sale Agreement",
      "Address Proof",
      "Employment Proof",
    ],
    requiredFields: [
      "full_name",
      "phone_number",
      "email",
      "current_address",
      "date_of_birth",
      "pan_number",
      "employment_type",
      "employer_name",
      "monthly_income",
      "existing_loans",
      "property_value",
      "loan_amount_required",
      "loan_tenure_years",
      "property_address",
      "property_type",
      "co_applicant_details",
    ],
  },
  car_loan: {
    name: "car_loan",
    displayName: "Car Loan",
    requiredDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport)",
      "Income Proof (Salary Slips/Bank Statements - Last 3 months)",
      "Address Proof",
      "Employment Proof",
      "Vehicle Quotation/Pro-forma Invoice",
    ],
    requiredFields: [
      "full_name",
      "phone_number",
      "email",
      "address",
      "date_of_birth",
      "pan_number",
      "employment_type",
      "monthly_income",
      "vehicle_make",
      "vehicle_model",
      "vehicle_price",
      "down_payment",
      "loan_tenure_months",
    ],
  },
  business_loan: {
    name: "business_loan",
    displayName: "Business Loan",
    requiredDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport)",
      "Business Registration Documents",
      "GST Registration Certificate",
      "ITR (Last 2 years)",
      "Bank Statements (Last 6 months - Business Account)",
      "Business Address Proof",
      "Financial Statements (Balance Sheet, P&L)",
    ],
    requiredFields: [
      "full_name",
      "phone_number",
      "email",
      "business_name",
      "business_type",
      "business_address",
      "years_in_business",
      "gst_number",
      "pan_number",
      "annual_turnover",
      "monthly_profit",
      "loan_amount_required",
      "loan_tenure_months",
      "purpose_of_loan",
    ],
  },
  // ========== TESTING ONLY - REMOVE AFTER TESTING ==========
  student_loan: {
    name: "student_loan",
    displayName: "Student Loan",
    requiredDocuments: [
      "Valid ID Proof (Aadhaar/Student ID)",
      "Resume/CV",
      "Academic Transcripts/Grade Reports",
      "College Admission Letter (if applicable)",
      "Parent/Guardian Income Proof (if co-applicant)",
    ],
    requiredFields: [
      "full_name",
      "phone_number",
      "email",
      "college_name",
      "course_name",
      "year_of_study",
      "gpa_cgpa",
      "number_of_hackathons_participated",
      "number_of_projects",
      "technical_skills",
      "internship_experience",
      "github_profile",
      "loan_amount_required",
      "purpose_of_loan",
    ],
  },
  // ========== END TESTING SECTION ==========
};

export const getLoanTypesList = (): string => {
  return Object.values(loanTypes)
    .map((loan, index) => `${index + 1}. ${loan.displayName}`)
    .join("\n");
};

export const getLoanRequirements = (loanType: string): LoanType | null => {
  return loanTypes[loanType] || null;
};
