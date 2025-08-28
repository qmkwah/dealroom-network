# Claude Code Implementation Plan: 5.2 Implement Access Control and Permissions for Data Rooms

## Objective
Establish granular access control and permission management for data rooms, allowing deal sponsors to define who can view, download, or administer documents within a data room.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Beyond simply granting or revoking access to a data room, sponsors need to specify different levels of permission (e.g., view-only, download, admin). This requires careful implementation of Row Level Security (RLS) in Supabase and corresponding frontend logic.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: View-Only Access**: As a `deal_sponsor`, create a data room and grant a `capital_partner` view-only access. Log in as the `capital_partner`. Assert that they can see the document list and view documents in-browser, but the download option is disabled or hidden.
    *   **Test Case 2: Download Access**: As a `deal_sponsor`, grant a `capital_partner` download access. Log in as the `capital_partner`. Assert that they can view and download documents.
    *   **Test Case 3: Admin Access**: As a `deal_sponsor`, grant a `capital_partner` admin access. Log in as the `capital_partner`. Assert that they can manage documents (upload, delete) and potentially manage other users' access within that specific data room.
    *   **Test Case 4: Revoke Access**: As a `deal_sponsor`, revoke a `capital_partner`'s access. Log in as the `capital_partner`. Assert that they can no longer access the data room or its documents.
    *   **Test Case 5: NDA Requirement**: If `nda_required` is true for a data room, assert that a user cannot access documents until they have digitally signed an NDA (this might involve a separate flow).
    *   **Test Case 6: Watermarking**: If `watermarking_enabled` is true, assert that viewed/downloaded documents contain a watermark (e.g., user's email or ID).

3.  **Implement the Task**: 
    *   **Database Schema Review**: Ensure the `data_room_access` table accurately captures `access_level` (`view`, `download`, `admin`), `nda_signed`, and `access_expires_at`.
    *   **Supabase RLS Policies**: 
        *   Implement RLS policies on the `data_room_documents` table to control access based on the `data_room_access` table. For example:
            ```sql
            -- Policy for viewing documents
            CREATE POLICY "Enable read access for authorized users" ON "public"."data_room_documents"
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM "public"."data_room_access"
                WHERE "data_room_access"."data_room_id" = "data_room_documents"."data_room_id"
                AND "data_room_access"."user_id" = auth.uid()
                AND "data_room_access"."access_level" IN ("view", "download", "admin")
              )
            );

            -- Policy for downloading documents (requires 'download' or 'admin' access)
            CREATE POLICY "Enable download access for authorized users" ON "public"."data_room_documents"
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM "public"."data_room_access"
                WHERE "data_room_access"."data_room_id" = "data_room_documents"."data_room_id"
                AND "data_room_access"."user_id" = auth.uid()
                AND "data_room_access"."access_level" IN ("download", "admin")
              )
            );

            -- Policy for managing documents (requires 'admin' access)
            CREATE POLICY "Enable manage access for data room admins" ON "public"."data_room_documents"
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM "public"."data_room_access"
                WHERE "data_room_access"."data_room_id" = "data_room_documents"."data_room_id"
                AND "data_room_access"."user_id" = auth.uid()
                AND "data_room_access"."access_level" = "admin"
              )
            );
            ```
        *   Implement RLS policies on the `data_room_access` table to ensure only the `deal_sponsor` who owns the data room can manage access.
    *   **Frontend UI for Access Management**: 
        *   On the data room detail page, provide an interface for the `deal_sponsor` to:
            *   List users with current access.
            *   Add new users to the data room, specifying their `access_level`.
            *   Modify existing users' `access_level`.
            *   Remove users from the data room.
            *   Toggle `nda_required` and `watermarking_enabled` settings for the data room.
        *   Use Shadcn/ui components for dropdowns, checkboxes, and buttons.
    *   **API Routes for Access Management**: 
        *   `POST /api/data-rooms/[id]/access`: To grant access to a user with a specific `access_level`.
        *   `PATCH /api/data-rooms/[id]/access/[user_id]`: To update a user's `access_level`.
        *   `DELETE /api/data-rooms/[id]/access/[user_id]`: To revoke access.
    *   **Document Watermarking (Optional but Recommended)**:
        *   If `watermarking_enabled` is true, when a document is viewed or downloaded, implement a server-side process (e.g., a Next.js API route or a Supabase Edge Function) that dynamically adds a watermark (e.g., the user's email or ID) to the document before serving it. This might involve using a PDF manipulation library.

4.  **Run Tests & Verify**: 
    *   Manually test all access levels (view-only, download, admin) for different users.
    *   Verify that access is correctly granted and revoked.
    *   Test the NDA requirement and watermarking if implemented.
    *   (For automated tests) Use Playwright to simulate user interactions with access controls and assert that the correct permissions are enforced.


