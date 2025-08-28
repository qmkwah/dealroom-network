# Claude Code Implementation Plan: 6.3 Implement Audit Logs

## Objective
Implement a comprehensive audit logging system to track all significant user actions and system events, providing a detailed history for security, compliance, and debugging purposes.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Record every important action performed by users (e.g., login, logout, opportunity creation, document upload, access changes) and key system events. This log should be immutable and accessible to administrators.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Login Event Logging**: A user logs in. Assert that a new entry is created in the `audit_logs` table with `event_type = 'user_login'`, `user_id`, and `timestamp`.
    *   **Test Case 2: Opportunity Creation Logging**: A `deal_sponsor` creates a new opportunity. Assert that an entry is created with `event_type = 'opportunity_created'`, `user_id`, `opportunity_id`, and relevant `details`.
    *   **Test Case 3: Document Upload Logging**: A document is uploaded to a data room. Assert that an entry is created with `event_type = 'document_uploaded'`, `user_id`, `data_room_id`, `document_id`, and `details`.
    *   **Test Case 4: Access Change Logging**: A `deal_sponsor` grants access to a data room. Assert that an entry is created with `event_type = 'data_room_access_granted'`, `user_id`, `target_user_id`, `data_room_id`, and `details`.
    *   **Test Case 5: Admin View Accessibility**: Log in as an `admin`. Navigate to the audit logs page (e.g., `/admin/audit-logs`). Assert that the logs are displayed and filterable.

3.  **Implement the Task**: 
    *   **Database Schema**: Ensure the `audit_logs` table is defined in your Supabase schema with fields like `id`, `user_id` (nullable, for system events), `event_type`, `entity_type` (e.g., `user`, `opportunity`, `document`), `entity_id`, `details` (JSONB), `ip_address`, `user_agent`, `created_at`.
    *   **Logging Utility (`src/lib/utils/audit-logger.ts`)**: 
        *   Create a utility function `logAuditAction` that takes `user_id`, `event_type`, `entity_type`, `entity_id`, and `details` as arguments.
        *   This function will insert a new record into the `audit_logs` table.
        *   It should also capture `ip_address` and `user_agent` from the request context.
    *   **Integrate Logging into API Routes and Server Actions**: 
        *   Identify all critical user actions and system events that need to be logged.
        *   Call `logAuditAction` within the relevant API routes or server actions after the primary operation is successful.
        *   Examples:
            *   User registration/login/logout.
            *   Opportunity creation/update/deletion.
            *   Inquiry submission/response.
            *   Data room creation/document upload/access changes.
            *   Subscription changes.
    *   **Admin UI for Audit Logs (`src/app/(dashboard)/admin/audit-logs/page.tsx`)**:
        *   Create an admin-only page to display the audit logs.
        *   Implement filtering by `event_type`, `user_id`, `entity_type`, and date range.
        *   Use a data table component to display the logs, with columns for `timestamp`, `user`, `event`, `entity`, and `details`.

4.  **Run Tests & Verify**: 
    *   Manually perform various actions as different users (login, create opportunity, upload document, etc.).
    *   Log in as an admin and verify that all these actions are correctly logged in the audit trail.
    *   Test filtering and searching the audit logs.
    *   (For automated tests) Use Playwright to simulate user actions and then query the `audit_logs` table directly via Supabase client to assert that the correct log entries are created.


