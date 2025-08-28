# Real Estate Deal Room Platform - Detailed PRD

## 1. Project Overview

This document expands upon the initial Product Requirements Document (PRD) for the 'DealRoom Network' platform. Its primary purpose is to provide highly detailed, step-by-step instructions for each development task, ensuring clarity and precision for a developer, even one new to the project or the Claude Code CLI. Each task will incorporate a Test-Driven Development (TDD) approach, where tests are written before implementation, and completion is marked only upon successful test passage. Additionally, a comprehensive section on setting up an automated frontend testing workflow will be included.

**Platform Name**: DealRoom Network  
**Type**: B2B professional networking platform for real estate deal makers  
**Revenue Model**: Monthly subscriptions + success fees for partnerships  
**Target Development Time**: 100 hours (10 days)  
**Target Revenue**: $10k-$100k monthly within 3 months

## 2. Business Model & Market Validation

### 2.1 Revenue Structure
- **Professional Subscription**: $199/month for investors, $299/month for capital partners
- **Success Fee**: $2,500 flat fee when equity partnership is formed
- **Premium Features**: $99/month for advanced deal analytics
- **Enterprise**: $999/month for real estate investment firms
- **Target Volume**: 400 subscribers = $80,000 monthly recurring revenue

### 2.2 Validated Demand Evidence
- **Reddit Validation**: r/RealEstateInvesting shows 15+ posts monthly seeking "partners" or "capital"
- **Market Gap**: No professional platform connects accredited investors with deal sponsors
- **Competitor Analysis**: No direct competitor in real estate equity partnership space
- **BiggerPockets Forums**: 50+ daily posts seeking investment partners
- **Industry Growth**: Private real estate investment growing 8% annually

### 2.3 Market Positioning
**Primary Value Proposition**: "LinkedIn for Real Estate Deal Makers"
- Professional networking platform for real estate equity partnerships
- Due diligence tools and deal analysis
- Verified accredited investor network
- No lending licenses required - pure networking platform

## 3. Core Features & User Stories

### 3.1 User Roles
- **Deal Sponsors**: Real estate professionals posting investment opportunities
- **Capital Partners**: Accredited investors seeking real estate investments
- **Service Providers**: Contractors, attorneys, accountants, property managers
- **Admin**: Platform administrators managing users and partnerships

### 3.2 Deal Sponsor User Stories
```
As a Real Estate Deal Sponsor, I can:
- Register with professional credentials and track record verification
- Create comprehensive investment opportunity profiles
- Upload deal packages with financial models and market analysis
- Set investment criteria (minimum investment, preferred investor types)
- Browse and filter accredited investor profiles
- Send partnership proposals to targeted investors
- Schedule virtual or in-person investor meetings
- Share deal updates and progress reports with partners
- Access deal analytics and investor interest tracking
- Manage multiple investment opportunities simultaneously
- Create private deal rooms for confidential information sharing
- Track partnership conversion rates and investor preferences
- Export investor contact information and communication history
- Set up automated deal alerts based on investor criteria
- Access premium market data and comparable analysis
- Rate and review investor partners post-transaction
- Build professional portfolio showcasing successful deals
```

### 3.3 Capital Partner User Stories
```
As an Accredited Investor (Capital Partner), I can:
- Register with accredited investor verification and financial qualification
- Create detailed investor profile with investment preferences
- Browse investment opportunities with advanced filtering
- Save and bookmark interesting investment opportunities
- Request access to confidential deal information and data rooms
- Schedule due diligence calls with deal sponsors
- Submit investment proposals and negotiate terms
- Track investment pipeline and deal status updates
- Access market analysis and investment performance benchmarks
- Connect with other investors for co-investment opportunities
- Receive personalized deal recommendations based on preferences
- Set up automated deal alerts for new opportunities
- Access exclusive investment opportunities from verified sponsors
- Rate and review deal sponsors and investment experiences
- Build investment portfolio tracking and performance monitoring
- Connect with service providers for independent due diligence
- Join investor groups and networks within the platform
```

### 3.4 Service Provider User Stories
```
As a Service Provider, I can:
- Register with professional credentials and service offerings
- Create comprehensive service profile with past client testimonials
- Browse networking opportunities with investors and sponsors
- Offer services for due diligence, legal, accounting, and property management
- Create service packages with transparent pricing
- Schedule consultations and service delivery meetings
- Track client relationships and project outcomes
- Access marketplace for service opportunities
- Build professional network within real estate investment community
- Rate and review clients and investment opportunities
- Manage service delivery pipeline and client communication
```

## 4. Technical Architecture

### 4.1 Technology Stack
```
Frontend Framework: Next.js 14 (App Router) with TypeScript
Styling: Tailwind CSS + Shadcn/ui component library
Backend: Next.js API routes with server-side rendering
Database: PostgreSQL hosted on Supabase
Authentication: Supabase Auth with Row Level Security (RLS)
File Storage: Supabase Storage with CDN for document management
Real-time Updates: Supabase Realtime subscriptions
Payment Processing: Stripe for subscription billing
Document Management: AWS S3 for secure file storage
Video Conferencing: Zoom SDK integration for investor meetings
Email Service: Resend for transactional emails and notifications
Deployment: Vercel with automatic CI/CD
Monitoring: Vercel Analytics + Sentry for error tracking
Search: Built-in PostgreSQL full-text search
```

### 4.2 Database Schema
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table with authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR,
  role VARCHAR NOT NULL CHECK (role IN (
    'deal_sponsor', 'capital_partner', 'service_provider', 'admin'
  )),
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR,
  company_name VARCHAR,
  title VARCHAR,
  profile_image_url VARCHAR,
  linkedin_url VARCHAR,
  website_url VARCHAR,
  bio TEXT,
  subscription_tier VARCHAR DEFAULT 'free' CHECK (subscription_tier IN (
    'free', 'professional', 'premium', 'enterprise'
  )),
  subscription_status VARCHAR DEFAULT 'active' CHECK (subscription_status IN (
    'active', 'cancelled', 'past_due', 'unpaid'
  )),
  subscription_expires_at TIMESTAMP,
  stripe_customer_id VARCHAR UNIQUE,
  verified_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deal sponsor profiles
CREATE TABLE deal_sponsor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional information
  license_number VARCHAR,
  license_state VARCHAR,
  license_type VARCHAR, -- broker, agent, developer, fund_manager
  years_experience INTEGER NOT NULL,
  
  -- Company details
  business_address JSONB NOT NULL,
  business_entity_type VARCHAR, -- llc, corporation, partnership, individual
  duns_number VARCHAR,
  ein_number VARCHAR,
  
  -- Track record
  deals_completed INTEGER DEFAULT 0,
  total_capital_raised DECIMAL DEFAULT 0,
  total_deal_volume DECIMAL DEFAULT 0,
  average_deal_size DECIMAL,
  successful_exit_count INTEGER DEFAULT 0,
  
  -- Investment focus
  preferred_property_types TEXT[], -- multifamily, retail, office, industrial, etc.
  preferred_investment_types TEXT[], -- buy_hold, value_add, development, opportunistic
  preferred_locations TEXT[],
  typical_hold_period_months INTEGER,
  target_returns_range JSONB, -- {min: 12.0, max: 20.0}
  
  -- Minimum investment requirements
  min_investment_amount DECIMAL,
  max_investment_amount DECIMAL,
  accredited_investors_only BOOLEAN DEFAULT TRUE,
  international_investors_accepted BOOLEAN DEFAULT FALSE,
  
  -- Verification status
  background_check_status VARCHAR DEFAULT 'pending',
  professional_references JSONB,
  verification_documents TEXT[],
  compliance_status VARCHAR DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Capital partner profiles  
CREATE TABLE capital_partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Investor qualification
  accredited_investor_status VARCHAR NOT NULL CHECK (accredited_investor_status IN (
    'verified', 'pending', 'not_qualified'
  )),
  accreditation_method VARCHAR, -- income, net_worth, professional, entity
  accreditation_documents TEXT[],
  net_worth_range VARCHAR, -- 1m_5m, 5m_10m, 10m_25m, 25m_plus
  liquid_investment_capacity DECIMAL,
  annual_investment_budget DECIMAL,
  
  -- Investment preferences
  investment_focus TEXT[], -- multifamily, retail, office, industrial, land, commercial
  preferred_investment_types TEXT[], -- core, core_plus, value_add, opportunistic, development
  preferred_locations TEXT[],
  target_return_range JSONB, -- {min: 8.0, max: 15.0}
  preferred_hold_period_months INTEGER,
  
  -- Investment constraints
  min_investment_amount DECIMAL NOT NULL,
  max_investment_amount DECIMAL NOT NULL,
  max_investments_per_year INTEGER,
  co_investment_interest BOOLEAN DEFAULT TRUE,
  international_investment_interest BOOLEAN DEFAULT FALSE,
  
  -- Investment experience
  real_estate_experience_years INTEGER,
  total_real_estate_investments INTEGER DEFAULT 0,
  total_invested_amount DECIMAL DEFAULT 0,
  investment_track_record TEXT,
  
  -- Due diligence preferences
  site_visit_required BOOLEAN DEFAULT TRUE,
  independent_appraisal_required BOOLEAN DEFAULT FALSE,
  legal_review_required BOOLEAN DEFAULT TRUE,
  cpa_review_required BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service provider profiles
CREATE TABLE service_provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional information
  service_categories TEXT[] NOT NULL, -- legal, accounting, property_management, construction, appraisal, etc.
  professional_licenses TEXT[],
  certifications TEXT[],
  insurance_coverage JSONB,
  bonding_information JSONB,
  
  -- Business details
  business_entity_type VARCHAR,
  service_areas TEXT[], -- geographic areas served
  languages_spoken TEXT[],
  
  -- Experience and credentials
  years_in_business INTEGER NOT NULL,
  total_projects_completed INTEGER DEFAULT 0,
  average_project_value DECIMAL,
  client_testimonials JSONB,
  professional_references JSONB,
  
  -- Service offerings
  service_descriptions JSONB,
  hourly_rates JSONB,
  project_rate_ranges JSONB,
  availability_schedule JSONB,
  response_time_guarantee INTEGER, -- hours
  
  -- Performance metrics
  client_satisfaction_rating DECIMAL DEFAULT 0,
  project_completion_rate DECIMAL DEFAULT 0,
  on_time_delivery_rate DECIMAL DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Investment opportunities (deals)
CREATE TABLE investment_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES users(id) NOT NULL,
  
  -- Basic opportunity information
  opportunity_name VARCHAR NOT NULL,
  opportunity_description TEXT,
  status VARCHAR DEFAULT 'fundraising' CHECK (status IN (
    'draft', 'fundraising', 'due_diligence', 'funded', 'closed', 'cancelled'
  )),
  
  -- Property details
  property_address JSONB NOT NULL,
  property_type VARCHAR NOT NULL, -- multifamily, retail, office, industrial, land, mixed_use
  property_subtype VARCHAR, -- apartment, shopping_center, warehouse, etc.
  total_square_feet INTEGER,
  number_of_units INTEGER,
  year_built INTEGER,
  property_condition VARCHAR, -- excellent, good, fair, poor
  
  -- Financial structure
  total_project_cost DECIMAL NOT NULL,
  equity_requirement DECIMAL NOT NULL,
  debt_amount DECIMAL,
  debt_type VARCHAR, -- bank_loan, bridge_loan, construction_loan, none
  loan_to_cost_ratio DECIMAL,
  loan_to_value_ratio DECIMAL,
  
  -- Investment terms
  minimum_investment DECIMAL NOT NULL,
  maximum_investment DECIMAL,
  target_raise_amount DECIMAL NOT NULL,
  current_commitments DECIMAL DEFAULT 0,
  fundraising_progress DECIMAL DEFAULT 0, -- percentage
  
  -- Returns and timeline
  projected_irr DECIMAL,
  projected_total_return_multiple DECIMAL,
  projected_hold_period_months INTEGER,
  cash_on_cash_return DECIMAL,
  preferred_return_rate DECIMAL,
  waterfall_structure JSONB,
  
  -- Investment strategy
  investment_strategy VARCHAR, -- buy_hold, value_add, development, opportunistic
  business_plan TEXT,
  value_creation_strategy TEXT,
  exit_strategy VARCHAR, -- sale, refinance, hold_indefinitely
  
  -- Timeline
  fundraising_deadline DATE,
  expected_closing_date DATE,
  construction_start_date DATE,
  stabilization_date DATE,
  projected_exit_date DATE,
  
  -- Documentation
  offering_memorandum_url VARCHAR,
  financial_model_url VARCHAR,
  property_photos TEXT[],
  property_documents TEXT[], -- inspections, appraisals, environmental
  marketing_materials TEXT[],
  
  -- Market analysis
  market_analysis JSONB,
  comparable_properties JSONB,
  demographic_data JSONB,
  economic_indicators JSONB,
  
  -- Performance tracking
  views_count INTEGER DEFAULT 0,
  interest_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  meeting_requests_count INTEGER DEFAULT 0,
  
  -- Visibility and access
  public_listing BOOLEAN DEFAULT FALSE,
  featured_listing BOOLEAN DEFAULT FALSE,
  accredited_only BOOLEAN DEFAULT TRUE,
  geographic_restrictions TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Investment inquiries and interest tracking
CREATE TABLE investment_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES users(id) NOT NULL,
  sponsor_id UUID REFERENCES users(id) NOT NULL,
  
  -- Inquiry details
  inquiry_type VARCHAR NOT NULL CHECK (inquiry_type IN (
    'general_interest', 'request_information', 'schedule_meeting', 'investment_proposal'
  )),
  investment_amount_interest DECIMAL,
  message TEXT,
  
  -- Status tracking
  status VARCHAR DEFAULT 'pending' CHECK (status IN (
    'pending', 'responded', 'meeting_scheduled', 'proposal_submitted', 'accepted', 'declined', 'withdrawn'
  )),
  sponsor_response TEXT,
  sponsor_responded_at TIMESTAMP,
  
  -- Meeting information
  meeting_scheduled_at TIMESTAMP,
  meeting_type VARCHAR, -- phone, video, in_person
  meeting_location TEXT,
  meeting_notes TEXT,
  meeting_completed BOOLEAN DEFAULT FALSE,
  
  -- Follow-up tracking
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Investment partnerships (successful matches)
CREATE TABLE investment_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES investment_opportunities(id) NOT NULL,
  sponsor_id UUID REFERENCES users(id) NOT NULL,
  investor_id UUID REFERENCES users(id) NOT NULL,
  
  -- Partnership terms
  investment_amount DECIMAL NOT NULL,
  equity_percentage DECIMAL,
  partnership_agreement_url VARCHAR,
  legal_structure VARCHAR, -- llc_member, limited_partner, joint_venture
  
  -- Platform success fee
  platform_success_fee DECIMAL NOT NULL, -- typically $2,500
  fee_paid_by VARCHAR NOT NULL CHECK (fee_paid_by IN (
    'sponsor', 'investor', 'split'
  )),
  fee_payment_status VARCHAR DEFAULT 'pending' CHECK (fee_payment_status IN (
    'pending', 'paid', 'waived'
  )),
  fee_paid_at TIMESTAMP,
  
  -- Timeline
  letter_of_intent_signed_at TIMESTAMP,
  due_diligence_completed_at TIMESTAMP,
  investment_funded_at TIMESTAMP,
  partnership_effective_date DATE,
  
  -- Performance tracking
  partnership_status VARCHAR DEFAULT 'active' CHECK (partnership_status IN (
    'pending', 'active', 'exited', 'dissolved'
  )),
  investment_performance JSONB,
  distributions_received DECIMAL DEFAULT 0,
  current_value DECIMAL,
  
  -- Satisfaction and feedback
  sponsor_rating INTEGER CHECK (sponsor_rating >= 1 AND sponsor_rating <= 5),
  investor_rating INTEGER CHECK (investor_rating >= 1 AND investor_rating <= 5),
  feedback_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Professional connections
CREATE TABLE professional_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) NOT NULL,
  recipient_id UUID REFERENCES users(id) NOT NULL,
  
  -- Connection details
  status VARCHAR DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'blocked'
  )),
  connection_type VARCHAR NOT NULL CHECK (connection_type IN (
    'professional', 'partnership', 'service_provider'
  )),
  message TEXT,
  
  -- Timeline
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messaging system
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) NOT NULL,
  message_text TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  
  -- Notification content
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR NOT NULL CHECK (notification_type IN (
    'new_opportunity', 'opportunity_update', 'inquiry_received', 'inquiry_response',
    'meeting_scheduled', 'partnership_formed', 'connection_request', 'message_received',
    'document_shared', 'subscription_expiring', 'payment_due', 'system_announcement'
  )),
  
  -- Related entities
  opportunity_id UUID REFERENCES investment_opportunities(id),
  inquiry_id UUID REFERENCES investment_inquiries(id),
  partnership_id UUID REFERENCES investment_partnerships(id),
  connection_id UUID REFERENCES professional_connections(id),
  message_id UUID REFERENCES messages(id),
  
  -- Notification delivery
  read_at TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  push_sent BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMP,
  
  -- Action tracking
  action_taken BOOLEAN DEFAULT FALSE,
  action_url VARCHAR,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Platform analytics and metrics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- Event details
  event_name VARCHAR NOT NULL,
  event_category VARCHAR, -- user_action, business_metric, system_event
  event_data JSONB,
  
  -- Context
  session_id VARCHAR,
  page_url VARCHAR,
  referrer_url VARCHAR,
  user_agent TEXT,
  ip_address INET,
  
  -- Related entities
  opportunity_id UUID REFERENCES investment_opportunities(id),
  inquiry_id UUID REFERENCES investment_inquiries(id),
  partnership_id UUID REFERENCES investment_partnerships(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription billing and payments
CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  
  -- Payment details
  amount DECIMAL NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  payment_type VARCHAR NOT NULL CHECK (payment_type IN (
    'subscription', 'success_fee', 'premium_feature', 'setup_fee'
  )),
  
  -- Billing period
  billing_period_start DATE,
  billing_period_end DATE,
  subscription_tier VARCHAR,
  
  -- Payment processing
  stripe_payment_intent_id VARCHAR,
  stripe_invoice_id VARCHAR,
  stripe_subscription_id VARCHAR,
  
  -- Status
  status VARCHAR DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded'
  )),
  processed_at TIMESTAMP,
  failed_reason TEXT,
  
  -- Success fee details
  partnership_id UUID REFERENCES investment_partnerships(id),
  success_fee_type VARCHAR CHECK (success_fee_type IN (
    'partnership_formed', 'investment_funded', 'milestone_reached'
  )),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Document management and data rooms
CREATE TABLE data_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES investment_opportunities(id) NOT NULL,
  sponsor_id UUID REFERENCES users(id) NOT NULL,
  
  -- Data room details
  room_name VARCHAR NOT NULL,
  room_description TEXT,
  access_type VARCHAR DEFAULT 'by_request' CHECK (access_type IN (
    'public', 'by_request', 'invite_only'
  )),
  
  -- Access control
  nda_required BOOLEAN DEFAULT TRUE,
  accredited_investor_only BOOLEAN DEFAULT TRUE,
  watermarking_enabled BOOLEAN DEFAULT TRUE,
  download_disabled BOOLEAN DEFAULT FALSE,
  expiration_date DATE,
  
  -- Activity tracking
  total_visitors INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  average_time_spent INTEGER DEFAULT 0, -- minutes
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Data room access permissions
CREATE TABLE data_room_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_room_id UUID REFERENCES data_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) NOT NULL,
  granted_by UUID REFERENCES users(id) NOT NULL,
  
  -- Access details
  access_level VARCHAR DEFAULT 'view' CHECK (access_level IN (
    'view', 'download', 'admin'
  )),
  nda_signed BOOLEEN DEFAULT FALSE,
  nda_signed_at TIMESTAMP,
  access_expires_at TIMESTAMP,
  
  -- Activity tracking
  first_access_at TIMESTAMP,
  last_access_at TIMESTAMP,
  total_visits INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents within data rooms
CREATE TABLE data_room_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_room_id UUID REFERENCES data_rooms(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  
  -- Document details
  document_name VARCHAR NOT NULL,
  document_description TEXT,
  document_type VARCHAR, -- financial, legal, property, marketing, due_diligence
  file_url VARCHAR NOT NULL,
  file_size INTEGER,
  file_type VARCHAR,
  
  -- Organization
  folder_path VARCHAR DEFAULT '/',
  sort_order INTEGER DEFAULT 0,
  
  -- Access control
  confidentiality_level VARCHAR DEFAULT 'confidential' CHECK (confidentiality_level IN (
    'public', 'confidential', 'restricted', 'highly_restricted'
  )),
  access_requires_nda BOOLEAN DEFAULT TRUE,
  watermark_enabled BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_investment_opportunities_sponsor ON investment_opportunities(sponsor_id);
CREATE INDEX idx_investment_opportunities_status ON investment_opportunities(status);
CREATE INDEX idx_investment_opportunities_property_type ON investment_opportunities(property_type);
CREATE INDEX idx_investment_opportunities_location ON investment_opportunities USING gin((property_address->'state'));
CREATE INDEX idx_investment_inquiries_opportunity ON investment_inquiries(opportunity_id);
CREATE INDEX idx_investment_inquiries_investor ON investment_inquiries(investor_id);
CREATE INDEX idx_investment_partnerships_sponsor ON investment_partnerships(sponsor_id);
CREATE INDEX idx_investment_partnerships_investor ON investment_partnerships(investor_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_participants ON messages(sender_id, recipient_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX idx_data_room_access_user ON data_room_access(user_id);
CREATE INDEX idx_data_room_access_room ON data_room_access(data_room_id);

-- Full-text search indexes
CREATE INDEX idx_opportunities_search ON investment_opportunities USING gin(to_tsvector('english', opportunity_name || ' ' || opportunity_description));
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(company_name, '')));

-- Row Level Security policies
ALTER TABLE investment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_access ENABLE ROW LEVEL SECURITY;

-- Example RLS policies
CREATE POLICY "Users can view public opportunities or their own" ON investment_opportunities
  FOR SELECT USING (
    public_listing = true OR 
    sponsor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM investment_inquiries 
      WHERE investment_inquiries.opportunity_id = investment_opportunities.id 
      AND investment_inquiries.investor_id = auth.uid()
    )
  );

CREATE POLICY "Only sponsors can create opportunities" ON investment_opportunities
  FOR INSERT WITH CHECK (
    sponsor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'deal_sponsor'
    )
  );

CREATE POLICY "Users can view their own inquiries" ON investment_inquiries
  FOR SELECT USING (
    investor_id = auth.uid() OR 
    sponsor_id = auth.uid()
  );
