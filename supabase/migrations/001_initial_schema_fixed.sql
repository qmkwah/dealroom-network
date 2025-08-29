-- Investment Opportunities Database Schema
-- Phase 2: Investment Opportunity Management System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create property type enum
CREATE TYPE property_type AS ENUM (
  'multifamily',
  'retail',
  'office',
  'industrial',
  'land',
  'mixed_use'
);

-- Create opportunity status enum
CREATE TYPE opportunity_status AS ENUM (
  'draft',
  'fundraising',
  'due_diligence',
  'funded',
  'closed',
  'cancelled'
);

-- Create document type enum
CREATE TYPE document_type AS ENUM (
  'offering-memorandum',
  'financial-projections',
  'property-images',
  'additional-documents'
);

-- Main investment opportunities table (matching PRD schema)
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
  opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_amount DECIMAL(15,2) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (opportunity_id, investor_id)
);

-- Create basic indexes
CREATE INDEX idx_opportunities_sponsor ON investment_opportunities(sponsor_id);
CREATE INDEX idx_opportunities_status ON investment_opportunities(status);
CREATE INDEX idx_opportunities_property_type ON investment_opportunities(property_type);
CREATE INDEX idx_opportunities_created_at ON investment_opportunities(created_at DESC);
CREATE INDEX idx_documents_opportunity ON opportunity_documents(opportunity_id);
CREATE INDEX idx_bookmarks_user ON opportunity_bookmarks(user_id);
CREATE INDEX idx_views_opportunity ON opportunity_views(opportunity_id);
CREATE INDEX idx_inquiries_opportunity ON investment_inquiries(opportunity_id);

-- Enable RLS
ALTER TABLE investment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_inquiries ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Allow public read access to fundraising opportunities" ON investment_opportunities
    FOR SELECT USING (status = 'fundraising' AND public_listing = true);

CREATE POLICY "Allow sponsors to manage their own opportunities" ON investment_opportunities
    FOR ALL USING (auth.uid() = sponsor_id);

CREATE POLICY "Allow users to manage their own bookmarks" ON opportunity_bookmarks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow view tracking" ON opportunity_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to view their own inquiries" ON investment_inquiries
    FOR SELECT USING (auth.uid() = investor_id);
