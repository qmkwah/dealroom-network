# Claude Code Implementation Plan: 6.2 Implement Custom Reports and Exports

## Objective
Enable deal sponsors to generate custom reports and export data related to their opportunities and inquiries in various formats (e.g., CSV, PDF).

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Sponsors need flexibility to analyze their data offline or integrate it with other tools. This involves providing a UI for selecting data points and export formats, and a backend process to generate and serve the files.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Report Generation UI**: Log in as a `deal_sponsor`. Navigate to the reports section (e.g., `/reports`). Assert that a UI is available for selecting report parameters (e.g., date range, opportunity, data fields).
    *   **Test Case 2: CSV Export**: Select a set of data (e.g., all inquiries for an opportunity). Choose CSV as the export format. Assert that a CSV file is downloaded and its content matches the selected data.
    *   **Test Case 3: PDF Export**: Select a report (e.g., a summary of an opportunity). Choose PDF as the export format. Assert that a PDF file is downloaded and its content is correctly formatted.
    *   **Test Case 4: Data Accuracy in Export**: Verify that the exported data accurately reflects the database content and selected filters.

3.  **Implement the Task**: 
    *   **Frontend Report Generation UI (`src/app/(dashboard)/reports/page.tsx`)**:
        *   Design a form that allows users to:
            *   Select the type of report (e.g., "Opportunity Inquiries", "Deal Performance Summary").
            *   Specify filters (e.g., date range, specific opportunity).
            *   Choose export format (CSV, PDF).
        *   Use Shadcn/ui components for form elements.
    *   **Create API Routes for Data Export**: 
        *   `GET /api/reports/inquiries.csv`: Handles CSV export of inquiry data.
        *   `GET /api/reports/opportunities/[id].pdf`: Handles PDF export of a single opportunity summary.
        *   These routes will:
            *   Fetch data from Supabase based on the requested report type and filters.
            *   Use a library to generate the desired file format:
                *   For CSV: `csv-stringify` or similar.
                *   For PDF: `html-pdf`, `puppeteer` (for more complex rendering), or `fpdf2` (if using Python for backend processing).
            *   Set appropriate `Content-Type` and `Content-Disposition` headers for file download.

4.  **Run Tests & Verify**: 
    *   Manually generate various reports and export them. Open the downloaded files to verify their content and formatting.
    *   (For automated tests) Use Playwright to simulate report generation and assert that files are downloaded and contain expected data (e.g., by reading the downloaded file content).


