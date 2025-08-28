# Claude Code Implementation Plan: 2.6 Build Opportunity Preview Functionality

## Objective
Provide deal sponsors with a real-time preview of how their investment opportunity will appear to capital partners before final submission or update.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: When a deal sponsor is creating or editing an opportunity, they should be able to see a live preview of the opportunity's detail page. This preview should reflect all the data they have entered into the form, even if it hasn't been saved to the database yet.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Preview Button Visibility**: Log in as a `deal_sponsor`. Navigate to the opportunity creation or editing form. Assert that a "Preview" button is visible and clickable.
    *   **Test Case 2: Preview Display**: Click the "Preview" button. Assert that a modal, new tab, or dedicated preview section appears, displaying the opportunity details.
    *   **Test Case 3: Real-time Data Reflection**: While in the preview mode, modify a field in the main form (e.g., change the `opportunity_name`). Assert that the change is immediately reflected in the preview without requiring a page refresh or form submission.
    *   **Test Case 4: Comprehensive Data Display**: Ensure that all relevant fields from the opportunity form (property details, financial structure, investment terms, documents, etc.) are accurately rendered in the preview.
    *   **Test Case 5: Responsive Design Check**: If possible, test the preview on different screen sizes (e.g., mobile, tablet, desktop) to ensure it is responsive.

3.  **Implement the Task**: 
    *   **Create a Preview Component (`src/components/opportunities/opportunity-preview.tsx`)**:
        *   This component will be a read-only version of the `OpportunityDetailPage` component (or a simplified version of it).
        *   It will accept the current, unsaved form data as props.
        *   It should render the data in a similar layout and style to the actual opportunity detail page.
    *   **Integrate Preview into Opportunity Form**: 
        *   In the opportunity creation/editing form (`src/app/(dashboard)/opportunities/new/page.tsx` or `src/app/(dashboard)/opportunities/[id]/edit/page.tsx`), add a "Preview" button.
        *   When the button is clicked, open a modal or a new route that renders the `OpportunityPreview` component, passing the current form state as props.
        *   Use React's state management (e.g., `useState`, `useReducer`, or a form library's state) to ensure the preview component receives the most up-to-date, unsaved data.
    *   **Styling and Responsiveness**: Ensure the preview component uses the same Tailwind CSS classes and Shadcn/ui components as the actual detail page to maintain visual consistency.

4.  **Run Tests & Verify**: 
    *   Manually test the preview functionality by entering various data into the form and observing the real-time updates in the preview.
    *   (For automated tests) Use Playwright to simulate form input and then assert that the preview modal/section displays the correct, updated information.


