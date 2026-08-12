# Implementation Plan: Real-World Enterprise Portal Enhancements

This plan outlines the steps to transform the Campus Placement Portal into a realistic enterprise-grade system, implementing the requested features without breaking existing core workflows.

## Proposed Changes

### 1. CGPA-Based Eligibility Engine
- **Backend (`JobController.java`)**: 
  - Modify `getEligibleJobs()` to fetch **all** active jobs, instead of filtering them out by CGPA at the database level.
- **Frontend (`dashboard.js`, `dashboard.html`)**: 
  - Render all jobs but apply a strict UI validation rule.
  - If a student's CGPA is less than the job's `min_cgpa`, disable the "Apply" button and show a red badge/message: `"Ineligible: Required CGPA is X.X (Your CGPA: Y.Y)"`.
  - Add a dynamic checkbox/toggle to "Show Only Eligible Jobs" to fulfill the filter requirement.

### 2. Comprehensive Job Post Details
- **Backend (`JobPosting.java`, `JobPostingDTO.java`, `CompanyController.java`)**:
  - Add new string fields: `ctcComponents`, `selectionRounds`, and `bondDetails`.
  - Update `createJob` and `updateJob` APIs to handle these fields.
- **Frontend (`company-dashboard.html`, `dashboard.html`)**:
  - Update the "Post Job" and "Edit Job" forms to capture these new details.
  - Update the Student "Job Details" modal to display these comprehensive fields cleanly.

### 3. Realistic Application Pipeline
- **Backend (`JobApplication.java`, `JobApplicationDTO.java`, `CompanyController.java`)**:
  - Add fields: `interviewDetails` (String) and `offerLetterUrl` (String).
  - Update `updateApplicationStatus` API to accept a JSON object `{ status, interviewDetails, offerLetterUrl }` rather than a raw string, to capture context when moving to specific stages.
- **Frontend (`company-dashboard.js`, `dashboard.js`)**:
  - Company Portal: When a company changes status to `INTERVIEW_SCHEDULED`, prompt a modal to input interview dates/links. When changing to `SELECTED`, prompt for an offer letter link/path.
  - Student Portal: Display these details in the "My Applications" list.

### 4. Realistic Data Seeding
- **Backend (`DataSeeder.java`)**:
  - Create a Spring Boot `CommandLineRunner` component that runs on startup.
  - It will safely insert 5 realistic Company Users, Company Profiles, and detailed Job Postings (Google, Microsoft, Amazon, Deloitte, TCS Digital) complete with varying CGPA requirements (7.0 to 8.5) and the newly added comprehensive fields if they don't already exist.

### 5. Real-Time Analytics Dashboard
- **Frontend (`index.html`, `admin-dashboard.html`, `company-dashboard.html`)**:
  - Import `Chart.js` via CDN.
  - **Admin Dashboard**: Add a pie chart for Branch-wise Placements and a bar chart for Salary Distribution in the `dashboardSection`.
  - **Company Dashboard**: Add a chart for Application Status conversion rates.
- **Backend (`AdminController.java`, `CompanyController.java`)**:
  - Implement `/api/admin/analytics` and `/api/companies/analytics` endpoints to aggregate and return the JSON data required for the charts.

## User Review Required
> [!IMPORTANT]
> The backend API `PUT /api/companies/applications/{appId}/status` currently accepts a raw String as the request body. To support sending Interview Details and Offer Letters along with the status update, I will change this to accept a JSON object. This is a minor breaking change internally but I will update the frontend JavaScript simultaneously so the application won't break for users. 

## Verification Plan
1. Launch the backend (this will automatically seed the realistic company and job data).
2. Login as a student with a 7.5 CGPA and verify that the Google (8.5 CGPA) job's Apply button is properly disabled with the custom ineligible message.
3. Login as a Company, move a student to `INTERVIEW_SCHEDULED`, and verify the prompt to enter interview details works.
4. Login as Admin and verify the new `Chart.js` real-time analytics graphs render successfully.
