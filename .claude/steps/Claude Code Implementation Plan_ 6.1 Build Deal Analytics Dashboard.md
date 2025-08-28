# Claude Code Implementation Plan: 6.1 Build Deal Analytics Dashboard

## Objective
Develop a comprehensive analytics dashboard for deal sponsors to track key metrics related to their investment opportunities, including views, interest, inquiries, and conversion rates.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Deal sponsors need actionable insights into the performance of their opportunities. This dashboard will aggregate data from various tables (`investment_opportunities`, `investment_inquiries`, etc.) and present it visually.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Dashboard Accessibility**: Log in as a `deal_sponsor`. Navigate to the analytics dashboard (e.g., `/analytics/deals`). Assert that the dashboard is rendered correctly.
    *   **Test Case 2: Key Metrics Display**: Assert that metrics like "Total Views," "Total Inquiries," "Conversion Rate (Inquiry to Meeting)," and "Conversion Rate (Inquiry to Funded)" are displayed accurately.
    *   **Test Case 3: Opportunity-Specific Analytics**: Assert that the dashboard can filter data to show analytics for a specific opportunity.
    *   **Test Case 4: Data Visualization**: If charts or graphs are used (e.g., line graph for views over time, bar chart for inquiry sources), assert that they are rendered and reflect the data accurately.
    *   **Test Case 5: Data Accuracy**: Create test data with known values for views, inquiries, etc. Assert that the calculated metrics on the dashboard match the expected values.

3.  **Implement the Task**: 
    *   **Create Analytics Page/Component (`src/app/(dashboard)/analytics/deals/page.tsx`)**:
        *   This page/component will be responsible for fetching and displaying deal-related metrics.
        *   Fetch data from `investment_opportunities` and `investment_inquiries` tables.
        *   **Calculations**: 
            *   **Total Views**: Sum of `views_count` from `investment_opportunities`.
            *   **Total Inquiries**: Count of inquiries from `investment_inquiries`.
            *   **Conversion Rate (Inquiry to Meeting)**: (Count of inquiries with `meeting_scheduled` status) / (Total inquiries).
            *   **Conversion Rate (Inquiry to Funded)**: (Count of inquiries leading to `investment_partnerships`) / (Total inquiries).
        *   **Data Visualization**: Use a charting library (e.g., Recharts, Chart.js) to create visual representations of the data. Examples:
            *   Line graph showing `views_count` over time.
            *   Bar chart showing inquiry volume per opportunity.
            *   Pie chart showing inquiry status distribution.
    *   **Create API Route for Deal Analytics (if needed for client-side fetching)**:
        *   If you opt for client-side data fetching, create an API route (`GET /api/analytics/deals`) that returns aggregated deal data for the authenticated sponsor, with optional query parameters for date ranges or opportunity IDs.

4.  **Run Tests & Verify**: 
    *   Manually test the analytics dashboard with various deal data scenarios. Verify that the numbers and visualizations are accurate.
    *   (For automated tests) Use Playwright to navigate to the analytics page and assert that key metrics and chart elements are present and display expected values based on test data.


