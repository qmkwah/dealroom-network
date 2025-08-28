# Claude Code Implementation Plan: 3.8 Implement Connection Suggestions

## Objective
Provide users with intelligent suggestions for other professionals they might want to connect with, based on shared interests, roles, or other profile attributes.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Enhance the networking experience by proactively suggesting relevant connections to users. This requires an algorithm to identify potential matches and a UI to display these suggestions.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Suggestions Display**: Log in as a user. Navigate to the connections page or a dedicated "Suggestions" section. Assert that a list of suggested connections is displayed.
    *   **Test Case 2: Relevance of Suggestions (Role-based)**: Create test users with specific roles (e.g., two `deal_sponsor`s, two `capital_partner`s). Log in as one `deal_sponsor`. Assert that other `deal_sponsor`s or `capital_partner`s with similar investment interests are suggested.
    *   **Test Case 3: Relevance of Suggestions (Location-based)**: Create test users in the same geographic location. Assert that users in the same location are suggested.
    *   **Test Case 4: No Self-Suggestion**: Assert that the logged-in user is not suggested as a connection to themselves.
    *   **Test Case 5: No Already Connected Suggestion**: Assert that users who are already connected are not suggested.

3.  **Implement the Task**: 
    *   **Create Connection Suggestions Component (`src/components/connections/connection-suggestions.tsx`)**:
        *   This component will fetch and display suggested connections.
        *   The logic for generating suggestions can be implemented either on the frontend (for simpler criteria) or via a dedicated API route (for more complex algorithms).
    *   **Implement Suggestion Logic (Backend API or Frontend Utility)**:
        *   **Simple Approach (Frontend)**: Fetch all users (excluding already connected users and self). Filter and sort them based on criteria like:
            *   Matching `role` (e.g., `deal_sponsor` suggests `capital_partner`s, `capital_partner` suggests `deal_sponsor`s).
            *   Matching `preferred_property_types` or `investment_focus`.
            *   Matching `preferred_locations` or `service_areas`.
        *   **Advanced Approach (Backend API - `src/app/api/connections/suggestions/route.ts`)**: 
            *   Create an API endpoint that takes the current user's ID.
            *   Implement a more sophisticated matching algorithm that considers multiple factors and potentially uses PostgreSQL functions for similarity (e.g., `pg_trgm` for text similarity on `bio` or `company_name`).
            *   Return a list of suggested user IDs.
    *   **Integrate into UI**: Display the `ConnectionSuggestions` component on the user's dashboard or a dedicated connections page.

4.  **Run Tests & Verify**: 
    *   Manually test the suggestions feature with different user profiles and verify the relevance of the suggestions.
    *   (For automated tests) Use Playwright to log in as various test users and assert that the suggested connections meet the specified criteria.


