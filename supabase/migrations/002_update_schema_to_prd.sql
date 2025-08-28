-- Update database schema to match PRD requirements
-- This migration updates the existing schema to properly match the PRD specification

-- First, drop existing enum types
DROP TYPE IF EXISTS opportunity_status CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;

-- Create new enum types matching PRD
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

-- Drop existing table (if exists) and create new one matching PRD schema
DROP TABLE IF EXISTS investment_opportunities CASCADE;

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

-- Create indexes
CREATE INDEX idx_investment_opportunities_sponsor ON investment_opportunities(sponsor_id);
CREATE INDEX idx_investment_opportunities_status ON investment_opportunities(status);
CREATE INDEX idx_investment_opportunities_property_type ON investment_opportunities(property_type);
CREATE INDEX idx_investment_opportunities_location ON investment_opportunities USING gin((property_address->'state'));
CREATE INDEX idx_investment_opportunities_created_at ON investment_opportunities(created_at DESC);

-- Full-text search index
CREATE INDEX idx_opportunities_search ON investment_opportunities USING gin(to_tsvector('english', opportunity_name || ' ' || opportunity_description));

-- Enable RLS
ALTER TABLE investment_opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view public opportunities or their own" ON investment_opportunities
    FOR SELECT USING (
        public_listing = true 
        AND status IN ('fundraising', 'due_diligence', 'funded')
        OR auth.uid() = sponsor_id
        OR EXISTS (
            SELECT 1 FROM investment_inquiries 
            WHERE investment_inquiries.opportunity_id = investment_opportunities.id 
            AND investment_inquiries.investor_id = auth.uid()
        )
    );

CREATE POLICY "Only sponsors can create opportunities" ON investment_opportunities
    FOR INSERT WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Only sponsors can update their opportunities" ON investment_opportunities
    FOR UPDATE USING (auth.uid() = sponsor_id);

CREATE POLICY "Only sponsors can delete their opportunities" ON investment_opportunities
    FOR DELETE USING (auth.uid() = sponsor_id);