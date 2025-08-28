# Claude Code Implementation Plan: 3.6 Create Professional Network Profiles

## Objective
Develop comprehensive profile pages for Deal Sponsors, Capital Partners, and Service Providers, showcasing their professional credentials, track record, and investment/service preferences.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: Each user role needs a dedicated profile page that displays information relevant to their role. This involves fetching data from the `deal_sponsor_profiles`, `capital_partner_profiles`, and `service_provider_profiles` tables and rendering it in a user-friendly format.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Profile Page Accessibility**: Log in as a user. Navigate to their own profile page (e.g., `/profile`). Assert that the correct profile page for their role is displayed.
    *   **Test Case 2: Data Display (Deal Sponsor)**: Log in as a `deal_sponsor`. Assert that fields like `license_number`, `years_experience`, `deals_completed`, `preferred_property_types`, etc., are displayed accurately on their profile.
    *   **Test Case 3: Data Display (Capital Partner)**: Log in as a `capital_partner`. Assert that fields like `accredited_investor_status`, `net_worth_range`, `investment_focus`, `min_investment_amount`, etc., are displayed accurately on their profile.
    *   **Test Case 4: Data Display (Service Provider)**: Log in as a `service_provider`. Assert that fields like `service_categories`, `years_in_business`, `client_testimonials`, `hourly_rates`, etc., are displayed accurately on their profile.
    *   **Test Case 5: Profile Editing (Owner)**: As the profile owner, assert that an "Edit Profile" button is visible and allows them to modify their profile information.
    *   **Test Case 6: Profile Viewing (Other Users)**: Log in as a different user role. Navigate to another user's profile. Assert that public information is displayed, but sensitive or private information is hidden.

3.  **Implement the Task**: 
    *   **Create Dynamic Profile Pages (`src/app/(dashboard)/profile/page.tsx` and `src/app/(dashboard)/investors/[id]/page.tsx`, `src/app/(dashboard)/sponsors/[id]/page.tsx`, etc.)**:
        *   Create a generic profile page component that can adapt based on the user's role or the ID in the URL.
        *   Fetch user data from the `users` table and then conditionally fetch data from the specific profile table (`deal_sponsor_profiles`, `capital_partner_profiles`, `service_provider_profiles`) based on the user's role.
        *   Use Shadcn/ui components to structure the profile layout, including sections for personal info, professional details, track record, and preferences.
    *   **Create Profile Editing Forms**: 
        *   Develop separate forms or a multi-step form for editing each type of profile. These forms will be pre-filled with existing data.
        *   Create API routes (`PATCH /api/profile/sponsor`, `PATCH /api/profile/investor`, `PATCH /api/profile/provider`) to handle updates to these profile tables.
        *   Implement robust server-side validation and authorization to ensure users can only edit their own profiles.
    *   **Implement Profile Viewing Logic**: 
        *   For public viewing of profiles, ensure that only non-sensitive information is displayed.
        *   Consider implementing a connection request mechanism before full profile details are revealed (if part of the networking feature).

4.  **Run Tests & Verify**: 
    *   Manually create and edit profiles for each user role, verifying that data is saved and displayed correctly.
    *   Test viewing profiles as different user roles to ensure access control is working.
    *   (For automated tests) Use Playwright to simulate profile creation, editing, and viewing for different user roles, asserting data accuracy and access restrictions.


