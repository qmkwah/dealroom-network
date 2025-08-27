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

**DealRoom Network** - B2B professional networking platform for real estate deal makers.

### Test Driven Development (TDD)
- **Framework**: Jest with React Testing Library
- **Process**: Red-Green-Refactor cycle for all features
- **Structure**: Tests in `src/__tests__/` with complete coverage required
- **Rule**: Write failing tests first, implement to pass, then refactor

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
- User profiles for each role type
- Investment opportunities with financial modeling
- Investment inquiries and partnership tracking
- Professional connections and messaging
- Subscription and payment management
- Document storage with access controls

### Implementation Status

#### ✅ Completed (Phase 1: Foundation & Testing)
- **Project Setup**: Next.js 15 with TypeScript, Tailwind CSS, Shadcn/ui
- **Testing Framework**: Jest + React Testing Library with comprehensive setup
- **Authentication System**: 
  - Supabase Auth integration with email/password
  - Login, register, logout, callback API routes (31/31 tests passing)
  - Role-based authentication structure
- **Investment Opportunity API**: 
  - Create opportunity endpoint with validation
  - Flat schema structure with Zod validation
  - Database integration (ready for Supabase schema)
- **Build System**: Production build working, TypeScript compilation passing
- **Environment**: Supabase CLI configured with API keys in .env.local

#### 🟡 In Progress (Current Session)
- Database schema implementation (Supabase configured, awaiting table creation)
- Frontend components (partially implemented, needs alignment with flat schema)

#### ⏳ Next Steps
- Complete database schema with Supabase CLI
- Implement frontend opportunity forms
- Add professional networking features
- Stripe subscription integration
- Real-time messaging system

## Rules
Before work, MUST view `.claude/tasks/context_session_x.md` for full context.

When creating new context session files, MUST use the template at `.claude/templates/context_session_template.md` as the structure.

After work, MUST update `.claude/tasks/context_session_x.md` with progress using the template format.
                              
## Agent Consultation (Use Only When Essential)

**test-engineer-tdd**: Testing and Vercel deployment (TDD critical path)

**frontend-architect**: UI building & tweaking (Complex UI only) 

**supabase-database-expert**: Database, authentication tables (Schema changes only)

**nextjs-fullstack-developer**: Business logic, API integration (Complex business logic only)

Sub-agents research and create `.claude/doc/xxxxx.md` reports. Main agent implements.

When consulting:
- Pass context file: `.claude/tasks/context_session_x.md`
- Sub-agent creates research report
- Sub-agent updates context file with findings location
- Main agent reads report before implementation

**Consultation Triggers** (Only when these conditions met):
- **Test Issues**: TDD failures, deployment problems → test-engineer-tdd
- **Complex UI**: Multi-step forms, dashboards, responsive layouts → frontend-architect  
- **Database Changes**: Schema modifications, RLS policies, auth setup → supabase-database-expert
- **Business Logic**: Payment processing, complex API integrations → nextjs-fullstack-developer

For simple tasks, implement directly without consultation.