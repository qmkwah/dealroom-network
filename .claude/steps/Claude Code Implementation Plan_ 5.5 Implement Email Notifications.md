# Claude Code Implementation Plan: 5.5 Implement Email Notifications

## Objective
Integrate an email service (Resend) to send transactional emails for critical events such as new inquiries, meeting confirmations, password resets, and subscription updates.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Beyond in-app notifications, users should receive important updates via email. This involves setting up an email sending service (Resend), creating email templates, and triggering emails from backend API routes.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Resend API Key Configuration**: Verify that `RESEND_API_KEY` is present in `.env.local`.
    *   **Test Case 2: Email Sending (Mocked)**: Write a unit test for an email sending utility that mocks the Resend API call. Assert that the utility is called with the correct recipient, subject, and content for a given event (e.g., new inquiry).
    *   **Test Case 3: New Inquiry Email**: Simulate a `capital_partner` submitting an inquiry. Assert that an email is sent to the `deal_sponsor` with relevant inquiry details.
    *   **Test Case 4: Meeting Confirmation Email**: Simulate a meeting being scheduled. Assert that confirmation emails are sent to both the `deal_sponsor` and `capital_partner` with meeting details.
    *   **Test Case 5: Password Reset Email**: Simulate a password reset request. Assert that a password reset email is sent to the user.

3.  **Implement the Task**: 
    *   **Resend Account Setup**: 
        *   Create an account on Resend ([https://resend.com/](https://resend.com/)).
        *   Verify your domain.
        *   Generate an API Key.
    *   **Configure Environment Variable**: Add the following to your `.env.local` file:
        ```dotenv
        # .env.local
        RESEND_API_KEY=re_YOUR_RESEND_API_KEY
        ```
    *   **Create Email Utility (`src/lib/email/utils.ts`)**:
        *   Create a utility file to initialize the Resend client and provide helper functions for sending emails.
        ```typescript
        // src/lib/email/utils.ts
        import { Resend } from 'resend';

        export const resend = new Resend(process.env.RESEND_API_KEY);

        export async function sendEmail({
          to,
          subject,
          html,
          text,
        }: { to: string; subject: string; html?: string; text?: string }) {
          try {
            const { data, error } = await resend.emails.send({
              from: 'DealRoom Network <onboarding@yourdomain.com>', // Replace with your verified sender email
              to: [to],
              subject,
              html,
              text,
            });

            if (error) {
              console.error('Error sending email:', error);
              return { success: false, error: error.message };
            }
            return { success: true, data };
          } catch (error: any) {
            console.error('Unexpected error sending email:', error);
            return { success: false, error: error.message };
          }
        }
        ```
    *   **Create Email Templates (`src/components/emails/`)**: 
        *   Use React Email ([https://react.email/](https://react.email/)) to create beautiful, responsive email templates. Examples:
            *   `NewInquiryEmail.tsx`
            *   `MeetingConfirmationEmail.tsx`
            *   `PasswordResetEmail.tsx`
        *   Render these templates to HTML strings for sending.
    *   **Integrate Email Sending into API Routes**: 
        *   Modify relevant API routes (e.g., `POST /api/inquiries`, `POST /api/meetings/schedule`, `POST /api/auth/reset-password`) to call the `sendEmail` utility after successful database operations.
        *   Pass the necessary data to the email template and render it to HTML.

4.  **Run Tests & Verify**: 
    *   Manually trigger events that should send emails (e.g., submit an inquiry, request a password reset). Check your email inbox (or Resend dashboard logs) to confirm emails are received and look correct.
    *   (For automated tests) Use Playwright to simulate these actions and verify that the `sendEmail` utility is called with the correct parameters (mocking the actual email sending for speed).