```

### 4.3 Project Structure
```
dealroom-network/
├── README.md
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── .env.local
├── .env.example
├── .gitignore
│
├── public/
│   ├── images/
│   ├── icons/
│   └── documents/
│
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── sponsor-register.tsx
│   │   │   │       ├── investor-register.tsx
│   │   │   │       └── provider-register.tsx
│   │   │   ├── verify/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── stats-overview.tsx
│   │   │   │       ├── recent-activity.tsx
│   │   │   │       └── quick-actions.tsx
│   │   │   │
│   │   │   ├── opportunities/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── opportunity-form.tsx
│   │   │   │   │       ├── property-details.tsx
│   │   │   │   │       ├── financial-structure.tsx
│   │   │   │   │       └── investment-terms.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── data-room/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── opportunity-header.tsx
│   │   │   │   │       ├── investment-summary.tsx
│   │   │   │   │       ├── financial-projections.tsx
│   │   │   │   │       └── investor-interest.tsx
│   │   │   │   └── components/
│   │   │   │       ├── opportunity-card.tsx
│   │   │   │       ├── opportunity-filters.tsx
│   │   │   │       └── opportunity-search.tsx
│   │   │   │
│   │   │   ├── investors/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── investor-card.tsx
│   │   │   │       ├── investor-filters.tsx
│   │   │   │       └── investor-search.tsx
│   │   │   │
│   │   │   ├── inquiries/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── inquiry-form.tsx
│   │   │   │       ├── inquiry-list.tsx
│   │   │   │       └── inquiry-status.tsx
│   │   │   │
│   │   │   ├── partnerships/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── partnership-card.tsx
│   │   │   │       ├── partnership-timeline.tsx
│   │   │   │       └── partnership-performance.tsx
│   │   │   │
│   │   │   ├── connections/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── connection-requests.tsx
│   │   │   │       ├── professional-network.tsx
│   │   │   │       └── connection-suggestions.tsx
│   │   │   │
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [conversationId]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── message-list.tsx
│   │   │   │       ├── message-thread.tsx
│   │   │   │       └── compose-message.tsx
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── sponsor-profile.tsx
│   │   │   │       ├── investor-profile.tsx
│   │   │   │       ├── provider-profile.tsx
│   │   │   │       └── verification-status.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       └── components/
│   │   │           ├── account-settings.tsx
│   │   │           ├── subscription-management.tsx
│   │   │           ├── notification-preferences.tsx
│   │   │           └── privacy-settings.tsx
│   │
│   │   ├── (public)/
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── how-it-works/
│   │   │   │   └── page.tsx
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── success-stories/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/
│   │       │   │   └── route.ts
│   │       │   ├── login/
│   │       │   │   └── route.ts
│   │       │   └── profile/
│   │       │       └── route.ts
│   │       │
│   │       ├── opportunities/
│   │       │   ├── route.ts
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts
│   │       │   │   ├── inquiries/
│   │       │   │   │   └── route.ts
│   │       │   │   └── data-room/
│   │       │   │       └── route.ts
│   │       │   └── search/
│   │       │       └── route.ts
│   │       │
│   │       ├── inquiries/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── respond/
│   │       │           └── route.ts
│   │       │
│   │       ├── partnerships/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       │
│   │       ├── connections/
│   │       │   ├── route.ts
│   │       │   ├── requests/
│   │       │   │   └── route.ts
│   │       │   └── suggestions/
│   │       │       └── route.ts
│   │       │
│   │       ├── messages/
│   │       │   ├── route.ts
│   │       │   └── conversations/
│   │       │       └── route.ts
│   │       │
│   │       ├── stripe/
│   │       │   ├── create-subscription/
│   │       │   │   └── route.ts
│   │       │   ├── webhooks/
│   │       │   │   └── route.ts
│   │       │   └── portal/
│   │       │       └── route.ts
│   │       │
│   │       ├── uploads/
│   │       │   ├── documents/
│   │       │   │   └── route.ts
│   │       │   └── images/
│   │       │       └── route.ts
│   │       │
│   │       └── analytics/
│   │           └── events/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/ (Shadcn/ui components)
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── cards/
│   │   ├── tables/
│   │   ├── charts/
│   │   ├── modals/
│   │   ├── filters/
│   │   └── common/
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   ├── stripe/
│   │   ├── auth/
│   │   ├── validations/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── constants/
│   │   └── providers/
│   │
│   └── types/
│       ├── database.types.ts
│       ├── auth.types.ts
│       ├── opportunity.types.ts
│       ├── inquiry.types.ts
│       ├── partnership.types.ts
│       └── user.types.ts
│
├── docs/
│   ├── README.md
│   ├── setup.md
│   ├── api.md
│   └── deployment.md
│
└── scripts/
    ├── setup-db.sql
    ├── seed-data.ts
    └── deploy.sh
```

## 5. Step-by-Step Development Plan (100 Hours)

This section details each task from the original checklist, providing comprehensive, step-by-step instructions. Each task will begin with a Test-Driven Development (TDD) approach, where tests are designed and written *before* the corresponding code implementation. A task is considered complete only when all associated tests pass.

### Phase 1: Project Setup & Authentication (20 hours)

#### Day 1 (8 hours)

**Task: Initialize Next.js 14 with TypeScript and App Router**

**Objective**: Set up the foundational Next.js project with TypeScript and the App Router, ensuring a robust and modern development environment.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: The goal is to create a new Next.js project. This involves running the `create-next-app` command and navigating into the newly created directory. The success criteria will be the presence of the expected project structure and the ability to run the development server.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Project Directory Creation**: Verify that a directory named `dealroom-network` is created.
    *   **Test Case 2: Core Files Presence**: Check for the existence of `package.json`, `next.config.js`, `tsconfig.json`, and `src/app/layout.tsx` within the new directory, indicating a successful Next.js setup with TypeScript and App Router.
    *   **Test Case 3: Development Server Start**: Attempt to start the Next.js development server and confirm it runs without immediate errors. This will be a manual verification step for now, but can be automated later with E2E tests.

3.  **Implement the Task**: Execute the following shell commands:
    ```bash
    npx create-next-app@latest dealroom-network --typescript --tailwind --eslint --app
    cd dealroom-network
    ```

4.  **Run Tests & Verify**: After executing the commands, manually verify the presence of the files and attempt to run `npm run dev` to ensure the server starts. If any test fails, debug and re-run until all pass.

**Task: Setup Tailwind CSS with custom configuration**

**Objective**: Integrate Tailwind CSS into the Next.js project and configure it for custom styling, including `tailwind.config.js` and `globals.css`.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Integrate Tailwind CSS. This involves installing necessary packages, initializing Tailwind, and configuring `tailwind.config.js` and `globals.css`.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Tailwind Configuration File**: Verify `tailwind.config.js` exists and contains the correct `content` array for Next.js files.
    *   **Test Case 2: Global CSS Import**: Check that `src/app/globals.css` imports Tailwind's base, components, and utilities.
    *   **Test Case 3: Basic Tailwind Class Application**: Create a temporary component (e.g., `src/app/test-tailwind.tsx`) and apply a simple Tailwind class (e.g., `text-blue-500`). Then, write a test (e.g., using a simple DOM check in a Playwright test later) to confirm the style is applied. For now, this can be a visual inspection.

3.  **Implement the Task**: Execute the following shell commands and file modifications:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```
    Then, modify `tailwind.config.js` to include the content paths:
    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }
    ```
    Finally, update `src/app/globals.css`:
    ```css
    /* src/app/globals.css */
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    /* Add any custom global styles here */
    ```

4.  **Run Tests & Verify**: Check the file contents and visually inspect a component with Tailwind classes applied after running `npm run dev`.

**Task: Install and configure Shadcn/ui components**

**Objective**: Integrate Shadcn/ui components, ensuring they are properly set up and ready for use within the Next.js project.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Integrate Shadcn/ui. This involves initializing Shadcn/ui, which generates UI components and utility files.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Shadcn/ui Initialization Files**: Verify the creation of `components/ui/` directory and files like `components.json`.
    *   **Test Case 2: Component Importability**: Attempt to import a basic Shadcn/ui component (e.g., `Button`) into `src/app/page.tsx` and ensure no import errors. This can be a simple compilation check.

3.  **Implement the Task**: Execute the following shell command. Follow the prompts, selecting `TypeScript`, `React Server Components`, `app/` directory, and `globals.css` for styling.
    ```bash
    npx shadcn-ui@latest init
    ```
    Then, add a sample component to verify:
    ```bash
    npx shadcn-ui@latest add button
    ```

4.  **Run Tests & Verify**: Check for the presence of the generated files and ensure the project compiles after adding a sample component. Visually confirm the button renders correctly.

**Task: Create Supabase project and configure environment variables**

**Objective**: Set up a new Supabase project, retrieve its API keys, and configure them as environment variables in the Next.js application.

**Detailed Steps (TDD Approach)**:

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

**Task: Setup basic project structure and folders**

**Objective**: Organize the project directory according to the specified structure, creating necessary folders for components, libraries, and types.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create the specified folder structure under `src/`.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Folder Existence**: Verify the existence of `src/components/ui`, `src/components/layout`, `src/lib/supabase`, `src/types`, etc.

3.  **Implement the Task**: Create the directories as per the PRD's `Project Structure` section (4.3):
    ```bash
    mkdir -p src/components/ui 
    mkdir -p src/components/layout 
    mkdir -p src/components/forms 
    mkdir -p src/components/cards 
    mkdir -p src/components/tables 
    mkdir -p src/components/charts 
    mkdir -p src/components/modals 
    mkdir -p src/components/filters 
    mkdir -p src/components/common 
    mkdir -p src/lib/supabase 
    mkdir -p src/lib/stripe 
    mkdir -p src/lib/auth 
    mkdir -p src/lib/validations 
    mkdir -p src/lib/utils 
    mkdir -p src/lib/hooks 
    mkdir -p src/lib/constants 
    mkdir -p src/lib/providers 
    mkdir -p src/types
    ```

4.  **Run Tests & Verify**: Use `ls -R src/` or similar commands to confirm the directory structure.

**Task: Configure ESLint, Prettier, and TypeScript settings**

**Objective**: Ensure code quality and consistency by configuring ESLint for linting, Prettier for code formatting, and fine-tuning TypeScript settings.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Configure code quality tools. This involves checking existing configurations and potentially adding new rules or scripts.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: ESLint Configuration**: Verify `.eslintrc.json` exists and contains Next.js and TypeScript configurations.
    *   **Test Case 2: Prettier Configuration**: Verify `.prettierrc` exists.
    *   **Test Case 3: TypeScript Paths**: Check `tsconfig.json` for the `paths` configuration (`@/*`, `@/components/*`, etc.).
    *   **Test Case 4: Lint and Format Scripts**: Verify `package.json` contains `lint` and `format` scripts.

3.  **Implement the Task**: Next.js `create-next-app` typically sets up ESLint and Prettier. Verify and adjust as needed.
    *   **ESLint**: Ensure `package.json` has a `lint` script (`next lint`). Review `.eslintrc.json` for desired rules. Add any custom rules or plugins if necessary.
    *   **Prettier**: Ensure `package.json` has a `format` script (e.g., `prettier --write .`). Create or adjust `.prettierrc` for formatting preferences.
    *   **TypeScript**: Review `tsconfig.json` to ensure `paths` are correctly configured as per the PRD's `TypeScript Configuration` section (7.3). This is crucial for absolute imports.

4.  **Run Tests & Verify**: Run `npm run lint` and `npm run format` to ensure they execute without errors and apply formatting/linting correctly.

**Task: Create basic layout components (Header, Footer, Navigation)**

**Objective**: Develop fundamental layout components to establish the overall page structure and navigation.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create reusable layout components. This involves creating React components and integrating them into `src/app/layout.tsx`.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Component File Existence**: Verify `src/components/layout/header.tsx`, `src/components/layout/footer.tsx`, and `src/components/layout/navigation.tsx` exist.
    *   **Test Case 2: Layout Integration**: Check that `src/app/layout.tsx` imports and renders these components.
    *   **Test Case 3: Basic Content Rendering**: Write a simple test (e.g., using React Testing Library or Playwright) to assert that specific text (e.g., 



`Header` or `Footer` text) from these components appears on the page.

3.  **Implement the Task**: 
    *   Create `src/components/layout/header.tsx`:
        ```typescript
        // src/components/layout/header.tsx
        import React from 'react';

        export default function Header() {
          return (
            <header className="bg-gray-800 text-white p-4">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">DealRoom Network</h1>
                {/* Add navigation links here later */}
              </div>
            </header>
          );
        }
        ```
    *   Create `src/components/layout/footer.tsx`:
        ```typescript
        // src/components/layout/footer.tsx
        import React from 'react';

        export default function Footer() {
          return (
            <footer className="bg-gray-800 text-white p-4 mt-8">
              <div className="container mx-auto text-center text-sm">
                &copy; {new Date().getFullYear()} DealRoom Network. All rights reserved.
              </div>
            </footer>
          );
        }
        ```
    *   Create `src/components/layout/navigation.tsx` (initially empty, to be populated later):
        ```typescript
        // src/components/layout/navigation.tsx
        import React from 'react';

        export default function Navigation() {
          return (
            <nav>
              {/* Navigation links will go here */}
            </nav>
          );
        }
        ```
    *   Update `src/app/layout.tsx` to include `Header` and `Footer`:
        ```typescript
        // src/app/layout.tsx
        import type { Metadata } from 'next';
        import { Inter } from 'next/font/google';
        import './globals.css';
        import Header from '@/components/layout/header';
        import Footer from '@/components/layout/footer';

        const inter = Inter({ subsets: ['latin'] });

        export const metadata: Metadata = {
          title: 'DealRoom Network',
          description: 'Professional networking platform for real estate deal makers',
        };

        export default function RootLayout({
          children,
        }: { 
          children: React.ReactNode;
        }) {
          return (
            <html lang="en">
              <body className={inter.className}>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow container mx-auto p-4">
                    {children}
                  </main>
                  <Footer />
                </div>
              </body>
            </html>
          );
        }
        ```

4.  **Run Tests & Verify**: Run `npm run dev` and visually inspect the page in the browser to confirm the header and footer are present. For automated testing, a simple Playwright test could assert the presence of specific text within the header/footer elements on the page.

**Task: Setup theme provider for dark/light mode**

**Objective**: Implement a theme provider to allow users to switch between dark and light modes, enhancing user experience.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide dark/light mode functionality. This involves installing `next-themes`, configuring `tailwind.config.js` for dark mode, and creating a `ThemeProvider` component.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: `next-themes` Installation**: Verify `next-themes` is listed in `package.json` dependencies.
    *   **Test Case 2: Tailwind Dark Mode Configuration**: Check `tailwind.config.js` for `darkMode: 'class'`.
    *   **Test Case 3: Theme Provider Existence**: Verify `src/lib/providers/theme-provider.tsx` exists.
    *   **Test Case 4: Theme Switching Functionality**: (Requires E2E test) Simulate clicking a theme toggle button and assert that the `html` tag gains/loses the `dark` class, and a component with `dark:` styles changes appearance.

3.  **Implement the Task**: 
    *   Install `next-themes`:
        ```bash
        npm install next-themes
        ```
    *   Modify `tailwind.config.js` to enable dark mode:
        ```javascript
        // tailwind.config.js
        /** @type {import('tailwindcss').Config} */
        module.exports = {
          darkMode: ['class'], // Add this line
          content: [
            './app/**/*.{js,ts,jsx,tsx,mdx}',
            './pages/**/*.{js,ts,jsx,tsx,mdx}',
            './components/**/*.{js,ts,jsx,tsx,mdx}',
            './src/**/*.{js,ts,jsx,tsx,mdx}',
          ],
          theme: {
            extend: {},
          },
          plugins: [],
        }
        ```
    *   Create `src/lib/providers/theme-provider.tsx`:
        ```typescript
        // src/lib/providers/theme-provider.tsx
        'use client';

        import * as React from 'react';
        import { ThemeProvider as NextThemesProvider } from 'next-themes';
        import { type ThemeProviderProps } from 'next-themes/dist/types';

        export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
          return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
        }
        ```
    *   Wrap your `RootLayout` in `src/app/layout.tsx` with `ThemeProvider`:
        ```typescript
        // src/app/layout.tsx
        import type { Metadata } from 'next';
        import { Inter } from 'next/font/google';
        import './globals.css';
        import Header from '@/components/layout/header';
        import Footer from '@/components/layout/footer';
        import { ThemeProvider } from '@/lib/providers/theme-provider'; // Import ThemeProvider

        const inter = Inter({ subsets: ['latin'] });

        export const metadata: Metadata = {
          title: 'DealRoom Network',
          description: 'Professional networking platform for real estate deal makers',
        };

        export default function RootLayout({
          children,
        }: { 
          children: React.ReactNode;
        }) {
          return (
            <html lang="en" suppressHydrationWarning>
              <body className={inter.className}>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-grow container mx-auto p-4">
                      {children}
                    </main>
                    <Footer />
                  </div>
                </ThemeProvider>
              </body>
            </html>
          );
        }
        ```
    *   Add a theme toggle button (e.g., in `src/components/layout/header.tsx` or a new component):
        ```typescript
        // src/components/ui/theme-toggle.tsx (example using Shadcn/ui Button)
        'use client';

        import * as React from 'react';
        import { useTheme } from 'next-themes';
        import { Button } from '@/components/ui/button'; // Assuming you've added button component
        import { Sun, Moon } from 'lucide-react'; // Assuming you've installed lucide-react

        export function ThemeToggle() {
          const { setTheme, theme } = useTheme();

          return (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          );
        }
        ```
        Then, import and use `ThemeToggle` in your `Header` component.

4.  **Run Tests & Verify**: Run `npm run dev`. Visually confirm the theme toggle button appears and changes the theme. For automated testing, use Playwright to click the button and assert the `dark` class on the `html` element.

#### Day 2 (8 hours)

**Task: Implement Supabase authentication with email/password**

**Objective**: Set up user registration and login using Supabase's email/password authentication, ensuring secure user management.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Implement user authentication. This involves creating Supabase client utilities, API routes for registration and login, and handling user sessions.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Supabase Client Utility**: Create a unit test for `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` to ensure they correctly initialize the Supabase client with environment variables.
    *   **Test Case 2: Registration API Route (Unit Test)**: Write a test for `src/app/api/auth/register/route.ts` that simulates a POST request with valid user data and asserts a successful response (e.g., status 200/201) and user creation in a mock database.
    *   **Test Case 3: Login API Route (Unit Test)**: Write a test for `src/app/api/auth/login/route.ts` that simulates a POST request with valid credentials and asserts a successful response (e.g., status 200) and session creation.
    *   **Test Case 4: Protected Route Access (Integration Test)**: Create a simple protected API route or page. Write a test that attempts to access it without authentication (should fail with 401/403) and then with valid authentication (should succeed).

3.  **Implement the Task**: 
    *   **Supabase Client Utilities**: Create `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts` to initialize Supabase clients for server-side and client-side operations respectively. These will use the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`.
        ```typescript
        // src/lib/supabase/client.ts
        import { createBrowserClient } from '@supabase/ssr';

        export function createClient() {
          return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
        }
        ```
        ```typescript
        // src/lib/supabase/server.ts
        import { createServerClient, type CookieOptions } from '@supabase/ssr';
        import { cookies } from 'next/headers';

        export function createClient() {
          const cookieStore = cookies();

          return createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get(name: string) {
                  return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                  try {
                    cookieStore.set({ name, value, ...options });
                  } catch (error) {
                    // The `cookies()` helper can be called only from a Server Component or Server Action.
                    // This error is typically thrown when attempting to set a cookie from a Client Component
                    // that is rendered on the server. If you're using a Client Component, you'll need to
                    // handle cookies in a different way, or ensure that the cookie is only set on the client side.
                    console.warn('Attempted to set cookie from a Server Component or Server Action:', error);
                  }
                },
                remove(name: string, options: CookieOptions) {
                  try {
                    cookieStore.set({ name, value: '', ...options });
                  } catch (error) {
                    console.warn('Attempted to remove cookie from a Server Component or Server Action:', error);
                  }
                },
              },
            }
          );
        }
        ```
    *   **Authentication API Routes**: Implement `src/app/api/auth/register/route.ts` and `src/app/api/auth/login/route.ts` using the Supabase client to handle user registration and sign-in.
        ```typescript
        // src/app/api/auth/register/route.ts
        import { NextResponse } from 'next/server';
        import { createClient } from '@/lib/supabase/server';

        export async function POST(request: Request) {
          const { email, password, firstName, lastName, role } = await request.json();
          const supabase = createClient();

          const { error, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { first_name: firstName, last_name: lastName, role },
            },
          });

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }

          return NextResponse.json({ message: 'Registration successful. Please check your email for verification.' });
        }
        ```
        ```typescript
        // src/app/api/auth/login/route.ts
        import { NextResponse } from 'next/server';
        import { createClient } from '@/lib/supabase/server';

        export async function POST(request: Request) {
          const { email, password } = await request.json();
          const supabase = createClient();

          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
          }

          return NextResponse.json({ message: 'Login successful' });
        }
        ```
    *   **Protected Route Middleware**: Create `src/middleware.ts` to protect routes. This will redirect unauthenticated users from protected paths.
        ```typescript
        // src/middleware.ts
        import { NextResponse } from 'next/server';
        import type { NextRequest } from 'next/server';
        import { createClient } from '@/lib/supabase/server';

        export async function middleware(request: NextRequest) {
          const supabase = createClient();

          const { data: { user } } = await supabase.auth.getUser();

          // Redirect unauthenticated users from protected routes
          if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/login', request.url));
          }

          return NextResponse.next();
        }

        export const config = {
          matcher: ['/dashboard/:path*', '/api/auth/me'], // Apply middleware to dashboard and profile API
        };
        ```

4.  **Run Tests & Verify**: 
    *   Manually test registration and login forms. Ensure successful sign-up redirects to a verification message and successful login redirects to the dashboard.
    *   Attempt to access `/dashboard` directly without logging in; verify redirection to `/login`.
    *   For automated testing, use Playwright to simulate user registration, login, and then attempt to access a protected route, asserting the expected behavior (redirection or successful access).

**Task: Create login and registration forms with validation**

**Objective**: Develop user-friendly login and registration forms, incorporating client-side validation for improved user experience and data integrity.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Build interactive forms with validation. This involves using `react-hook-form` and `zod` for schema validation.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Form Rendering**: Verify that the login and registration forms render correctly with all required input fields (email, password, etc.) and a submit button.
    *   **Test Case 2: Client-Side Validation (Empty Fields)**: Simulate submitting the form with empty required fields and assert that validation error messages are displayed for each field.
    *   **Test Case 3: Client-Side Validation (Invalid Email)**: Simulate submitting the form with an invalid email format and assert that an appropriate error message is displayed.
    *   **Test Case 4: Successful Submission (Mock API)**: Mock the API calls for registration/login and assert that the form submission function is called with the correct data and that a success message/redirection occurs.

