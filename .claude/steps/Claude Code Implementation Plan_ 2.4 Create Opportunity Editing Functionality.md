# Claude Code Implementation Plan: 2.4 Create Opportunity Editing Functionality

## Objective
Enable deal sponsors to edit and update existing investment opportunities, ensuring data consistency and real-time reflection of changes.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Deal sponsors need to be able to modify the details of their previously created investment opportunities. This involves pre-filling the opportunity form with existing data, allowing updates, and saving changes back to the database.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Edit Form Accessibility**: Log in as a `deal_sponsor`. Navigate to one of your created opportunities' detail pages. Click the "Edit Opportunity" button. Assert that the editing form (likely the same multi-step form used for creation) is displayed and pre-filled with the existing opportunity data.
    *   **Test Case 2: Successful Update**: Modify one or more fields in the form (e.g., `opportunity_name`, `projected_irr`). Submit the form. Assert that a success message is displayed and the user is redirected to the updated opportunity's detail page.
    *   **Test Case 3: Database Update Verification**: After a successful update, query the Supabase `investment_opportunities` table to confirm that the specific record has been updated with the new data.
    *   **Test Case 4: Validation on Update**: Attempt to submit the edited form with invalid data (e.g., making a required field empty, entering an invalid number). Assert that appropriate client-side and server-side validation errors are displayed.
    *   **Test Case 5: Unauthorized Access**: Attempt to access the edit page of an opportunity not owned by the logged-in sponsor. Assert that access is denied or redirected to an unauthorized page.

3.  **Implement the Task**: 
    *   **Modify Opportunity Form Component**: The existing opportunity posting form (`src/app/(dashboard)/opportunities/new/page.tsx` or a shared component like `src/components/forms/opportunity-form.tsx`) should be made reusable for both creation and editing.
        *   It should accept an `opportunityId` prop or URL parameter. If `opportunityId` is present, fetch the existing opportunity data from Supabase and pre-fill the form fields.
    *   **Create Edit Opportunity Page (`src/app/(dashboard)/opportunities/[id]/edit/page.tsx`)**:
        *   This page will likely wrap the reusable opportunity form component.
        *   It will be responsible for extracting the `id` from the URL and passing it to the form component.
    *   **Create API Route for Opportunity Update (`src/app/api/opportunities/[id]/route.ts`)**:
        *   Handle `PUT` or `PATCH` requests to this route (for updating existing resources).
        *   Receive the updated form data from the request body and the `id` from the URL parameters.
        *   Perform server-side validation.
        *   Use the Supabase client to update the corresponding record in the `investment_opportunities` table based on the `id`.
        *   Implement authorization checks to ensure only the owner of the opportunity can update it.
        *   Handle success and error responses.

4.  **Run Tests & Verify**: 
    *   Manually test editing various fields of an existing opportunity.
    *   Verify that changes are immediately reflected on the detail page and in the database.
    *   (For automated tests) Develop Playwright tests to automate the editing process, including positive and negative test cases for validation and authorization.


