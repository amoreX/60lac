# Student Loan - Testing Feature

## 🎓 Student Loan Added for Testing

The Student Loan option has been added to test the system's capabilities including:
- Resume parsing
- GPA/CGPA extraction
- Hackathon participation tracking
- Project and technical skills extraction
- GitHub profile linking

### Required Fields:
- Full Name
- Phone Number
- Email
- College Name
- Course Name
- Year of Study
- GPA/CGPA
- Number of Hackathons Participated
- Number of Projects
- Technical Skills
- Internship Experience
- GitHub Profile
- Loan Amount Required
- Purpose of Loan

### Required Documents:
- Valid ID Proof (Aadhaar/Student ID)
- Resume/CV
- Academic Transcripts/Grade Reports
- College Admission Letter (if applicable)
- Parent/Guardian Income Proof (if co-applicant)

---

## 🗑️ How to Remove Student Loan After Testing

### Step 1: Remove from Loan Configuration
**File:** `src/config/loanConfig.ts`

**Remove lines 162-190:**
```typescript
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
```

### Step 2: Remove from Function Calling Service
**File:** `src/services/functionCallingService.ts`

**Remove from enum (line 20):**
```typescript
"student_loan", // TESTING ONLY - REMOVE AFTER TESTING
```

### That's It!
Just remove these two sections and the student loan option will be completely removed from the system.

---

## 📝 Testing Tips

1. **Upload Resume (PDF):** The system will extract name, college, skills, projects, etc.
2. **Upload Transcript (Image):** AI will extract GPA and course details
3. **Send text messages:** Provide hackathon participation, GitHub profile, etc.
4. **Check console:** Once all fields collected, loan submission will be logged

The AI will intelligently extract all information from documents and ask for missing fields one by one!