3.  **Implement the Task**: 
    *   Install form libraries:
        ```bash
        npm install react-hook-form zod @hookform/resolvers
        ```
    *   Create validation schemas using `zod` (e.g., `src/lib/validations/auth.ts`):
        ```typescript
        // src/lib/validations/auth.ts
        import { z } from 'zod';

        export const loginSchema = z.object({
          email: z.string().email({ message: 'Invalid email address.' }),
          password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
        });

        export const registerSchema = z.object({
          firstName: z.string().min(1, { message: 'First name is required.' }),
          lastName: z.string().min(1, { message: 'Last name is required.' }),
          email: z.string().email({ message: 'Invalid email address.' }),
          password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
          role: z.enum(['deal_sponsor', 'capital_partner', 'service_provider'], { message: 'Please select a role.' }),
        });
        ```
    *   Create `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx` using `react-hook-form` and `zodResolver` for validation. Utilize Shadcn/ui components for inputs and buttons.
        ```typescript
        // src/app/(auth)/login/page.tsx (simplified example)
        'use client';

        import { useForm } from 'react-hook-form';
        import { zodResolver } from '@hookform/resolvers/zod';
        import { z } from 'zod';
        import { useRouter } from 'next/navigation';
        import { loginSchema } from '@/lib/validations/auth';
        import { Button } from '@/components/ui/button';
        import { Input } from '@/components/ui/input';
        import { Label } from '@/components/ui/label';

        type LoginFormInputs = z.infer<typeof loginSchema>;

        export default function LoginPage() {
          const router = useRouter();
          const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
            resolver: zodResolver(loginSchema),
          });

          const onSubmit = async (data: LoginFormInputs) => {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });

            if (response.ok) {
              router.push('/dashboard');
            } else {
              const errorData = await response.json();
              alert(errorData.error || 'Login failed');
            }
          };

          return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...register('password')} />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full">Login</Button>
                </form>
              </div>
            </div>
          );
        }
        ```
        (Similar structure for `register/page.tsx` with additional fields and role selection).

4.  **Run Tests & Verify**: 
    *   Manually test forms by submitting with invalid and valid data, observing validation messages and successful submission behavior.
    *   For automated testing, use Playwright to fill forms with various data, assert error messages, and verify successful submission and redirection.

**Task: Setup email verification flow**

**Objective**: Implement the email verification process for new user registrations, ensuring that users confirm their email addresses before gaining full access.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Enable email verification. This involves configuring Supabase for email confirmations, and creating a verification page.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Registration Triggers Email**: After a successful registration API call, assert that Supabase sends a confirmation email (this might require mocking or checking Supabase logs/email service logs).
    *   **Test Case 2: Verification Page Redirect**: Simulate a user clicking the verification link (or directly accessing `verify` route with token) and assert that the user is redirected to a success page or login.
    *   **Test Case 3: Unverified User Access**: Attempt to access a protected route with a registered but unverified user and assert that access is denied or redirected to a verification reminder.

3.  **Implement the Task**: 
    *   **Supabase Configuration**: In your Supabase project, navigate to `Authentication > Settings` and ensure 


`Email confirmations` is enabled. You can also customize the email template here.
    *   **Verification Page**: Create `src/app/(auth)/verify/page.tsx`. This page will handle the verification token from the URL. Supabase handles this automatically when the user clicks the link in the email, but you can create a custom page to show a message.
        ```typescript
        // src/app/(auth)/verify/page.tsx
        import React from 'react';

        export default function VerifyPage() {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Verifying your email...</h1>
                <p>Please wait while we verify your email address. You will be redirected shortly.</p>
              </div>
            </div>
          );
        }
        ```
    *   **Update Registration Logic**: The existing registration API route (`src/app/api/auth/register/route.ts`) already triggers the verification email by default with Supabase `signUp`. No changes are needed there, but you should inform the user to check their email.

4.  **Run Tests & Verify**: 
    *   Manually register a new user and check your email for the verification link. Click the link and confirm you can now log in.
    *   For automated testing, this is more complex. You would need a tool like `mail-tester` or a mock email server to intercept the verification email and extract the link to complete the E2E test flow.

**Task: Implement role-based authentication (sponsor/investor/provider)**

**Objective**: Enforce access control based on user roles, ensuring that users can only access features and data relevant to their role.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Restrict access based on user roles. This involves checking the user's role (stored in Supabase `auth.users` metadata) in middleware and API routes.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Role-Specific Route Access**: Create a route accessible only to `deal_sponsor` (e.g., `/dashboard/opportunities/new`). Write a test where a `capital_partner` attempts to access it and asserts they are redirected or receive a 403 Forbidden error.
    *   **Test Case 2: API Endpoint Protection**: Create an API endpoint for creating opportunities. Write a test where a non-sponsor user attempts to POST to this endpoint and asserts a 403 Forbidden response.

3.  **Implement the Task**: 
    *   **Store Role on Registration**: Ensure the `role` is passed in the `options.data` field during `supabase.auth.signUp` as implemented in the registration API route. This stores the role in the user's metadata.
    *   **Update Middleware**: Modify `src/middleware.ts` to check user roles for specific routes.
        ```typescript
        // src/middleware.ts (updated)
        import { NextResponse } from 'next/server';
        import type { NextRequest } from 'next/server';
        import { createClient } from '@/lib/supabase/server';

        export async function middleware(request: NextRequest) {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            if (request.nextUrl.pathname.startsWith('/dashboard')) {
              return NextResponse.redirect(new URL('/login', request.url));
            }
            return NextResponse.next();
          }

          const { data: userDetails } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          const userRole = userDetails?.role;

          // Example: Protect opportunity creation page
          if (request.nextUrl.pathname.startsWith('/dashboard/opportunities/new') && userRole !== 'deal_sponsor') {
            return NextResponse.redirect(new URL('/dashboard', request.url)); // Or a dedicated 'unauthorized' page
          }

          return NextResponse.next();
        }

        export const config = {
          matcher: ['/dashboard/:path*'],
        };
        ```
    *   **Protect API Routes**: In your API routes, fetch the user's role and verify permissions before executing sensitive operations.
        ```typescript
        // Example in an API route for creating an opportunity
        import { createClient } from '@/lib/supabase/server';
        import { NextResponse } from 'next/server';

        export async function POST(request: Request) {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const { data: userDetails } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (userDetails?.role !== 'deal_sponsor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }

          // ... rest of the logic for creating an opportunity
          return NextResponse.json({ message: 'Opportunity created' });
        }
        ```

4.  **Run Tests & Verify**: 
    *   Manually log in as a `capital_partner` and attempt to navigate to the new opportunity page. Verify you are redirected.
    *   For automated testing, use Playwright to log in with different user roles and attempt to access protected routes and APIs, asserting the correct responses (redirection, 403 errors, or success).

**Task: Create protected route middleware**

**Objective**: Implement middleware to protect routes that require authentication, redirecting unauthenticated users to the login page.

**Detailed Steps (TDD Approach)**:

*This task was largely implemented as part of the previous authentication tasks. The steps below serve as a focused review and refinement.*

1.  **Understand the Goal**: Ensure all routes under `/dashboard` are protected.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Unauthenticated Access to Dashboard**: Attempt to access `/dashboard` without being logged in and assert a redirect to `/login`.
    *   **Test Case 2: Unauthenticated Access to Nested Dashboard Route**: Attempt to access a nested route like `/dashboard/profile` without being logged in and assert a redirect to `/login`.
    *   **Test Case 3: Authenticated Access**: Log in and access `/dashboard`, asserting a successful (200) response and no redirection.

3.  **Implement the Task**: The `src/middleware.ts` file created earlier already handles this. Review and confirm its logic:
    ```typescript
    // src/middleware.ts
    import { NextResponse } from 'next/server';
    import type { NextRequest } from 'next/server';
    import { createClient } from '@/lib/supabase/server';

    export async function middleware(request: NextRequest) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next();
    }

    export const config = {
      matcher: ['/dashboard/:path*'],
    };
    ```

4.  **Run Tests & Verify**: Execute the tests defined above using Playwright to confirm the middleware is working as expected.

**Task: Build user profile creation flow**

**Objective**: Develop the user interface and backend logic for users to create and complete their profiles after registration.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create forms for different user roles to fill out their profile details, which will be saved to the corresponding database tables (`deal_sponsor_profiles`, `capital_partner_profiles`, etc.).

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Profile Form Rendering**: Based on the user's role, assert that the correct profile form (`SponsorProfileForm`, `InvestorProfileForm`) is rendered on the profile page.
    *   **Test Case 2: Form Submission (API Unit Test)**: Write a unit test for the profile update API endpoint. Simulate a POST/PUT request with valid profile data and assert a successful response and data insertion/update in a mock database.
    *   **Test Case 3: Profile Data Display**: After submitting the form, assert that the updated profile data is correctly displayed on the profile page.

3.  **Implement the Task**: 
    *   **Profile Forms**: Create separate components for each profile type (e.g., `src/components/forms/sponsor-profile-form.tsx`, `src/components/forms/investor-profile-form.tsx`). These forms will use `react-hook-form` and `zod` for validation, similar to the registration form.
    *   **Profile Page**: Create `src/app/(dashboard)/profile/page.tsx`. This page will fetch the user's role and conditionally render the appropriate profile form.
    *   **API Route for Profile Update**: Create an API route (e.g., `src/app/api/profile/route.ts`) to handle profile creation and updates. This route will receive the form data and insert/update the corresponding profile table in Supabase (`deal_sponsor_profiles`, `capital_partner_profiles`, etc.), linking it to the `user_id`.

4.  **Run Tests & Verify**: 
    *   Manually log in as different user roles, navigate to the profile page, fill out and submit the form, and verify the data is saved and displayed correctly.
    *   Use Playwright to automate this flow for each user role.

**Task: Setup password reset functionality**

**Objective**: Implement a secure password reset flow that allows users to reset their password via an email link.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create a 


flow for users to reset their password.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Request Password Reset UI**: Verify the password reset request page renders with an email input field and a submit button.
    *   **Test Case 2: Request Password Reset API**: Write a test for the API endpoint that triggers the password reset email. Assert that a successful request to this endpoint with a valid email results in a 200 OK response.
    *   **Test Case 3: Update Password UI**: Verify the password update page (the one linked from the email) renders with two password fields (new password and confirm password) and a submit button.
    *   **Test Case 4: Update Password API**: Write a test for the API endpoint that updates the password. Assert that a successful request with a valid token and matching passwords results in a 200 OK response.

3.  **Implement the Task**: 
    *   **Request Password Reset Page**: Create a page (e.g., `/forgot-password`) with a form for the user to enter their email address.
    *   **API Route for Sending Reset Email**: Create an API route that calls `supabase.auth.resetPasswordForEmail()`.
    *   **Password Update Page**: Create a page (e.g., `/update-password`) that Supabase will redirect the user to from the email link. This page will have a form for the user to enter and confirm their new password.
    *   **API Route for Updating Password**: Create an API route that calls `supabase.auth.updateUser()` to set the new password.

4.  **Run Tests & Verify**: 
    *   Manually test the entire flow: request a password reset, click the link in the email, and set a new password. Then, try to log in with the new password.
    *   Automated testing of the full email flow is complex. However, you can test the UI of the forms and the API endpoints with mock data.

**Task: Test authentication flow end-to-end**

**Objective**: Perform comprehensive end-to-end testing of the entire authentication system to ensure it is robust and secure.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Verify the complete authentication lifecycle.

2.  **Write Tests (Pre-implementation)**: Design a comprehensive E2E test script using Playwright that covers:
    *   **Test Script 1: Successful Registration and Login**: 
        1. Navigate to the registration page.
        2. Fill out and submit the registration form.
        3. (If possible with email testing tools) Intercept the verification email and click the link.
        4. Navigate to the login page.
        5. Log in with the new credentials.
        6. Assert that the user is redirected to the dashboard.
        7. Log out and assert the user is redirected to the login or home page.
    *   **Test Script 2: Invalid Login**: Attempt to log in with incorrect credentials and assert an error message is shown.
    *   **Test Script 3: Password Reset**: 
        1. Navigate to the forgot password page.
        2. Submit the form with a registered email.
        3. (If possible) Intercept the email and click the reset link.
        4. Set a new password.
        5. Log in with the new password.

3.  **Implement the Task**: Write the Playwright test scripts based on the designs above.

4.  **Run Tests & Verify**: Execute the Playwright test suite and ensure all authentication-related tests pass. Debug any failures until the entire flow is working correctly.

#### Day 3 (4 hours)

**Task: Create deal sponsor profile form**

**Objective**: Develop the form for deal sponsors to create and edit their professional profiles.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Build a form for deal sponsor profiles.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Form Rendering**: Assert that the deal sponsor profile form renders with all fields defined in the `deal_sponsor_profiles` table schema.
    *   **Test Case 2: Validation**: Test validation for key fields (e.g., `years_experience` must be a number, `license_number` has a certain format if applicable).
    *   **Test Case 3: API Submission**: Mock the API call and assert the form submits the correct data structure.

3.  **Implement the Task**: 
    *   Create a validation schema with `zod` for the deal sponsor profile.
    *   Create the `src/components/forms/sponsor-profile-form.tsx` component using `react-hook-form` and Shadcn/ui components.
    *   Connect the form to the profile update API endpoint.

4.  **Run Tests & Verify**: Use Playwright to log in as a deal sponsor, fill out the form, and verify the data is saved and displayed correctly.

**Task: Create capital partner profile form with accreditation**

**Objective**: Develop the form for capital partners, including fields for accreditation status and investment preferences.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Build a form for capital partner profiles.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Form Rendering**: Assert the form renders with all fields from the `capital_partner_profiles` schema.
    *   **Test Case 2: Accreditation Fields**: Specifically test the rendering and functionality of the accreditation status and method fields.
    *   **Test Case 3: Validation**: Test validation for fields like `min_investment_amount` and `max_investment_amount`.

3.  **Implement the Task**: 
    *   Create a `zod` validation schema for the capital partner profile.
    *   Create the `src/components/forms/investor-profile-form.tsx` component.
    *   Connect to the profile update API.

4.  **Run Tests & Verify**: Use Playwright to log in as a capital partner, complete the profile, and verify the data.

**Task: Create service provider profile form**

**Objective**: Develop the form for service providers to detail their services and credentials.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Build a form for service provider profiles.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Form Rendering**: Assert the form renders with all fields from the `service_provider_profiles` schema.
    *   **Test Case 2: Service Categories**: Test the multi-select or tagging functionality for `service_categories`.

3.  **Implement the Task**: 
    *   Create a `zod` validation schema for the service provider profile.
    *   Create the `src/components/forms/provider-profile-form.tsx` component.
    *   Connect to the profile update API.

4.  **Run Tests & Verify**: Use Playwright to log in as a service provider, complete the profile, and verify the data.

**Task: Implement profile completion tracking**

**Objective**: Track and display the user's profile completion percentage to encourage them to fill out their entire profile.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Calculate and show profile completion.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Calculation Logic**: Write a unit test for a utility function that calculates the completion percentage based on a profile object.
    *   **Test Case 2: UI Display**: Assert that a progress bar or percentage text is displayed on the dashboard and profile page.

3.  **Implement the Task**: 
    *   Create a utility function to calculate profile completion.
    *   In the dashboard and profile pages, fetch the user's profile data, calculate the completion, and display it using a progress bar component.

4.  **Run Tests & Verify**: Manually and with Playwright, update profile fields and assert that the completion percentage updates accordingly.

**Task: Setup profile verification system**

**Objective**: Implement a system for admins to verify user profiles, particularly for deal sponsors and accredited investors.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Allow admins to review and approve profiles.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Admin Verification UI**: In an admin-only section, assert that a list of unverified profiles is displayed with an option to approve or reject.
    *   **Test Case 2: Verification API**: Write a test for the API endpoint that updates the verification status of a profile.

3.  **Implement the Task**: 
    *   Create an admin dashboard page accessible only to users with the `admin` role.
    *   On this page, fetch and display a list of profiles with a `pending` verification status.
    *   Create an API endpoint for admins to update the `verified_at` timestamp or a status field on the user/profile table.

4.  **Run Tests & Verify**: Log in as an admin, verify a user, then log in as that user and assert that their verified status is reflected on their profile.

**Task: Create user dashboard landing page**

**Objective**: Design and build the main dashboard page that users see after logging in, providing a summary of their activity and quick access to key features.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create a central hub for users.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Role-Specific Widgets**: Assert that the dashboard renders different widgets based on the user's role (e.g., a deal sponsor sees their posted opportunities, an investor sees their investment pipeline).
    *   **Test Case 2: Data Fetching**: Mock the API calls for dashboard data and assert that the components render the correct information.

3.  **Implement the Task**: 
    *   Create the `src/app/(dashboard)/dashboard/page.tsx` page.
    *   Create dashboard components like `StatsOverview`, `RecentActivity`, and `QuickActions` as specified in the project structure.
    *   Fetch data relevant to the user's role and pass it to these components.

4.  **Run Tests & Verify**: Log in with different user roles and assert that the correct dashboard layout and data are displayed.

**Task: Test profile creation and updates**

**Objective**: Perform end-to-end testing of the entire profile management system.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Verify the complete profile management lifecycle.

2.  **Write Tests (Pre-implementation)**: Design E2E test scripts for each user role:
    *   **Test Script (per role)**:
        1. Log in.
        2. Navigate to the profile page.
        3. Fill out and submit the profile form.
        4. Assert a success message.
        5. Reload the page and assert the data is still there.
        6. Edit a field, save, and assert the change is persisted.

3.  **Implement the Task**: Write the Playwright scripts.

4.  **Run Tests & Verify**: Execute the test suite and fix any bugs.





### Phase 2: Investment Opportunity Management (25 hours)

#### Day 3-4 (12 hours)

**Task: Create comprehensive opportunity posting form**

**Objective**: Develop a multi-step form that allows deal sponsors to create detailed investment opportunity profiles, capturing all necessary information.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Build a robust form for creating investment opportunities, following the `investment_opportunities` table schema.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Form Rendering**: Assert that the multi-step form renders with all initial required fields (e.g., `opportunity_name`, `property_address`, `property_type`).
    *   **Test Case 2: Step Navigation**: Test that users can navigate between form steps (e.g., clicking 



'Next' button) and that validation occurs before advancing.
    *   **Test Case 3: Client-Side Validation**: Test validation for various fields (e.g., `total_project_cost` is a number, `fundraising_deadline` is a valid date).
    *   **Test Case 4: API Submission (Unit Test)**: Mock the API call (`POST /api/opportunities`) and assert that the form submission function sends the correct data structure to the backend.

3.  **Implement the Task**: 
    *   **Form Components**: Create separate React components for each step of the form (e.g., `src/app/(dashboard)/opportunities/new/components/opportunity-form.tsx`, `property-details.tsx`, `financial-structure.tsx`, `investment-terms.tsx`).
    *   **Main Form Page**: `src/app/(dashboard)/opportunities/new/page.tsx` will orchestrate these steps, managing form state (e.g., using `react-hook-form` with `useFormContext` for multi-step forms) and navigation.
    *   **Validation Schema**: Define a comprehensive `zod` schema for the entire opportunity object, with nested schemas for `property_address`, `financial_structure`, etc.
    *   **API Route**: Implement the `POST /api/opportunities` API route (`src/app/api/opportunities/route.ts`) to receive the form data and insert it into the `investment_opportunities` table. Ensure proper validation and error handling on the backend.

4.  **Run Tests & Verify**: 
    *   Manually navigate through the multi-step form, filling in data and observing validation messages. Submit a complete form and verify the opportunity is created in the database.
    *   Use Playwright to automate the form filling and submission process, asserting successful creation and redirection to the opportunity detail page.

**Task: Implement multi-step form with progress tracking**

**Objective**: Design and implement the user interface for a multi-step form, including visual indicators of progress to guide the user through the process.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create a user-friendly multi-step form with clear progress indication.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Progress Indicator Display**: Assert that a progress bar or step indicator component is visible on the form page.
    *   **Test Case 2: Progress Update**: Simulate navigating between steps and assert that the progress indicator visually updates to reflect the current step.
    *   **Test Case 3: Step Validation**: Ensure that a user cannot advance to the next step if the current step's required fields are not valid.

3.  **Implement the Task**: 
    *   **Progress Component**: Create a reusable `ProgressIndicator` component (e.g., in `src/components/common/progress-indicator.tsx`) that takes the current step and total steps as props and visually represents progress (e.g., using Shadcn/ui `Progress` component or custom styling).
    *   **Form Logic**: In `src/app/(dashboard)/opportunities/new/page.tsx`, manage the current step state. Implement `nextStep` and `prevStep` functions that include validation checks before allowing navigation.
    *   **Conditional Rendering**: Conditionally render the appropriate form step component based on the current step state.

4.  **Run Tests & Verify**: 
    *   Manually interact with the form, ensuring the progress indicator updates correctly and that navigation is blocked by invalid input.
    *   Use Playwright to simulate step-by-step navigation and assert the visual state of the progress indicator and the presence/absence of validation messages.

**Task: Build property details section with address validation**

**Objective**: Create a form section for capturing property-specific details, including robust address validation to ensure data accuracy.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Collect accurate property information, including address validation.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Fields Rendering**: Assert that all property-related fields (e.g., `property_address` components, `property_type`, `total_square_feet`, `year_built`) are rendered.
    *   **Test Case 2: Address Validation (Client-Side)**: Test client-side validation for address fields (e.g., required fields, valid format for zip codes). Mock an address validation API call if using one, and test its integration.
    *   **Test Case 3: Property Type Selection**: Test that selecting a `property_type` correctly updates the form state.

3.  **Implement the Task**: 
    *   **Component**: Create `src/app/(dashboard)/opportunities/new/components/property-details.tsx`. This component will contain the input fields for property information.
    *   **Address Input**: For address validation, consider integrating with a third-party address validation API (e.g., Google Maps Geocoding API) or implementing basic regex/format validation for fields like zip code. If using an external API, ensure API keys are securely managed in environment variables.
    *   **Zod Schema**: Extend the main opportunity `zod` schema to include detailed validation rules for all property fields.

4.  **Run Tests & Verify**: 
    *   Manually enter various valid and invalid addresses and property details, observing validation feedback.
    *   Use Playwright to automate these scenarios, including testing the integration with any address validation services.

**Task: Create financial structure and investment terms section**

**Objective**: Develop form sections for detailing the financial aspects of the investment opportunity, such as project costs, equity requirements, and debt structure.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Capture detailed financial information and investment terms.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Fields Rendering**: Assert that all financial fields (e.g., `total_project_cost`, `equity_requirement`, `debt_amount`, `minimum_investment`, `target_raise_amount`, `projected_irr`) are rendered.
    *   **Test Case 2: Numeric Input Validation**: Test that numeric fields only accept valid numbers and display appropriate error messages for non-numeric input or out-of-range values.
    *   **Test Case 3: Dependent Fields Logic**: If `debt_amount` is entered, ensure `debt_type` becomes required. Test such conditional logic.

