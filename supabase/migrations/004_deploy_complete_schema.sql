-- Complete DealRoom Network Database Schema Deployment
-- This file combines all required migrations for direct execution
-- Run this in the Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables if they exist (for clean deployment)
DROP TABLE IF EXISTS data_room_documents CASCADE;
DROP TABLE IF EXISTS data_room_access CASCADE;
DROP TABLE IF EXISTS data_rooms CASCADE;
DROP TABLE IF EXISTS subscription_payments CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS professional_connections CASCADE;
DROP TABLE IF EXISTS investment_partnerships CASCADE;
DROP TABLE IF EXISTS investment_inquiries CASCADE;
DROP TABLE IF EXISTS opportunity_views CASCADE;
DROP TABLE IF EXISTS opportunity_bookmarks CASCADE;
DROP TABLE IF EXISTS opportunity_documents CASCADE;
DROP TABLE IF EXISTS investment_opportunities CASCADE;
DROP TABLE IF EXISTS service_provider_profiles CASCADE;
DROP TABLE IF EXISTS capital_partner_profiles CASCADE;
DROP TABLE IF EXISTS deal_sponsor_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS opportunity_status CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;

-- Create enums
CREATE TYPE opportunity_status AS ENUM (
  'draft',
  'fundraising',
  'due_diligence',
  'funded',
  'closed',
  'cancelled'
);

CREATE TYPE property_type AS ENUM (
  'multifamily',
  'retail',
  'office',
  'industrial',
  'land',
  'mixed_use'
);

CREATE TYPE document_type AS ENUM (
  'offering-memorandum',
  'financial-projections',
  'property-images',
  'additional-documents'
);

-- Users table with authentication (extending auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
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
  license_type VARCHAR,
  years_experience INTEGER NOT NULL,
  
  -- Company details
  business_address JSONB NOT NULL,
  business_entity_type VARCHAR,
  duns_number VARCHAR,
  ein_number VARCHAR,
  
  -- Track record
  deals_completed INTEGER DEFAULT 0,
  total_capital_raised DECIMAL DEFAULT 0,
  total_deal_volume DECIMAL DEFAULT 0,
  average_deal_size DECIMAL,
  successful_exit_count INTEGER DEFAULT 0,
  
  -- Investment focus
  preferred_property_types TEXT[],
  preferred_investment_types TEXT[],
  preferred_locations TEXT[],
  typical_hold_period_months INTEGER,
  target_returns_range JSONB,
  
  -- Investment requirements
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
  accreditation_method VARCHAR,
  accreditation_documents TEXT[],
  net_worth_range VARCHAR,
  liquid_investment_capacity DECIMAL,
  annual_investment_budget DECIMAL,
  
  -- Investment preferences
  investment_focus TEXT[],
  preferred_investment_types TEXT[],
  preferred_locations TEXT[],
  target_return_range JSONB,
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
  service_categories TEXT[] NOT NULL,
  professional_licenses TEXT[],
  certifications TEXT[],
  insurance_coverage JSONB,
  bonding_information JSONB,
  
  -- Business details
  business_entity_type VARCHAR,
  service_areas TEXT[],
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
  response_time_guarantee INTEGER,
  
  -- Performance metrics
  client_satisfaction_rating DECIMAL DEFAULT 0,
  project_completion_rate DECIMAL DEFAULT 0,
  on_time_delivery_rate DECIMAL DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Main investment opportunities table
CREATE TABLE investment_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic opportunity information
  opportunity_name VARCHAR NOT NULL,
  opportunity_description TEXT,
  status opportunity_status DEFAULT 'fundraising',
  
  -- Property details
  property_address JSONB NOT NULL,
  property_type property_type NOT NULL,
  property_subtype VARCHAR,
  total_square_feet INTEGER,
  number_of_units INTEGER,
  year_built INTEGER,
  property_condition VARCHAR,
  
  -- Financial structure
  total_project_cost DECIMAL NOT NULL,
  equity_requirement DECIMAL NOT NULL,
  debt_amount DECIMAL,
  debt_type VARCHAR,
  loan_to_cost_ratio DECIMAL,
  loan_to_value_ratio DECIMAL,
  
  -- Investment terms
  minimum_investment DECIMAL NOT NULL,
  maximum_investment DECIMAL,
  target_raise_amount DECIMAL NOT NULL,
  current_commitments DECIMAL DEFAULT 0,
  fundraising_progress DECIMAL DEFAULT 0,
  
  -- Returns and timeline
  projected_irr DECIMAL,
  projected_total_return_multiple DECIMAL,
  projected_hold_period_months INTEGER,
  cash_on_cash_return DECIMAL,
  preferred_return_rate DECIMAL,
  waterfall_structure JSONB,
  
  -- Investment strategy
  investment_strategy VARCHAR,
  business_plan TEXT,
  value_creation_strategy TEXT,
  exit_strategy VARCHAR,
  
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
  property_documents TEXT[],
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
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document storage table
CREATE TABLE opportunity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 52428800),
  mime_type VARCHAR(100) NOT NULL,
  document_type document_type NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  requires_accreditation BOOLEAN DEFAULT TRUE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_mime_types CHECK (
    mime_type IN (
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/webp'
    )
  )
);

