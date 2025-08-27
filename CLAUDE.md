# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: This project uses `pnpm` as specified in package.json
```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build with Turbopack  
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript checking without emitting

# Database
pnpm db:types         # Generate Supabase database types (requires PROJECT_ID)
pnpm stripe:listen    # Listen to Stripe webhooks for local development
```

## Architecture Overview

**DealRoom Network** - A B2B professional networking platform for real estate deal makers (sponsors, investors, service providers).

### Test Driven Development (TDD)
- **Testing Framework**: Jest with React Testing Library (to be set up in Day 2)
- **TDD Approach**: Red-Green-Refactor cycle for all features
- **Test Structure**: Tests organized in `src/__tests__/` directory
- **Test Types**: Unit tests, integration tests, and end-to-end tests
- **Test Coverage**: All features must have comprehensive test coverage
- **Implementation Rule**: Write failing tests first (red), then implement to make tests pass (green)
- **Feature Completion**: A feature is only considered complete when ALL tests pass

**TDD Implementation Process**:
1. **Red Phase**: Write comprehensive failing tests for the feature
2. **Green Phase**: Implement minimum code to make all tests pass
3. **Refactor Phase**: Improve code quality while keeping tests passing
4. **Integration**: Ensure new feature works with existing codebase

**Test Organization**:
- `__tests__/components/` - React component tests
- `__tests__/api/` - API route and server function tests
- `__tests__/lib/` - Utility and library function tests
- `__tests__/integration/` - Feature integration tests
- `__tests__/e2e/` - End-to-end workflow tests

### Tech Stack
- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: Supabase (PostgreSQL with auth, storage, realtime)
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Payments**: Stripe for subscriptions and success fees
- **Email**: Resend for transactional emails
- **Validation**: Zod with React Hook Form

### Project Structure

```
src/
├── app/                    # App Router pages and API routes
│   ├── (auth)/            # Auth routes (login, register, verify)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── opportunities/ # Investment opportunity management
│   │   ├── investors/     # Investor discovery and networking
│   │   ├── inquiries/     # Investment inquiry management
│   │   ├── partnerships/  # Partnership tracking and management
│   │   ├── messages/      # Real-time messaging system
│   │   └── profile/       # User profile management
│   └── api/               # API routes (auth, opportunities, stripe)
├── components/            # React components
│   ├── ui/               # Shadcn/ui components (button, input, etc.)
│   ├── layout/           # Layout components (header, nav, footer)
│   ├── forms/            # Form components
│   └── cards/            # Card components for data display
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client and server configurations
│   ├── stripe/           # Stripe client and server utilities
│   ├── utils.ts          # Utility functions and cn() helper
│   └── validations/      # Zod validation schemas
├── types/                # TypeScript type definitions
│   └── database.types.ts # Generated Supabase types
└── __tests__/            # Test directories following TDD approach
    ├── components/       # Component unit tests
    ├── api/             # API route tests
    ├── lib/             # Library function tests
    ├── integration/     # Integration tests
    └── e2e/            # End-to-end tests
```

### Key Features
1. **User Roles**: Deal sponsors, capital partners (investors), service providers
2. **Investment Opportunities**: Create, browse, and manage real estate deals
3. **Professional Networking**: Connect with other industry professionals
4. **Investment Inquiries**: Express interest and manage deal inquiries
5. **Partnership Management**: Track successful partnerships and fees
6. **Subscription Billing**: Monthly subscriptions + success fees via Stripe
7. **Real-time Messaging**: Communication between users
8. **Document Management**: Secure data rooms for deal documents

### Authentication & Authorization
- Supabase Auth with email/password
- Role-based access control (deal_sponsor, capital_partner, service_provider)
- Row Level Security (RLS) policies for data access
- Server-side and client-side authentication helpers

### Database Architecture
- Comprehensive user profiles for each role type
- Investment opportunities with financial modeling
- Investment inquiries and partnership tracking
- Professional connections and messaging
- Subscription and payment management
- Document storage with access controls

### Development Notes
- Uses Turbopack for faster builds and development
- Configured with CORS headers for API routes
- Image optimization for Supabase storage
- Form validation with React Hook Form + Zod
- Toast notifications via Sonner
- Dark mode support via next-themes

### Environment Setup
Requires setup of:
- Supabase project with database and auth configured
- Stripe account for payment processing
- Resend account for email notifications
- Database types generation: `pnpm db:types` after Supabase setup

### Revenue Model
- Professional subscriptions ($199-$999/month)
- Success fees ($2,500 per partnership formed)
- Premium features and enterprise plans