3.  **Implement the Task**: 
    *   **Component**: Create `src/app/(dashboard)/opportunities/new/components/financial-structure.tsx` and `src/app/(dashboard)/opportunities/new/components/investment-terms.tsx`.
    *   **Input Types**: Use appropriate input types (e.g., `type=



"number") and client-side validation to ensure correct data entry.
    *   **Zod Schema**: Extend the main opportunity `zod` schema with validation rules for these financial fields.

4.  **Run Tests & Verify**: 
    *   Manually test by entering various valid and invalid financial data, observing validation feedback.
    *   Use Playwright to automate these scenarios, ensuring correct calculations and conditional field visibility.

**Task: Add document upload functionality for offering materials**

**Objective**: Enable deal sponsors to securely upload various offering materials (e.g., financial models, property photos, legal documents) to their investment opportunities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Allow users to upload files, store them securely (Supabase Storage/AWS S3), and associate them with an opportunity.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: File Input Rendering**: Assert that a file input element (e.g., `<input type="file">`) is present on the form.
    *   **Test Case 2: File Selection**: Simulate selecting a file and assert that the file name or a preview is displayed in the UI.
    *   **Test Case 3: File Type and Size Validation (Client-Side)**: Attempt to upload an unsupported file type (e.g., `.exe`) or a file exceeding the `MAX_FILE_SIZE` and assert that an appropriate client-side error message is displayed.
    *   **Test Case 4: Successful Upload (API Unit Test)**: Mock the Supabase Storage upload and the API call (`POST /api/uploads/documents` or `POST /api/uploads/images`). Assert that a successful upload returns a URL and that the opportunity update API is called with the new document URL.
    *   **Test Case 5: Document Deletion (API Unit Test)**: Mock the Supabase Storage deletion and the API call to remove a document. Assert that a successful deletion removes the document from storage and the opportunity.

3.  **Implement the Task**: 
    *   **Supabase Storage Setup**: Ensure Supabase Storage is configured for your project. Create buckets for `documents` and `images` with appropriate RLS policies to allow authenticated users to upload.
    *   **API Routes for Uploads**: Implement `src/app/api/uploads/documents/route.ts` and `src/app/api/uploads/images/route.ts`. These routes will handle file uploads to Supabase Storage. They should:
        *   Receive the file from the frontend.
        *   Perform server-side validation for file type and size.
        *   Upload the file to the appropriate Supabase Storage bucket.
        *   Return the public URL of the uploaded file.
        ```typescript
        // src/app/api/uploads/documents/route.ts (simplified example)
        import { NextResponse } from 'next/server';
        import { createClient } from '@/lib/supabase/server';
        import { v4 as uuidv4 } from 'uuid';

        export async function POST(request: Request) {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }

          const formData = await request.formData();
          const file = formData.get('file') as File;

          if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
          }

          const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
          const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

          if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
          }

          if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds limit (50MB)' }, { status: 400 });
          }

          const fileExtension = file.name.split('.').pop();
          const filePath = `${user.id}/${uuidv4()}.${fileExtension}`;

          const { data, error } = await supabase.storage
            .from('documents') // Assuming a 'documents' bucket exists
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }

          const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

          return NextResponse.json({ url: publicUrlData.publicUrl });
        }
        ```
    *   **Frontend Component**: Integrate file input elements (e.g., Shadcn/ui `Input` with `type=



"file") within the opportunity posting form. Handle file selection, display upload progress, and call the API routes.

4.  **Run Tests & Verify**: 
    *   Manually upload various types of files (PDF, DOCX, JPG) and verify they appear in the UI and are accessible via their public URLs after submission.
    *   Test with unsupported file types and oversized files to ensure client-side validation works.
    *   Use Playwright to automate the file upload process, asserting successful uploads and proper display of uploaded documents.

**Task: Implement opportunity preview and review section**

**Objective**: Provide a dedicated section within the opportunity creation flow where deal sponsors can review all entered information before final submission, ensuring accuracy and completeness.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Allow users to review their input before final submission.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Preview Display**: Assert that all data entered in previous form steps is accurately displayed in the preview section.
    *   **Test Case 2: Edit Functionality**: Ensure that clicking an 



'Edit' button next to a section in the preview takes the user back to the corresponding form step.
    *   **Test Case 3: Final Submission**: Simulate clicking the final 'Submit' button and assert that the API call to create the opportunity is made with the correct data.

3.  **Implement the Task**: 
    *   **Preview Component**: Create a final step in the multi-step form process, which is the preview component. This component will receive the complete form data as a prop and render it in a read-only format.
    *   **Data Display**: Organize the displayed data logically, with clear headings for each section (Property Details, Financials, etc.).
    *   **Edit Links**: For each section, include an 'Edit' link or button that, when clicked, updates the form's step state to take the user back to that specific step.
    *   **Submit Button**: Include a final 'Submit Opportunity' button that triggers the API call to `POST /api/opportunities`.

4.  **Run Tests & Verify**: 
    *   Manually fill out the form, review the preview, use the 'Edit' links to make changes, and then submit.
    *   Use Playwright to automate this entire flow, asserting that the preview data is correct and that the final submission is successful.

**Task: Setup opportunity status management system**

**Objective**: Implement a system for managing the status of an investment opportunity (e.g., 'draft', 'fundraising', 'funded', 'closed'), allowing sponsors to update the status as the deal progresses.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Allow sponsors to manage the lifecycle of their opportunities.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Status Display**: On the opportunity detail page and the sponsor's dashboard, assert that the current status of an opportunity is displayed (e.g., as a badge).
    *   **Test Case 2: Status Update UI**: Assert that a dropdown menu or a set of buttons is available to the opportunity sponsor to change the status.
    *   **Test Case 3: Status Update API (Unit Test)**: Write a unit test for the `PUT /api/opportunities/[id]` endpoint. Simulate a request to update the status and assert a successful response and that the database is updated in a mock environment.

3.  **Implement the Task**: 
    *   **UI for Status Change**: In the opportunity detail page (`src/app/(dashboard)/opportunities/[id]/page.tsx`), add a component (e.g., a dropdown from Shadcn/ui) that is only visible to the sponsor of the opportunity. This component will display the current status and allow the sponsor to select a new one.
    *   **API Route for Update**: The `PUT /api/opportunities/[id]` route (`src/app/api/opportunities/[id]/route.ts`) should handle updates to the opportunity, including the `status` field. Ensure proper authorization so that only the sponsor can update their own opportunity.

4.  **Run Tests & Verify**: 
    *   Manually log in as a sponsor, create an opportunity, and then change its status. Verify the change is reflected on the page and in the database.
    *   Use Playwright to automate this process, asserting the UI updates and the API call is successful.

**Task: Create opportunity editing and updating functionality**

**Objective**: Develop the functionality for deal sponsors to edit and update the details of their existing investment opportunities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Allow sponsors to modify their posted opportunities.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Edit Page Rendering**: Assert that navigating to `/opportunities/[id]/edit` renders the opportunity form, pre-filled with the existing data for that opportunity.
    *   **Test Case 2: Form Pre-population**: Assert that all form fields are correctly populated with the data from the opportunity being edited.
    *   **Test Case 3: Update API (Unit Test)**: Write a unit test for the `PUT /api/opportunities/[id]` endpoint, simulating a request with updated data and asserting a successful update in a mock database.

3.  **Implement the Task**: 
    *   **Edit Page**: Create `src/app/(dashboard)/opportunities/[id]/edit/page.tsx`. This page will reuse the same multi-step form components from the creation flow.
    *   **Data Fetching**: On the edit page, fetch the data for the specific opportunity using its ID from the URL parameters. Pass this data to the form to pre-populate the fields.
    *   **API Route**: The `PUT /api/opportunities/[id]` route will handle the update logic. It should receive the updated form data and update the corresponding record in the `investment_opportunities` table.

4.  **Run Tests & Verify**: 
    *   Manually create an opportunity, then navigate to the edit page, make changes, save, and verify the updates are persisted.
    *   Use Playwright to automate this, asserting that the form is pre-populated correctly and that updates are saved.

**Task: Build opportunity analytics and tracking**

**Objective**: Implement a system to track and display key analytics for each investment opportunity, such as view counts, number of inquiries, and investor interest.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide sponsors with insights into how their opportunities are performing.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Analytics Display**: On the opportunity detail page (for the sponsor), assert that an analytics section is displayed with metrics like 'Views', 'Inquiries', etc.
    *   **Test Case 2: View Count Increment**: Simulate a user viewing an opportunity and assert that the view count is incremented. This will require an API call to be made when the opportunity page is loaded.
    *   **Test Case 3: Inquiry Count Increment**: Simulate a user making an inquiry and assert that the inquiry count is incremented.

3.  **Implement the Task**: 
    *   **Database Fields**: The `investment_opportunities` table already has fields like `views_count`, `interest_count`, and `inquiry_count`.
    *   **API for Tracking**: Create an API route (e.g., `POST /api/opportunities/[id]/track-view`) that increments the `views_count` for an opportunity. Call this API from the opportunity detail page using a `useEffect` hook.
    *   **Update on Inquiry**: When a new inquiry is created, the API route for creating inquiries should also increment the `inquiry_count` on the related opportunity.
    *   **Analytics Component**: Create a component to display these analytics on the opportunity detail page, visible only to the sponsor.

4.  **Run Tests & Verify**: 
    *   Manually view an opportunity as one user, then log in as the sponsor and verify the view count has increased.
    *   Use Playwright to automate this, simulating views and inquiries and asserting the analytics are updated correctly.

**Task: Test opportunity creation flow thoroughly**

**Objective**: Conduct comprehensive end-to-end testing of the entire opportunity creation and management lifecycle.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure the entire opportunity management workflow is bug-free.

2.  **Write Tests (Pre-implementation)**: Design a detailed E2E test script with Playwright:
    *   **Test Script**: 
        1. Log in as a deal sponsor.
        2. Navigate to the 'Create Opportunity' page.
        3. Fill out the multi-step form with valid data, including uploading a document.
        4. Review the preview and submit.
        5. Assert redirection to the new opportunity's detail page.
        6. Verify all data is displayed correctly on the detail page.
        7. Navigate to the edit page for this opportunity.
        8. Change a few fields and save.
        9. Assert the changes are reflected on the detail page.
        10. Change the status of the opportunity.
        11. Assert the new status is displayed.

3.  **Implement the Task**: Write the Playwright script.

4.  **Run Tests & Verify**: Execute the script and debug any issues until the entire flow works seamlessly.

#### Day 4-5 (13 hours)

**Task: Build opportunity listing page with advanced filters**

**Objective**: Create a page where users can browse all public investment opportunities, with advanced filtering capabilities to narrow down the results.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Display a filterable list of investment opportunities.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Listing Page Rendering**: Assert that the `/opportunities` page renders a list of opportunity cards.
    *   **Test Case 2: Filter UI**: Assert that filter controls (e.g., for `property_type`, `min_investment`, `location`) are present on the page.
    *   **Test Case 3: Filtering Logic (API Unit Test)**: Write a unit test for the `GET /api/opportunities` endpoint. Simulate requests with different filter parameters and assert that the returned data is correctly filtered in a mock environment.
    *   **Test Case 4: Filtering E2E**: Use Playwright to interact with the filter controls and assert that the list of displayed opportunities updates correctly.

3.  **Implement the Task**: 
    *   **API Route**: Enhance the `GET /api/opportunities` route to accept and process filter parameters from the query string. Use these parameters to build a dynamic Supabase query.
    *   **Filter Component**: Create `src/app/(dashboard)/opportunities/components/opportunity-filters.tsx`. This component will contain the UI for the filters (e.g., dropdowns, sliders, text inputs).
    *   **Listing Page**: In `src/app/(dashboard)/opportunities/page.tsx`, manage the filter state. When filters change, re-fetch the data from the API and update the displayed list of opportunities.

4.  **Run Tests & Verify**: 
    *   Manually test the filters, applying various combinations and verifying the results.
    *   Use Playwright to automate filter interactions and assert the results.

**Task: Create search functionality with full-text search**

**Objective**: Implement a search bar that allows users to find opportunities using keywords, leveraging PostgreSQL's full-text search capabilities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Allow users to search for opportunities by keyword.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Search Bar UI**: Assert that a search input field and a search button are rendered on the opportunity listing page.
    *   **Test Case 2: Search API (Unit Test)**: Write a unit test for the search API endpoint (`/api/opportunities/search`). Simulate requests with search terms and assert the correct data is returned from a mock database.

3.  **Implement the Task**: 
    *   **Database Index**: Ensure the full-text search index (`idx_opportunities_search`) is created in your database schema.
    *   **API Route**: Create `src/app/api/opportunities/search/route.ts`. This route will take a search query and use Supabase's `.textSearch()` function on the `opportunity_name` and `opportunity_description` fields.
    *   **Search Component**: Create `src/app/(dashboard)/opportunities/components/opportunity-search.tsx`. This component will handle user input and trigger the API call.

4.  **Run Tests & Verify**: 
    *   Manually search for opportunities using various keywords and verify the results.
    *   Use Playwright to automate search queries and assert the results.

**Task: Implement opportunity card component with key metrics**

**Objective**: Design and build a reusable `OpportunityCard` component that provides a concise summary of an investment opportunity for display in lists.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create a visually appealing and informative summary card for opportunities.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Card Rendering**: Assert that the `OpportunityCard` component renders with all expected data points (e.g., name, location, IRR, investment required).
    *   **Test Case 2: Data Display**: Pass a mock opportunity object to the component and assert that the data is displayed correctly formatted (e.g., currency, percentages).

3.  **Implement the Task**: 
    *   **Component**: Create `src/app/(dashboard)/opportunities/components/opportunity-card.tsx`. This component will take an opportunity object as a prop.
    *   **Styling**: Use Tailwind CSS and Shadcn/ui components to style the card, ensuring it is clear and easy to read.

4.  **Run Tests & Verify**: 
    *   Use Storybook or a similar tool to develop and test the component in isolation.
    *   Integrate the card into the opportunity listing page and verify it renders correctly with real data.

**Task: Build detailed opportunity view page**

**Objective**: Create a dedicated page that displays all the details of a single investment opportunity.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide a comprehensive view of a single opportunity.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Page Rendering**: Assert that the page renders with all sections (header, summary, financials, documents, etc.).
    *   **Test Case 2: Data Fetching**: Mock the API call to fetch a single opportunity and assert that the data is correctly displayed in the various sections of the page.

3.  **Implement the Task**: 
    *   **Page**: Create `src/app/(dashboard)/opportunities/[id]/page.tsx`.
    *   **Components**: Break down the page into smaller components as defined in the project structure (e.g., `opportunity-header.tsx`, `investment-summary.tsx`).
    *   **Data Fetching**: Use the `id` from the URL to fetch the full details of the opportunity from the API.

4.  **Run Tests & Verify**: 
    *   Manually navigate to the detail page for several different opportunities and verify all data is correct.
    *   Use Playwright to automate this, asserting the presence and correctness of key data points on the page.

**Task: Add document gallery and offering materials display**

**Objective**: Create a section on the opportunity detail page to display and provide access to the uploaded offering materials.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Allow users to view and download uploaded documents.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Gallery Rendering**: Assert that a list or gallery of documents is displayed, showing document names and icons based on file type.
    *   **Test Case 2: Download Links**: Assert that each document has a clickable link that points to the correct Supabase Storage URL.

3.  **Implement the Task**: 
    *   **Component**: Create a `DocumentGallery` component.
    *   **Data**: The opportunity data fetched for the detail page should include the array of document URLs.
    *   **UI**: Loop through the document URLs and render a list item for each, with a link to the URL and an icon representing the file type.

4.  **Run Tests & Verify**: 
    *   Manually upload documents to an opportunity and verify they are displayed correctly in the gallery and that the links work.
    *   Use Playwright to assert the presence of the document links.

**Task: Create opportunity comparison tool**

**Objective**: Develop a feature that allows users to select multiple opportunities and view their key metrics side-by-side for easy comparison.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Help users make informed decisions by comparing opportunities.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Selection UI**: Assert that there are checkboxes on the opportunity cards to select them for comparison.
    *   **Test Case 2: Comparison View**: Assert that a 'Compare' button appears when multiple opportunities are selected, and clicking it opens a modal or a new page with a comparison table.
    *   **Test Case 3: Comparison Data**: Assert that the comparison table correctly displays the data for the selected opportunities.

3.  **Implement the Task**: 
    *   **State Management**: Use a state management solution (e.g., React Context or Zustand) to manage the list of selected opportunities.
    *   **UI**: Add checkboxes to the `OpportunityCard` component. Create a `ComparisonModal` or a `ComparisonPage` that takes the list of selected opportunities and renders their data in a table.

4.  **Run Tests & Verify**: 
    *   Manually select several opportunities, open the comparison view, and verify the data.
    *   Use Playwright to automate the selection and comparison process.

**Task: Implement opportunity bookmarking/favoriting**

**Objective**: Allow users to save or bookmark opportunities they are interested in for easy access later.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Let users save interesting opportunities.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Bookmark Button**: Assert that a 'Bookmark' button or icon is present on the opportunity card and detail page.
    *   **Test Case 2: API (Unit Test)**: Write a unit test for the API endpoint that adds/removes a bookmark, asserting the database is updated correctly in a mock environment.
    *   **Test Case 3: Bookmarked List**: Assert that bookmarked opportunities appear on a dedicated 'My Bookmarks' page.

3.  **Implement the Task**: 
    *   **Database**: Create a new table, `bookmarked_opportunities`, with `user_id` and `opportunity_id` columns.
    *   **API**: Create API endpoints to add and remove bookmarks.
    *   **UI**: Add a bookmark button to the UI. On click, call the API. Create a new page to display the user's bookmarked opportunities.

4.  **Run Tests & Verify**: 
    *   Manually bookmark and un-bookmark opportunities and verify they appear/disappear from the bookmarks page.
    *   Use Playwright to automate this.

**Task: Setup opportunity analytics and view tracking**

*This task is a duplicate of a previous task and has already been detailed.* 

**Task: Create opportunity recommendation engine**

**Objective**: Develop a basic recommendation engine that suggests relevant opportunities to users based on their profile preferences and browsing history.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide personalized recommendations to users.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Recommendation UI**: Assert that a 'Recommended for You' section appears on the dashboard.
    *   **Test Case 2: Recommendation Logic (Unit Test)**: Write a unit test for the recommendation logic. Given a user's profile and a list of opportunities, assert that the returned recommendations match the user's preferences (e.g., location, property type).

3.  **Implement the Task**: 
    *   **API**: Create an API endpoint `/api/opportunities/recommendations`. This endpoint will:
        1. Fetch the current user's profile (e.g., `capital_partner_profiles`).
        2. Get their preferences (e.g., `preferred_locations`, `preferred_property_types`).
        3. Query the `investment_opportunities` table for opportunities that match these preferences.
        4. Implement some ranking logic (e.g., prioritize newer or more popular opportunities).
    *   **UI**: Create a component that calls this API and displays the recommended opportunities.

4.  **Run Tests & Verify**: 
    *   Create users with different preferences, and verify that the recommendations they see are relevant.
    *   This is a good candidate for unit testing the recommendation logic itself.

**Task: Build opportunity sharing functionality**

**Objective**: Allow users to share opportunities with others via a public link or social media.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Enable easy sharing of opportunities.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Share Button**: Assert that a 'Share' button is present on the opportunity detail page.
    *   **Test Case 2: Share Options**: Assert that clicking the 'Share' button opens a modal with options to copy a link or share to social media.

3.  **Implement the Task**: 
    *   **Public Page**: You may need a public-facing version of the opportunity detail page that doesn't require a login to view basic details.
    *   **UI**: Add a 'Share' button. On click, use the Web Share API if available, or show a modal with a 'Copy Link' button and links to share on social networks.

4.  **Run Tests & Verify**: 
    *   Manually share an opportunity and verify the link works correctly.
    *   Use Playwright to click the share button and assert the share options appear.

**Task: Create opportunity activity feed**

**Objective**: Develop an activity feed that shows recent updates related to an opportunity (e.g., new documents added, status changes).

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Keep interested parties informed about an opportunity's progress.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Feed UI**: Assert that an activity feed section is present on the opportunity detail page.
    *   **Test Case 2: New Activity**: Simulate an action (e.g., status change) and assert that a new item appears in the activity feed.

3.  **Implement the Task**: 
    *   **Database**: Create an `opportunity_activity` table to log events related to an opportunity.
    *   **API**: When actions like status changes or document uploads occur, add a new entry to the `opportunity_activity` table.
    *   **UI**: On the opportunity detail page, fetch and display the activity log.

4.  **Run Tests & Verify**: 
    *   Manually perform actions and verify the activity feed updates.
    *   Use Playwright to automate this.

**Task: Test all opportunity discovery features**

**Objective**: Perform comprehensive end-to-end testing of all features related to finding and viewing opportunities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure the entire discovery workflow is solid.

2.  **Write Tests (Pre-implementation)**: Design an E2E test script:
    *   **Test Script**:
        1. Log in.
        2. Navigate to the opportunities page.
        3. Use the filters to narrow the results.
        4. Use the search bar.
        5. Click on an opportunity card to go to the detail page.
        6. Bookmark the opportunity.
        7. Share the opportunity.
        8. Check the recommendations on the dashboard.

3.  **Implement the Task**: Write the Playwright script.

4.  **Run Tests & Verify**: Execute the script and fix any bugs.




## 6. Automated Frontend Testing Workflow Setup

This section provides a comprehensive guide for setting up an automated frontend testing workflow specifically designed for use with Claude Code CLI. The workflow incorporates modern testing frameworks like Playwright and Browserbase SDK, along with Model Context Protocol (MCP) agents for browser automation. This setup ensures that frontend functionality can be automatically tested from within the Claude Code CLI environment, enabling continuous validation of user interface components, user interactions, and end-to-end workflows.

### 6.1 Prerequisites and Environment Setup

Before implementing the automated testing workflow, several prerequisites must be established to ensure a robust testing environment. The foundation of this testing setup relies on having the proper tools and configurations in place.

**Claude Code CLI Installation and Configuration**

The first requirement is ensuring that Claude Code CLI is properly installed and configured according to Anthropic's official documentation [1]. This involves downloading the CLI tool, setting up authentication credentials, and verifying that the tool can successfully interact with your development environment. The Claude Code CLI serves as the orchestration layer for all automated testing activities, providing the interface through which testing commands are executed and results are interpreted.

**Node.js and Package Management**

A modern Node.js environment is essential for running contemporary frontend testing frameworks. The recommended approach is to install Node.js version 18 or higher, along with npm for package management. This provides access to the extensive ecosystem of JavaScript testing tools and frameworks that will be utilized throughout the automated testing workflow.

**Testing Framework Selection**

