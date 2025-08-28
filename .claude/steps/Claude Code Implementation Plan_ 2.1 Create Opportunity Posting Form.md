# Claude Code Implementation Plan: 2.1 Create Opportunity Posting Form

## Objective
Develop a multi-step form for deal sponsors to create and submit new investment opportunities, capturing all necessary details as defined in the `investment_opportunities` table schema.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Create a user interface that allows deal sponsors to input all the required information for a new investment opportunity. This form should be intuitive and guide the user through the process, potentially using a multi-step approach for better user experience.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Form Accessibility**: Log in as a `deal_sponsor` and navigate to the "Create Opportunity" page (e.g., `/opportunities/new`). Assert that the form is rendered correctly with all expected input fields.
    *   **Test Case 2: Required Field Validation**: Attempt to submit the form with missing required fields (e.g., `opportunity_name`, `total_project_cost`, `equity_requirement`). Assert that appropriate client-side validation errors are displayed for each missing field.
    *   **Test Case 3: Data Type Validation**: Attempt to submit the form with invalid data types (e.g., text in a number field, incorrect date format). Assert that appropriate validation errors are displayed.
    *   **Test Case 4: Successful Form Submission (Basic)**: Fill out the form with valid, minimal data. Simulate submission. Assert that a success message is displayed and the user is redirected to a relevant page (e.g., the newly created opportunity's detail page or the sponsor's dashboard).
    *   **Test Case 5: Database Entry Verification**: After a successful submission, query the Supabase `investment_opportunities` table to confirm that a new record has been created with the submitted data.

3.  **Implement the Task**: 
    *   **Create Opportunity Form Page (`src/app/(dashboard)/opportunities/new/page.tsx`)**:
        *   Design a multi-step form using React state to manage form data across steps.
        *   Use Shadcn/ui components for all form elements (e.g., `Input`, `Textarea`, `Select`, `DatePicker`, `Button`).
        *   Implement client-side validation using a library like Zod and React Hook Form for robust form handling.
        *   The form should cover sections like:
            *   **Basic Information**: Opportunity Name, Description, Status.
            *   **Property Details**: Address (JSONB), Type, Subtype, Square Feet, Units, Year Built, Condition.
            *   **Financial Structure**: Total Project Cost, Equity Requirement, Debt Amount, Debt Type, Loan-to-Cost, Loan-to-Value.
            *   **Investment Terms**: Minimum Investment, Maximum Investment, Target Raise Amount, Projected IRR, Projected Total Return Multiple, Projected Hold Period, Cash-on-Cash Return, Preferred Return Rate, Waterfall Structure (JSONB).
            *   **Investment Strategy**: Strategy Type, Business Plan, Value Creation Strategy, Exit Strategy.
            *   **Timeline**: Fundraising Deadline, Expected Closing Date, Construction Start Date, Stabilization Date, Projected Exit Date.
            *   **Visibility**: Public Listing, Featured Listing, Accredited Only, Geographic Restrictions.
    *   **Create API Route for Opportunity Creation (`src/app/api/opportunities/route.ts`)**:
        *   Handle `POST` requests to this route.
        *   Receive form data from the request body.
        *   Perform server-side validation to ensure data integrity and security.
        *   Use the Supabase client to insert the new opportunity into the `investment_opportunities` table.
        *   Handle success and error responses, returning appropriate HTTP status codes and messages.
    *   **Supabase Integration**: Ensure the Supabase client is correctly configured to interact with the `investment_opportunities` table.

4.  **Run Tests & Verify**: 
    *   Manually test the form submission with various valid and invalid inputs.
    *   Verify that new opportunities appear in the Supabase database.
    *   (For automated tests) Develop Playwright tests to automate the form filling and submission process, asserting successful creation and validation error handling.


