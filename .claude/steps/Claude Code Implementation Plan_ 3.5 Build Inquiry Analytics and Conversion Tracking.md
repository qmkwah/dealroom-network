# Claude Code Implementation Plan: 3.5 Build Inquiry Analytics and Conversion Tracking

## Objective
Develop a dashboard or section for deal sponsors to view analytics related to their inquiries, including volume, response rates, and conversion rates.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Deal sponsors need insights into how their opportunities are performing in terms of attracting inquiries and converting them into meetings or partnerships. This involves aggregating data from the `investment_inquiries` table and presenting it visually.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Analytics Dashboard Accessibility**: Log in as a `deal_sponsor`. Navigate to the analytics dashboard (e.g., `/analytics` or a section within the inquiries dashboard). Assert that the dashboard is rendered correctly.
    *   **Test Case 2: Inquiry Volume Display**: Assert that the total number of inquiries received over a period (e.g., last 30 days, all time) is displayed accurately.
    *   **Test Case 3: Response Rate Calculation**: Assert that the percentage of inquiries responded to is correctly calculated and displayed.
    *   **Test Case 4: Conversion Rate to Meeting**: Assert that the percentage of inquiries that resulted in a scheduled meeting is correctly calculated and displayed.
    *   **Test Case 5: Data Visualization**: If charts or graphs are used (e.g., bar chart for inquiry volume over time, pie chart for inquiry status distribution), assert that they are rendered and reflect the data accurately.
    *   **Test Case 6: Filtering by Opportunity**: If the sponsor has multiple opportunities, assert that the analytics can be filtered to show data for a specific opportunity.

3.  **Implement the Task**: 
    *   **Create Analytics Page/Component (`src/app/(dashboard)/analytics/inquiries/page.tsx` or `src/components/analytics/inquiry-analytics.tsx`)**:
        *   This page/component will be responsible for fetching and displaying inquiry-related metrics.
        *   Fetch data from the `investment_inquiries` table. You will need to perform aggregations (COUNT, AVG) and potentially group by date or opportunity ID.
        *   **Calculations**: 
            *   **Inquiry Volume**: Count of all inquiries.
            *   **Response Rate**: (Count of inquiries with status `responded` or `meeting_scheduled` or `proposal_submitted`) / (Total inquiries).
            *   **Conversion to Meeting Rate**: (Count of inquiries with status `meeting_scheduled`) / (Total inquiries).
        *   **Data Visualization**: Use a charting library (e.g., Recharts, Chart.js, or a custom component using D3.js) to create visual representations of the data. Examples:
            *   Bar chart showing inquiries per month.
            *   Pie chart showing the distribution of inquiry statuses.
            *   Line graph showing response rate trends.
    *   **Create API Route for Inquiry Analytics (if needed for client-side fetching)**:
        *   If you opt for client-side data fetching, create an API route (`GET /api/analytics/inquiries`) that returns aggregated inquiry data for the authenticated sponsor, with optional query parameters for date ranges or opportunity IDs.

4.  **Run Tests & Verify**: 
    *   Manually test the analytics dashboard with various inquiry data scenarios (e.g., some responded, some pending, some converted to meetings). Verify that the numbers and visualizations are accurate.
    *   (For automated tests) Use Playwright to navigate to the analytics page and assert that key metrics and chart elements are present and display expected values based on test data.