Two primary testing framework options are recommended for this setup: Playwright and Browserbase SDK. Playwright offers comprehensive browser automation capabilities with support for multiple browser engines (Chromium, Firefox, and WebKit), making it ideal for cross-browser testing scenarios. The Browserbase SDK provides cloud-based browser automation with additional features for remote testing and scalability.

For most development scenarios, Playwright is the recommended choice due to its robust feature set, excellent documentation, and strong integration capabilities with CI/CD pipelines. However, teams requiring cloud-based testing infrastructure or those working with distributed development environments may find the Browserbase SDK more suitable for their needs.

**Git Integration**

Version control integration through Git is crucial for maintaining test history, tracking changes to test suites, and enabling collaborative development of testing scenarios. The testing workflow should be configured to automatically commit test results, track test coverage changes, and maintain a history of test execution outcomes.

**Optional: Model Context Protocol (MCP) Server Ecosystem**

For advanced automation scenarios, the MCP server ecosystem provides additional capabilities for remote automation and tool orchestration [2]. This optional component enables more sophisticated testing workflows, including integration with external services, advanced reporting capabilities, and distributed test execution across multiple environments.

### 6.2 Initial Project Setup and Scaffolding

The automated testing workflow begins with proper project initialization and scaffolding. This process establishes the foundation for all subsequent testing activities and ensures that the testing infrastructure is properly integrated with the main application codebase.

**Project Initialization with Claude Code CLI**

The first step involves using Claude Code CLI to scaffold the frontend project. This process should be initiated with a command such as `claude "initialize a new React application with basic UI and testable user actions"`. The Claude Code CLI will generate the necessary boilerplate code, establish the folder structure, and configure the initial development environment.

During this initialization phase, it is important to ensure that the generated project structure includes dedicated directories for testing files, typically organized as `/tests/` for end-to-end tests, `/src/__tests__/` for unit tests, and `/src/components/__tests__/` for component-specific tests. This organization facilitates maintainability and makes it easier to locate and manage test files as the project grows.

**Testing Framework Installation**

Once the project structure is established, the next step involves installing the chosen testing framework. For Playwright, this is accomplished through the command `npm install --save-dev playwright`. The installation process should also include the Playwright browser binaries, which can be installed using `npx playwright install`.

For teams choosing the Browserbase SDK, the installation command would be `npm install --save-dev browserbase-sdk`. This SDK provides cloud-based browser automation capabilities and may require additional configuration steps for API authentication and service setup.

**Configuration File Setup**

Both testing frameworks require configuration files to define testing parameters, browser settings, and execution options. For Playwright, this involves creating a `playwright.config.js` file in the project root with appropriate settings for test directories, browser configurations, and reporting options.

A typical Playwright configuration for the DealRoom Network project would include settings for multiple browser engines, test timeouts appropriate for complex financial forms, and screenshot capture for debugging purposes. The configuration should also specify the base URL for the application, typically `http://localhost:3000` for development testing.

**Environment Variable Configuration**

Testing environments require specific environment variables to function correctly. These variables should include database connection strings for test databases, API keys for external services (configured for testing environments), and feature flags that may affect testing behavior.

It is crucial to maintain separate environment configurations for testing, development, and production environments. This separation ensures that testing activities do not interfere with production data and that tests can run consistently across different environments.

### 6.3 Test Generation and Automation Strategy

The core of the automated testing workflow involves generating comprehensive test suites that cover all critical user interactions and business logic within the DealRoom Network application. This process leverages Claude Code CLI's capabilities to automatically generate test scenarios based on the application's functionality.

**Automated Test Generation with Claude Code CLI**

Claude Code CLI can be instructed to generate comprehensive test suites using commands such as `claude "write end-to-end tests for all main frontend actions using Playwright"`. This instruction triggers the AI to analyze the application structure, identify key user interactions, and generate appropriate test scenarios.

The generated tests should cover all major user workflows identified in the PRD, including user registration and authentication, profile creation and management, investment opportunity posting and browsing, inquiry submission and management, and partnership formation processes. Each test should be designed to validate both the user interface behavior and the underlying business logic.

**Test-Driven Development Integration**

The automated testing workflow should be designed to support Test-Driven Development (TDD) principles, where tests are written before the corresponding functionality is implemented. This approach ensures that all features are thoroughly tested and that the testing suite evolves alongside the application codebase.

Claude Code CLI can be instructed to generate tests based on feature specifications, allowing developers to implement functionality with clear acceptance criteria already defined. This approach reduces the likelihood of bugs and ensures that all features meet the specified requirements.

**Component-Level Testing**

In addition to end-to-end tests, the workflow should include comprehensive component-level testing. This involves testing individual React components in isolation to ensure they render correctly, handle props appropriately, and respond to user interactions as expected.

Component tests should be generated for all major UI components, including form components (registration forms, opportunity posting forms), display components (opportunity cards, user profiles), and interactive components (filters, search functionality). These tests serve as a safety net for refactoring activities and help maintain code quality as the application evolves.

**API Integration Testing**

The testing workflow should include comprehensive testing of API integrations to ensure that frontend components correctly interact with backend services. This includes testing form submissions, data fetching operations, file uploads, and real-time updates through Supabase subscriptions.

API integration tests should validate both successful operations and error handling scenarios. This includes testing network failures, server errors, validation errors, and authentication failures to ensure that the application provides appropriate user feedback in all scenarios.

### 6.4 Advanced Automation with MCP Agents

For teams requiring more sophisticated testing capabilities, the Model Context Protocol (MCP) agent ecosystem provides advanced automation features that extend beyond basic browser testing. This section details the integration and utilization of MCP agents within the automated testing workflow.

**MCP Server Installation and Configuration**

The MCP server ecosystem can be integrated into the testing workflow by cloning the appropriate repositories and installing the necessary dependencies. A typical setup involves commands such as `git clone https://github.com/GrimFandango42/Claude-MCP-tools.git` followed by `cd Claude-MCP-tools` and `pip install fastmcp`.

The MCP server configuration should be tailored to the specific needs of the DealRoom Network application. This includes configuring browser automation agents for complex user interactions, screenshot validation agents for visual regression testing, and integration agents for external service testing.

**Browser Automation Enhancement**

MCP agents can significantly enhance browser automation capabilities beyond what is available through standard Playwright or Browserbase SDK functionality. These agents can handle complex scenarios such as multi-tab interactions, advanced form filling with dynamic content, and sophisticated user behavior simulation.

For the DealRoom Network application, MCP agents can be particularly valuable for testing complex workflows such as the multi-step opportunity posting process, document upload and management, and real-time messaging functionality. These agents can simulate realistic user behavior patterns and validate that the application performs correctly under various usage scenarios.

**Visual Regression Testing**

MCP agents can be configured to perform automated visual regression testing by capturing screenshots of key application pages and comparing them against baseline images. This capability is particularly important for applications like DealRoom Network, where visual presentation and user experience are critical to user adoption and engagement.

The visual regression testing setup should include baseline image capture for all major application pages, automated comparison algorithms to detect visual changes, and reporting mechanisms to highlight differences for developer review. This ensures that UI changes are intentional and that visual bugs are caught before reaching production.

**Integration with External Services**

MCP agents can facilitate testing of integrations with external services such as Stripe for payment processing, email services for notifications, and third-party APIs for data validation. These agents can simulate external service responses, test error handling scenarios, and validate that the application correctly handles various service states.

### 6.5 Continuous Testing and Debugging Loop

The automated testing workflow should include mechanisms for continuous testing and iterative debugging to ensure that issues are identified and resolved quickly. This section outlines the processes and tools necessary to maintain a robust continuous testing environment.

**Automated Test Execution**

The testing workflow should be configured to automatically execute tests in response to code changes, either through git hooks or continuous integration triggers. This ensures that regressions are identified immediately and that the development team receives prompt feedback on the impact of their changes.

Claude Code CLI can be configured to automatically trigger test execution using commands such as `claude --dangerously-skip-permissions` for fully automated testing scenarios. This configuration allows the AI to make necessary code changes, execute tests, and iterate on solutions without manual intervention.

**Intelligent Debugging and Fix Generation**

When tests fail, the automated workflow should include intelligent debugging capabilities that can analyze test failures, identify root causes, and generate potential fixes. Claude Code CLI excels in this area, as it can analyze test output, examine application code, and propose specific changes to resolve issues.

The debugging process should follow a systematic approach: first analyzing the test failure to understand the specific issue, then examining the relevant application code to identify the root cause, and finally generating and testing potential fixes until the issue is resolved. This process should be documented and tracked to build a knowledge base of common issues and their solutions.

**Iterative Improvement Process**

The testing workflow should include mechanisms for continuous improvement based on test results and failure patterns. This involves analyzing test execution data to identify areas where additional test coverage is needed, optimizing test execution times to improve developer productivity, and refining test scenarios based on real-world usage patterns.

Regular review of test results should inform decisions about test suite expansion, test case refinement, and testing strategy adjustments. This ensures that the testing workflow continues to provide value as the application evolves and grows in complexity.

### 6.6 Test Coverage and Quality Metrics

Maintaining high test coverage and quality metrics is essential for ensuring the reliability and maintainability of the DealRoom Network application. This section outlines the metrics and monitoring approaches that should be integrated into the automated testing workflow.

**Coverage Measurement and Reporting**

The testing workflow should include comprehensive coverage measurement that tracks both line coverage and functional coverage across the application codebase. This involves integrating coverage tools such as Istanbul or c8 with the test execution process to generate detailed coverage reports.

Coverage reports should be generated automatically with each test run and should include detailed breakdowns by component, feature area, and test type. These reports should be easily accessible to the development team and should highlight areas where additional testing is needed.

**Quality Metrics Tracking**

Beyond basic coverage metrics, the testing workflow should track quality metrics such as test execution time, test reliability (pass/fail rates over time), and defect detection rates. These metrics provide insights into the effectiveness of the testing strategy and help identify areas for improvement.

Quality metrics should be tracked over time to identify trends and patterns. For example, increasing test execution times may indicate the need for test optimization, while declining pass rates may suggest that the application is becoming more complex and requires additional testing attention.

**Performance Testing Integration**

The automated testing workflow should include performance testing capabilities to ensure that the DealRoom Network application meets performance requirements under various load conditions. This includes testing page load times, form submission performance, and database query performance.

Performance tests should be integrated into the regular testing cycle and should include both synthetic load testing and real-world usage simulation. Results should be tracked over time to identify performance regressions and ensure that performance requirements are consistently met.

### 6.7 Deployment and Production Testing

The automated testing workflow should extend beyond development and staging environments to include production testing capabilities. This ensures that the application continues to function correctly in the production environment and that any production-specific issues are identified quickly.

**Production Smoke Testing**

After each deployment to production, automated smoke tests should be executed to verify that core functionality is working correctly. These tests should cover critical user paths such as user authentication, opportunity browsing, and inquiry submission.

Smoke tests should be designed to execute quickly and should focus on the most critical application functionality. They should be non-destructive and should not create test data in the production environment.

**Monitoring and Alerting Integration**

The testing workflow should be integrated with production monitoring and alerting systems to provide comprehensive visibility into application health. This includes integrating test results with monitoring dashboards and configuring alerts for test failures or performance degradations.

Monitoring integration should provide real-time visibility into application performance and should enable rapid response to issues. This ensures that problems are identified and resolved quickly, minimizing impact on users.

### 6.8 Implementation Checklist and Best Practices

To ensure successful implementation of the automated frontend testing workflow, the following checklist and best practices should be followed:

**Setup and Configuration Checklist**

The implementation process should begin with a comprehensive setup checklist that covers all necessary components and configurations. This includes verifying Claude Code CLI installation and authentication, installing and configuring the chosen testing framework (Playwright or Browserbase SDK), setting up project structure and test directories, configuring environment variables for testing, and establishing version control integration.

Each item on the checklist should include specific verification steps to ensure that the setup is correct and complete. This reduces the likelihood of configuration issues that could impact testing effectiveness.

**Test Development Best Practices**

Test development should follow established best practices to ensure maintainability and reliability. This includes writing clear and descriptive test names that explain what is being tested, organizing tests logically by feature area or user workflow, using appropriate test data that reflects real-world usage scenarios, and implementing proper cleanup procedures to prevent test interference.

Tests should be designed to be independent and should not rely on the execution order or state from other tests. This ensures that tests can be executed in any order and that test failures are isolated and easier to debug.

**Maintenance and Evolution Guidelines**

The testing workflow should include guidelines for ongoing maintenance and evolution to ensure that it continues to provide value as the application grows and changes. This includes regular review and updating of test scenarios to reflect application changes, optimization of test execution times to maintain developer productivity, and expansion of test coverage to address new features and functionality.

Regular maintenance activities should be scheduled and documented to ensure that they are consistently performed. This helps maintain the quality and effectiveness of the testing workflow over time.

**Team Training and Documentation**

Successful implementation of the automated testing workflow requires proper team training and documentation. This includes providing training on the testing tools and frameworks being used, documenting testing procedures and best practices, and establishing clear responsibilities for test maintenance and execution.

Documentation should be comprehensive and should include both high-level overviews of the testing strategy and detailed technical documentation for specific testing procedures. This ensures that all team members can effectively contribute to and benefit from the automated testing workflow.

The automated frontend testing workflow described in this section provides a comprehensive foundation for ensuring the quality and reliability of the DealRoom Network application. By following these guidelines and best practices, development teams can establish a robust testing environment that supports rapid development while maintaining high quality standards.

This testing workflow is specifically designed to integrate seamlessly with Claude Code CLI, enabling AI-assisted test generation, execution, and debugging. The combination of automated test generation, intelligent debugging, and continuous improvement processes creates a powerful development environment that can adapt to changing requirements while maintaining consistent quality standards.

The implementation of this automated testing workflow represents a significant investment in development infrastructure, but the benefits in terms of reduced bugs, faster development cycles, and improved code quality make it an essential component of any serious web application development project. The specific focus on Test-Driven Development principles ensures that testing is not an afterthought but an integral part of the development process from the very beginning.



### Phase 3: Professional Network & Matching (25 hours)

#### Day 5-6 (12 hours)

**Task: Create inquiry submission form with investment details**

**Objective**: Develop a comprehensive form that allows capital partners to submit detailed investment inquiries to deal sponsors, capturing all necessary information for effective deal evaluation.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Build a form for investors to express interest in specific opportunities, providing detailed information about their investment capacity and requirements.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Form Rendering**: Assert that the inquiry form renders with all required fields including `inquiry_type`, `investment_amount_interest`, and `message`.
    *   **Test Case 2: Investment Amount Validation**: Test that the investment amount field validates against the opportunity's minimum and maximum investment requirements.
    *   **Test Case 3: Form Submission (API Unit Test)**: Mock the API call to `POST /api/inquiries` and assert that the form submits the correct data structure including the opportunity ID and investor details.
    *   **Test Case 4: Success Handling**: After successful submission, assert that the user receives confirmation and is redirected to their inquiries dashboard.

3.  **Implement the Task**: 
    *   **Form Component**: Create `src/app/(dashboard)/inquiries/components/inquiry-form.tsx` using `react-hook-form` and `zod` validation.
    *   **Validation Schema**: Define comprehensive validation rules for inquiry data, including investment amount ranges and message length requirements.
    *   **API Integration**: Implement the form submission logic that calls the inquiries API endpoint and handles both success and error responses.
    *   **User Experience**: Include features like auto-saving drafts, character counters for message fields, and clear progress indicators.

4.  **Run Tests & Verify**: 
    *   Manually test the form with various investment amounts and message lengths, verifying validation feedback.
    *   Use Playwright to automate form submission scenarios, including edge cases like minimum and maximum investment amounts.

**Task: Build inquiry management dashboard for sponsors**

**Objective**: Create a comprehensive dashboard interface for deal sponsors to view, manage, and respond to investment inquiries from potential partners.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide sponsors with tools to efficiently manage incoming inquiries and track their response rates and conversion metrics.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Dashboard Rendering**: Assert that the inquiry management dashboard displays a list of inquiries with key information like investor name, investment amount, and inquiry date.
    *   **Test Case 2: Filtering and Sorting**: Test that sponsors can filter inquiries by status, opportunity, or date range, and sort by various criteria.
    *   **Test Case 3: Bulk Actions**: Verify that sponsors can select multiple inquiries and perform bulk actions like marking as reviewed or scheduling follow-ups.
    *   **Test Case 4: Response Integration**: Assert that clicking on an inquiry opens a detailed view with response options.

3.  **Implement the Task**: 
    *   **Dashboard Component**: Create `src/app/(dashboard)/inquiries/page.tsx` with a comprehensive table view of inquiries.
    *   **Filtering System**: Implement advanced filtering options using query parameters and state management.
    *   **Data Management**: Use server-side pagination and sorting to handle large volumes of inquiries efficiently.
    *   **Real-time Updates**: Integrate Supabase real-time subscriptions to update the dashboard when new inquiries arrive.

4.  **Run Tests & Verify**: 
    *   Create multiple test inquiries and verify that they appear correctly in the dashboard with proper sorting and filtering.
    *   Use Playwright to test the interactive features like filtering, sorting, and bulk selection.

**Task: Implement inquiry status tracking and responses**

**Objective**: Develop a comprehensive system for tracking inquiry lifecycle from submission through resolution, including sponsor response capabilities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create a workflow system that tracks inquiry progress and enables effective communication between sponsors and investors.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Status Updates**: Assert that inquiry status changes are properly tracked and displayed to both sponsors and investors.
    *   **Test Case 2: Response Functionality**: Test that sponsors can respond to inquiries with detailed messages and status updates.
    *   **Test Case 3: Notification System**: Verify that status changes trigger appropriate notifications to relevant parties.
    *   **Test Case 4: Timeline Tracking**: Assert that all inquiry activities are logged with timestamps for audit purposes.

3.  **Implement the Task**: 
    *   **Status Management**: Implement a state machine for inquiry status transitions with proper validation.
    *   **Response Interface**: Create components for sponsors to respond to inquiries with rich text editing capabilities.
    *   **Activity Logging**: Implement comprehensive logging of all inquiry-related activities for transparency.
    *   **Notification Integration**: Connect status changes to the notification system for real-time updates.

4.  **Run Tests & Verify**: 
    *   Test the complete inquiry lifecycle from submission to resolution, verifying all status transitions.
    *   Use Playwright to simulate sponsor responses and verify that investors receive appropriate notifications.

**Task: Create meeting scheduling functionality**

**Objective**: Implement an integrated meeting scheduling system that allows sponsors and investors to coordinate due diligence calls and investment discussions.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide seamless scheduling capabilities that integrate with external calendar systems and support various meeting formats.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Calendar Integration**: Assert that the scheduling interface displays available time slots based on participant availability.
    *   **Test Case 2: Meeting Creation**: Test that meetings can be created with proper details including date, time, type, and agenda.
    *   **Test Case 3: Confirmation System**: Verify that meeting confirmations are sent to all participants with calendar invites.
    *   **Test Case 4: Rescheduling**: Assert that meetings can be rescheduled with proper notifications to all parties.

3.  **Implement the Task**: 
    *   **Scheduling Interface**: Create calendar-based scheduling components with availability checking.
    *   **Meeting Management**: Implement meeting creation, modification, and cancellation functionality.
    *   **Integration Layer**: Connect with external calendar services and video conferencing platforms.
    *   **Reminder System**: Implement automated reminders and follow-up notifications.

4.  **Run Tests & Verify**: 
    *   Test meeting scheduling between different user types, verifying calendar integration and notifications.
    *   Use Playwright to automate the scheduling workflow and verify all confirmation emails are sent.

**Task: Build inquiry analytics and conversion tracking**

**Objective**: Develop comprehensive analytics capabilities that provide insights into inquiry patterns, response rates, and conversion metrics for sponsors.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide data-driven insights that help sponsors optimize their opportunity presentations and response strategies.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Analytics Dashboard**: Assert that analytics components display key metrics like inquiry volume, response rates, and conversion percentages.
    *   **Test Case 2: Trend Analysis**: Test that historical data is properly aggregated and displayed in charts and graphs.
    *   **Test Case 3: Comparative Analysis**: Verify that sponsors can compare performance across different opportunities and time periods.
    *   **Test Case 4: Export Functionality**: Assert that analytics data can be exported for external analysis.

3.  **Implement the Task**: 
    *   **Analytics Engine**: Implement data aggregation and calculation logic for key performance indicators.
    *   **Visualization Components**: Create charts and graphs using libraries like Recharts for data presentation.
    *   **Reporting System**: Build comprehensive reporting capabilities with filtering and export options.
    *   **Performance Optimization**: Implement caching and efficient data queries for analytics calculations.

4.  **Run Tests & Verify**: 
    *   Generate test data across multiple inquiries and opportunities to verify analytics calculations.
    *   Use Playwright to test the analytics interface and verify that charts render correctly with various data sets.

**Task: Setup automated inquiry notifications**

**Objective**: Implement a comprehensive notification system that keeps all parties informed about inquiry status changes and important updates.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure timely communication between sponsors and investors through automated notifications across multiple channels.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Notification Triggers**: Assert that appropriate notifications are sent when inquiries are submitted, responded to, or status changes occur.
    *   **Test Case 2: Multi-Channel Delivery**: Test that notifications are delivered through both in-app and email channels.
    *   **Test Case 3: Personalization**: Verify that notifications are properly personalized with relevant details and context.
    *   **Test Case 4: Delivery Tracking**: Assert that notification delivery is tracked and failures are handled appropriately.

3.  **Implement the Task**: 
    *   **Notification Engine**: Create a flexible notification system that supports multiple triggers and channels.
    *   **Template Management**: Implement customizable notification templates for different scenarios.
    *   **Delivery System**: Integrate with email services and push notification systems for reliable delivery.
    *   **Preference Management**: Allow users to customize their notification preferences and frequency.

4.  **Run Tests & Verify**: 
    *   Test notification delivery across various scenarios and user preferences.
    *   Use automated testing to verify that notifications are sent correctly and contain accurate information.

**Task: Create inquiry-to-partnership conversion workflow**

**Objective**: Develop a seamless workflow that guides successful inquiries through the partnership formation process.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide a structured process for converting promising inquiries into formal investment partnerships.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Conversion Initiation**: Assert that sponsors can initiate the partnership conversion process from successful inquiries.
    *   **Test Case 2: Documentation Management**: Test that required partnership documents are properly managed and tracked.
    *   **Test Case 3: Status Progression**: Verify that the conversion workflow properly tracks progress through various stages.
    *   **Test Case 4: Success Fee Calculation**: Assert that platform success fees are correctly calculated and processed.

3.  **Implement the Task**: 
    *   **Workflow Engine**: Create a step-by-step workflow system for partnership conversion.
    *   **Document Management**: Implement secure document handling for partnership agreements and legal documents.
    *   **Progress Tracking**: Build comprehensive tracking of conversion milestones and requirements.
    *   **Fee Processing**: Integrate with payment systems for success fee collection.

