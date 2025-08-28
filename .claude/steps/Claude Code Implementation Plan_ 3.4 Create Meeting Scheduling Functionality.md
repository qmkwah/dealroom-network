# Claude Code Implementation Plan: 3.4 Create Meeting Scheduling Functionality

## Objective
Enable deal sponsors and capital partners to schedule virtual or in-person meetings related to investment inquiries.

## Detailed Steps (TDD Approach)

1.  **Understand the Goal**: After an inquiry, both the sponsor and investor should have the option to schedule a meeting. This involves a UI for proposing times, confirming meetings, and potentially integrating with a calendar or video conferencing service.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Schedule Meeting Button Visibility**: After an inquiry has been responded to (status `responded`), assert that a "Schedule Meeting" button is visible on the inquiry detail view for both the sponsor and the investor.
    *   **Test Case 2: Meeting Proposal**: As a sponsor, click "Schedule Meeting". Assert that a modal or form appears allowing the sponsor to propose meeting details (date, time, type - video/in-person, location/link).
    *   **Test Case 3: Successful Meeting Creation**: Propose a meeting. Assert that the meeting details are saved to the `investment_inquiries` table (or a new `meetings` table if created) and a notification is sent to the other party.
    *   **Test Case 4: Meeting Acceptance/Rejection**: As the capital partner, receive a meeting proposal. Assert that options to accept or reject the proposal are visible. Accept the meeting. Assert that the meeting status is updated to `meeting_scheduled` and a confirmation is sent to the sponsor.
    *   **Test Case 5: Calendar Integration (if applicable)**: If integrating with Google Calendar or Outlook, assert that the meeting is added to the respective calendars of both parties.
    *   **Test Case 6: Zoom Integration (if applicable)**: If a video meeting, assert that a Zoom link is generated and included in the meeting details.

3.  **Implement the Task**: 
    *   **Enhance Inquiry Detail View**: 
        *   On the inquiry detail view (accessible from both sponsor and investor dashboards), add a "Schedule Meeting" button that becomes active once the inquiry status is `responded`.
        *   Clicking this button should open a modal (`src/components/modals/schedule-meeting-modal.tsx`).
    *   **Create Schedule Meeting Modal/Form**: 
        *   The modal should allow users to input:
            *   `meeting_scheduled_at` (date and time picker)
            *   `meeting_type` (dropdown: `phone`, `video`, `in_person`)
            *   `meeting_location` (text input for address or video conference link)
            *   `meeting_notes` (textarea)
        *   Use Shadcn/ui components for all form elements.
    *   **Create API Route for Meeting Scheduling (`src/app/api/inquiries/[id]/schedule-meeting/route.ts`)**:
        *   Handle `POST` requests to this route.
        *   Receive `inquiry_id` and meeting details from the request body.
        *   Perform server-side validation and authorization.
        *   Update the `investment_inquiries` table with `meeting_scheduled_at`, `meeting_type`, `meeting_location`, `meeting_notes`, and set `status` to `meeting_scheduled`.
        *   **Zoom SDK Integration (Optional but Recommended)**: If `meeting_type` is `video`, use the Zoom SDK (or a similar service) to generate a meeting link and include it in `meeting_location`.
        *   **Email Notifications**: Send email notifications to both the sponsor and investor with meeting details.
    *   **Meeting Acceptance/Rejection UI**: 
        *   On the inquiry detail view, if a meeting is proposed, display options for the recipient to `Accept` or `Reject`.
        *   These actions will trigger another API call to update the meeting status.

4.  **Run Tests & Verify**: 
    *   Manually test the meeting scheduling flow from both sponsor and investor perspectives.
    *   Verify that meeting details are saved correctly and notifications are sent.
    *   (For automated tests) Use Playwright to simulate meeting proposals, acceptances, and rejections, asserting the correct state changes and UI updates.


