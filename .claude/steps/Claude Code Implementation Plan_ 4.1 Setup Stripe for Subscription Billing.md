# Claude Code Implementation Plan: 4.1 Setup Stripe for Subscription Billing

## Objective
Integrate Stripe into the application to handle subscription payments and billing for various user tiers.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: The application needs to process recurring payments for user subscriptions. This involves setting up Stripe API keys, creating products and prices in Stripe, and ensuring the application can interact with Stripe securely.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Environment Variables Configuration**: Verify that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` are present in `.env.local`.
    *   **Test Case 2: Stripe Product/Price Creation**: Manually verify in the Stripe Dashboard that at least one product (e.g., "Professional Subscription") and its associated prices (e.g., $199/month) have been created.
    *   **Test Case 3: Stripe Client Initialization**: Write a simple test (e.g., in `src/lib/stripe/client.ts` for frontend, or a server-side utility) to attempt to initialize the Stripe client using the environment variables and ensure no immediate errors.

3.  **Implement the Task**: 
    *   **Stripe Account Setup**: 
        *   If you don't have one, create a Stripe account ([https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)).
        *   Navigate to `Developers > API keys` to find your `Publishable key` (starts with `pk_test_` or `pk_live_`) and `Secret key` (starts with `sk_test_` or `sk_live_`).
        *   Navigate to `Developers > Webhooks` and add a new endpoint. For local development, you can use `stripe listen` or a service like `ngrok` to expose your local webhook endpoint. The endpoint URL will be `YOUR_APP_URL/api/stripe/webhooks`. Copy the `Webhook secret`.
    *   **Configure Environment Variables**: Add the following to your `.env.local` file:
        ```dotenv
        # .env.local
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
        STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
        STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
        ```
        Replace placeholders with your actual keys.
    *   **Create Stripe Products and Prices**: 
        *   In the Stripe Dashboard, go to `Products`.
        *   Create a new product for each subscription tier (e.g., "Professional Subscription", "Premium Features", "Enterprise").
        *   For each product, add a recurring price (e.g., $199/month, $299/month, $99/month, $999/month).
        *   Note down the Price IDs (e.g., `price_12345`) as you will need them in your application code.
    *   **Create Stripe Utility (`src/lib/stripe/utils.ts`)**:
        *   Create a utility file to initialize the Stripe client and provide helper functions for interacting with the Stripe API.
        ```typescript
        // src/lib/stripe/utils.ts
        import Stripe from 'stripe';

        export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2024-04-10', // Use a recent API version
          typescript: true,
        });
        ```

4.  **Run Tests & Verify**: 
    *   Ensure your `.env.local` file is correctly populated.
    *   Run `npm run dev` and ensure no errors related to Stripe API keys are reported.
    *   Manually verify the products and prices are set up in your Stripe Dashboard.