4.  **Run Tests & Verify**: 
    *   Test the complete conversion workflow from inquiry acceptance to partnership formation.
    *   Use Playwright to automate the conversion process and verify all steps complete successfully.

**Task: Implement inquiry filtering and search**

**Objective**: Provide sponsors with powerful filtering and search capabilities to efficiently manage large volumes of inquiries.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Enable sponsors to quickly find and prioritize inquiries based on various criteria and search terms.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Filter Interface**: Assert that filtering controls are properly rendered and functional for all relevant criteria.
    *   **Test Case 2: Search Functionality**: Test that text search works across inquiry content and investor information.
    *   **Test Case 3: Combined Filtering**: Verify that multiple filters can be applied simultaneously with correct results.
    *   **Test Case 4: Saved Searches**: Assert that sponsors can save and recall frequently used search and filter combinations.

3.  **Implement the Task**: 
    *   **Filter System**: Implement comprehensive filtering options for inquiry attributes and investor characteristics.
    *   **Search Engine**: Create full-text search capabilities across inquiry content and related data.
    *   **State Management**: Build efficient state management for filter and search combinations.
    *   **Performance Optimization**: Implement efficient querying and indexing for fast search results.

4.  **Run Tests & Verify**: 
    *   Test various filter and search combinations with large datasets to verify performance and accuracy.
    *   Use Playwright to automate complex filtering scenarios and verify result accuracy.

**Task: Build bulk inquiry management tools**

**Objective**: Create tools that allow sponsors to efficiently manage multiple inquiries simultaneously through bulk operations.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide efficiency tools for sponsors managing high volumes of inquiries.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Bulk Selection**: Assert that sponsors can select multiple inquiries using checkboxes or selection tools.
    *   **Test Case 2: Bulk Actions**: Test that bulk operations like status updates, responses, or archiving work correctly.
    *   **Test Case 3: Confirmation Systems**: Verify that bulk actions require appropriate confirmation to prevent accidental operations.
    *   **Test Case 4: Progress Tracking**: Assert that bulk operations show progress and handle failures gracefully.

3.  **Implement the Task**: 
    *   **Selection Interface**: Create intuitive bulk selection tools with select all/none functionality.
    *   **Action System**: Implement various bulk actions with proper validation and error handling.
    *   **Confirmation Dialogs**: Build appropriate confirmation interfaces for destructive or significant bulk operations.
    *   **Progress Indicators**: Create progress tracking for long-running bulk operations.

4.  **Run Tests & Verify**: 
    *   Test bulk operations with various selection sizes and verify all operations complete successfully.
    *   Use Playwright to automate bulk operation scenarios and verify proper error handling.

**Task: Test entire inquiry lifecycle**

**Objective**: Perform comprehensive end-to-end testing of the complete inquiry management system from submission to resolution.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure the entire inquiry system works seamlessly across all user types and scenarios.

2.  **Write Tests (Pre-implementation)**: Design comprehensive E2E test scripts covering:
    *   **Complete Inquiry Workflow**: From investor submission through sponsor response to partnership conversion.
    *   **Multi-User Scenarios**: Testing interactions between multiple investors and sponsors simultaneously.
    *   **Edge Cases**: Testing system behavior with unusual data or high-volume scenarios.
    *   **Integration Points**: Verifying all external integrations work correctly within the inquiry context.

3.  **Implement the Task**: Create comprehensive Playwright test suites that cover all inquiry-related functionality.

4.  **Run Tests & Verify**: Execute the complete test suite and resolve any issues identified during testing.

#### Day 6-7 (13 hours)

**Task: Build professional connection request system**

**Objective**: Develop a LinkedIn-style professional networking system that allows users to connect with each other for business purposes.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Create a professional networking feature that facilitates business relationships within the real estate investment community.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Connection Request UI**: Assert that users can send connection requests with personalized messages.
    *   **Test Case 2: Request Management**: Test that users can view and manage incoming and outgoing connection requests.
    *   **Test Case 3: Connection Acceptance**: Verify that accepting connections establishes proper relationships in the database.
    *   **Test Case 4: Privacy Controls**: Assert that users can control who can send them connection requests.

3.  **Implement the Task**: 
    *   **Request Interface**: Create components for sending and managing connection requests.
    *   **Relationship Management**: Implement database relationships and business logic for professional connections.
    *   **Privacy Settings**: Build user controls for connection request preferences and visibility.
    *   **Notification Integration**: Connect connection activities to the notification system.

4.  **Run Tests & Verify**: 
    *   Test connection requests between different user types and verify all relationship states.
    *   Use Playwright to automate connection workflows and verify proper database updates.

**Task: Create connection management dashboard**

**Objective**: Build a comprehensive interface for users to view and manage their professional network connections.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide users with tools to organize and leverage their professional connections effectively.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Connection Display**: Assert that the dashboard shows all connections with relevant profile information.
    *   **Test Case 2: Organization Tools**: Test that users can categorize, tag, or organize their connections.
    *   **Test Case 3: Communication Features**: Verify that users can initiate communication with connections directly from the dashboard.
    *   **Test Case 4: Network Analytics**: Assert that users can view insights about their network growth and composition.

3.  **Implement the Task**: 
    *   **Dashboard Interface**: Create comprehensive connection management views with search and filtering.
    *   **Organization System**: Implement tagging and categorization features for connection management.
    *   **Communication Integration**: Connect the dashboard to messaging and communication systems.
    *   **Analytics Components**: Build network analytics and insights features.

4.  **Run Tests & Verify**: 
    *   Test connection management features with various network sizes and compositions.
    *   Use Playwright to verify all dashboard functionality works correctly across different user scenarios.

**Task: Implement connection suggestions algorithm**

**Objective**: Develop an intelligent system that suggests relevant professional connections based on user profiles, mutual connections, and business interests.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide personalized connection suggestions that help users expand their professional networks strategically.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Suggestion Generation**: Assert that the algorithm generates relevant suggestions based on user profiles and preferences.
    *   **Test Case 2: Mutual Connections**: Test that suggestions properly weight mutual connections and network overlap.
    *   **Test Case 3: Business Relevance**: Verify that suggestions prioritize users with complementary business interests.
    *   **Test Case 4: Suggestion Quality**: Assert that suggestion quality improves based on user feedback and connection success rates.

3.  **Implement the Task**: 
    *   **Algorithm Development**: Create sophisticated matching algorithms based on multiple criteria.
    *   **Data Analysis**: Implement analysis of user profiles, connection patterns, and business interests.
    *   **Machine Learning**: Integrate learning capabilities to improve suggestion quality over time.
    *   **Performance Optimization**: Ensure suggestion generation is efficient and scalable.

4.  **Run Tests & Verify**: 
    *   Test suggestion quality with various user profiles and network configurations.
    *   Use automated testing to verify suggestion algorithms produce consistent and relevant results.

**Task: Build professional network visualization**

**Objective**: Create interactive visualizations that help users understand and navigate their professional networks.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide visual tools that help users identify networking opportunities and understand relationship patterns.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Network Graph**: Assert that network visualizations accurately represent connection relationships.
    *   **Test Case 2: Interactive Features**: Test that users can interact with visualizations to explore connections and relationships.
    *   **Test Case 3: Filtering Options**: Verify that visualizations can be filtered by various criteria like connection type or industry.
    *   **Test Case 4: Performance**: Assert that visualizations perform well with large networks and complex relationships.

3.  **Implement the Task**: 
    *   **Visualization Library**: Integrate graph visualization libraries for network display.
    *   **Interactive Features**: Build interactive capabilities for exploring network relationships.
    *   **Data Processing**: Implement efficient data processing for large network visualizations.
    *   **User Interface**: Create intuitive controls for visualization customization and exploration.

4.  **Run Tests & Verify**: 
    *   Test network visualizations with various network sizes and verify performance and accuracy.
    *   Use Playwright to test interactive features and verify proper data representation.

**Task: Create networking event and meetup integration**

**Objective**: Integrate with external event platforms and create internal event management capabilities for networking opportunities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Facilitate in-person and virtual networking opportunities through event integration and management.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Event Display**: Assert that networking events are properly displayed with relevant details and registration options.
    *   **Test Case 2: Registration System**: Test that users can register for events and manage their event attendance.
    *   **Test Case 3: Integration APIs**: Verify that external event platform integrations work correctly and sync data properly.
    *   **Test Case 4: Event Creation**: Assert that users can create and manage their own networking events within the platform.

3.  **Implement the Task**: 
    *   **Event Management**: Create comprehensive event management capabilities for networking events.
    *   **External Integration**: Integrate with popular event platforms like Eventbrite or Meetup.
    *   **Registration System**: Build event registration and attendance tracking functionality.
    *   **Communication Tools**: Implement event-related communication and networking features.

4.  **Run Tests & Verify**: 
    *   Test event management features and external integrations with real event data.
    *   Use Playwright to verify event registration and management workflows.

**Task: Implement mutual connection discovery**

**Objective**: Develop features that help users identify and leverage mutual connections for business introductions and networking.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Enable users to discover shared connections and facilitate warm introductions within their networks.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Mutual Connection Identification**: Assert that the system correctly identifies mutual connections between users.
    *   **Test Case 2: Introduction Requests**: Test that users can request introductions through mutual connections.
    *   **Test Case 3: Introduction Management**: Verify that mutual connections can manage and facilitate introduction requests.
    *   **Test Case 4: Privacy Controls**: Assert that users can control their visibility for introduction requests.

3.  **Implement the Task**: 
    *   **Discovery Algorithm**: Create algorithms to identify and rank mutual connections.
    *   **Introduction System**: Build request and management systems for professional introductions.
    *   **Privacy Management**: Implement user controls for introduction visibility and preferences.
    *   **Communication Integration**: Connect introduction features to messaging and notification systems.

4.  **Run Tests & Verify**: 
    *   Test mutual connection discovery with complex network relationships.
    *   Use Playwright to verify introduction request workflows and privacy controls.

**Task: Build professional endorsement system**

**Objective**: Create a system for professional endorsements and recommendations similar to LinkedIn's endorsement features.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Enable users to endorse each other's skills and provide professional recommendations to build credibility.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Endorsement Interface**: Assert that users can endorse connections for specific skills or achievements.
    *   **Test Case 2: Recommendation System**: Test that users can write and manage detailed professional recommendations.
    *   **Test Case 3: Display Integration**: Verify that endorsements and recommendations are properly displayed on user profiles.
    *   **Test Case 4: Credibility Scoring**: Assert that endorsements contribute to user credibility and reputation scores.

3.  **Implement the Task**: 
    *   **Endorsement System**: Create skill-based endorsement functionality with proper validation.
    *   **Recommendation Management**: Build comprehensive recommendation writing and management tools.
    *   **Profile Integration**: Integrate endorsements and recommendations into user profile displays.
    *   **Reputation System**: Implement credibility scoring based on endorsements and recommendations.

4.  **Run Tests & Verify**: 
    *   Test endorsement and recommendation features across different user relationships.
    *   Use Playwright to verify the complete endorsement workflow and profile integration.

**Task: Create industry news and updates feed**

**Objective**: Develop a curated news feed that keeps users informed about real estate investment industry trends and opportunities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide valuable industry content that keeps users engaged and informed about market developments.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Content Aggregation**: Assert that news content is properly aggregated from multiple sources and displayed.
    *   **Test Case 2: Personalization**: Test that news feeds are personalized based on user interests and preferences.
    *   **Test Case 3: Content Management**: Verify that administrators can manage and curate news content effectively.
    *   **Test Case 4: Engagement Features**: Assert that users can interact with news content through comments, shares, and reactions.

3.  **Implement the Task**: 
    *   **Content Aggregation**: Integrate with news APIs and RSS feeds for industry content.
    *   **Personalization Engine**: Create algorithms to personalize content based on user preferences.
    *   **Content Management**: Build administrative tools for content curation and management.
    *   **Engagement System**: Implement user interaction features for news content.

4.  **Run Tests & Verify**: 
    *   Test news feed functionality with various content sources and user preferences.
    *   Use Playwright to verify content display and user interaction features.

**Task: Setup networking analytics and insights**

**Objective**: Provide users with analytics about their networking activities and the effectiveness of their professional connections.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Help users understand and optimize their networking strategies through data-driven insights.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Network Analytics**: Assert that analytics properly track network growth, connection quality, and engagement metrics.
    *   **Test Case 2: Activity Insights**: Test that users can view insights about their networking activities and outcomes.
    *   **Test Case 3: Comparative Analysis**: Verify that users can compare their networking performance over time and against benchmarks.
    *   **Test Case 4: Recommendation Engine**: Assert that analytics generate actionable recommendations for networking improvement.

3.  **Implement the Task**: 
    *   **Analytics Engine**: Create comprehensive analytics calculation and tracking systems.
    *   **Insights Generation**: Build algorithms to generate meaningful insights from networking data.
    *   **Visualization Components**: Create charts and graphs to display networking analytics effectively.
    *   **Recommendation System**: Implement AI-driven recommendations for networking optimization.

4.  **Run Tests & Verify**: 
    *   Test analytics calculations with various networking scenarios and verify accuracy.
    *   Use Playwright to verify analytics displays and recommendation generation.

**Task: Build referral and introduction system**

**Objective**: Create a formal system for managing business referrals and professional introductions within the network.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Facilitate business development through structured referral and introduction processes.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Referral Management**: Assert that users can create, track, and manage business referrals effectively.
    *   **Test Case 2: Introduction Workflow**: Test that professional introductions follow proper protocols and tracking.
    *   **Test Case 3: Success Tracking**: Verify that referral and introduction outcomes are properly tracked and reported.
    *   **Test Case 4: Incentive System**: Assert that referral incentives and rewards are calculated and distributed correctly.

3.  **Implement the Task**: 
    *   **Referral System**: Create comprehensive referral management and tracking capabilities.
    *   **Introduction Protocol**: Build structured introduction workflows with proper etiquette and tracking.
    *   **Outcome Tracking**: Implement systems to track referral and introduction success rates.
    *   **Incentive Management**: Create reward and incentive systems for successful referrals.

4.  **Run Tests & Verify**: 
    *   Test referral and introduction workflows with various user scenarios.
    *   Use Playwright to verify the complete referral lifecycle and incentive calculations.

**Task: Test networking features thoroughly**

**Objective**: Perform comprehensive end-to-end testing of all professional networking features and workflows.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure all networking features work seamlessly together and provide value to users.

2.  **Write Tests (Pre-implementation)**: Design comprehensive test scenarios covering all networking features and their interactions.

3.  **Implement the Task**: Create extensive Playwright test suites for all networking functionality.

4.  **Run Tests & Verify**: Execute comprehensive testing and resolve any issues identified.

### Phase 4: Subscription & Payment Processing (15 hours)

#### Day 7-8 (10 hours)

**Task: Setup Stripe for subscription billing**

**Objective**: Integrate Stripe's subscription billing system to handle recurring payments for the DealRoom Network platform.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Implement a robust subscription billing system that can handle multiple subscription tiers and billing cycles.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Stripe Configuration**: Assert that Stripe is properly configured with correct API keys and webhook endpoints.
    *   **Test Case 2: Product Creation**: Test that subscription products and prices are correctly created in Stripe.
    *   **Test Case 3: Customer Management**: Verify that customer records are properly synchronized between the application and Stripe.
    *   **Test Case 4: Webhook Processing**: Assert that Stripe webhooks are properly received and processed for subscription events.

3.  **Implement the Task**: 
    *   **Stripe Configuration**: Set up Stripe account, configure API keys, and establish webhook endpoints.
    *   **Product Setup**: Create subscription products in Stripe for different user tiers and pricing plans.
    *   **Integration Layer**: Build comprehensive Stripe integration utilities and API wrappers.
    *   **Webhook Handler**: Implement robust webhook processing for subscription lifecycle events.

4.  **Run Tests & Verify**: 
    *   Test Stripe integration with test payment methods and verify all subscription operations.
    *   Use Playwright to test the complete subscription signup flow with Stripe's test environment.

**Task: Create subscription plan management**

**Objective**: Build administrative and user-facing interfaces for managing subscription plans, pricing, and features.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide flexible subscription plan management that can adapt to changing business needs.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Plan Configuration**: Assert that subscription plans can be created, modified, and deactivated through administrative interfaces.
    *   **Test Case 2: Feature Management**: Test that plan features and limitations are properly enforced throughout the application.
    *   **Test Case 3: Pricing Updates**: Verify that pricing changes are properly handled for existing and new subscribers.
    *   **Test Case 4: Plan Comparison**: Assert that users can view and compare different subscription plans effectively.

3.  **Implement the Task**: 
    *   **Administrative Interface**: Create comprehensive plan management tools for administrators.
    *   **Feature Enforcement**: Implement feature gating and usage limitations based on subscription tiers.
    *   **Pricing Management**: Build systems for managing pricing changes and grandfathering existing customers.
    *   **User Interface**: Create clear plan comparison and selection interfaces for users.

4.  **Run Tests & Verify**: 
    *   Test plan management features with various configuration scenarios.
    *   Use Playwright to verify plan comparison and selection workflows for users.

**Task: Implement subscription signup flow**

**Objective**: Create a seamless subscription signup experience that guides users through plan selection and payment setup.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide a frictionless signup experience that maximizes conversion rates while ensuring payment security.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Plan Selection**: Assert that users can easily select and compare subscription plans during signup.
    *   **Test Case 2: Payment Processing**: Test that payment information is securely collected and processed through Stripe.
    *   **Test Case 3: Account Activation**: Verify that successful payment immediately activates the user's account with appropriate features.
    *   **Test Case 4: Error Handling**: Assert that payment failures and errors are handled gracefully with clear user feedback.

3.  **Implement the Task**: 
    *   **Signup Flow**: Create a multi-step signup process with plan selection and payment collection.
    *   **Stripe Integration**: Implement secure payment processing using Stripe Elements and Payment Intents.
    *   **Account Activation**: Build automatic account activation and feature enablement upon successful payment.
    *   **Error Management**: Implement comprehensive error handling and user feedback systems.

4.  **Run Tests & Verify**: 
    *   Test the complete signup flow with various payment scenarios and error conditions.
    *   Use Playwright to automate signup testing with Stripe's test payment methods.

**Task: Build subscription management dashboard**

**Objective**: Create a comprehensive dashboard where users can manage their subscriptions, view billing history, and update payment methods.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide users with complete control over their subscription and billing preferences.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Subscription Display**: Assert that current subscription details are accurately displayed including plan, billing cycle, and next payment date.
    *   **Test Case 2: Plan Changes**: Test that users can upgrade, downgrade, or change their subscription plans seamlessly.
    *   **Test Case 3: Payment Methods**: Verify that users can add, update, and remove payment methods securely.
    *   **Test Case 4: Billing History**: Assert that complete billing history is displayed with downloadable invoices.

3.  **Implement the Task**: 
    *   **Dashboard Interface**: Create comprehensive subscription management interfaces with clear information display.
    *   **Plan Management**: Implement plan change functionality with proper proration and billing adjustments.
    *   **Payment Management**: Build secure payment method management using Stripe's customer portal or custom interfaces.
    *   **Billing History**: Create detailed billing history displays with invoice generation and download capabilities.

4.  **Run Tests & Verify**: 
    *   Test all subscription management features with various subscription states and scenarios.
    *   Use Playwright to verify the complete subscription management workflow.

**Task: Setup subscription renewal and cancellation**

**Objective**: Implement automated subscription renewal processes and user-friendly cancellation workflows.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure reliable subscription renewals while providing easy cancellation options to maintain user trust.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Automatic Renewal**: Assert that subscriptions automatically renew on schedule with proper billing and feature continuation.
    *   **Test Case 2: Renewal Failures**: Test that failed renewals are handled appropriately with retry logic and user notifications.
    *   **Test Case 3: Cancellation Process**: Verify that users can easily cancel subscriptions with appropriate confirmation and feedback.
    *   **Test Case 4: Grace Periods**: Assert that cancelled subscriptions continue to provide access through the end of the billing period.

3.  **Implement the Task**: 
    *   **Renewal System**: Implement automated renewal processing with comprehensive error handling and retry logic.
    *   **Failure Management**: Build systems to handle renewal failures with appropriate user communication and recovery options.
    *   **Cancellation Interface**: Create user-friendly cancellation workflows with feedback collection and retention offers.
    *   **Access Management**: Implement proper access control for cancelled subscriptions during grace periods.

4.  **Run Tests & Verify**: 
    *   Test renewal and cancellation scenarios with various subscription states and payment conditions.
    *   Use automated testing to verify proper handling of edge cases and error conditions.

**Task: Implement webhook handling for payment events**

**Objective**: Build robust webhook processing to handle all Stripe payment and subscription events reliably.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure that all payment-related events are properly processed to maintain accurate subscription and billing states.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Webhook Reception**: Assert that webhooks are properly received and authenticated from Stripe.
    *   **Test Case 2: Event Processing**: Test that different webhook events trigger appropriate application responses and database updates.
    *   **Test Case 3: Idempotency**: Verify that duplicate webhook events are handled properly without causing data inconsistencies.
    *   **Test Case 4: Error Recovery**: Assert that webhook processing failures are logged and can be retried appropriately.

3.  **Implement the Task**: 
    *   **Webhook Endpoint**: Create secure webhook endpoints with proper authentication and signature verification.
    *   **Event Processing**: Implement comprehensive event handlers for all relevant Stripe webhook events.
    *   **Idempotency Management**: Build systems to prevent duplicate processing of webhook events.
    *   **Error Handling**: Implement robust error handling and logging for webhook processing failures.

4.  **Run Tests & Verify**: 
    *   Test webhook processing with various event types and verify proper application responses.
    *   Use Stripe's webhook testing tools to verify proper handling of all event scenarios.

**Task: Create billing history and invoicing**

**Objective**: Implement comprehensive billing history tracking and invoice generation capabilities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide users with complete transparency into their billing history and professional invoicing capabilities.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: History Display**: Assert that billing history is accurately displayed with all relevant transaction details.
    *   **Test Case 2: Invoice Generation**: Test that invoices are properly generated with correct formatting and information.
    *   **Test Case 3: Download Functionality**: Verify that users can download invoices in standard formats like PDF.
    *   **Test Case 4: Tax Handling**: Assert that tax calculations and display are handled correctly for different jurisdictions.

3.  **Implement the Task**: 
    *   **History Management**: Create comprehensive billing history tracking and display systems.
    *   **Invoice Generation**: Build professional invoice generation with proper formatting and branding.
    *   **Download System**: Implement secure invoice download capabilities with proper access controls.
    *   **Tax Integration**: Integrate tax calculation and compliance features for different regions.

4.  **Run Tests & Verify**: 
    *   Test billing history and invoice generation with various subscription and payment scenarios.
    *   Use Playwright to verify invoice download functionality and proper formatting.