## Step-by-Step Implementation Plan (155+ Hours with TDD)

### Phase 1: Project Setup & Authentication (20 hours)

#### Day 1: Project Foundation (8 hours)
**Status**: ✅ Completed (Basic setup done)
- [x] Initialize Next.js 14+ with TypeScript and App Router
- [x] Setup Tailwind CSS with custom configuration
- [x] Install and configure Shadcn/ui components
- [x] Create Supabase project and configure environment variables
- [x] Setup basic project structure and folders
- [x] Configure ESLint, Prettier, and TypeScript settings
- [x] Create basic layout components (Header, Footer, Navigation)
- [x] Setup theme provider for dark/light mode

#### Day 2: Authentication System Tests + Implementation (12 hours)
**TDD Phase - Write Tests First (4 hours)**:
- [ ] Setup Jest and React Testing Library for testing framework
- [ ] Write tests for authentication API routes (login, register, logout)
- [ ] Write tests for email verification flow
- [ ] Write tests for password reset functionality
- [ ] Write tests for role-based authentication middleware
- [ ] Write tests for protected route components
- [ ] Write tests for login/register form validation
- [ ] Write tests for authentication state management
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (8 hours)**:
- [ ] Implement Supabase authentication with email/password
- [ ] Create login and registration forms with validation
- [ ] Setup email verification flow
- [ ] Implement role-based authentication (sponsor/investor/provider)
- [ ] Create protected route middleware
- [ ] Build user profile creation flow
- [ ] Setup password reset functionality
- [ ] Make all tests pass (green phase)

#### Day 3: User Profiles & Role Management Tests + Implementation (8 hours)
**TDD Phase - Write Tests First (3 hours)**:
- [ ] Write tests for profile creation forms (sponsor/investor/provider)
- [ ] Write tests for profile validation and completion tracking
- [ ] Write tests for profile verification workflows
- [ ] Write tests for dashboard profile display
- [ ] Write tests for profile update functionality
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (5 hours)**:
- [ ] Create deal sponsor profile form with track record verification
- [ ] Create capital partner profile form with accreditation
- [ ] Create service provider profile form
- [ ] Implement profile completion tracking
- [ ] Setup profile verification system
- [ ] Create user dashboard landing page
- [ ] Make all tests pass (green phase)

### Phase 2: Investment Opportunity Management (25 hours)

#### Days 3-4: Opportunity Creation & Management Tests + Implementation (18 hours)
**TDD Phase - Write Tests First (6 hours)**:
- [ ] Write tests for opportunity posting form validation
- [ ] Write tests for multi-step form progress tracking
- [ ] Write tests for property details and address validation
- [ ] Write tests for financial structure calculations
- [ ] Write tests for document upload functionality
- [ ] Write tests for opportunity preview generation
- [ ] Write tests for opportunity status management
- [ ] Write tests for opportunity editing/updating
- [ ] Write tests for opportunity analytics tracking
- [ ] Write tests for API routes (create, update, delete opportunities)
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (12 hours)**:
- [ ] Create comprehensive opportunity posting form
- [ ] Implement multi-step form with progress tracking
- [ ] Build property details section with address validation
- [ ] Create financial structure and investment terms section
- [ ] Add document upload functionality for offering materials
- [ ] Implement opportunity preview and review section
- [ ] Setup opportunity status management system
- [ ] Create opportunity editing and updating functionality
- [ ] Build opportunity analytics and tracking
- [ ] Make all tests pass (green phase)

#### Days 4-5: Opportunity Discovery & Browsing Tests + Implementation (19 hours)
**TDD Phase - Write Tests First (6 hours)**:
- [ ] Write tests for opportunity listing with filtering logic
- [ ] Write tests for search functionality and full-text search
- [ ] Write tests for opportunity card component rendering
- [ ] Write tests for detailed opportunity view page
- [ ] Write tests for document gallery display
- [ ] Write tests for opportunity comparison functionality
- [ ] Write tests for bookmarking/favoriting features
- [ ] Write tests for analytics and view tracking
- [ ] Write tests for recommendation engine algorithm
- [ ] Write tests for opportunity sharing features
- [ ] Write tests for activity feed generation
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (13 hours)**:
- [ ] Build opportunity listing page with advanced filters
- [ ] Create search functionality with full-text search
- [ ] Implement opportunity card component with key metrics
- [ ] Build detailed opportunity view page
- [ ] Add document gallery and offering materials display
- [ ] Create opportunity comparison tool
- [ ] Implement opportunity bookmarking/favoriting
- [ ] Setup opportunity analytics and view tracking
- [ ] Create opportunity recommendation engine
- [ ] Build opportunity sharing functionality
- [ ] Create opportunity activity feed
- [ ] Make all tests pass (green phase)

