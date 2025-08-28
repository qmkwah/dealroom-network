# Claude Code Implementation Plan: 2.3 Implement Opportunity Detail Page

## Objective
Create a detailed page for each investment opportunity, displaying all its information and providing relevant actions for different user roles.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: When a user clicks on an opportunity from the browsing page, they should be taken to a dedicated page that provides a comprehensive overview of that specific opportunity. The content and available actions on this page should vary based on the user's role.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Page Accessibility and Data Display**: Navigate to the detail page of a specific opportunity (e.g., `/opportunities/[id]`). Assert that all the opportunity's details (property info, financial structure, investment terms, etc.) are correctly displayed.
    *   **Test Case 2: Action Buttons for Capital Partner**: Log in as a `capital_partner`. On the opportunity detail page, assert that buttons like "Express Interest," "Request Information," or "Schedule Meeting" are visible and enabled.
    *   **Test Case 3: Action Buttons for Deal Sponsor**: Log in as the `deal_sponsor` who created the opportunity. Assert that an "Edit Opportunity" button is visible and enabled. Assert that investor-specific action buttons are not visible.
    *   **Test Case 4: Action Buttons for Unauthenticated User**: View the page as an unauthenticated user. Assert that action buttons are either hidden or disabled, and a prompt to log in or register is displayed.
    *   **Test Case 5: Document Display**: If the opportunity has associated documents, assert that they are listed and can be viewed or downloaded (depending on permissions).

3.  **Implement the Task**: 
    *   **Create Dynamic Route for Opportunity Detail Page (`src/app/(dashboard)/opportunities/[id]/page.tsx`)**:
        *   Use Next.js dynamic routing to create a page for each opportunity based on its ID.
        *   In the page component, fetch the details of the specific opportunity from Supabase using the `id` from the URL parameters. Use server-side rendering (SSR) for dynamic content.
        *   Display all the fetched opportunity data in a well-organized and readable format. Use Shadcn/ui components for layout and presentation (e.g., `Card`, `Table`, `Tabs`).
    *   **Implement Role-Based Conditional Rendering**: 
        *   Fetch the current user's session and role.
        *   Use conditional rendering to display different action buttons and content based on the user's role:
            *   If the user is a `capital_partner`, show inquiry and interaction buttons.
            *   If the user is the `deal_sponsor` of the opportunity, show editing and management buttons.
            *   If the user is unauthenticated, show a call-to-action to log in or register.
    *   **Display Associated Documents**: 
        *   Fetch and display a list of documents associated with the opportunity from the `investment_opportunities` table (or a related table).
        *   Provide links to view or download the documents, potentially with access control checks.

4.  **Run Tests & Verify**: 
    *   Manually navigate to several different opportunity detail pages to ensure they render correctly.
    *   Log in as different user roles and verify that the correct action buttons and content are displayed for each role.
    *   (For automated tests) Use Playwright to test the different user role scenarios, asserting the presence or absence of specific elements on the page.