**Task: Build subscription analytics**

**Objective**: Create comprehensive analytics for subscription performance, churn rates, and revenue metrics.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide business intelligence about subscription performance to inform strategic decisions.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Metrics Calculation**: Assert that subscription metrics like MRR, churn rate, and LTV are calculated correctly.
    *   **Test Case 2: Analytics Display**: Test that analytics are presented in clear, actionable dashboards and reports.
    *   **Test Case 3: Trend Analysis**: Verify that historical trends and projections are accurately calculated and displayed.
    *   **Test Case 4: Segmentation**: Assert that analytics can be segmented by user type, plan, and other relevant criteria.

3.  **Implement the Task**: 
    *   **Analytics Engine**: Create comprehensive subscription analytics calculation systems.
    *   **Dashboard Creation**: Build executive and operational dashboards for subscription performance monitoring.
    *   **Reporting System**: Implement detailed reporting capabilities with export and sharing options.
    *   **Segmentation Tools**: Create flexible segmentation and filtering capabilities for analytics.

4.  **Run Tests & Verify**: 
    *   Test analytics calculations with various subscription data scenarios and verify accuracy.
    *   Use automated testing to verify analytics dashboard functionality and data presentation.

**Task: Setup trial periods and promotional pricing**

**Objective**: Implement flexible trial period and promotional pricing capabilities to support marketing and user acquisition strategies.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide marketing tools to attract new users and test different pricing strategies.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Trial Management**: Assert that trial periods are properly managed with automatic conversion to paid subscriptions.
    *   **Test Case 2: Promotional Pricing**: Test that promotional pricing is correctly applied and expires according to configured rules.
    *   **Test Case 3: Conversion Tracking**: Verify that trial-to-paid conversions are properly tracked and reported.
    *   **Test Case 4: Feature Access**: Assert that trial users have appropriate access to features and limitations.

3.  **Implement the Task**: 
    *   **Trial System**: Create comprehensive trial period management with automatic conversion capabilities.
    *   **Promotion Engine**: Build flexible promotional pricing systems with various discount types and expiration rules.
    *   **Conversion Management**: Implement smooth trial-to-paid conversion workflows with proper billing transitions.
    *   **Access Control**: Create feature access controls that properly handle trial limitations and conversions.

4.  **Run Tests & Verify**: 
    *   Test trial and promotional pricing scenarios with various configurations and user behaviors.
    *   Use Playwright to verify trial signup and conversion workflows.

**Task: Test subscription flows with Stripe test mode**

**Objective**: Perform comprehensive testing of all subscription-related functionality using Stripe's test environment.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure all subscription functionality works correctly before deploying to production.

2.  **Write Tests (Pre-implementation)**: Design comprehensive test scenarios covering all subscription workflows and edge cases.

3.  **Implement the Task**: Create extensive test suites using Stripe's test payment methods and webhook simulation tools.

4.  **Run Tests & Verify**: Execute comprehensive subscription testing and resolve any issues identified.

#### Day 8 (5 hours)

**Task: Create partnership success fee calculation**

**Objective**: Implement automated calculation and tracking of success fees when investment partnerships are formed through the platform.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Automate the calculation and collection of platform success fees when deals are successfully completed.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Fee Calculation**: Assert that success fees are correctly calculated based on partnership terms and platform fee structure.
    *   **Test Case 2: Fee Allocation**: Test that fees are properly allocated between different parties according to configured rules.
    *   **Test Case 3: Trigger Events**: Verify that fee calculations are triggered by appropriate partnership milestones and events.
    *   **Test Case 4: Adjustment Handling**: Assert that fee adjustments and corrections can be made when necessary.

3.  **Implement the Task**: 
    *   **Calculation Engine**: Create sophisticated fee calculation algorithms that handle various partnership structures.
    *   **Event Integration**: Integrate fee calculations with partnership milestone tracking and event systems.
    *   **Allocation System**: Build flexible fee allocation systems that can handle complex partnership arrangements.
    *   **Adjustment Tools**: Create administrative tools for fee adjustments and corrections when needed.

4.  **Run Tests & Verify**: 
    *   Test fee calculations with various partnership scenarios and verify accuracy.
    *   Use automated testing to verify fee calculation triggers and allocation logic.

**Task: Implement success fee payment processing**

**Objective**: Build secure payment processing for success fees with proper handling of different payment scenarios and parties.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure reliable and secure collection of success fees when partnerships are completed.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Payment Collection**: Assert that success fees are properly collected from the responsible parties.
    *   **Test Case 2: Payment Methods**: Test that various payment methods are supported for success fee payments.
    *   **Test Case 3: Split Payments**: Verify that split payment scenarios are handled correctly when fees are shared.
    *   **Test Case 4: Payment Failures**: Assert that payment failures are handled appropriately with retry logic and notifications.

3.  **Implement the Task**: 
    *   **Payment Processing**: Integrate success fee payment processing with Stripe's payment systems.
    *   **Payment Methods**: Support multiple payment methods including credit cards, ACH, and wire transfers.
    *   **Split Payment Logic**: Implement complex split payment scenarios for shared fee arrangements.
    *   **Failure Handling**: Build robust failure handling and retry systems for payment processing.

4.  **Run Tests & Verify**: 
    *   Test success fee payment processing with various payment scenarios and methods.
    *   Use Stripe's test environment to verify payment processing and error handling.

**Task: Build success fee tracking and reporting**

**Objective**: Create comprehensive tracking and reporting systems for success fee revenue and performance metrics.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide detailed insights into success fee revenue and partnership conversion performance.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Revenue Tracking**: Assert that success fee revenue is accurately tracked and reported over time.
    *   **Test Case 2: Performance Metrics**: Test that partnership conversion rates and success fee performance are properly calculated.
    *   **Test Case 3: Reporting Interface**: Verify that comprehensive reports are available for success fee analysis.
    *   **Test Case 4: Forecasting**: Assert that revenue forecasting based on pipeline data is accurate and useful.

3.  **Implement the Task**: 
    *   **Tracking System**: Create comprehensive success fee tracking with detailed attribution and categorization.
    *   **Analytics Engine**: Build sophisticated analytics for success fee performance and trends.
    *   **Reporting Tools**: Create detailed reporting interfaces with export and sharing capabilities.
    *   **Forecasting Models**: Implement revenue forecasting based on partnership pipeline and historical data.

4.  **Run Tests & Verify**: 
    *   Test success fee tracking and reporting with various revenue scenarios.
    *   Use automated testing to verify analytics calculations and report generation.

**Task: Setup commission splits between platform and referrers**

**Objective**: Implement flexible commission splitting systems that can handle referral partnerships and revenue sharing arrangements.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Enable revenue sharing with partners and referrers to support business development and growth strategies.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Split Calculation**: Assert that commission splits are calculated correctly according to configured rules and agreements.
    *   **Test Case 2: Referrer Tracking**: Test that referrer attribution is properly tracked throughout the partnership lifecycle.
    *   **Test Case 3: Payment Distribution**: Verify that commission payments are distributed correctly to all parties.
    *   **Test Case 4: Reporting**: Assert that commission split reporting is accurate and provides proper attribution.

3.  **Implement the Task**: 
    *   **Split Engine**: Create flexible commission splitting algorithms that handle various partnership arrangements.
    *   **Attribution System**: Build comprehensive referrer tracking and attribution systems.
    *   **Payment Distribution**: Implement automated payment distribution for commission splits.
    *   **Reporting Integration**: Create detailed reporting for commission splits and referrer performance.

4.  **Run Tests & Verify**: 
    *   Test commission splitting with various referrer scenarios and partnership arrangements.
    *   Use automated testing to verify split calculations and payment distribution.

**Task: Create success fee analytics**

**Objective**: Build comprehensive analytics for success fee performance, trends, and optimization opportunities.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide actionable insights for optimizing success fee revenue and partnership performance.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Performance Analytics**: Assert that success fee performance metrics are accurately calculated and displayed.
    *   **Test Case 2: Trend Analysis**: Test that historical trends and patterns are properly identified and visualized.
    *   **Test Case 3: Optimization Insights**: Verify that analytics provide actionable recommendations for performance improvement.
    *   **Test Case 4: Comparative Analysis**: Assert that performance can be compared across different time periods and segments.

3.  **Implement the Task**: 
    *   **Analytics Dashboard**: Create comprehensive analytics dashboards for success fee performance monitoring.
    *   **Trend Analysis**: Build sophisticated trend analysis and pattern recognition capabilities.
    *   **Optimization Engine**: Implement recommendation systems for success fee optimization.
    *   **Comparative Tools**: Create tools for performance comparison and benchmarking.

4.  **Run Tests & Verify**: 
    *   Test success fee analytics with various data scenarios and verify accuracy and usefulness.
    *   Use automated testing to verify analytics calculations and dashboard functionality.

**Task: Test success fee payment flows**

**Objective**: Perform comprehensive testing of all success fee-related payment processing and management functionality.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure all success fee functionality works reliably and accurately in all scenarios.

2.  **Write Tests (Pre-implementation)**: Design comprehensive test scenarios covering all success fee workflows and edge cases.

3.  **Implement the Task**: Create extensive test suites for success fee calculation, payment processing, and reporting.

4.  **Run Tests & Verify**: Execute comprehensive success fee testing and resolve any issues identified.



### Phase 5: Communication & Document Management (10 hours)

#### Day 9 (6 hours)

**Task: Create messaging system between users**

**Objective**: Implement a comprehensive messaging system that enables secure, real-time communication between all user types on the platform.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Build a professional messaging system that facilitates business communications while maintaining security and compliance standards.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Message Creation**: Assert that users can compose and send messages to their connections with proper validation and formatting.
    *   **Test Case 2: Message Delivery**: Test that messages are reliably delivered to recipients and marked as delivered in the system.
    *   **Test Case 3: Message Security**: Verify that messages are properly encrypted and only accessible to intended recipients.
    *   **Test Case 4: Message Threading**: Assert that message conversations are properly threaded and organized for easy navigation.

3.  **Implement the Task**: 
    *   **Message Infrastructure**: Create comprehensive messaging infrastructure using Supabase real-time capabilities.
    *   **Security Implementation**: Implement end-to-end encryption and proper access controls for message security.
    *   **Threading System**: Build sophisticated message threading and conversation management systems.
    *   **Delivery Tracking**: Create reliable message delivery tracking and confirmation systems.

4.  **Run Tests & Verify**: 
    *   Test messaging functionality between different user types and verify security and delivery.
    *   Use Playwright to automate messaging workflows and verify real-time functionality.

**Task: Build message thread interface**

**Objective**: Create an intuitive and efficient user interface for managing message conversations and threads.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide a user-friendly interface that makes professional communication efficient and organized.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Thread Display**: Assert that message threads are displayed in chronological order with proper formatting and user identification.
    *   **Test Case 2: Navigation**: Test that users can easily navigate between different conversations and message threads.
    *   **Test Case 3: Message Composition**: Verify that the message composition interface is intuitive and supports rich text formatting.
    *   **Test Case 4: Search Functionality**: Assert that users can search through their message history effectively.

3.  **Implement the Task**: 
    *   **Interface Design**: Create intuitive message thread interfaces with modern design patterns and responsive layouts.
    *   **Navigation System**: Build efficient navigation systems for managing multiple conversations simultaneously.
    *   **Composition Tools**: Implement rich text editing capabilities with professional formatting options.
    *   **Search Integration**: Create comprehensive search functionality across all message content and metadata.

4.  **Run Tests & Verify**: 
    *   Test message thread interfaces with various conversation scenarios and user interactions.
    *   Use Playwright to verify interface responsiveness and search functionality.

**Task: Implement real-time messaging with Supabase**

**Objective**: Integrate Supabase real-time capabilities to provide instant message delivery and live conversation updates.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure that messaging feels instantaneous and responsive, similar to modern messaging applications.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Real-time Delivery**: Assert that messages appear instantly in recipient interfaces without requiring page refresh.
    *   **Test Case 2: Presence Indicators**: Test that online/offline status and typing indicators work correctly.
    *   **Test Case 3: Connection Handling**: Verify that connection interruptions are handled gracefully with proper reconnection logic.
    *   **Test Case 4: Performance**: Assert that real-time messaging performs well under various network conditions and user loads.

3.  **Implement the Task**: 
    *   **Real-time Integration**: Implement comprehensive Supabase real-time subscriptions for messaging functionality.
    *   **Presence System**: Build user presence tracking and status indicator systems.
    *   **Connection Management**: Create robust connection management with automatic reconnection and error handling.
    *   **Performance Optimization**: Implement efficient data synchronization and caching for optimal performance.

4.  **Run Tests & Verify**: 
    *   Test real-time messaging functionality under various network conditions and user scenarios.
    *   Use automated testing to verify real-time synchronization and connection handling.

**Task: Create notification system (email + in-app)**

**Objective**: Build a comprehensive notification system that keeps users informed about important messages and activities through multiple channels.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure users never miss important communications while providing control over notification preferences.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Notification Triggers**: Assert that appropriate notifications are sent for various message and activity types.
    *   **Test Case 2: Multi-channel Delivery**: Test that notifications are delivered through both in-app and email channels as configured.
    *   **Test Case 3: Preference Management**: Verify that users can customize their notification preferences and frequency settings.
    *   **Test Case 4: Delivery Tracking**: Assert that notification delivery is tracked and failures are handled appropriately.

3.  **Implement the Task**: 
    *   **Notification Engine**: Create a flexible notification system that supports multiple triggers and delivery channels.
    *   **Template Management**: Build customizable notification templates for different message types and scenarios.
    *   **Preference System**: Implement comprehensive user preference management for notification customization.
    *   **Delivery Infrastructure**: Create reliable notification delivery systems with proper error handling and retry logic.

4.  **Run Tests & Verify**: 
    *   Test notification delivery across various scenarios and user preference configurations.
    *   Use automated testing to verify notification triggers and multi-channel delivery.

**Task: Build message search and filtering**

**Objective**: Implement powerful search and filtering capabilities that help users find specific messages and conversations quickly.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Enable users to efficiently locate specific messages and conversations from their communication history.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Text Search**: Assert that full-text search works across all message content and returns relevant results.
    *   **Test Case 2: Advanced Filtering**: Test that users can filter messages by date, sender, conversation, and other criteria.
    *   **Test Case 3: Search Performance**: Verify that search functionality performs well with large message histories.
    *   **Test Case 4: Result Presentation**: Assert that search results are presented clearly with proper context and highlighting.

3.  **Implement the Task**: 
    *   **Search Engine**: Implement comprehensive full-text search capabilities using PostgreSQL search features.
    *   **Filtering System**: Build advanced filtering options with multiple criteria and logical operators.
    *   **Performance Optimization**: Create efficient indexing and caching strategies for fast search performance.
    *   **Results Interface**: Design clear and useful search result presentation with context and navigation.

4.  **Run Tests & Verify**: 
    *   Test search and filtering functionality with large datasets and complex queries.
    *   Use Playwright to verify search interface usability and result accuracy.

**Task: Setup message attachments and document sharing**

**Objective**: Enable users to share documents and files securely through the messaging system.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Facilitate business document sharing while maintaining security and access controls.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: File Upload**: Assert that users can attach various file types to messages with proper validation.
    *   **Test Case 2: Security Controls**: Test that file access is properly controlled and limited to message participants.
    *   **Test Case 3: File Management**: Verify that attached files can be downloaded, previewed, and managed effectively.
    *   **Test Case 4: Storage Integration**: Assert that file storage and retrieval work reliably with proper error handling.

3.  **Implement the Task**: 
    *   **Upload System**: Create secure file upload capabilities with comprehensive validation and virus scanning.
    *   **Access Control**: Implement proper access controls that limit file access to authorized message participants.
    *   **File Management**: Build file management interfaces with preview, download, and organization capabilities.
    *   **Storage Integration**: Integrate with Supabase Storage for reliable and secure file storage and retrieval.

4.  **Run Tests & Verify**: 
    *   Test file attachment and sharing functionality with various file types and security scenarios.
    *   Use Playwright to verify file upload, download, and access control functionality.

**Task: Create conversation management**

**Objective**: Build comprehensive tools for organizing and managing message conversations and communication history.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Help users organize their communications effectively for better productivity and relationship management.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Conversation Organization**: Assert that users can organize conversations into folders, categories, or tags.
    *   **Test Case 2: Archive Functionality**: Test that users can archive old conversations while maintaining searchability.
    *   **Test Case 3: Conversation Settings**: Verify that users can configure conversation-specific settings like notifications and access.
    *   **Test Case 4: Bulk Operations**: Assert that users can perform bulk operations on multiple conversations efficiently.

3.  **Implement the Task**: 
    *   **Organization System**: Create flexible conversation organization tools with folders, tags, and categories.
    *   **Archive Management**: Build comprehensive archiving systems that maintain accessibility while reducing clutter.
    *   **Settings Management**: Implement conversation-specific settings and preference management.
    *   **Bulk Operations**: Create efficient bulk operation tools for conversation management.

4.  **Run Tests & Verify**: 
    *   Test conversation management features with various organizational scenarios and user workflows.
    *   Use Playwright to verify bulk operations and organizational tool functionality.

**Task: Test messaging functionality**

**Objective**: Perform comprehensive end-to-end testing of all messaging system components and workflows.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure the complete messaging system works reliably and provides excellent user experience.

2.  **Write Tests (Pre-implementation)**: Design comprehensive test scenarios covering all messaging features and user interactions.

3.  **Implement the Task**: Create extensive test suites for all messaging functionality including real-time features.

4.  **Run Tests & Verify**: Execute comprehensive messaging system testing and resolve any issues identified.

#### Day 9 (4 hours)

**Task: Create secure data room functionality**

**Objective**: Implement secure virtual data rooms that allow controlled access to confidential investment documents and materials.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide enterprise-grade document security and access control for sensitive investment materials.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Data Room Creation**: Assert that sponsors can create secure data rooms with proper configuration and access controls.
    *   **Test Case 2: Access Management**: Test that access permissions are properly enforced and can be granted or revoked as needed.
    *   **Test Case 3: Document Security**: Verify that documents are properly protected with watermarking, download restrictions, and access logging.
    *   **Test Case 4: Audit Trail**: Assert that all data room activities are logged for compliance and security auditing.

3.  **Implement the Task**: 
    *   **Data Room Infrastructure**: Create secure data room infrastructure with enterprise-grade security controls.
    *   **Access Control System**: Build comprehensive access management with role-based permissions and time-limited access.
    *   **Security Features**: Implement document watermarking, download restrictions, and view-only access controls.
    *   **Audit System**: Create comprehensive activity logging and audit trail capabilities for compliance requirements.

4.  **Run Tests & Verify**: 
    *   Test data room security features with various access scenarios and user types.
    *   Use automated testing to verify access controls and security enforcement.

**Task: Build document upload and organization system**

**Objective**: Create comprehensive document management capabilities within data rooms for efficient organization and access.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide sophisticated document organization tools that make it easy to manage complex investment documentation.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Document Upload**: Assert that various document types can be uploaded with proper validation and processing.
    *   **Test Case 2: Organization Tools**: Test that documents can be organized into folders, categories, and hierarchical structures.
    *   **Test Case 3: Metadata Management**: Verify that document metadata is properly managed and searchable.
    *   **Test Case 4: Version Control**: Assert that document versions are properly tracked and managed.

3.  **Implement the Task**: 
    *   **Upload System**: Create robust document upload capabilities with support for various file types and sizes.
    *   **Organization Tools**: Build sophisticated folder structures and categorization systems for document organization.
    *   **Metadata System**: Implement comprehensive metadata management with custom fields and search capabilities.
    *   **Version Control**: Create document version tracking and management systems for maintaining document history.

4.  **Run Tests & Verify**: 
    *   Test document upload and organization features with various document types and organizational structures.
    *   Use Playwright to verify document management workflows and organization tools.

**Task: Implement access control and permissions**

**Objective**: Build granular access control systems that provide precise control over who can access specific documents and data rooms.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure that sensitive documents are only accessible to authorized parties with appropriate permissions.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Permission Levels**: Assert that different permission levels (view, download, admin) are properly enforced.
    *   **Test Case 2: User Management**: Test that users can be added and removed from data rooms with appropriate permissions.
    *   **Test Case 3: Time-based Access**: Verify that time-limited access permissions work correctly and expire as configured.
    *   **Test Case 4: Inheritance Rules**: Assert that permission inheritance and override rules work correctly in hierarchical structures.

3.  **Implement the Task**: 
    *   **Permission System**: Create comprehensive permission management with multiple access levels and granular controls.
    *   **User Management**: Build user invitation and management systems for data room access.
    *   **Time Controls**: Implement time-based access controls with automatic expiration and renewal capabilities.
    *   **Inheritance Logic**: Create sophisticated permission inheritance and override systems for complex access scenarios.

4.  **Run Tests & Verify**: 
    *   Test access control systems with various permission scenarios and user combinations.
    *   Use automated testing to verify permission enforcement and inheritance rules.

**Task: Create NDA signing workflow**

**Objective**: Implement digital NDA signing capabilities that ensure legal compliance before granting access to confidential materials.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure legal protection for confidential information through proper NDA execution and tracking.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: NDA Presentation**: Assert that NDAs are properly presented to users before data room access.
    *   **Test Case 2: Digital Signing**: Test that digital signing functionality works correctly with proper authentication and validation.
    *   **Test Case 3: Access Enforcement**: Verify that data room access is properly restricted until NDAs are signed.
    *   **Test Case 4: Legal Compliance**: Assert that signed NDAs are properly stored and tracked for legal compliance.

3.  **Implement the Task**: 
    *   **NDA Management**: Create comprehensive NDA template management and customization capabilities.
    *   **Digital Signing**: Integrate digital signature capabilities with proper authentication and legal validity.
    *   **Access Integration**: Connect NDA signing to data room access controls for automatic permission management.
    *   **Compliance Tracking**: Build comprehensive tracking and storage systems for signed NDAs and legal compliance.

4.  **Run Tests & Verify**: 
    *   Test NDA signing workflows with various user scenarios and legal requirements.
    *   Use Playwright to verify the complete NDA signing and access control integration.

**Task: Build document tracking and analytics**

**Objective**: Implement comprehensive tracking and analytics for document access and user engagement within data rooms.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide sponsors with insights into investor engagement and document performance for better deal management.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Access Tracking**: Assert that all document access is properly tracked with user identification and timestamps.
    *   **Test Case 2: Engagement Analytics**: Test that user engagement metrics are accurately calculated and displayed.
    *   **Test Case 3: Document Performance**: Verify that document-specific analytics show which materials are most accessed and engaging.
    *   **Test Case 4: Reporting**: Assert that comprehensive reports can be generated for document access and user engagement.

