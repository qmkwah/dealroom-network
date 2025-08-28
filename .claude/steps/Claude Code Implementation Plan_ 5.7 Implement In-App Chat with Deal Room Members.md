# Claude Code Implementation Plan: 5.7 Implement In-App Chat with Deal Room Members

## Objective
Develop a dedicated in-app chat feature within each secure data room, allowing deal sponsors and authorized capital partners to communicate directly and securely about the specific opportunity.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Facilitate direct communication between data room members. This chat should be specific to the data room, ensuring discussions are contextual and private to the members with access.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Chat Interface Visibility**: Log in as a `deal_sponsor` or an authorized `capital_partner` with data room access. Navigate to the data room. Assert that a chat interface (e.g., a chat window or tab) is visible.
    *   **Test Case 2: Message Sending**: Type a message in the chat input and send it. Assert that the message appears in the chat history for the sender.
    *   **Test Case 3: Real-time Message Receiving**: Open two browser windows, logged in as two different authorized data room members. Send a message from one. Assert that the message appears instantly in the other window without refresh.
    *   **Test Case 4: Chat Privacy**: Log in as a user *without* access to the data room. Attempt to access the chat. Assert that access is denied or the chat is not visible.
    *   **Test Case 5: Message Persistence**: Send messages, then close and reopen the data room. Assert that previous messages are still visible in the chat history.

3.  **Implement the Task**: 
    *   **Database Schema**: Reuse the existing `messages` table, but ensure `conversation_id` can be linked to a `data_room_id` or create a new `data_room_messages` table with `data_room_id` as a foreign key.
    *   **Create Data Room Chat Component (`src/components/data-rooms/data-room-chat.tsx`)**:
        *   This component will be integrated into the data room detail page (`src/app/(dashboard)/opportunities/[id]/data-room/page.tsx`).
        *   It will display messages and provide an input for sending new messages.
        *   Fetch messages from the database, filtered by `data_room_id`.
    *   **Real-time Updates with Supabase Realtime**: 
        *   Similar to the general messaging system (`claude_code_plan_3_10_implement_realtime_messaging.md`), use Supabase Realtime subscriptions to listen for new `INSERT` events on the `data_room_messages` table (or `messages` table filtered by `data_room_id`).
        *   Filter the subscription by the current `data_room_id`.
    *   **API Route for Sending Data Room Messages (`src/app/api/data-rooms/[id]/messages/route.ts`)**:
        *   Handle `POST` requests to send a new message within a specific data room.
        *   Receive `data_room_id` from the URL and `message_text` from the request body.
        *   Perform server-side validation and authorization (ensure the sender is an authorized member of the data room).
        *   Insert the new message into the `data_room_messages` table.

4.  **Run Tests & Verify**: 
    *   Manually test sending and receiving messages within a data room with multiple authorized users.
    *   Verify that messages are real-time and only visible to authorized members.
    *   (For automated tests) Use Playwright to simulate chat interactions within a data room and assert the correct behavior.


