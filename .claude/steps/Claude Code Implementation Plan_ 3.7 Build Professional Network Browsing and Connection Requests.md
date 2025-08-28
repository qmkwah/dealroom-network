# Claude Code Implementation Plan: 3.7 Build Professional Network Browsing and Connection Requests

## Objective
Develop a feature that allows users to browse and search for other professionals (Deal Sponsors, Capital Partners, Service Providers) on the platform and send connection requests.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Users should be able to discover and connect with other relevant professionals. This involves a directory or search page for users, and a mechanism to send and manage connection requests.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: User Directory Accessibility**: Log in as any user role. Navigate to the professional network browsing page (e.g., `/connections` or `/users`). Assert that a list of other users is displayed.
    *   **Test Case 2: Filtering by Role**: Use a filter to display only `deal_sponsor` profiles. Assert that the list updates correctly.
    *   **Test Case 3: Search by Name/Company**: Use the search bar to find a user by name or company. Assert that the search results are accurate.
    *   **Test Case 4: Send Connection Request**: From a user's profile, click a "Connect" button. Assert that a confirmation message is displayed and a connection request is recorded in the database.
    *   **Test Case 5: Accept Connection Request**: Log in as the recipient of a connection request. Navigate to their notifications or connection requests page. Accept the request. Assert that the connection is established and both users are now listed as connected.
    *   **Test Case 6: Decline Connection Request**: Log in as the recipient. Decline a request. Assert that the request is removed and no connection is formed.
    *   **Test Case 7: Mutual Connection Display**: After a connection is established, assert that both users' profiles show each other as a connection.

3.  **Implement the Task**: 
    *   **Create User Directory Page (`src/app/(dashboard)/connections/page.tsx`)**:
        *   Fetch a list of users from the `users` table, potentially joining with profile tables to display relevant summary information.
        *   Implement search functionality (using PostgreSQL full-text search or Supabase filters) for `first_name`, `last_name`, `company_name`.
        *   Add filters for `role` and other relevant profile attributes.
        *   Display users in a card or list format, with a "Connect" button for non-connected users.
    *   **Create API Route for Connection Requests (`src/app/api/connections/route.ts`)**:
        *   Handle `POST` requests to create a new connection request.
        *   Insert a record into a new `professional_connections` table (or similar) with `sender_id`, `recipient_id`, and `status` (e.g., `pending`).
        *   Trigger a notification to the recipient.
    *   **Create API Route for Accepting/Declining Requests (`src/app/api/connections/[id]/route.ts`)**:
        *   Handle `PATCH` or `PUT` requests to update the status of a connection request.
        *   If accepted, update the status to `connected` and potentially create a reciprocal entry.
        *   If declined, update status to `declined` or delete the request.
    *   **Update User Profile Pages**: 
        *   On user profile pages, display a "Connect" button if not already connected, or a "Connected" status if they are.
        *   Display a list of mutual connections.

4.  **Run Tests & Verify**: 
    *   Manually test browsing, searching, sending, accepting, and declining connection requests.
    *   Verify that connections are correctly established and reflected on both users' profiles.
    *   (For automated tests) Use Playwright to simulate these interactions and assert the correct state changes and UI updates.


