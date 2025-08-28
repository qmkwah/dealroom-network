# Claude Code Implementation Plan: 3.3 Implement Inquiry Status Tracking and Responses

## Objective
Enable deal sponsors to respond to inquiries and update their status, and allow capital partners to see the responses and status changes.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: The inquiry management process needs to be interactive. Sponsors should be able to write a response to an inquiry and change its status (e.g., from `pending` to `responded`). This interaction should be visible to the capital partner who made the inquiry.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Response UI**: Log in as a `deal_sponsor`. In the inquiry management dashboard, select an inquiry. Assert that a UI element (e.g., a modal or an expandable section) appears, allowing the sponsor to type a response and change the status.
    *   **Test Case 2: Successful Response and Status Update**: Submit a response and change the status to `responded`. Assert that the inquiry in the dashboard now shows the new status.
    *   **Test Case 3: Database Update Verification**: After submitting a response, query the `investment_inquiries` table to confirm that the `status`, `sponsor_response`, and `sponsor_responded_at` fields have been updated.
    *   **Test Case 4: Capital Partner View**: Log in as the `capital_partner` who made the inquiry. Navigate to their inquiry tracking page. Assert that the sponsor's response and the updated status are visible.
    *   **Test Case 5: Notification to Capital Partner**: (Requires backend/email testing) Verify that the `capital_partner` receives a notification (in-app or email) that their inquiry has been responded to.

3.  **Implement the Task**: 
    *   **Enhance Inquiry Management Dashboard**: 
        *   In the inquiry dashboard (`src/app/(dashboard)/inquiries/page.tsx`), add a "View/Respond" button to each inquiry.
        *   Clicking this button should open a modal (`src/components/modals/inquiry-response-modal.tsx`) that displays the full inquiry details and provides a textarea for the sponsor's response and a dropdown to update the status.
    *   **Create API Route for Inquiry Response (`src/app/api/inquiries/[id]/respond/route.ts`)**:
        *   Handle `PATCH` or `PUT` requests to this route.
        *   Receive the `inquiry_id` from the URL and the `sponsor_response` and new `status` from the request body.
        *   Perform server-side validation and authorization.
        *   Use the Supabase client to update the corresponding record in the `investment_inquiries` table.
        *   **Implement Notification Logic**: After a successful response, trigger a notification to the `capital_partner`.
    *   **Create Capital Partner Inquiry Tracking Page (`src/app/(dashboard)/my-inquiries/page.tsx`)**:
        *   Create a new page where logged-in capital partners can see a list of all the inquiries they have sent.
        *   This page should display the status of each inquiry and any responses from sponsors.

4.  **Run Tests & Verify**: 
    *   Manually test the full workflow: a capital partner sends an inquiry, the deal sponsor responds, and the capital partner views the response.
    *   Verify all UI and database updates.
    *   (For automated tests) Use Playwright to create E2E tests that cover this entire interaction between the two user roles.


