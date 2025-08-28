# Claude Code Implementation Plan: 5.3 Implement Document Versioning

## Objective
Enable deal sponsors to upload new versions of documents within a data room, maintaining a history of changes and allowing access to previous versions.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: When a document is updated, the system should not simply overwrite the old file. Instead, it should store the new version while keeping the old one accessible, providing an audit trail and the ability to revert.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Upload New Version**: As a `deal_sponsor`, upload an initial version of a document to a data room. Then, upload a new file with the same logical name (e.g., "Financial Model.xlsx"). Assert that both versions are stored and accessible, and the latest version is marked as current.
    *   **Test Case 2: View Version History**: For a versioned document, assert that a UI element (e.g., a dropdown or a link) allows the sponsor to view a list of all previous versions, including their upload dates and who uploaded them.
    *   **Test Case 3: Access Previous Version**: Select a previous version from the history. Assert that the content of the previous version can be viewed or downloaded.
    *   **Test Case 4: Restore Previous Version**: Select a previous version and initiate a "restore" action. Assert that the selected previous version becomes the new current version, and the old current version is now part of the history.
    *   **Test Case 5: Document Deletion (Versioned)**: Delete a versioned document. Assert that all versions of the document are removed from storage and the database.

3.  **Implement the Task**: 
    *   **Database Schema Update**: Modify the `data_room_documents` table to include fields for `version_number` (integer, default 1), `is_current_version` (boolean, default true), and `previous_version_id` (UUID, nullable, self-referencing).
        *   Alternatively, create a new `document_versions` table that links to `data_room_documents` and stores metadata for each version.
    *   **Modify Document Upload Logic**: 
        *   When a sponsor uploads a document, first check if a document with the same logical name already exists for that data room.
        *   If it does, mark the existing document as `is_current_version = false` and increment its `version_number`.
        *   Create a new record for the uploaded file, setting `is_current_version = true` and `version_number` to the next available number.
        *   Store the actual file in Supabase Storage with a unique name (e.g., `[document_id]_[version_number].[ext]`).
    *   **Frontend UI for Version Management**: 
        *   On the data room document list, display the current version of each document.
        *   Add an icon or link next to versioned documents to open a version history modal/sidebar.
        *   The version history UI should list all versions, with options to view, download, or restore previous versions.
    *   **API Routes for Version Management**: 
        *   `POST /api/data-rooms/[dataRoomId]/documents/[documentId]/new-version`: To upload a new version of an existing document.
        *   `GET /api/data-rooms/[dataRoomId]/documents/[documentId]/versions`: To retrieve the version history.
        *   `POST /api/data-rooms/[dataRoomId]/documents/[documentId]/restore-version`: To restore a previous version.

4.  **Run Tests & Verify**: 
    *   Manually test uploading new versions, viewing history, and restoring previous versions.
    *   Verify that the correct document content is displayed for each version.
    *   (For automated tests) Use Playwright to simulate document versioning workflows and assert the correct behavior and data persistence.