3.  **Implement the Task**: 
    *   **Tracking System**: Create comprehensive document access tracking with detailed logging and attribution.
    *   **Analytics Engine**: Build sophisticated analytics calculations for user engagement and document performance.
    *   **Reporting Tools**: Create detailed reporting interfaces with export capabilities and customizable views.
    *   **Real-time Monitoring**: Implement real-time monitoring dashboards for active data room engagement.

4.  **Run Tests & Verify**: 
    *   Test document tracking and analytics with various access patterns and user behaviors.
    *   Use automated testing to verify analytics calculations and reporting accuracy.

**Task: Setup watermarking for sensitive documents**

**Objective**: Implement document watermarking capabilities to protect sensitive materials and track document distribution.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide additional security for sensitive documents through watermarking and distribution tracking.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Watermark Application**: Assert that watermarks are properly applied to documents with user identification and timestamps.
    *   **Test Case 2: Dynamic Watermarking**: Test that watermarks are dynamically generated for each user and access session.
    *   **Test Case 3: Document Integrity**: Verify that watermarked documents maintain their original quality and readability.
    *   **Test Case 4: Security Enforcement**: Assert that watermarking cannot be easily removed or bypassed by users.

3.  **Implement the Task**: 
    *   **Watermarking Engine**: Create sophisticated document watermarking capabilities with dynamic content generation.
    *   **User Attribution**: Build user-specific watermarking that includes identification and access tracking information.
    *   **Quality Preservation**: Implement watermarking that maintains document quality while providing security.
    *   **Security Measures**: Create robust watermarking that resists removal attempts and provides reliable tracking.

4.  **Run Tests & Verify**: 
    *   Test watermarking functionality with various document types and user scenarios.
    *   Use automated testing to verify watermark application and security enforcement.

**Task: Test data room access and security**

**Objective**: Perform comprehensive security testing of all data room functionality to ensure enterprise-grade protection.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure data room security meets enterprise standards and protects sensitive investment information.

2.  **Write Tests (Pre-implementation)**: Design comprehensive security test scenarios covering all access controls and protection mechanisms.

3.  **Implement the Task**: Create extensive security test suites including penetration testing and access control validation.

4.  **Run Tests & Verify**: Execute comprehensive security testing and resolve any vulnerabilities identified.

### Phase 6: Analytics & Final Features (5 hours)

#### Day 10 (3 hours)

**Task: Create user analytics dashboard**

**Objective**: Build comprehensive analytics dashboards that provide users with insights into their platform activity and performance.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide users with actionable insights about their platform usage and business outcomes.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Dashboard Rendering**: Assert that analytics dashboards render correctly with appropriate data visualizations.
    *   **Test Case 2: Data Accuracy**: Test that analytics calculations are accurate and reflect actual user activity.
    *   **Test Case 3: Personalization**: Verify that dashboards are personalized based on user role and preferences.
    *   **Test Case 4: Interactive Features**: Assert that users can interact with charts and drill down into detailed data.

3.  **Implement the Task**: 
    *   **Dashboard Framework**: Create comprehensive analytics dashboard framework with role-based customization.
    *   **Data Processing**: Build efficient data processing and aggregation systems for analytics calculations.
    *   **Visualization Components**: Implement interactive charts and graphs using modern visualization libraries.
    *   **Personalization Engine**: Create personalization systems that adapt dashboards to user needs and preferences.

4.  **Run Tests & Verify**: 
    *   Test analytics dashboards with various user roles and data scenarios.
    *   Use Playwright to verify dashboard interactivity and data accuracy.

**Task: Build opportunity performance tracking**

**Objective**: Implement comprehensive tracking and analytics for investment opportunity performance and investor engagement.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Help sponsors understand how their opportunities are performing and optimize their presentations.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Performance Metrics**: Assert that key performance indicators are accurately calculated and displayed.
    *   **Test Case 2: Trend Analysis**: Test that performance trends over time are properly tracked and visualized.
    *   **Test Case 3: Comparative Analysis**: Verify that opportunities can be compared against each other and industry benchmarks.
    *   **Test Case 4: Predictive Insights**: Assert that predictive analytics provide useful insights for opportunity optimization.

3.  **Implement the Task**: 
    *   **Performance Engine**: Create comprehensive performance tracking systems with multiple KPIs and metrics.
    *   **Trend Analysis**: Build sophisticated trend analysis capabilities with historical data processing.
    *   **Comparison Tools**: Implement comparative analysis tools for opportunity benchmarking.
    *   **Predictive Analytics**: Create predictive models for opportunity performance forecasting.

4.  **Run Tests & Verify**: 
    *   Test opportunity performance tracking with various opportunity types and performance scenarios.
    *   Use automated testing to verify analytics accuracy and predictive model performance.

**Task: Implement platform usage analytics**

**Objective**: Build comprehensive analytics for overall platform usage patterns and user engagement metrics.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide platform administrators with insights into user behavior and platform performance.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Usage Tracking**: Assert that all platform usage is properly tracked and categorized.
    *   **Test Case 2: Engagement Metrics**: Test that user engagement metrics are accurately calculated and meaningful.
    *   **Test Case 3: Behavioral Analysis**: Verify that user behavior patterns are identified and analyzed effectively.
    *   **Test Case 4: Performance Monitoring**: Assert that platform performance metrics are tracked and reported.

3.  **Implement the Task**: 
    *   **Usage Tracking**: Create comprehensive usage tracking systems with detailed event logging and categorization.
    *   **Engagement Analytics**: Build sophisticated engagement analysis with multiple metrics and scoring systems.
    *   **Behavioral Analysis**: Implement user behavior analysis with pattern recognition and segmentation.
    *   **Performance Monitoring**: Create platform performance monitoring with real-time alerts and reporting.

4.  **Run Tests & Verify**: 
    *   Test platform usage analytics with various user behavior patterns and usage scenarios.
    *   Use automated testing to verify tracking accuracy and analytics calculations.

**Task: Create conversion funnel analysis**

**Objective**: Implement detailed conversion funnel tracking to understand user journeys and optimize conversion rates.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Identify bottlenecks in user conversion processes and optimize platform effectiveness.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Funnel Definition**: Assert that conversion funnels are properly defined and tracked for different user journeys.
    *   **Test Case 2: Step Tracking**: Test that each step in conversion funnels is accurately tracked and measured.
    *   **Test Case 3: Drop-off Analysis**: Verify that funnel drop-off points are identified and analyzed for optimization opportunities.
    *   **Test Case 4: Optimization Insights**: Assert that funnel analysis provides actionable insights for conversion improvement.

3.  **Implement the Task**: 
    *   **Funnel Framework**: Create comprehensive funnel tracking framework with flexible funnel definition capabilities.
    *   **Step Tracking**: Build detailed step tracking with proper attribution and timing analysis.
    *   **Analysis Engine**: Implement sophisticated funnel analysis with drop-off identification and optimization recommendations.
    *   **Visualization Tools**: Create clear funnel visualization tools with interactive analysis capabilities.

4.  **Run Tests & Verify**: 
    *   Test conversion funnel analysis with various user journey scenarios and conversion patterns.
    *   Use automated testing to verify funnel tracking accuracy and analysis quality.

**Task: Setup ROI and performance metrics**

**Objective**: Implement comprehensive ROI tracking and performance measurement systems for platform effectiveness.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Measure platform ROI and performance to demonstrate value and guide strategic decisions.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: ROI Calculation**: Assert that ROI calculations are accurate and based on appropriate metrics and timeframes.
    *   **Test Case 2: Performance Benchmarking**: Test that performance metrics are properly benchmarked against industry standards.
    *   **Test Case 3: Value Attribution**: Verify that value creation is properly attributed to platform features and activities.
    *   **Test Case 4: Reporting Integration**: Assert that ROI and performance metrics are integrated into comprehensive reporting systems.

3.  **Implement the Task**: 
    *   **ROI Engine**: Create sophisticated ROI calculation systems with multiple measurement approaches.
    *   **Benchmarking System**: Build performance benchmarking capabilities with industry data integration.
    *   **Attribution Models**: Implement value attribution models that properly credit platform contributions.
    *   **Reporting Integration**: Connect ROI metrics to comprehensive reporting and dashboard systems.

4.  **Run Tests & Verify**: 
    *   Test ROI and performance metrics with various business scenarios and measurement periods.
    *   Use automated testing to verify calculation accuracy and reporting integration.

**Task: Build custom reporting features**

**Objective**: Create flexible reporting capabilities that allow users to generate custom reports for their specific needs.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide users with powerful reporting tools that can adapt to their unique business requirements.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Report Builder**: Assert that users can create custom reports using an intuitive report builder interface.
    *   **Test Case 2: Data Selection**: Test that users can select and filter data sources for their custom reports.
    *   **Test Case 3: Visualization Options**: Verify that multiple visualization options are available for custom reports.
    *   **Test Case 4: Export Capabilities**: Assert that custom reports can be exported in various formats for external use.

3.  **Implement the Task**: 
    *   **Report Builder**: Create intuitive report building interfaces with drag-and-drop functionality and flexible configuration.
    *   **Data Integration**: Build comprehensive data integration that allows access to all relevant platform data.
    *   **Visualization Engine**: Implement flexible visualization capabilities with multiple chart types and customization options.
    *   **Export System**: Create robust export capabilities supporting multiple formats and delivery methods.

4.  **Run Tests & Verify**: 
    *   Test custom reporting features with various report configurations and data scenarios.
    *   Use Playwright to verify report builder functionality and export capabilities.

**Task: Test analytics functionality**

**Objective**: Perform comprehensive testing of all analytics and reporting functionality to ensure accuracy and reliability.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure all analytics features provide accurate, reliable, and actionable insights.

2.  **Write Tests (Pre-implementation)**: Design comprehensive test scenarios covering all analytics features and calculation methods.

3.  **Implement the Task**: Create extensive test suites for analytics accuracy, performance, and usability.

4.  **Run Tests & Verify**: Execute comprehensive analytics testing and resolve any issues identified.

#### Day 10 (2 hours)

**Task: Comprehensive testing of all features**

**Objective**: Perform end-to-end testing of the complete DealRoom Network application to ensure all features work together seamlessly.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Verify that the complete application functions correctly as an integrated system.

2.  **Write Tests (Pre-implementation)**: Design comprehensive integration test scenarios that cover all major user workflows and feature interactions.

3.  **Implement the Task**: Create extensive integration test suites using Playwright that simulate real user scenarios across all platform features.

4.  **Run Tests & Verify**: Execute comprehensive system testing and resolve any integration issues identified.

**Task: Performance optimization and caching**

**Objective**: Optimize application performance through caching strategies, query optimization, and resource management.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure the application performs well under expected load conditions and provides excellent user experience.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Load Performance**: Assert that the application performs well under expected user loads and data volumes.
    *   **Test Case 2: Caching Effectiveness**: Test that caching strategies effectively improve performance without compromising data accuracy.
    *   **Test Case 3: Resource Optimization**: Verify that resource usage is optimized for efficient server and client performance.
    *   **Test Case 4: Scalability**: Assert that the application can scale to handle increased usage and data growth.

3.  **Implement the Task**: 
    *   **Performance Analysis**: Conduct comprehensive performance analysis to identify optimization opportunities.
    *   **Caching Implementation**: Implement strategic caching at multiple levels including database, API, and client-side caching.
    *   **Query Optimization**: Optimize database queries and API endpoints for maximum efficiency.
    *   **Resource Management**: Implement efficient resource management for images, documents, and other assets.

4.  **Run Tests & Verify**: 
    *   Test application performance under various load conditions and verify optimization effectiveness.
    *   Use performance testing tools to validate scalability and resource efficiency.

**Task: Security audit and testing**

**Objective**: Conduct comprehensive security testing to ensure the application meets enterprise security standards.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure the application is secure against common vulnerabilities and meets industry security standards.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Authentication Security**: Assert that authentication systems are secure against common attack vectors.
    *   **Test Case 2: Authorization Controls**: Test that authorization controls properly restrict access to sensitive features and data.
    *   **Test Case 3: Data Protection**: Verify that sensitive data is properly encrypted and protected throughout the system.
    *   **Test Case 4: Input Validation**: Assert that all user inputs are properly validated and sanitized to prevent injection attacks.

3.  **Implement the Task**: 
    *   **Security Assessment**: Conduct comprehensive security assessment including automated vulnerability scanning.
    *   **Penetration Testing**: Perform penetration testing to identify potential security weaknesses.
    *   **Code Review**: Conduct security-focused code review to identify potential vulnerabilities in the application code.
    *   **Compliance Verification**: Verify compliance with relevant security standards and regulations.

4.  **Run Tests & Verify**: 
    *   Execute comprehensive security testing and resolve any vulnerabilities identified.
    *   Verify that security controls are properly implemented and effective.

**Task: Setup production environment variables**

**Objective**: Configure all necessary environment variables and settings for production deployment.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure the application is properly configured for production deployment with appropriate security and performance settings.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Configuration Completeness**: Assert that all required environment variables are properly set for production.
    *   **Test Case 2: Security Settings**: Test that production security settings are properly configured and enforced.
    *   **Test Case 3: Performance Configuration**: Verify that production performance settings are optimized for expected usage.
    *   **Test Case 4: Integration Settings**: Assert that all external service integrations are properly configured for production.

3.  **Implement the Task**: 
    *   **Environment Setup**: Configure all production environment variables including database connections, API keys, and service configurations.
    *   **Security Configuration**: Implement production security settings including SSL certificates, CORS policies, and access controls.
    *   **Performance Settings**: Configure production performance settings including caching, CDN, and optimization parameters.
    *   **Integration Configuration**: Set up all external service integrations for production including payment processing, email services, and analytics.

4.  **Run Tests & Verify**: 
    *   Verify that all production configurations are properly set and functional.
    *   Test production environment setup with staging deployment to ensure everything works correctly.

**Task: Deploy to Vercel with CI/CD**

**Objective**: Deploy the application to Vercel with automated CI/CD pipeline for continuous deployment.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Establish automated deployment pipeline that ensures reliable and consistent deployments.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Deployment Process**: Assert that the deployment process completes successfully without errors.
    *   **Test Case 2: Application Functionality**: Test that the deployed application functions correctly in the production environment.
    *   **Test Case 3: CI/CD Pipeline**: Verify that the CI/CD pipeline properly runs tests and deploys only when all tests pass.
    *   **Test Case 4: Rollback Capability**: Assert that rollback capabilities work correctly in case of deployment issues.

3.  **Implement the Task**: 
    *   **Vercel Configuration**: Configure Vercel deployment settings including build commands, environment variables, and domain configuration.
    *   **CI/CD Setup**: Set up automated CI/CD pipeline with GitHub Actions or similar tools for continuous deployment.
    *   **Testing Integration**: Integrate automated testing into the deployment pipeline to ensure quality control.
    *   **Monitoring Setup**: Configure deployment monitoring and alerting to track deployment success and application health.

4.  **Run Tests & Verify**: 
    *   Execute deployment process and verify successful deployment to production environment.
    *   Test CI/CD pipeline with code changes to ensure automated deployment works correctly.

**Task: Setup monitoring and error tracking**

**Objective**: Implement comprehensive monitoring and error tracking to ensure application reliability and performance in production.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Provide comprehensive visibility into application performance and quickly identify and resolve issues.

2.  **Write Tests (Pre-implementation)**:
    *   **Test Case 1: Error Tracking**: Assert that errors are properly captured and reported through monitoring systems.
    *   **Test Case 2: Performance Monitoring**: Test that performance metrics are accurately tracked and reported.
    *   **Test Case 3: Alerting System**: Verify that alerts are properly configured and triggered for critical issues.
    *   **Test Case 4: Dashboard Integration**: Assert that monitoring data is properly integrated into operational dashboards.

3.  **Implement the Task**: 
    *   **Error Tracking**: Integrate comprehensive error tracking using Sentry or similar tools for real-time error monitoring.
    *   **Performance Monitoring**: Set up performance monitoring with Vercel Analytics and other tools for comprehensive performance tracking.
    *   **Alerting Configuration**: Configure intelligent alerting systems that notify the team of critical issues without creating alert fatigue.
    *   **Dashboard Creation**: Create operational dashboards that provide real-time visibility into application health and performance.

4.  **Run Tests & Verify**: 
    *   Test monitoring and error tracking systems to ensure they properly capture and report issues.
    *   Verify that alerting systems work correctly and provide timely notifications.

**Task: Final quality assurance testing**

**Objective**: Perform final comprehensive quality assurance testing to ensure the application is ready for production use.

**Detailed Steps (TDD Approach)**:

1.  **Understand the Goal**: Ensure the complete application meets all quality standards and is ready for user adoption.

2.  **Write Tests (Pre-implementation)**: Design comprehensive QA test scenarios covering all functionality, user workflows, and edge cases.

3.  **Implement the Task**: Execute comprehensive quality assurance testing including functional testing, usability testing, performance testing, and security testing.

4.  **Run Tests & Verify**: Complete all QA testing and resolve any issues identified to ensure production readiness.

## 7. Environment Variables & Configuration

### 7.1 Required Environment Variables

The DealRoom Network application requires comprehensive environment variable configuration to ensure proper functionality across all integrated services and features. These variables must be carefully configured for each deployment environment (development, staging, and production) with appropriate security measures and access controls.

**Database Configuration Variables**

The database configuration forms the foundation of the application's data management capabilities. The `NEXT_PUBLIC_SUPABASE_URL` variable specifies the endpoint for the Supabase project, while `NEXT_PUBLIC_SUPABASE_ANON_KEY` provides the anonymous access key for client-side operations. The `SUPABASE_SERVICE_ROLE_KEY` enables server-side operations with elevated privileges and must be kept strictly confidential. The `DATABASE_URL` provides direct PostgreSQL access for advanced database operations and migrations.

**Authentication and Security Variables**

Authentication security relies on properly configured secret keys and URLs. The `NEXTAUTH_SECRET` provides cryptographic security for session management and must be a strong, randomly generated value. The `NEXTAUTH_URL` specifies the canonical URL for the application and is crucial for proper authentication redirects and callbacks.

**Payment Processing Configuration**

Stripe integration requires both publishable and secret keys for different operational contexts. The `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` enables client-side payment form functionality, while `STRIPE_SECRET_KEY` provides server-side payment processing capabilities. The `STRIPE_WEBHOOK_SECRET` ensures secure webhook communication between Stripe and the application.

**Communication and Notification Services**

Email communication relies on the `RESEND_API_KEY` for transactional email delivery, with `FROM_EMAIL` specifying the sender address for all automated communications. These services are critical for user onboarding, notifications, and business communications.

**File Management and Storage**

File upload and storage configuration includes `MAX_FILE_SIZE` to control upload limits and `ALLOWED_FILE_TYPES` to specify permitted file formats. These settings ensure proper resource management and security for document handling within data rooms and opportunity materials.

**Application Configuration**

Core application settings include `APP_NAME` for branding consistency, `APP_URL` for canonical URL references, and `SUPPORT_EMAIL` for user support communications. These variables ensure consistent application behavior and user experience.

**Third-Party Service Integration**

External service integration requires various API keys including `GOOGLE_MAPS_API_KEY` for address validation, `ZOOM_SDK_KEY` and `ZOOM_SDK_SECRET` for video conferencing integration, and analytics keys like `GOOGLE_ANALYTICS_ID` and `MIXPANEL_TOKEN` for user behavior tracking.

**Security and Encryption**

Advanced security features require `ENCRYPTION_KEY` for data encryption and `JWT_SECRET` for token security. These keys must be properly generated and securely managed across all environments.

**Feature Control**

Feature flags like `ENABLE_ZOOM_INTEGRATION`, `ENABLE_ADVANCED_ANALYTICS`, and `ENABLE_WHITE_LABEL` provide flexible control over application functionality and can be used to gradually roll out new features or customize deployments for different client needs.

### 7.2 Next.js Configuration

The Next.js configuration file serves as the central control point for application behavior, performance optimization, and integration settings. This configuration must be carefully tuned to support the complex requirements of the DealRoom Network platform while maintaining optimal performance and security.

**Experimental Features Configuration**

The application leverages Next.js 14's App Router architecture, which requires enabling experimental features through the configuration. This modern routing approach provides enhanced performance, better developer experience, and improved SEO capabilities that are essential for a professional B2B platform.

**Image Optimization and CDN Integration**

Image handling configuration is critical for performance and user experience. The configuration specifies allowed domains for image optimization, including Supabase storage domains for user-uploaded content. Remote patterns are configured to handle dynamic image URLs from Supabase storage while maintaining security through proper domain restrictions.

**CORS and API Security**

Cross-Origin Resource Sharing (CORS) headers are configured to enable secure API access while preventing unauthorized cross-origin requests. The configuration includes specific headers for API routes that support the application's authentication and data access patterns while maintaining security best practices.

**Performance and Caching Optimization**

The configuration includes performance optimizations such as static generation settings, caching strategies, and build optimizations that ensure fast page loads and efficient resource utilization. These settings are particularly important for a data-intensive application like DealRoom Network.

### 7.3 TypeScript Configuration

The TypeScript configuration ensures type safety, developer productivity, and code quality throughout the application development process. This configuration is specifically tuned for Next.js 14 with App Router and includes path mapping for clean imports and efficient development workflows.

**Compiler Options and Target Configuration**

The TypeScript compiler is configured to target ES5 for broad browser compatibility while enabling modern JavaScript features through appropriate library inclusions. The configuration supports both DOM and ES6 features necessary for modern web application development.

**Module Resolution and Path Mapping**

Path mapping configuration enables clean, absolute imports throughout the application codebase. This includes mappings for components, libraries, types, and other application modules, making the codebase more maintainable and reducing import complexity.

**Development and Build Optimization**

The configuration includes settings for incremental compilation, source map generation, and build optimization that enhance both development experience and production performance. These settings ensure fast development cycles while maintaining production-ready code quality.

## 8. References and Citations

The development of this comprehensive Product Requirements Document has been informed by industry best practices, technical documentation, and established methodologies for modern web application development. The following references provide additional context and detailed information for the approaches and technologies outlined in this document.

[1] Anthropic Claude Code CLI Documentation. Available at: https://docs.anthropic.com/en/docs/claude-code/overview

[2] Ritza. "Automated Browser Testing for AI Development with Browserbase and Claude Code Agents." Available at: https://ritza.co/articles/automated-browser-testing-for-ai-development-with-browserbase-and-claude-code-agents/

The comprehensive nature of this PRD ensures that developers working with Claude Code CLI have detailed, step-by-step instructions for every aspect of the DealRoom Network development process. The Test-Driven Development approach integrated throughout ensures high code quality and reliability, while the automated frontend testing workflow provides the infrastructure necessary for continuous quality assurance and rapid development cycles.

This document serves as both a technical specification and a practical guide, enabling even novice developers to successfully implement a sophisticated B2B platform with enterprise-grade features and capabilities. The detailed task breakdowns, combined with the comprehensive testing strategies, provide the foundation for successful project completion within the specified timeline and budget constraints.

