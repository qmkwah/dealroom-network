# Claude Code Implementation Plan: 3.10 Implement Real-time Messaging with Supabase

## Objective
Enhance the messaging system to provide real-time updates, allowing messages to appear instantly without requiring a page refresh.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Leverage Supabase Realtime subscriptions to push new messages to active conversation threads as soon as they are sent, creating a seamless chat experience.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Real-time Message Display**: Open two browser windows, logged in as two different connected users (User A and User B), and navigate both to the same conversation thread.
        *   As User A, send a message. Assert that the message appears instantly in User B's conversation window without User B needing to refresh the page.
        *   As User B, send a reply. Assert that the reply appears instantly in User A's conversation window.
    *   **Test Case 2: Subscription Lifecycle**: Assert that the real-time subscription is correctly established when a user enters a conversation and is properly unsubscribed when they leave (e.g., navigate away from the conversation page).
    *   **Test Case 3: Error Handling**: Simulate a real-time connection error. Assert that the application gracefully handles the error and potentially attempts to reconnect or informs the user.

3.  **Implement the Task**: 
    *   **Supabase Realtime Setup**: 
        *   Ensure your Supabase project has Realtime enabled for the `messages` table (this is usually enabled by default).
        *   You might need to configure Row Level Security (RLS) policies on the `messages` table to ensure users can only subscribe to messages they are authorized to see (i.e., messages in conversations they are a part of).
    *   **Modify Conversation Detail Page (`src/app/(dashboard)/messages/[conversationId]/page.tsx`)**:
        *   In the client-side component responsible for displaying messages, import the Supabase client.
        *   When the component mounts (e.g., using `useEffect` in React), create a Supabase Realtime subscription to the `messages` table, filtering by the current `conversationId`.
        *   Example Supabase Realtime subscription code:
            ```typescript
            // src/app/(dashboard)/messages/[conversationId]/page.tsx (client component)
            'use client';

            import React, { useEffect, useState } from 'react';
            import { createClient } from '@/lib/supabase/client'; // Your Supabase client setup
            import { useParams } from 'next/navigation';

            type Message = { id: string; message_text: string; sender_id: string; created_at: string; };

            export default function ConversationPage() {
              const { conversationId } = useParams();
              const [messages, setMessages] = useState<Message[]>([]);
              const supabase = createClient();

              useEffect(() => {
                if (!conversationId) return;

                // Fetch initial messages
                const fetchMessages = async () => {
                  const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: true });

                  if (error) {
                    console.error('Error fetching messages:', error);
                  } else {
                    setMessages(data || []);
                  }
                };

                fetchMessages();

                // Subscribe to new messages
                const channel = supabase
                  .channel(`conversation_${conversationId}`)
                  .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                    (payload) => {
                      setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
                    }
                  )
                  .subscribe();

                // Cleanup subscription on unmount
                return () => {
                  supabase.removeChannel(channel);
                };
              }, [conversationId, supabase]);

              return (
                <div className="flex flex-col h-full">
                  <div className="flex-grow overflow-y-auto p-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="mb-2">
                        <strong>{msg.sender_id}:</strong> {msg.message_text}
                      </div>
                    ))}
                  </div>
                  {/* Message input form here */}
                </div>
              );
            }
            ```
        *   When a new message is received via the subscription, update the component's state to display the new message instantly.
    *   **Message Sending**: Ensure that when a message is sent (via the API route implemented in the previous task), it correctly inserts into the `messages` table, which will then trigger the Realtime subscription.

4.  **Run Tests & Verify**: 
    *   Manually test the real-time functionality by having two users chat simultaneously.
    *   (For automated tests) Use Playwright to open two browser contexts, log in as different users, navigate to the same conversation, and assert that messages sent in one context appear instantly in the other.