### Phase 3: Professional Network & Matching (25 hours)

#### Days 5-6: Investment Inquiries & Interest Management Tests + Implementation (18 hours)
**TDD Phase - Write Tests First (6 hours)**:
- [ ] Write tests for inquiry submission form validation
- [ ] Write tests for inquiry management dashboard
- [ ] Write tests for inquiry status tracking and updates
- [ ] Write tests for meeting scheduling functionality
- [ ] Write tests for inquiry analytics calculations
- [ ] Write tests for automated notification system
- [ ] Write tests for inquiry-to-partnership conversion
- [ ] Write tests for inquiry filtering and search
- [ ] Write tests for bulk inquiry operations
- [ ] Write tests for inquiry API routes
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (12 hours)**:
- [ ] Create inquiry submission form with investment details
- [ ] Build inquiry management dashboard for sponsors
- [ ] Implement inquiry status tracking and responses
- [ ] Create meeting scheduling functionality
- [ ] Build inquiry analytics and conversion tracking
- [ ] Setup automated inquiry notifications
- [ ] Create inquiry-to-partnership conversion workflow
- [ ] Implement inquiry filtering and search
- [ ] Build bulk inquiry management tools
- [ ] Make all tests pass (green phase)

#### Days 6-7: Professional Networking & Connections Tests + Implementation (19 hours)
**TDD Phase - Write Tests First (6 hours)**:
- [ ] Write tests for connection request system
- [ ] Write tests for connection management dashboard
- [ ] Write tests for connection suggestions algorithm
- [ ] Write tests for network visualization components
- [ ] Write tests for networking event integration
- [ ] Write tests for mutual connection discovery
- [ ] Write tests for endorsement system
- [ ] Write tests for industry news feed
- [ ] Write tests for networking analytics
- [ ] Write tests for referral system
- [ ] Write tests for networking API routes
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (13 hours)**:
- [ ] Build professional connection request system
- [ ] Create connection management dashboard
- [ ] Implement connection suggestions algorithm
- [ ] Build professional network visualization
- [ ] Create networking event and meetup integration
- [ ] Implement mutual connection discovery
- [ ] Build professional endorsement system
- [ ] Create industry news and updates feed
- [ ] Setup networking analytics and insights
- [ ] Build referral and introduction system
- [ ] Make all tests pass (green phase)

### Phase 4: Subscription & Payment Processing (15 hours)

#### Days 7-8: Stripe Subscription Integration Tests + Implementation (15 hours)
**TDD Phase - Write Tests First (5 hours)**:
- [ ] Write tests for Stripe subscription API integration
- [ ] Write tests for subscription plan management
- [ ] Write tests for subscription signup flow
- [ ] Write tests for subscription dashboard functionality
- [ ] Write tests for subscription renewal/cancellation
- [ ] Write tests for webhook handling and payment events
- [ ] Write tests for billing history generation
- [ ] Write tests for subscription analytics
- [ ] Write tests for trial periods and pricing
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (10 hours)**:
- [ ] Setup Stripe for subscription billing
- [ ] Create subscription plan management
- [ ] Implement subscription signup flow
- [ ] Build subscription management dashboard
- [ ] Setup subscription renewal and cancellation
- [ ] Implement webhook handling for payment events
- [ ] Create billing history and invoicing
- [ ] Build subscription analytics
- [ ] Setup trial periods and promotional pricing
- [ ] Make all tests pass (green phase)

#### Day 8: Success Fee Processing Tests + Implementation (8 hours)
**TDD Phase - Write Tests First (3 hours)**:
- [ ] Write tests for partnership success fee calculations
- [ ] Write tests for success fee payment processing
- [ ] Write tests for success fee tracking and reporting
- [ ] Write tests for commission split algorithms
- [ ] Write tests for success fee analytics
- [ ] Write tests for success fee API routes
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (5 hours)**:
- [ ] Create partnership success fee calculation
- [ ] Implement success fee payment processing
- [ ] Build success fee tracking and reporting
- [ ] Setup commission splits between platform and referrers
- [ ] Create success fee analytics
- [ ] Make all tests pass (green phase)

### Phase 5: Communication & Document Management (10 hours)

