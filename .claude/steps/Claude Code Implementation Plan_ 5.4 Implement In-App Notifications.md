# Claude Code Implementation Plan: 5.4 Implement In-App Notifications

## Objective
Develop a system for delivering real-time, in-app notifications to users for important events such as new inquiries, meeting requests, document uploads, and connection requests.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Users need to be immediately aware of relevant activities on the platform without constantly checking different sections. This involves a notification bell icon, a notification feed, and marking notifications as read.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Notification Bell Display**: Log in as a user. Assert that a notification bell icon is visible in the header/navigation.
    *   **Test Case 2: Unread Notification Count**: Trigger a new event (e.g., send a connection request to the logged-in user). Assert that the notification bell displays an unread count (e.g., a badge with "1").
    *   **Test Case 3: Notification Feed Display**: Click the notification bell. Assert that a dropdown or dedicated page displays a list of notifications, showing the event, sender, and timestamp.
    *   **Test Case 4: Mark as Read**: Click on an unread notification or a "Mark all as read" button. Assert that the notification is marked as read and the unread count decreases.
    *   **Test Case 5: Real-time Notification Delivery**: Trigger a new event. Assert that the notification appears instantly in the notification feed and the unread count updates without a page refresh.

3.  **Implement the Task**: 
    *   **Database Schema**: Ensure the `notifications` table is defined in your Supabase schema with fields like `user_id`, `type` (e.g., `new_inquiry`, `meeting_request`, `document_uploaded`, `connection_request`), `message`, `read_at`, `created_at`, and `related_entity_id` (e.g., `opportunity_id`, `inquiry_id`).
    *   **Notification Triggering**: 
        *   Modify existing API routes (e.g., for inquiry submission, meeting scheduling, document upload, connection requests) to insert a new record into the `notifications` table when a relevant event occurs.
        *   Example: After a successful inquiry submission, insert a notification for the `deal_sponsor`.
    *   **Frontend Notification Component (`src/components/layout/notification-bell.tsx`)**:
        *   Create a React component for the notification bell icon in the application header.
        *   Fetch unread notifications for the current user from Supabase.
        *   Display the unread count as a badge.
        *   On click, display a dropdown or navigate to a dedicated notification page (`src/app/(dashboard)/notifications/page.tsx`) listing all notifications.
    *   **Real-time Updates with Supabase Realtime**: 
        *   Use Supabase Realtime subscriptions to listen for new `INSERT` events on the `notifications` table, filtered by `user_id`.
        *   When a new notification is received, update the unread count and add the notification to the feed instantly.
    *   **Mark as Read Functionality**: 
        *   Create an API route (`PATCH /api/notifications/[id]/read`) to mark a specific notification as read.
        *   Create another API route (`PATCH /api/notifications/mark-all-read`) to mark all notifications for a user as read.
        *   Update the `read_at` timestamp in the `notifications` table.

4.  **Run Tests & Verify**: 
    *   Manually test triggering various events (e.g., send an inquiry from one user to another, accept a connection request) and verify that notifications appear in real-time.
    *   Test marking notifications as read and observe the unread count updates.
    *   (For automated tests) Use Playwright to simulate event triggers and assert the correct display and state changes of notifications.


