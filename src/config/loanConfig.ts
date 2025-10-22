export interface LoanType {
  name: string;
  displayName: string;
  suggestedDocuments: string[]; // Changed from requiredDocuments to suggestedDocuments
  requiredFields: string[];
}

export const loanTypes: Record<string, LoanType> = {
  gold_loan: {
    name: "gold_loan",
    displayName: "Gold Loan",
    suggestedDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport) - to extract name, DOB, address",
      "Gold appraisal certificate - to extract weight and purity",
      "Address Proof - to extract address details",
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
    suggestedDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport) - to extract name, DOB, address",
      "Income Proof (Salary Slips/Bank Statements) - to extract income, employer details",
      "Address Proof - to extract address",
      "Vehicle quotation - to extract vehicle model and price",
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
    suggestedDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport) - to extract name, DOB, PAN, address",
      "Income Proof (Salary Slips/Bank Statements) - to extract income, employer name",
      "Address Proof - to extract current address",
      "Employment letter - to extract employer name, employment type",
      "Credit Score Report (optional) - to assess creditworthiness",
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
    suggestedDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport) - to extract name, DOB, PAN, address",
      "Income Proof (Salary Slips/ITR) - to extract income, employer details",
      "Bank Statements - to verify income and financial stability",
      "Property Documents - to extract property value, address, type",
      "Sale Agreement - to extract property price and terms",
      "Employment Proof - to extract employer name, employment type",
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
    suggestedDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport) - to extract name, DOB, PAN, address",
      "Income Proof (Salary Slips/Bank Statements) - to extract income details",
      "Address Proof - to extract current address",
      "Vehicle Quotation/Pro-forma Invoice - to extract vehicle make, model, price",
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
    suggestedDocuments: [
      "Valid ID Proof (Aadhaar/PAN/Passport) - to extract owner name, DOB, PAN",
      "Business Registration Documents - to extract business name, type, registration date",
      "GST Registration Certificate - to extract GST number",
      "ITR (Last 2 years) - to extract annual turnover, profit",
      "Bank Statements (Business Account) - to verify turnover and financial health",
      "Business Address Proof - to extract business location",
      "Financial Statements (Balance Sheet, P&L) - to extract turnover, profit margins",
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
    suggestedDocuments: [
      "Valid ID Proof (Aadhaar/Student ID) - to extract name, DOB",
      "Resume/CV - to extract college, skills, projects, internships, GitHub",
      "Academic Transcripts/Grade Reports - to extract GPA/CGPA, course, year",
      "College Admission Letter - to extract college name, course",
      "Parent/Guardian Income Proof (if co-applicant) - to extract income details",
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
