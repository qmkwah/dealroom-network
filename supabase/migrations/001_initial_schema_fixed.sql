-- Investment Opportunities Database Schema
-- Phase 2: Investment Opportunity Management System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create property type enum
CREATE TYPE property_type AS ENUM (
  'multifamily',
  'office',
  'retail',
  'industrial',
  'mixed-use',
  'land',
  'hospitality',
  'healthcare',
  'self-storage',
  'student-housing'
);

-- Create opportunity status enum
CREATE TYPE opportunity_status AS ENUM (
  'draft',
  'review',
  'active',
  'closed',
  'archived'
);

-- Create document type enum
CREATE TYPE document_type AS ENUM (
  'offering-memorandum',
  'financial-projections',
  'property-images',
  'additional-documents'
);

-- Main investment opportunities table
CREATE TABLE investment_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  property_type property_type NOT NULL,
  description TEXT NOT NULL,
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(10) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) DEFAULT 'US',
  square_footage INTEGER NOT NULL CHECK (square_footage > 0 AND square_footage <= 50000000),
  year_built INTEGER NOT NULL CHECK (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM NOW()) + 5),
  unit_count INTEGER CHECK (unit_count > 0),
  total_investment DECIMAL(15,2) NOT NULL CHECK (total_investment >= 100000 AND total_investment <= 1000000000),
  minimum_investment DECIMAL(15,2) NOT NULL CHECK (minimum_investment >= 10000),
  target_return DECIMAL(5,2) NOT NULL CHECK (target_return >= 1.0 AND target_return <= 50.0),
  hold_period INTEGER NOT NULL CHECK (hold_period >= 12 AND hold_period <= 240),
  acquisition_fee DECIMAL(5,2) DEFAULT 0.0 CHECK (acquisition_fee >= 0.0 AND acquisition_fee <= 10.0),
  management_fee DECIMAL(5,2) DEFAULT 0.0 CHECK (management_fee >= 0.0 AND management_fee <= 5.0),
  disposition_fee DECIMAL(5,2) DEFAULT 0.0 CHECK (disposition_fee >= 0.0 AND disposition_fee <= 10.0),
  status opportunity_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT minimum_investment_check CHECK (minimum_investment <= total_investment),
  CONSTRAINT description_length CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 5000),
  CONSTRAINT title_length CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200)
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
CREATE POLICY "Allow public read access to active opportunities" ON investment_opportunities
    FOR SELECT USING (status = 'active');

CREATE POLICY "Allow sponsors to manage their own opportunities" ON investment_opportunities
    FOR ALL USING (auth.uid() = sponsor_id);

CREATE POLICY "Allow users to manage their own bookmarks" ON opportunity_bookmarks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow view tracking" ON opportunity_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to view their own inquiries" ON investment_inquiries
    FOR SELECT USING (auth.uid() = investor_id);
