# Claude Code Implementation Plan: 1.12 Implement Role-Based Authentication

## Objective
Implement a robust role-based authentication system that restricts user access to specific features and content based on their assigned role (Deal Sponsor, Capital Partner, Service Provider, Admin).

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Users will have a `role` field in the `users` table. The application needs to read this role and dynamically adjust UI elements, navigation, and API access based on the user's permissions. This involves both frontend and backend logic.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Role Assignment on Registration**: When a user registers, assert that their `role` is correctly set in the Supabase `users` table based on the registration flow (e.g., if they register as a 'deal_sponsor', their role should be 'deal_sponsor').
    *   **Test Case 2: Frontend UI Adaptation (Sponsor)**: Log in as a `deal_sponsor`. Assert that sponsor-specific navigation links (e.g., 

