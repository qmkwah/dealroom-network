# Claude Code Implementation Plan: 1.9 Implement User Registration (Email/Password)

## Objective
Enable new users to register for the platform using their email and a password, storing their credentials securely.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Create a user registration page and API endpoint that allows users to sign up. This involves creating a form, handling form submission, and interacting with Supabase Auth to create a new user.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Registration Page Accessibility**: Verify that the `/register` route renders the registration form.
    *   **Test Case 2: Successful Registration**: Simulate a user filling out the registration form with valid email and password. Assert that a new user record is created in Supabase `auth.users` table and the user is redirected to a success page or dashboard.
    *   **Test Case 3: Invalid Email Format**: Simulate submitting the form with an invalid email address. Assert that an appropriate error message is displayed and no user is created.
    *   **Test Case 4: Weak Password**: Simulate submitting the form with a password that does not meet strength requirements (if any). Assert that an error message is displayed.
    *   **Test Case 5: Duplicate Email Registration**: Attempt to register with an email that already exists. Assert that an error message is displayed.

3.  **Implement the Task**: 
    *   **Create Registration Page (`src/app/(auth)/register/page.tsx`)**:
        *   Design a simple form with email and password input fields, and a submit button.
        *   Use Shadcn/ui components for form elements (e.g., `Input`, `Button`, `Label`).
        *   Implement client-side validation for email format and password strength.
    *   **Create Registration API Route (`src/app/api/auth/register/route.ts`)**:
        *   Handle `POST` requests to this route.
        *   Receive email and password from the request body.
        *   Use the Supabase client to call `supabase.auth.signUp({ email, password })`.
        *   Handle success and error responses from Supabase, returning appropriate HTTP status codes and messages.
    *   **Integrate with Supabase Client**: Ensure `src/lib/supabase/client.ts` is correctly configured to initialize the Supabase client.

4.  **Run Tests & Verify**: 
    *   Manually navigate to `/register` and test the form with valid and invalid inputs.
    *   Check the Supabase `auth.users` table to confirm user creation.
    *   (For automated tests) Run Playwright tests that simulate user registration and assert the expected outcomes.