#### Day 9: Messaging & Communication Tests + Implementation (10 hours)
**TDD Phase - Write Tests First (4 hours)**:
- [ ] Write tests for messaging system functionality
- [ ] Write tests for message thread interface
- [ ] Write tests for real-time messaging with Supabase
- [ ] Write tests for notification system (email + in-app)
- [ ] Write tests for message search and filtering
- [ ] Write tests for message attachments and file sharing
- [ ] Write tests for conversation management
- [ ] Write tests for messaging API routes
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (6 hours)**:
- [ ] Create messaging system between users
- [ ] Build message thread interface
- [ ] Implement real-time messaging with Supabase
- [ ] Create notification system (email + in-app)
- [ ] Build message search and filtering
- [ ] Setup message attachments and document sharing
- [ ] Create conversation management
- [ ] Make all tests pass (green phase)

#### Day 9: Data Room & Document Management Tests + Implementation (7 hours)
**TDD Phase - Write Tests First (3 hours)**:
- [ ] Write tests for secure data room functionality
- [ ] Write tests for document upload and organization
- [ ] Write tests for access control and permissions
- [ ] Write tests for NDA signing workflow
- [ ] Write tests for document tracking and analytics
- [ ] Write tests for document watermarking
- [ ] Write tests for data room security measures
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (4 hours)**:
- [ ] Create secure data room functionality
- [ ] Build document upload and organization system
- [ ] Implement access control and permissions
- [ ] Create NDA signing workflow
- [ ] Build document tracking and analytics
- [ ] Setup watermarking for sensitive documents
- [ ] Make all tests pass (green phase)

### Phase 6: Analytics & Final Features (5 hours)

#### Day 10: Analytics Dashboard Tests + Implementation (5 hours)
**TDD Phase - Write Tests First (2 hours)**:
- [ ] Write tests for user analytics dashboard
- [ ] Write tests for opportunity performance tracking
- [ ] Write tests for platform usage analytics
- [ ] Write tests for conversion funnel analysis
- [ ] Write tests for ROI and performance metrics
- [ ] Write tests for custom reporting features
- [ ] Ensure all tests fail initially (red phase)

**Implementation Phase (3 hours)**:
- [ ] Create user analytics dashboard
- [ ] Build opportunity performance tracking
- [ ] Implement platform usage analytics
- [ ] Create conversion funnel analysis
- [ ] Setup ROI and performance metrics
- [ ] Build custom reporting features
- [ ] Make all tests pass (green phase)

#### Day 10: Final Testing & Deployment (4 hours)
**TDD Phase - Final Integration Tests (2 hours)**:
- [ ] Write end-to-end integration tests for complete user workflows
- [ ] Write tests for performance optimization and caching
- [ ] Write security audit tests and vulnerability checks
- [ ] Write tests for production environment setup
- [ ] Write tests for deployment and CI/CD pipeline
- [ ] Write tests for monitoring and error tracking
- [ ] Ensure all integration tests pass

**Deployment Phase (2 hours)**:
- [ ] Run comprehensive testing of all features
- [ ] Implement performance optimization and caching
- [ ] Complete security audit and testing
- [ ] Setup production environment variables
- [ ] Deploy to Vercel with CI/CD
- [ ] Setup monitoring and error tracking
- [ ] Verify all tests pass in production

## Database Schema Overview

### Core Tables
1. **users** - Base user authentication and profile
2. **deal_sponsor_profiles** - Real estate professional profiles
3. **capital_partner_profiles** - Accredited investor profiles
4. **service_provider_profiles** - Service provider profiles
5. **investment_opportunities** - Real estate investment deals
6. **investment_inquiries** - Interest tracking and management
7. **investment_partnerships** - Successful partnerships
8. **professional_connections** - Professional networking
9. **messages** - Real-time messaging system
10. **data_rooms** - Secure document sharing

## Rules
Before you do any work, MUST view files in .claude/tasks/context_session_x.md file to get the full context (x being the id of the session we are operate, if file doesn’t exist, then create one)

context_session_x.md should contain most of context of what we did, overall plan, and sub agents will continusly add context to the file

After you finish the work, MUST update the .claude/tasks/context_session_x.md file to make sure others can get full context of what you did
                              
you have access to 4 dedicated agents

test-engineer-tdd: for all the tasks related to testing and vercel deployment you HAVE TO consult this agent

frontend-architect: all task related to UI building & tweaking HAVE TO consult this agent

supabase-database-expert: you need to consult this agent for all the things related to databses, supabase, user authentication tables etc

nextjs-fullstack-developer: this agent is expert in business logic and api integration, anything realted to resend, stripe payment and other business logic you should consult this agent.

Sub agents will do research about the implementation, but you will do the actual implementation;
When passing task to sub agent, make sure you pass the context file, e.g. '.claude/tasks/context_session_x.md',
After each sub agent finish the work, make sure you read the related documentation they created to get full context of the plan before you start executing

