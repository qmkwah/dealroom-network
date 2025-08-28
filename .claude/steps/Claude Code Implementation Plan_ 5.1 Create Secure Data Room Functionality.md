# Claude Code Implementation Plan: 5.1 Create Secure Data Room Functionality

## Objective
Develop a secure data room feature where deal sponsors can upload and manage confidential documents related to their investment opportunities, and control access for capital partners.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Deal sponsors need a dedicated, secure space to share sensitive documents (e.g., due diligence materials, financial projections) with specific capital partners. This involves creating a data room, uploading documents to it, and managing who has access.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Data Room Creation**: Log in as a `deal_sponsor`. Navigate to an opportunity detail page. Assert that a button/option to "Create Data Room" is visible. Click it and fill out a form to create a new data room. Assert that the data room is created and linked to the opportunity.
    *   **Test Case 2: Document Upload to Data Room**: Within the newly created data room, assert that a file upload interface is available. Upload a document. Assert that the document appears in the data room list and is stored securely (e.g., in AWS S3 or Supabase Storage).
    *   **Test Case 3: Access Control (No Access)**: Log in as a `capital_partner` who has *not* been granted access to the data room. Navigate to the opportunity. Assert that the data room is either not visible or shows a "Request Access" prompt, and documents within it are inaccessible.
    *   **Test Case 4: Access Control (Granted Access)**: As the `deal_sponsor`, grant access to the `capital_partner` from Test Case 3. Log in as the `capital_partner`. Assert that the data room is now accessible and documents can be viewed/downloaded.
    *   **Test Case 5: Document Viewing/Downloading**: As an authorized `capital_partner`, click on a document within the data room. Assert that the document can be viewed in-browser or downloaded successfully.
    *   **Test Case 6: Data Room Deletion**: As the `deal_sponsor`, delete the data room. Assert that the data room and its associated documents are removed.

3.  **Implement the Task**: 
    *   **Database Schema**: Ensure the `data_rooms`, `data_room_access`, and `data_room_documents` tables are correctly defined in your Supabase schema as per the PRD (Section 4.2).
    *   **Create Data Room Creation UI**: 
        *   On the opportunity detail page (`src/app/(dashboard)/opportunities/[id]/page.tsx`), add a button/section for `deal_sponsor`s to create a data room. This could open a modal (`src/components/modals/create-data-room-modal.tsx`).
        *   The modal should allow input for `room_name`, `room_description`, `access_type`, `nda_required`, `accredited_investor_only`, etc.
    *   **Create Data Room Detail Page (`src/app/(dashboard)/opportunities/[id]/data-room/page.tsx`)**:
        *   This page will display the contents of a specific data room.
        *   Fetch data room details and its associated documents from Supabase.
        *   **Document Upload Integration**: Reuse or adapt the document upload component from `claude_code_plan_2_5_setup_document_upload.md` to allow sponsors to upload documents directly to the data room. Ensure these uploads are linked to the `data_room_documents` table.
        *   **Access Management UI**: Provide an interface for the `deal_sponsor` to invite or grant access to specific `capital_partner`s to the data room. This will involve updating the `data_room_access` table.
    *   **API Routes for Data Room Management**: 
        *   `POST /api/data-rooms`: To create a new data room.
        *   `GET /api/data-rooms/[id]`: To fetch data room details and documents.
        *   `POST /api/data-rooms/[id]/documents`: To upload documents to a data room.
        *   `POST /api/data-rooms/[id]/access`: To grant/revoke access to users.
        *   `DELETE /api/data-rooms/[id]`: To delete a data room.
    *   **Implement Access Control Logic**: 
        *   On the backend API routes for accessing data room documents, implement robust checks using Supabase RLS or custom logic to ensure only authorized users can view/download documents.
        *   Frontend components should also conditionally render content based on user access.

4.  **Run Tests & Verify**: 
    *   Manually test the full data room lifecycle: creation, document upload, access granting/revoking, and document viewing/downloading from both sponsor and investor perspectives.
    *   Verify that unauthorized users cannot access confidential documents.
    *   (For automated tests) Use Playwright to simulate these complex interactions and assert the correct behavior and security.


