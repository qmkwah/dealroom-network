# Claude Code Implementation Plan: 3.1 Create Inquiry Submission Form

## Objective
Develop a form that allows capital partners to submit inquiries or express interest in a specific investment opportunity.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Capital partners need a way to communicate their interest in an opportunity to the deal sponsor. This involves creating a form on the opportunity detail page where they can submit their inquiry, potentially including an amount of interest or a message.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Form Visibility**: Log in as a `capital_partner`. Navigate to an opportunity detail page. Assert that an "Express Interest" or "Request Information" button/form is visible and interactive.
    *   **Test Case 2: Successful Inquiry Submission**: Fill out the inquiry form with valid data (e.g., investment amount interest, message). Submit the form. Assert that a success message is displayed and the form is cleared or replaced with a confirmation.
    *   **Test Case 3: Database Entry Verification**: After a successful submission, query the Supabase `investment_inquiries` table to confirm that a new record has been created with the submitted data, correctly linked to the `opportunity_id`, `investor_id`, and `sponsor_id`.
    *   **Test Case 4: Validation on Submission**: Attempt to submit the form with missing required fields or invalid data types. Assert that appropriate client-side validation errors are displayed.
    *   **Test Case 5: Sponsor Notification**: (Requires backend/email testing) Verify that the `deal_sponsor` associated with the opportunity receives a notification (e.g., in-app or email) about the new inquiry.

3.  **Implement the Task**: 
    *   **Integrate Inquiry Form into Opportunity Detail Page (`src/app/(dashboard)/opportunities/[id]/page.tsx`)**:
        *   Within the opportunity detail page, add a section for the inquiry form. This section should only be visible to `capital_partner` users.
        *   The form should include fields for `inquiry_type` (e.g., general interest, request information, schedule meeting, investment proposal), `investment_amount_interest` (optional), and `message`.
        *   Use Shadcn/ui components for form elements.
        *   Implement client-side validation using Zod and React Hook Form.
    *   **Create API Route for Inquiry Submission (`src/app/api/inquiries/route.ts`)**:
        *   Handle `POST` requests to this route.
        *   Receive form data from the request body, including `opportunity_id`, `investor_id` (from authenticated user session), and `sponsor_id` (fetched from the opportunity).
        *   Perform server-side validation.
        *   Use the Supabase client to insert the new inquiry into the `investment_inquiries` table.
        *   Handle success and error responses.
        *   **Implement Notification Logic**: After successfully creating an inquiry, trigger a notification to the `deal_sponsor` (e.g., by inserting a record into the `notifications` table or sending an email via Resend).

4.  **Run Tests & Verify**: 
    *   Manually test submitting inquiries as a capital partner and verify the database entries.
    *   Log in as the deal sponsor and confirm the inquiry appears in their dashboard.
    *   (For automated tests) Develop Playwright tests to simulate inquiry submission and verify the database and UI updates.


