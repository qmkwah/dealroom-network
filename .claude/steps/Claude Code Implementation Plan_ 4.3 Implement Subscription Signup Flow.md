# Claude Code Implementation Plan: 4.3 Implement Subscription Signup Flow

## Objective
Develop the user interface and backend logic for users to select a subscription plan and complete the payment process using Stripe Checkout.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Users should be able to choose a subscription plan from the pricing page and proceed to a secure checkout process to make their first payment and activate their subscription. This involves creating a Stripe Checkout session and handling its success/failure.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Initiate Checkout**: On the pricing page, click the "Choose Plan" or "Subscribe" button for a specific plan. Assert that the user is redirected to a Stripe Checkout page.
    *   **Test Case 2: Successful Payment**: On the Stripe Checkout page, enter valid test payment details (using Stripe's test card numbers). Complete the payment. Assert that the user is redirected to a success page (e.g., `/success`) and their `subscription_tier` and `stripe_customer_id` are updated in the Supabase `users` table.
    *   **Test Case 3: Failed Payment**: On the Stripe Checkout page, enter invalid test payment details (e.g., a declined card). Assert that the payment fails and the user is redirected to a failure page (e.g., `/cancel`) or an error message is displayed.
    *   **Test Case 4: User Role Update**: After successful subscription, verify that the user's `role` in the `users` table is updated to reflect their new subscription (e.g., from `free` to `professional`).

3.  **Implement the Task**: 
    *   **Modify Pricing Page (`src/app/(public)/pricing/page.tsx`)**:
        *   For each subscription plan, add a button (e.g., "Choose Plan").
        *   When this button is clicked, it should trigger a client-side function that makes an API call to create a Stripe Checkout session.
    *   **Create API Route for Stripe Checkout Session (`src/app/api/stripe/create-checkout-session/route.ts`)**:
        *   Handle `POST` requests to this route.
        *   Receive the `priceId` of the selected subscription plan from the request body.
        *   Use the Stripe Node.js library (`stripe.checkout.sessions.create`) to create a new Checkout Session.
        *   **Important**: Include `success_url` and `cancel_url` parameters that point back to your application (e.g., `YOUR_APP_URL/success?session_id={CHECKOUT_SESSION_ID}` and `YOUR_APP_URL/cancel`).
        *   Return the `session.url` to the frontend.
    *   **Handle Redirects on Frontend**: 
        *   On the client-side, after receiving the `session.url` from the API, redirect the user to this URL (`window.location.href = session.url`).
        *   Create `src/app/(public)/success/page.tsx` and `src/app/(public)/cancel/page.tsx` to handle the redirects from Stripe Checkout. The `success` page will typically confirm the subscription and might trigger a backend update (though webhooks are preferred for reliability).
    *   **Update User Data (via Webhook - see next task)**: While you can update user data on the `success` page, the most reliable way to confirm a subscription and update user roles is via Stripe Webhooks. This ensures that even if the user closes the browser after payment, your system still gets notified.

4.  **Run Tests & Verify**: 
    *   Manually test the subscription signup flow using Stripe's test card numbers. Verify successful and failed payment scenarios.
    *   Check your Supabase `users` table to confirm `subscription_tier` and `stripe_customer_id` are updated after a successful payment.
    *   (For automated tests) Use Playwright to simulate the entire checkout process, including navigating to Stripe Checkout, filling in test card details, and asserting the final state in your application and database.


