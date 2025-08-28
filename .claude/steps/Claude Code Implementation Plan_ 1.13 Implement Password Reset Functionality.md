# Claude Code Implementation Plan: 1.13 Implement Password Reset Functionality

## Objective
Enable users to reset their forgotten passwords securely through an email-based process.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Users who forget their password should be able to request a password reset link via email. Clicking this link will allow them to set a new password.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Password Reset Request**: Simulate a user requesting a password reset for a registered email address. Assert that a password reset email is sent to their inbox (check email logs or mock service).
    *   **Test Case 2: Successful Password Reset**: Simulate a user clicking the reset link, entering a new password, and submitting. Assert that the password is successfully updated and the user can log in with the new password.
    *   **Test Case 3: Invalid/Expired Reset Link**: Simulate attempting to reset a password with an invalid or expired link. Assert that an error message is displayed and the password is not changed.
    *   **Test Case 4: Non-existent Email**: Simulate requesting a password reset for an email address not registered in the system. Assert that a generic success message is displayed (to prevent email enumeration attacks) and no email is sent.

3.  **Implement the Task**: 
    *   **Create Forgot Password Page (`src/app/(auth)/forgot-password/page.tsx`)**:
        *   Design a form with an email input field and a submit button.
        *   On submission, call Supabase Auth's `resetPasswordForEmail` method.
        *   Display a generic success message to the user, regardless of whether the email exists, for security reasons.
    *   **Create Update Password Page (`src/app/(auth)/update-password/page.tsx`)**:
        *   This page will be accessed via the link sent in the reset email. It will typically receive a `code` and `type` parameter in the URL.
        *   Design a form with new password and confirm password input fields.
        *   On submission, use the Supabase client to call `supabase.auth.updateUser` with the new password.
        *   Handle success and error responses, redirecting the user to the login page on success.
    *   **Supabase Configuration**: Ensure Supabase's email templates for password reset are configured.

4.  **Run Tests & Verify**: 
    *   Manually test the forgot password flow by requesting a reset email and then using the link to set a new password.
    *   Verify successful login with the new password.
    *   (For automated tests) Use Playwright to simulate the entire flow and assert the expected outcomes.


