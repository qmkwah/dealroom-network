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
  -- Primary identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Property details
  title VARCHAR(200) NOT NULL,
  property_type property_type NOT NULL,
  description TEXT NOT NULL,
  
  -- Address information
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(10) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) DEFAULT 'US',
  
  -- Property specifications
  square_footage INTEGER NOT NULL CHECK (square_footage > 0 AND square_footage <= 50000000),
  year_built INTEGER NOT NULL CHECK (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM NOW()) + 5),
  unit_count INTEGER CHECK (unit_count > 0),
  
  -- Financial structure
  total_investment DECIMAL(15,2) NOT NULL CHECK (total_investment >= 100000 AND total_investment <= 1000000000),
  minimum_investment DECIMAL(15,2) NOT NULL CHECK (minimum_investment >= 10000),
  target_return DECIMAL(5,2) NOT NULL CHECK (target_return >= 1.0 AND target_return <= 50.0),
  hold_period INTEGER NOT NULL CHECK (hold_period >= 12 AND hold_period <= 240),
  
  -- Fee structure
  acquisition_fee DECIMAL(5,2) DEFAULT 0.0 CHECK (acquisition_fee >= 0.0 AND acquisition_fee <= 10.0),
  management_fee DECIMAL(5,2) DEFAULT 0.0 CHECK (management_fee >= 0.0 AND management_fee <= 5.0),
  disposition_fee DECIMAL(5,2) DEFAULT 0.0 CHECK (disposition_fee >= 0.0 AND disposition_fee <= 10.0),
  
  -- Opportunity status and metadata
  status opportunity_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT minimum_investment_check CHECK (minimum_investment <= total_investment),
  CONSTRAINT description_length CHECK (LENGTH(description) >= 10 AND LENGTH(description) <= 5000),
  CONSTRAINT title_length CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200)
);

-- Document storage table
CREATE TABLE opportunity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  
  -- File information
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 52428800), -- 50MB limit
  mime_type VARCHAR(100) NOT NULL,
  document_type document_type NOT NULL,
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  requires_accreditation BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
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

-- User bookmarks/favorites table
CREATE TABLE opportunity_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one bookmark per user per opportunity
  UNIQUE (user_id, opportunity_id)
);

-- Analytics: view tracking table
CREATE TABLE opportunity_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Allow anonymous views
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_duration INTEGER, -- Duration in seconds
  
  -- Prevent duplicate views from same user (or IP if anonymous) within short timeframe
  CONSTRAINT unique_user_view UNIQUE (opportunity_id, user_id, DATE(viewed_at))
);

-- Investment inquiries table (future feature)
CREATE TABLE investment_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Inquiry details
  investment_amount DECIMAL(15,2) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE (opportunity_id, investor_id) -- One inquiry per investor per opportunity
);

-- Create indexes for performance
CREATE INDEX idx_opportunities_sponsor ON investment_opportunities(sponsor_id);
CREATE INDEX idx_opportunities_status ON investment_opportunities(status);
CREATE INDEX idx_opportunities_property_type ON investment_opportunities(property_type);
CREATE INDEX idx_opportunities_created_at ON investment_opportunities(created_at DESC);
CREATE INDEX idx_opportunities_total_investment ON investment_opportunities(total_investment);
CREATE INDEX idx_opportunities_target_return ON investment_opportunities(target_return);

-- Geographic search indexes
CREATE INDEX idx_opportunities_location ON investment_opportunities(city, state);
CREATE INDEX idx_opportunities_state ON investment_opportunities(state);

-- Composite indexes for filtered searches
CREATE INDEX idx_opportunities_active_featured ON investment_opportunities(status, is_featured) WHERE status = 'active';
CREATE INDEX idx_opportunities_search ON investment_opportunities USING gin(to_tsvector('english', title || ' ' || description));

-- Document indexes
CREATE INDEX idx_documents_opportunity ON opportunity_documents(opportunity_id);
CREATE INDEX idx_documents_type ON opportunity_documents(document_type);
CREATE INDEX idx_documents_public ON opportunity_documents(is_public);

-- Bookmark indexes
CREATE INDEX idx_bookmarks_user ON opportunity_bookmarks(user_id);
CREATE INDEX idx_bookmarks_opportunity ON opportunity_bookmarks(opportunity_id);

-- View analytics indexes
CREATE INDEX idx_views_opportunity ON opportunity_views(opportunity_id);
CREATE INDEX idx_views_user ON opportunity_views(user_id);
CREATE INDEX idx_views_date ON opportunity_views(viewed_at DESC);

