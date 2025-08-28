# Claude Code Implementation Plan: 1.4 Create Supabase Project and Configure Environment Variables

## Objective
Set up a new Supabase project, retrieve its API keys, and configure them as environment variables in the Next.js application.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Connect the application to Supabase. This requires creating a Supabase project, obtaining its URL and `anon` key, and setting them in `.env.local`.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Environment Variables Presence**: Verify that `.env.local` exists and contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   **Test Case 2: Supabase Client Initialization**: Write a simple test (e.g., in `src/lib/supabase/client.ts`) to attempt to initialize the Supabase client using the environment variables and ensure no immediate connection errors. This can be a unit test for the Supabase client utility.

3.  **Implement the Task**: 
    *   Go to [Supabase](https://app.supabase.com/) and create a new project.
    *   Navigate to `Project Settings > API` to find your `Project URL` and `anon public` key.
    *   Create a `.env.local` file in the root of your project (if it doesn't exist) and add the following:
        ```dotenv
        # .env.local
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY # Keep this secret!
        DATABASE_URL=YOUR_DATABASE_CONNECTION_STRING
        ```
        Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, `YOUR_SUPABASE_SERVICE_ROLE_KEY`, and `YOUR_DATABASE_CONNECTION_STRING` with your actual Supabase project details.

4.  **Run Tests & Verify**: Check the `.env.local` file content. Implement a basic Supabase client initialization in `src/lib/supabase/client.ts` and run a simple script or component that uses it to verify connectivity.


