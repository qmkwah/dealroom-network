# Claude Code Implementation Plan: 2.5 Setup Document Upload for Deal Packages

## Objective
Implement functionality for deal sponsors to securely upload various documents (e.g., financial models, market analysis, property photos) associated with their investment opportunities.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Deal sponsors need to attach relevant documents to their investment opportunities. This involves creating an upload interface, handling file storage (Supabase Storage/AWS S3), and associating the uploaded files with the correct opportunity in the database.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Upload Interface Accessibility**: Log in as a `deal_sponsor`. Navigate to the opportunity creation/editing form. Assert that a file upload component is visible and interactive.
    *   **Test Case 2: Successful Single File Upload**: Select a single valid document (e.g., a PDF or JPG). Initiate the upload. Assert that a success message is displayed, the file appears in a list of uploaded documents for that opportunity, and the file is accessible via its URL.
    *   **Test Case 3: Successful Multiple File Upload**: Select multiple valid documents. Initiate the upload. Assert that all files are successfully uploaded and listed.
    *   **Test Case 4: File Type Validation**: Attempt to upload an unsupported file type (e.g., an executable). Assert that an error message is displayed and the file is not uploaded.
    *   **Test Case 5: File Size Limit**: Attempt to upload a file exceeding a predefined size limit. Assert that an error message is displayed and the file is not uploaded.
    *   **Test Case 6: Database Association**: After successful uploads, query the Supabase `investment_opportunities` table (specifically the `property_photos` or `property_documents` arrays, or a related `data_room_documents` table if implemented) to confirm that the file URLs are correctly associated with the opportunity.
    *   **Test Case 7: Document Deletion**: Select an uploaded document and initiate its deletion. Assert that the document is removed from the list and no longer accessible, and its entry is removed from the database/storage.

3.  **Implement the Task**: 
    *   **Integrate File Upload Component into Opportunity Form**: 
        *   Within the opportunity creation/editing form (e.g., `src/components/forms/opportunity-form.tsx` or a dedicated sub-component), add a file upload input.
        *   Consider using a library for file uploads that provides drag-and-drop functionality and progress indicators (e.g., `react-dropzone` or a Shadcn/ui-compatible upload component).
    *   **Create API Route for File Upload (`src/app/api/uploads/documents/route.ts` or `src/app/api/uploads/images/route.ts`)**:
        *   Handle `POST` requests for file uploads.
        *   Receive the file data from the request.
        *   **Supabase Storage Integration**: Use the Supabase client to upload the file to a designated bucket (e.g., `deal-packages`, `opportunity-photos`) in Supabase Storage.
            *   Ensure appropriate bucket policies are set for security.
            *   Generate a public URL for the uploaded file.
        *   **Database Update**: After successful upload, update the `investment_opportunities` table (or `data_room_documents` table) to store the file's URL and any other relevant metadata (e.g., file name, type, size) associated with the specific `opportunity_id`.
        *   Handle success and error responses, including validation for file types and sizes.
    *   **Implement Document Display and Deletion**: 
        *   On the opportunity detail page and within the editing form, display a list of uploaded documents.
        *   Provide a mechanism (e.g., a button next to each document) to delete an uploaded file. This will require another API route (`DELETE /api/uploads/documents/[fileId]`) that removes the file from Supabase Storage and its entry from the database.

4.  **Run Tests & Verify**: 
    *   Manually test uploading various file types and sizes, and verify their display and deletion.
    *   Check the Supabase Storage dashboard to confirm files are being stored and removed correctly.
    *   (For automated tests) Develop Playwright tests to simulate file uploads and deletions, asserting the correct behavior and data persistence.