-- User bookmarks table
CREATE TABLE opportunity_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, opportunity_id)
);

-- Analytics view tracking table
CREATE TABLE opportunity_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration INTEGER
);

-- Investment inquiries table
CREATE TABLE investment_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES auth.users(id) NOT NULL,
  sponsor_id UUID REFERENCES auth.users(id) NOT NULL,
  
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
  meeting_type VARCHAR,
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
  sponsor_id UUID REFERENCES auth.users(id) NOT NULL,
  investor_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Partnership terms
  investment_amount DECIMAL NOT NULL,
  equity_percentage DECIMAL,
  partnership_agreement_url VARCHAR,
  legal_structure VARCHAR,
  
  -- Platform success fee
  platform_success_fee DECIMAL NOT NULL,
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
  requester_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  message_text TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
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
  user_id UUID REFERENCES auth.users(id),
  
  -- Event details
  event_name VARCHAR NOT NULL,
  event_category VARCHAR,
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
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
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
  sponsor_id UUID REFERENCES auth.users(id) NOT NULL,
  
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
  average_time_spent INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Data room access permissions
CREATE TABLE data_room_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_room_id UUID REFERENCES data_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  granted_by UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Access details
  access_level VARCHAR DEFAULT 'view' CHECK (access_level IN (
    'view', 'download', 'admin'
  )),
  nda_signed BOOLEAN DEFAULT FALSE,
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
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Document details
  document_name VARCHAR NOT NULL,
  document_description TEXT,
  document_type VARCHAR,
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
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX idx_data_room_access_user ON data_room_access(user_id);
CREATE INDEX idx_data_room_access_room ON data_room_access(data_room_id);
CREATE INDEX idx_opportunity_documents_opportunity ON opportunity_documents(opportunity_id);
CREATE INDEX idx_opportunity_bookmarks_user ON opportunity_bookmarks(user_id);
CREATE INDEX idx_opportunity_views_opportunity ON opportunity_views(opportunity_id);

-- Full-text search indexes
CREATE INDEX idx_opportunities_search ON investment_opportunities USING gin(to_tsvector('english', opportunity_name || ' ' || opportunity_description));

-- Enable Row Level Security
ALTER TABLE investment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for investment opportunities
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
  FOR INSERT WITH CHECK (sponsor_id = auth.uid());

CREATE POLICY "Only sponsors can update their opportunities" ON investment_opportunities
  FOR UPDATE USING (sponsor_id = auth.uid());

CREATE POLICY "Only sponsors can delete their opportunities" ON investment_opportunities
  FOR DELETE USING (sponsor_id = auth.uid());

-- RLS policies for investment inquiries
CREATE POLICY "Users can view their own inquiries" ON investment_inquiries
  FOR SELECT USING (
    investor_id = auth.uid() OR 
    sponsor_id = auth.uid()
  );

CREATE POLICY "Users can create inquiries" ON investment_inquiries
  FOR INSERT WITH CHECK (investor_id = auth.uid());

-- RLS policies for opportunity documents
CREATE POLICY "Users can view public documents" ON opportunity_documents
  FOR SELECT USING (
    is_public = true OR
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM investment_opportunities 
      WHERE investment_opportunities.id = opportunity_documents.opportunity_id 
      AND investment_opportunities.sponsor_id = auth.uid()
    )
  );

-- RLS policies for bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON opportunity_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE investment_inquiries;