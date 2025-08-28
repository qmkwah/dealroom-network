# Claude Code Implementation Plan: 2.8 Test Opportunity Management Flows

## Objective
Conduct comprehensive end-to-end testing of the entire investment opportunity management lifecycle, from creation to status changes, ensuring seamless functionality and data consistency across different user roles.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: This task is primarily about writing automated end-to-end (E2E) tests using Playwright to verify that all previously implemented features related to opportunity management work together correctly. It involves simulating user journeys for both deal sponsors and capital partners.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Sponsor Creates and Manages Opportunity**: 
        *   **Scenario**: A `deal_sponsor` logs in, creates a new opportunity, edits its details, uploads documents, previews it, and changes its status.
        *   **Assertions**: 
            *   Successful login.
            *   Form submission leads to successful opportunity creation.
            *   Edited details are reflected on the detail page.
            *   Uploaded documents appear and are accessible.
            *   Preview accurately reflects current form data.
            *   Status changes are applied and reflected.
            *   Database records are consistent after each action.
    *   **Test Case 2: Capital Partner Interacts with Opportunity**: 
        *   **Scenario**: A `capital_partner` logs in, browses opportunities, applies filters, searches, views a specific opportunity, and verifies its details.
        *   **Assertions**: 
            *   Successful login.
            *   Opportunity list is displayed.
            *   Filters and search yield correct results.
            *   Opportunity detail page displays accurate information.
            *   Appropriate action buttons (e.g., "Express Interest") are visible.
    *   **Test Case 3: Cross-Role Data Consistency**: 
        *   **Scenario**: A `deal_sponsor` creates an opportunity. A `capital_partner` then views that opportunity. The `deal_sponsor` updates the opportunity. The `capital_partner` then re-views the opportunity.
        *   **Assertions**: 
            *   The opportunity created by the sponsor is visible to the capital partner.
            *   Updates made by the sponsor are immediately reflected when the capital partner views the opportunity.

3.  **Implement the Task**: 
    *   **Setup Playwright Test Environment**: If not already done, ensure Playwright is installed and configured for E2E testing in your Next.js project. (This is covered in Section 6 of the detailed PRD).
    *   **Create Playwright Test Files**: 
        *   Create a new test file (e.g., `e2e/opportunity-management.spec.ts`).
        *   Use Playwright's `test` and `expect` functions to write the scenarios and assertions defined in the 

