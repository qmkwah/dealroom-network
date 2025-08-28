# Claude Code Implementation Plan: 3.9 Create Messaging System Between Users

## Objective
Develop a private messaging system that allows users to communicate directly with their connections on the platform.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Users need to be able to send and receive private messages. This involves creating conversation threads, displaying messages within those threads, and ensuring messages are only visible to participants.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Conversation List Display**: Log in as a user. Navigate to the messages page (e.g., `/messages`). Assert that a list of existing conversations (if any) is displayed, showing the other participant and the last message snippet.
    *   **Test Case 2: New Conversation Initiation**: From a connected user's profile, click a "Message" button. Assert that a new conversation thread is initiated or an existing one is opened.
    *   **Test Case 3: Sending a Message**: In a conversation thread, type a message and send it. Assert that the message appears in the conversation history for the sender.
    *   **Test Case 4: Receiving a Message**: Log in as the recipient of the message. Navigate to the conversation. Assert that the new message is visible in their conversation history.
    *   **Test Case 5: Message Privacy**: Log in as a third user who is not part of the conversation. Attempt to access the conversation. Assert that access is denied or the conversation is not visible.
    *   **Test Case 6: Real-time Update (Basic)**: (This will be enhanced in the next task, but for now) Send a message and refresh the recipient's page. Assert the message appears.

3.  **Implement the Task**: 
    *   **Database Schema**: Ensure the `messages` table and `conversations` table (if you decide to separate them for better organization) are correctly defined in your Supabase schema. The PRD's `messages` table has `conversation_id`, `sender_id`, `recipient_id`, `message_text`.
    *   **Create Conversation List Page (`src/app/(dashboard)/messages/page.tsx`)**:
        *   Fetch all conversations involving the logged-in user from the `messages` table (or a `conversations` table if implemented).
        *   Display a list of conversations, showing the other participant's name and a snippet of the last message.
    *   **Create Conversation Detail Page (`src/app/(dashboard)/messages/[conversationId]/page.tsx`)**:
        *   Use Next.js dynamic routing to create a page for each conversation based on its `conversationId`.
        *   Fetch all messages for the given `conversationId` from the `messages` table.
        *   Display the messages in chronological order.
        *   Include an input field and a send button for composing new messages.
    *   **Create API Route for Sending Messages (`src/app/api/messages/route.ts`)**:
        *   Handle `POST` requests to send a new message.
        *   Receive `conversation_id`, `recipient_id`, and `message_text` from the request body.
        *   Perform server-side validation and authorization (ensure sender is part of the conversation or connected to recipient).
        *   Insert the new message into the `messages` table.
        *   Handle success and error responses.
    *   **Integrate "Message" Button on Profile Pages**: On user profile pages, add a "Message" button that, when clicked, navigates to the appropriate conversation page (creating a new conversation if one doesn't exist).

4.  **Run Tests & Verify**: 
    *   Manually test sending messages between two connected users.
    *   Verify that messages appear in the correct conversation threads and are not visible to unauthorized users.
    *   (For automated tests) Use Playwright to simulate message sending and receiving, asserting the correct UI updates and database entries.


