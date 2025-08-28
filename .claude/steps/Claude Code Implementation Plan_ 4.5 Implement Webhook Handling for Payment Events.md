# Claude Code Implementation Plan: 4.5 Implement Webhook Handling for Payment Events

## Objective
Set up a secure webhook endpoint to receive and process real-time payment events from Stripe, ensuring the application's database is always synchronized with Stripe's subscription and payment statuses.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Stripe sends notifications (webhooks) to your application when important events occur (e.g., a subscription is created, a payment succeeds, a payment fails, a subscription is cancelled). Your application needs to receive these notifications, verify their authenticity, and update its internal database accordingly.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Webhook Endpoint Accessibility**: Assert that the webhook endpoint (`/api/stripe/webhooks`) is accessible and can receive POST requests.
    *   **Test Case 2: Valid Webhook Signature**: Send a test webhook from Stripe with a valid signature. Assert that the webhook is successfully processed and the corresponding database update occurs (e.g., `invoice.payment_succeeded` updates `subscription_expires_at`).
    *   **Test Case 3: Invalid Webhook Signature**: Send a test webhook from Stripe with an invalid signature. Assert that the webhook is rejected (e.g., returns a 400 or 403 status code) and no database update occurs.
    *   **Test Case 4: `customer.subscription.created` Event**: Trigger this event from Stripe. Assert that a new user's `subscription_tier`, `subscription_status`, `stripe_customer_id`, and `stripe_subscription_id` are correctly set in the `users` table.
    *   **Test Case 5: `invoice.payment_succeeded` Event**: Trigger this event. Assert that the user's `subscription_expires_at` is updated and a `subscription_payments` record is created/updated.
    *   **Test Case 6: `customer.subscription.deleted` Event**: Trigger this event. Assert that the user's `subscription_status` is updated to `cancelled` in the `users` table.
    *   **Test Case 7: Idempotency**: Send the same webhook event multiple times. Assert that the database is updated only once, preventing duplicate processing.

3.  **Implement the Task**: 
    *   **Create Webhook API Route (`src/app/api/stripe/webhooks/route.ts`)**:
        *   This route will handle `POST` requests from Stripe.
        *   **Raw Body Parsing**: Stripe webhooks require access to the raw request body to verify the signature. You might need to configure Next.js to parse the raw body for this specific route.
        *   **Signature Verification**: Use `stripe.webhooks.constructEvent` to verify the webhook signature. This is crucial for security to ensure the webhook is genuinely from Stripe and hasn't been tampered with.
            ```typescript
            // Example in route.ts
            import { headers } from 'next/headers';
            import Stripe from 'stripe';
            import { stripe } from '@/lib/stripe/utils'; // Your Stripe utility

            export async function POST(req: Request) {
              const body = await req.text();
              const signature = headers().get('stripe-signature');

              let event: Stripe.Event;

              try {
                event = stripe.webhooks.constructEvent(
                  body,
                  signature!,
                  process.env.STRIPE_WEBHOOK_SECRET!
                );
              } catch (err: any) {
                console.error(`Webhook Error: ${err.message}`);
                return new Response(`Webhook Error: ${err.message}`, { status: 400 });
              }

              // Handle the event
              switch (event.type) {
                case 'customer.subscription.created':
                  const subscriptionCreated = event.data.object as Stripe.Subscription;
                  // Update user in Supabase: set subscription_tier, stripe_subscription_id, etc.
                  console.log(`Subscription created: ${subscriptionCreated.id}`);
                  break;
                case 'invoice.payment_succeeded':
                  const invoicePaymentSucceeded = event.data.object as Stripe.Invoice;
                  // Update user in Supabase: set subscription_expires_at, create payment record
                  console.log(`Payment succeeded for invoice: ${invoicePaymentSucceeded.id}`);
                  break;
                case 'customer.subscription.deleted':
                  const subscriptionDeleted = event.data.object as Stripe.Subscription;
                  // Update user in Supabase: set subscription_status to 'cancelled'
                  console.log(`Subscription deleted: ${subscriptionDeleted.id}`);
                  break;
                // ... handle other event types
                default:
                  console.log(`Unhandled event type ${event.type}`);
              }

              return new Response(JSON.stringify({ received: true }), { status: 200 });
            }

            // Important: Disable body parsing for this route
            export const config = {
              api: {
                bodyParser: false,
              },
            };
            ```
        *   **Event Handling Logic**: Implement a `switch` statement or similar logic to handle different Stripe event types. For each relevant event, update your Supabase database accordingly.
            *   `customer.subscription.created`: Update `users` table with `stripe_customer_id`, `stripe_subscription_id`, `subscription_tier`, `subscription_status`.
            *   `invoice.payment_succeeded`: Update `users` table with `subscription_expires_at`. Create a record in `subscription_payments` table.
            *   `customer.subscription.updated`: Handle changes to subscription (e.g., plan changes, status changes).
            *   `customer.subscription.deleted`: Update `users` table `subscription_status` to `cancelled`.
    *   **Supabase Database Updates**: Use the Supabase client to perform `update` or `insert` operations on your `users` and `subscription_payments` tables based on the webhook data.

4.  **Run Tests & Verify**: 
    *   **Local Testing**: Use `stripe listen --forward-to localhost:3000/api/stripe/webhooks` (or your actual webhook URL) to forward test webhooks from Stripe to your local development environment.
    *   Trigger various events from the Stripe Dashboard (e.g., create a test subscription, mark an invoice as paid, cancel a subscription).
    *   Verify that your application's database is updated correctly after each event.
    *   (For automated tests) Use a testing framework that can simulate incoming HTTP requests with specific headers and bodies to test the webhook endpoint logic.


