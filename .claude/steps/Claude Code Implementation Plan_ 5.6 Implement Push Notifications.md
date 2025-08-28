# Claude Code Implementation Plan: 5.6 Implement Push Notifications

## Objective
Extend the notification system to include push notifications for web browsers, providing immediate alerts to users even when they are not actively on the platform.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Implement browser-based push notifications to enhance user engagement and ensure critical updates are delivered promptly. This involves using a service like Web Push API or a third-party provider like OneSignal or Firebase Cloud Messaging.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Push Notification Permission Prompt**: Navigate to the application. Assert that a browser permission prompt for push notifications appears.
    *   **Test Case 2: Successful Subscription**: Grant permission. Assert that the browser successfully subscribes to push notifications and a subscription token is stored in the database.
    *   **Test Case 3: Push Notification Delivery**: Trigger an event (e.g., new inquiry). Assert that a push notification is received by the subscribed browser, even when the tab is in the background or closed.
    *   **Test Case 4: Click Action**: Click on the received push notification. Assert that the user is redirected to the relevant page within the application.
    *   **Test Case 5: Unsubscription**: Revoke push notification permission from browser settings. Assert that the subscription token is removed from the database.

3.  **Implement the Task**: 
    *   **Database Schema Update**: Add a `push_subscription_tokens` table to store `user_id`, `endpoint`, `p256dh`, and `auth` (from the push subscription object).
    *   **Frontend Service Worker (`public/service-worker.js`)**: 
        *   Create a service worker file that will handle push events.
        *   Register the service worker in your `_app.tsx` or `layout.tsx`.
        *   The service worker will listen for `push` events and display notifications using `self.registration.showNotification()`.
    *   **Frontend Push Subscription Logic**: 
        *   On the client-side, prompt the user for push notification permission (e.g., in a settings page or after login).
        *   If granted, use `navigator.serviceWorker.ready` and `registration.pushManager.subscribe()` to get the push subscription object.
        *   Send this subscription object to your backend API to store it in the `push_subscription_tokens` table.
    *   **Backend API for Sending Push Notifications (`src/app/api/notifications/push/route.ts`)**:
        *   When an event occurs that requires a push notification, retrieve the relevant `push_subscription_tokens` for the target user(s).
        *   Use a web-push library (e.g., `web-push` npm package) to send the push notification to each endpoint.
        *   Example (simplified):
            ```typescript
            // src/app/api/notifications/push/route.ts
            import { NextResponse } from 'next/server';
            import webpush from 'web-push';
            import { createClient } from '@/lib/supabase/server';

            // Replace with your VAPID keys
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

            webpush.setVapidDetails(
              'mailto:your_email@example.com',
              publicVapidKey!,
              privateVapidKey!
            );

            export async function POST(req: Request) {
              const { userId, title, body, url } = await req.json();
              const supabase = createClient();

              const { data: subscriptions, error } = await supabase
                .from('push_subscription_tokens')
                .select('*')
                .eq('user_id', userId);

              if (error || !subscriptions || subscriptions.length === 0) {
                return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
              }

              const payload = JSON.stringify({ title, body, url });

              for (const sub of subscriptions) {
                try {
                  await webpush.sendNotification(sub as webpush.PushSubscription, payload);
                } catch (pushError: any) {
                  console.error('Push notification failed:', pushError);
                  // Handle expired subscriptions (e.g., delete from DB)
                }
              }

              return NextResponse.json({ success: true });
            }
            ```
    *   **VAPID Keys**: Generate VAPID keys (e.g., `npx web-push generate-vapid-keys`) and store them securely in environment variables.

4.  **Run Tests & Verify**: 
    *   Manually test subscribing to push notifications and triggering events to receive them.
    *   Verify that clicking the notification redirects to the correct page.
    *   (For automated tests) Playwright can simulate granting permissions and receiving notifications, but testing actual push delivery might require a more complex setup or mocking.


