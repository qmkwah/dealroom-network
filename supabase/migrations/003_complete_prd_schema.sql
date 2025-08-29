-- Complete DealRoom Network Database Schema
-- Based on PRD Section 4.2 Database Schema
-- This migration creates the complete schema as specified in the PRD

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table with authentication (extending auth.users)
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

-- Update investment inquiries to match PRD
DROP TABLE IF EXISTS investment_inquiries CASCADE;
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
CREATE INDEX idx_messages_sender ON messages(sender_id);
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

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE investment_inquiries;