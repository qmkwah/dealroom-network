# Claude Code Implementation Plan: 2.2 Build Opportunity Browsing and Filtering

## Objective
Develop a user interface that allows capital partners to browse, search, and filter investment opportunities based on various criteria.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Create a page where capital partners can view a list of available investment opportunities. This page should include robust filtering and search functionality to help users find opportunities that match their investment preferences.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Opportunity List Display**: Log in as a `capital_partner` and navigate to the opportunity browsing page (e.g., `/opportunities`). Assert that a list of investment opportunities is displayed, with each opportunity showing key information (name, summary, key metrics).
    *   **Test Case 2: Filtering by Property Type**: Use the filter controls to select a specific property type (e.g., "multifamily"). Assert that the displayed list of opportunities is updated to show only those with the selected property type.
    *   **Test Case 3: Filtering by Investment Size**: Use a range slider or input fields to filter opportunities by investment size (e.g., minimum investment between $50,000 and $100,000). Assert that the list updates correctly.
    *   **Test Case 4: Search by Keyword**: Use the search bar to enter a keyword present in an opportunity's name or description. Assert that the search results contain the relevant opportunity.
    *   **Test Case 5: Combined Filtering and Search**: Apply multiple filters (e.g., property type and location) and a search keyword simultaneously. Assert that the results correctly reflect all applied criteria.
    *   **Test Case 6: Pagination**: If the number of opportunities exceeds the page limit, assert that pagination controls are visible and functional.

3.  **Implement the Task**: 
    *   **Create Opportunity Browsing Page (`src/app/(dashboard)/opportunities/page.tsx`)**:
        *   Fetch a list of investment opportunities from the Supabase database. Use server-side rendering (SSR) or static site generation (SSG) with revalidation for performance.
        *   Display the opportunities in a card-based or list-based layout. Each card should show a summary of the opportunity.
        *   Implement pagination to handle large numbers of opportunities.
    *   **Create Filtering Components (`src/components/filters/opportunity-filters.tsx`)**:
        *   Build a set of filter controls, including:
            *   Checkboxes or multi-select dropdowns for `property_type`, `investment_strategy`, etc.
            *   Range sliders for `minimum_investment`, `projected_irr`, etc.
            *   Location-based filters (e.g., by state or city).
        *   Manage the filter state using React state (e.g., `useState` or `useReducer`).
    *   **Create Search Component (`src/components/search/opportunity-search.tsx`)**:
        *   Implement a search input field.
        *   On search submission or as the user types (with debouncing), update the search query state.
    *   **Create API Route for Filtered/Searched Opportunities (`src/app/api/opportunities/search/route.ts`)**:
        *   Handle `GET` requests to this route, accepting filter and search parameters as query strings.
        *   Construct a dynamic Supabase query based on the provided parameters. Use Supabase's query builder to add `where` clauses for filters and `ilike` or full-text search for keywords.
        *   Return the filtered and searched list of opportunities as a JSON response.
    *   **Integrate Frontend with API**: On the opportunity browsing page, use the filter and search state to make requests to the API route. Update the displayed list of opportunities with the response from the API.

4.  **Run Tests & Verify**: 
    *   Manually test the browsing, filtering, and search functionality with various combinations of criteria.
    *   Verify that the results are accurate and the UI updates correctly.
    *   (For automated tests) Use Playwright to simulate user interactions with the filter and search controls, asserting that the displayed results match the expected outcomes.


