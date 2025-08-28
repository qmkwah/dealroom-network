# Claude Code Implementation Plan: 4.4 Build Subscription Management Dashboard

## Objective
Develop a user dashboard where subscribed users can view their current plan details, manage their subscription (upgrade, downgrade, cancel), and update payment methods.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Provide users with self-service options for their subscriptions. This involves fetching their current subscription status from Stripe and Supabase, displaying it, and offering actions to modify it.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Dashboard Accessibility**: Log in as a subscribed user. Navigate to the subscription management dashboard (e.g., `/settings/subscription`). Assert that the dashboard is rendered correctly.
    *   **Test Case 2: Current Plan Display**: Assert that the user's current subscription plan, billing cycle, and next payment date are accurately displayed.
    *   **Test Case 3: Upgrade/Downgrade Option**: If applicable, assert that options to upgrade or downgrade the subscription are visible and functional.
    *   **Test Case 4: Cancellation Option**: Assert that a "Cancel Subscription" button is visible and, when clicked, initiates the cancellation process.
    *   **Test Case 5: Update Payment Method**: Assert that a button or link to update the payment method is visible and redirects to Stripe's customer portal or a custom payment update form.
    *   **Test Case 6: Reflect Changes**: After an upgrade, downgrade, or cancellation, assert that the dashboard immediately reflects the new subscription status.

3.  **Implement the Task**: 
    *   **Create Subscription Management Page (`src/app/(dashboard)/settings/subscription/page.tsx`)**:
        *   Fetch the logged-in user's `stripe_customer_id` and `subscription_tier` from the Supabase `users` table.
        *   Use the Stripe API (server-side) to retrieve the user's current subscription details (e.g., `stripe.subscriptions.retrieve(user.stripe_subscription_id)`).
        *   Display the subscription details, including the plan name, price, billing period, and next payment date.
        *   **Upgrade/Downgrade Logic**: Provide buttons or a dropdown for changing plans. When a new plan is selected, make an API call to a backend route that uses the Stripe API to update the subscription (`stripe.subscriptions.update`).
        *   **Cancellation Logic**: Add a "Cancel Subscription" button. On click, make an API call to a backend route that uses `stripe.subscriptions.del` to cancel the subscription.
        *   **Update Payment Method**: Provide a button to redirect the user to Stripe's Customer Portal (`stripe.billingPortal.sessions.create`). This allows users to manage their payment methods and view invoices directly on Stripe.
    *   **Create API Routes for Subscription Management**: 
        *   `POST /api/stripe/update-subscription`: Handles upgrade/downgrade requests.
        *   `POST /api/stripe/cancel-subscription`: Handles cancellation requests.
        *   `POST /api/stripe/create-customer-portal-session`: Creates a session for Stripe's Customer Portal.
        *   Implement server-side validation and authorization for all these routes.

4.  **Run Tests & Verify**: 
    *   Manually test upgrading, downgrading, and canceling a subscription. Verify changes in the dashboard and in your Stripe account.
    *   Test updating the payment method via the Stripe Customer Portal.
    *   (For automated tests) Use Playwright to simulate these actions and assert the correct UI and database updates.