-- Inquiry indexes
CREATE INDEX idx_inquiries_opportunity ON investment_inquiries(opportunity_id);
CREATE INDEX idx_inquiries_investor ON investment_inquiries(investor_id);
CREATE INDEX idx_inquiries_status ON investment_inquiries(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_investment_opportunities_updated_at
    BEFORE UPDATE ON investment_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_inquiries_updated_at
    BEFORE UPDATE ON investment_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE investment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_inquiries ENABLE ROW LEVEL SECURITY;

-- Investment Opportunities RLS Policies

-- Allow public read access to active opportunities
CREATE POLICY "Allow public read access to active opportunities" ON investment_opportunities
    FOR SELECT USING (status = 'active');

-- Allow sponsors to create opportunities
CREATE POLICY "Allow sponsors to create opportunities" ON investment_opportunities
    FOR INSERT WITH CHECK (
        auth.uid() = sponsor_id AND 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND (raw_user_meta_data->>'role' = 'deal_sponsor' OR user_metadata->>'role' = 'deal_sponsor')
        )
    );

-- Allow sponsors to view and edit their own opportunities
CREATE POLICY "Allow sponsors to manage their own opportunities" ON investment_opportunities
    FOR ALL USING (auth.uid() = sponsor_id);

-- Allow sponsors to update their opportunities
CREATE POLICY "Allow sponsors to update their own opportunities" ON investment_opportunities
    FOR UPDATE USING (auth.uid() = sponsor_id);

-- Opportunity Documents RLS Policies

-- Allow public read access to public documents
CREATE POLICY "Allow public access to public documents" ON opportunity_documents
    FOR SELECT USING (is_public = true);

-- Allow read access to documents for opportunities user has access to
CREATE POLICY "Allow document access for opportunity viewers" ON opportunity_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM investment_opportunities 
            WHERE id = opportunity_id 
            AND (status = 'active' OR (auth.uid() IS NOT NULL AND sponsor_id = auth.uid()))
        )
        AND (
            is_public = true OR 
            (requires_accreditation = false) OR
            (auth.uid() IS NOT NULL AND EXISTS (
                SELECT 1 FROM auth.users 
                WHERE id = auth.uid() 
                AND (
                    raw_user_meta_data->>'accredited_investor' = 'true' OR 
                    user_metadata->>'accredited_investor' = 'true' OR
                    raw_user_meta_data->>'role' = 'deal_sponsor' OR
                    user_metadata->>'role' = 'deal_sponsor'
                )
            ))
        )
    );

-- Allow sponsors to manage documents for their opportunities
CREATE POLICY "Allow sponsors to manage their opportunity documents" ON opportunity_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM investment_opportunities 
            WHERE id = opportunity_id 
            AND sponsor_id = auth.uid()
        )
    );

-- Opportunity Bookmarks RLS Policies

-- Allow users to manage their own bookmarks
CREATE POLICY "Allow users to manage their own bookmarks" ON opportunity_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Opportunity Views RLS Policies

-- Allow anyone to insert view records (for analytics)
CREATE POLICY "Allow view tracking" ON opportunity_views
    FOR INSERT WITH CHECK (true);

-- Allow sponsors to view analytics for their opportunities
CREATE POLICY "Allow sponsors to view their opportunity analytics" ON opportunity_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM investment_opportunities 
            WHERE id = opportunity_id 
            AND sponsor_id = auth.uid()
        )
    );

-- Investment Inquiries RLS Policies

-- Allow investors to create inquiries
CREATE POLICY "Allow investors to create inquiries" ON investment_inquiries
    FOR INSERT WITH CHECK (auth.uid() = investor_id);

-- Allow users to view their own inquiries
CREATE POLICY "Allow users to view their own inquiries" ON investment_inquiries
    FOR SELECT USING (auth.uid() = investor_id);

-- Allow sponsors to view inquiries for their opportunities
CREATE POLICY "Allow sponsors to view inquiries for their opportunities" ON investment_inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM investment_opportunities 
            WHERE id = opportunity_id 
            AND sponsor_id = auth.uid()
        )
    );

-- Allow sponsors to update inquiry status
CREATE POLICY "Allow sponsors to update inquiry status" ON investment_inquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM investment_opportunities 
            WHERE id = opportunity_id 
            AND sponsor_id = auth.uid()
        )
    );

-- Create helpful views for common queries

-- Active opportunities with sponsor information
CREATE VIEW active_opportunities_with_sponsor AS
SELECT 
    o.*,
    u.email as sponsor_email,
    COALESCE(
        u.raw_user_meta_data->>'company_name',
        u.user_metadata->>'company_name',
        'Individual Sponsor'
    ) as sponsor_company
FROM investment_opportunities o
JOIN auth.users u ON o.sponsor_id = u.id
WHERE o.status = 'active';

-- Opportunity analytics summary
CREATE VIEW opportunity_analytics AS
SELECT 
    o.id,
    o.title,
    o.sponsor_id,
    COUNT(v.id) as total_views,
    COUNT(DISTINCT v.user_id) as unique_viewers,
    COUNT(b.id) as bookmark_count,
    COUNT(i.id) as inquiry_count,
    AVG(v.view_duration) as avg_view_duration
FROM investment_opportunities o
LEFT JOIN opportunity_views v ON o.id = v.opportunity_id
LEFT JOIN opportunity_bookmarks b ON o.id = b.opportunity_id
LEFT JOIN investment_inquiries i ON o.id = i.opportunity_id
GROUP BY o.id, o.title, o.sponsor_id;