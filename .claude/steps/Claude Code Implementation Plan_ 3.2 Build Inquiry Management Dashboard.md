# Claude Code Implementation Plan: 3.2 Build Inquiry Management Dashboard

## Objective
Develop a dashboard for deal sponsors to view, manage, and respond to all inquiries received for their investment opportunities.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Deal sponsors need a centralized place to see all the interest their opportunities are generating. This dashboard should list all inquiries, showing key information at a glance, and provide tools for filtering and sorting.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Dashboard Accessibility**: Log in as a `deal_sponsor`. Navigate to the inquiry management dashboard (e.g., `/inquiries`). Assert that the dashboard is rendered correctly.
    *   **Test Case 2: Inquiry List Display**: Assert that a list or table of inquiries is displayed, with each entry showing the investor's name, the opportunity they inquired about, the inquiry date, and the current status.
    *   **Test Case 3: Filtering by Opportunity**: If the sponsor has multiple opportunities, use a filter to select one. Assert that the inquiry list updates to show only inquiries for that specific opportunity.
    *   **Test Case 4: Filtering by Status**: Use a filter to select a status (e.g., 'pending', 'responded'). Assert that the list updates to show only inquiries with that status.
    *   **Test Case 5: Sorting**: Click on table headers (e.g., 'Date', 'Investor Name') to sort the inquiries. Assert that the list reorders correctly.

3.  **Implement the Task**: 
    *   **Create Inquiry Dashboard Page (`src/app/(dashboard)/inquiries/page.tsx`)**:
        *   Fetch all inquiries associated with the logged-in `deal_sponsor` from the `investment_inquiries` table in Supabase. You may need to join with the `users` and `investment_opportunities` tables to get the investor's name and opportunity name.
        *   Use a data table component (e.g., from Shadcn/ui) to display the inquiries. The table should have columns for Investor, Opportunity, Message Snippet, Date, and Status.
    *   **Create Filtering and Sorting Components**: 
        *   Add dropdown filters for `opportunity_id` and `status`.
        *   Implement client-side or server-side logic for sorting when table headers are clicked.
    *   **API Route for Inquiries (if needed for client-side fetching/filtering)**:
        *   If you opt for client-side data fetching and filtering, create an API route (`GET /api/inquiries`) that returns all inquiries for the authenticated sponsor, with optional query parameters for filtering and sorting.

4.  **Run Tests & Verify**: 
    *   Manually test the dashboard with multiple inquiries for different opportunities and statuses.
    *   Verify that filtering and sorting work as expected.
    *   (For automated tests) Use Playwright to simulate a sponsor logging in and managing their inquiries, asserting that the UI updates correctly based on their actions.


