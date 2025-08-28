# Claude Code Implementation Plan: 2.7 Implement Opportunity Status Management

## Objective
Enable deal sponsors to manage the lifecycle of their investment opportunities by updating their status (e.g., 'draft', 'fundraising', 'due_diligence', 'funded', 'closed', 'cancelled').

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Deal sponsors need a way to change the status of their opportunities. This involves providing a UI element (e.g., a dropdown or buttons) to select a new status, updating the database, and ensuring the UI reflects the change.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Status Display**: Log in as a `deal_sponsor`. Navigate to an opportunity's detail page or dashboard. Assert that the current status of the opportunity is clearly displayed.
    *   **Test Case 2: Status Change UI Visibility**: Assert that a UI element (e.g., a dropdown or button group) for changing the opportunity status is visible and interactive for the opportunity owner.
    *   **Test Case 3: Successful Status Update**: Select a new valid status (e.g., change from 'fundraising' to 'due_diligence'). Submit the change. Assert that a success message is displayed and the opportunity's status is updated on the UI.
    *   **Test Case 4: Database Update Verification**: After a successful status update, query the Supabase `investment_opportunities` table to confirm that the `status` field for that opportunity has been updated to the new value.
    *   **Test Case 5: Impact on Visibility/Actions**: If a status change affects visibility (e.g., 'closed' opportunities are no longer publicly listed) or available actions (e.g., 'cancelled' opportunities cannot receive inquiries), assert that these changes are correctly applied.
    *   **Test Case 6: Unauthorized Status Change**: Attempt to change the status of an opportunity not owned by the logged-in sponsor. Assert that the action is denied or an error message is displayed.

3.  **Implement the Task**: 
    *   **Add Status Management UI to Opportunity Detail/Dashboard**: 
        *   On the opportunity detail page (`src/app/(dashboard)/opportunities/[id]/page.tsx`) or within the sponsor's dashboard, add a component for status management.
        *   This could be a Shadcn/ui `Select` component or a set of `Button` components, allowing the sponsor to choose from the predefined statuses (`draft`, `fundraising`, `due_diligence`, `funded`, `closed`, `cancelled`).
        *   Ensure this UI element is only visible to the `deal_sponsor` who owns the opportunity.
    *   **Create API Route for Status Update (`src/app/api/opportunities/[id]/status/route.ts`)**:
        *   Handle `PATCH` or `PUT` requests to this route.
        *   Receive the `opportunity_id` from the URL and the new `status` from the request body.
        *   Perform server-side validation to ensure the new status is valid and the user is authorized to make the change.
        *   Use the Supabase client to update the `status` field in the `investment_opportunities` table.
        *   Handle success and error responses.
    *   **Frontend Integration**: When a new status is selected in the UI, make an API call to the status update endpoint. On success, update the local state to reflect the new status and potentially trigger a re-fetch of the opportunity data to ensure consistency.

4.  **Run Tests & Verify**: 
    *   Manually test changing the status of various opportunities and verify the UI updates and database changes.
    *   Verify that status changes correctly affect other parts of the application (e.g., filtering, visibility).
    *   (For automated tests) Use Playwright to simulate status changes and assert the expected outcomes across the application.


