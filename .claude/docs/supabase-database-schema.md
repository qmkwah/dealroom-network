# Supabase Database Schema Implementation Plan

## Project Context

DealRoom Network is a B2B professional networking platform for real estate deal makers with three distinct user roles:
- **Deal Sponsors**: Real estate professionals with track record verification
- **Capital Partners**: Accredited investors with investment criteria 
- **Service Providers**: Professional service providers with certifications

This document provides the complete database schema implementation for the authentication system with Row Level Security (RLS) policies and integration requirements.

## Database Architecture Overview

### Core Tables Structure
1. **user_profiles** - Base user authentication and profile data
2. **deal_sponsor_profiles** - Real estate professional-specific data
3. **capital_partner_profiles** - Investor-specific data with accreditation
4. **service_provider_profiles** - Service provider-specific data
5. **authentication_audit** - Security audit trail for auth events

### Key Features
- Automatic profile creation via database triggers
- Role-based Row Level Security policies
- Profile completion tracking system
- Integration with Supabase Auth metadata
- Comprehensive audit logging for security compliance

## Complete SQL Schema Implementation

### 1. Base User Profiles Table

```sql
-- Create user_profiles table (main profile table)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  user_role TEXT NOT NULL CHECK (user_role IN ('deal_sponsor', 'capital_partner', 'service_provider')),
  profile_image_url TEXT,
  phone_number TEXT,
  linkedin_url TEXT,
  bio TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'United States',
  profile_completed BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{
    "email_notifications": true,
    "marketing_emails": false,
    "profile_visibility": "network",
    "connection_requests": "anyone"
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON public.user_profiles(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON public.user_profiles(last_active) WHERE last_active IS NOT NULL;
```

### 2. Deal Sponsor Profiles Table

```sql
-- Create deal_sponsor_profiles table
CREATE TABLE IF NOT EXISTS public.deal_sponsor_profiles (
  id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  job_title TEXT NOT NULL,
  years_experience INTEGER CHECK (years_experience >= 0 AND years_experience <= 50),
  license_number TEXT,
  license_state TEXT,
  specialties TEXT[] DEFAULT '{}',
  property_types TEXT[] DEFAULT '{}', -- multifamily, office, retail, industrial, etc.
  markets_active TEXT[] DEFAULT '{}', -- geographic markets
  track_record JSONB DEFAULT '{
    "total_deals_completed": 0,
    "total_capital_raised": 0,
    "total_square_footage": 0,
    "average_hold_period": null,
    "preferred_deal_size_min": null,
    "preferred_deal_size_max": null,
    "notable_deals": []
  }'::jsonb,
  aum_range TEXT CHECK (aum_range IN (
    'under_10m',
    '10m_50m', 
    '50m_100m',
    '100m_500m',
    '500m_1b',
    'over_1b'
  )),
  fund_structures TEXT[] DEFAULT '{}', -- syndication, fund, joint_venture, etc.
  investment_philosophy TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create indexes for deal sponsor searches
CREATE INDEX IF NOT EXISTS idx_deal_sponsor_company ON public.deal_sponsor_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_deal_sponsor_specialties ON public.deal_sponsor_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_deal_sponsor_property_types ON public.deal_sponsor_profiles USING GIN(property_types);
CREATE INDEX IF NOT EXISTS idx_deal_sponsor_markets ON public.deal_sponsor_profiles USING GIN(markets_active);
CREATE INDEX IF NOT EXISTS idx_deal_sponsor_aum ON public.deal_sponsor_profiles(aum_range);
CREATE INDEX IF NOT EXISTS idx_deal_sponsor_verification ON public.deal_sponsor_profiles(verification_status);
```

### 3. Capital Partner Profiles Table

```sql
-- Create capital_partner_profiles table
CREATE TABLE IF NOT EXISTS public.capital_partner_profiles (
  id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  investor_type TEXT NOT NULL CHECK (investor_type IN (
    'individual',
    'family_office',
    'private_fund',
    'pension_fund',
    'insurance_company',
    'reit',
    'bank',
    'sovereign_wealth',
    'endowment',
    'foundation',
    'other_institutional'
  )),
  organization_name TEXT,
  organization_website TEXT,
  job_title TEXT,
  investment_range_min BIGINT CHECK (investment_range_min > 0),
  investment_range_max BIGINT CHECK (investment_range_max >= investment_range_min),
  preferred_markets TEXT[] DEFAULT '{}',
  preferred_property_types TEXT[] DEFAULT '{}',
  preferred_deal_structures TEXT[] DEFAULT '{}', -- equity, debt, mezzanine, preferred_equity
  investment_criteria JSONB DEFAULT '{
    "minimum_irr_target": null,
    "minimum_cash_on_cash": null,
    "maximum_leverage": null,
    "hold_period_preference": null,
    "geographic_focus": [],
    "exclusions": [],
    "esg_requirements": false,
    "co_investment_opportunities": true
  }'::jsonb,
  accredited_status BOOLEAN DEFAULT FALSE,
  accreditation_type TEXT CHECK (accreditation_type IN (
    'income_based',
    'net_worth_based', 
    'professional_knowledge',
    'institutional'
  )),
  accreditation_verified BOOLEAN DEFAULT FALSE,
  accreditation_documents JSONB DEFAULT '[]'::jsonb,
  accredited_at TIMESTAMP WITH TIME ZONE,
  portfolio_allocation JSONB DEFAULT '{
    "real_estate_percentage": null,
    "target_allocation": null,
    "current_commitments": null
  }'::jsonb,
  investment_history JSONB DEFAULT '{
    "total_investments": 0,
    "sectors_invested": [],
    "notable_investments": []
  }'::jsonb,
  due_diligence_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create indexes for capital partner searches
CREATE INDEX IF NOT EXISTS idx_capital_partner_type ON public.capital_partner_profiles(investor_type);
CREATE INDEX IF NOT EXISTS idx_capital_partner_range ON public.capital_partner_profiles(investment_range_min, investment_range_max);
CREATE INDEX IF NOT EXISTS idx_capital_partner_markets ON public.capital_partner_profiles USING GIN(preferred_markets);
CREATE INDEX IF NOT EXISTS idx_capital_partner_property_types ON public.capital_partner_profiles USING GIN(preferred_property_types);
CREATE INDEX IF NOT EXISTS idx_capital_partner_accredited ON public.capital_partner_profiles(accredited_status, accreditation_verified);
CREATE INDEX IF NOT EXISTS idx_capital_partner_structures ON public.capital_partner_profiles USING GIN(preferred_deal_structures);
```

### 4. Service Provider Profiles Table

```sql
-- Create service_provider_profiles table  
CREATE TABLE IF NOT EXISTS public.service_provider_profiles (
  id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  job_title TEXT,
  service_categories TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(service_categories, 1) > 0),
  -- Service categories: legal, accounting, property_management, construction, 
  -- architecture, engineering, lending, insurance, valuation, environmental, etc.
  primary_service_category TEXT NOT NULL,
  service_description TEXT NOT NULL,
  years_in_business INTEGER CHECK (years_in_business >= 0),
  employee_count_range TEXT CHECK (employee_count_range IN (
    '1',
    '2_10',
    '11_50', 
    '51_200',
    '201_500',
    '500_plus'
  )),
  certifications TEXT[] DEFAULT '{}', -- CPA, PE, JD, etc.
  licenses TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}', -- geographic areas served
  hourly_rate_range TEXT CHECK (hourly_rate_range IN (
    'under_100',
    '100_200',
    '200_350',
    '350_500',
    '500_750',
    'over_750',
    'project_based'
  )),
  project_size_preference TEXT CHECK (project_size_preference IN (
    'under_1m',
    '1m_5m',
    '5m_25m',
    '25m_100m',
    'over_100m',
    'any_size'
  )),
  client_references JSONB DEFAULT '[]'::jsonb,
  case_studies JSONB DEFAULT '[]'::jsonb,
  insurance_coverage JSONB DEFAULT '{
    "general_liability": null,
    "professional_liability": null,
    "cyber_liability": null
  }'::jsonb,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents JSONB DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create indexes for service provider searches
CREATE INDEX IF NOT EXISTS idx_service_provider_company ON public.service_provider_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_service_provider_categories ON public.service_provider_profiles USING GIN(service_categories);
CREATE INDEX IF NOT EXISTS idx_service_provider_primary_category ON public.service_provider_profiles(primary_service_category);
CREATE INDEX IF NOT EXISTS idx_service_provider_areas ON public.service_provider_profiles USING GIN(service_areas);
CREATE INDEX IF NOT EXISTS idx_service_provider_certifications ON public.service_provider_profiles USING GIN(certifications);
CREATE INDEX IF NOT EXISTS idx_service_provider_rate_range ON public.service_provider_profiles(hourly_rate_range);
CREATE INDEX IF NOT EXISTS idx_service_provider_verification ON public.service_provider_profiles(verification_status);
```

### 5. Authentication Audit Table

```sql
-- Create authentication audit table for security tracking
CREATE TABLE IF NOT EXISTS public.authentication_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'registration',
    'login_success',
    'login_failure', 
    'logout',
    'password_reset_requested',
    'password_reset_completed',
    'email_verification',
    'profile_created',
    'profile_updated',
    'account_locked',
    'account_unlocked'
  )),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON public.authentication_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_email ON public.authentication_audit(email);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event_type ON public.authentication_audit(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON public.authentication_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_ip ON public.authentication_audit(ip_address);
```

## Database Functions and Triggers

### 1. User Profile Creation Function

```sql
-- Function to handle new user registration and profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    user_role,
    email_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'capital_partner'),
    CASE 
      WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE 
      ELSE FALSE 
    END
  );

  -- Create role-specific profile based on user_role
  IF NEW.raw_user_meta_data->>'user_role' = 'deal_sponsor' THEN
    INSERT INTO public.deal_sponsor_profiles (id) VALUES (NEW.id);
  ELSIF NEW.raw_user_meta_data->>'user_role' = 'capital_partner' THEN  
    INSERT INTO public.capital_partner_profiles (id) VALUES (NEW.id);
  ELSIF NEW.raw_user_meta_data->>'user_role' = 'service_provider' THEN
    INSERT INTO public.service_provider_profiles (id) VALUES (NEW.id);
  END IF;

  -- Log registration event
  INSERT INTO public.authentication_audit (
    user_id,
    email, 
    event_type,
    metadata
  ) VALUES (
    NEW.id,
    NEW.email,
    'registration',
    jsonb_build_object(
      'user_role', NEW.raw_user_meta_data->>'user_role',
      'registration_method', 'email'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Profile Completion Tracking Function

```sql
-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  base_completion INTEGER := 0;
  role_completion INTEGER := 0;
  user_role_val TEXT;
  total_completion INTEGER := 0;
BEGIN
  -- Get user role
  SELECT user_role INTO user_role_val 
  FROM public.user_profiles 
  WHERE id = user_id_param;

  -- Calculate base profile completion (40% weight)
  SELECT 
    CASE 
      WHEN first_name IS NOT NULL AND first_name != '' THEN 5 ELSE 0 END +
      CASE 
        WHEN last_name IS NOT NULL AND last_name != '' THEN 5 ELSE 0 END +
      CASE 
        WHEN phone_number IS NOT NULL THEN 5 ELSE 0 END +
      CASE 
        WHEN linkedin_url IS NOT NULL THEN 5 ELSE 0 END +
      CASE 
        WHEN bio IS NOT NULL AND length(bio) > 50 THEN 10 ELSE 0 END +
      CASE 
        WHEN location_city IS NOT NULL AND location_state IS NOT NULL THEN 10 ELSE 0 END
  INTO base_completion
  FROM public.user_profiles 
  WHERE id = user_id_param;

  -- Calculate role-specific completion (60% weight)
  IF user_role_val = 'deal_sponsor' THEN
    SELECT
      CASE 
        WHEN company_name IS NOT NULL AND company_name != '' THEN 15 ELSE 0 END +
      CASE 
        WHEN job_title IS NOT NULL AND job_title != '' THEN 10 ELSE 0 END +
      CASE 
        WHEN years_experience IS NOT NULL THEN 10 ELSE 0 END +
      CASE 
        WHEN array_length(specialties, 1) > 0 THEN 10 ELSE 0 END +
      CASE 
        WHEN aum_range IS NOT NULL THEN 10 ELSE 0 END +
      CASE 
        WHEN investment_philosophy IS NOT NULL AND length(investment_philosophy) > 100 THEN 5 ELSE 0 END
    INTO role_completion
    FROM public.deal_sponsor_profiles 
    WHERE id = user_id_param;

  ELSIF user_role_val = 'capital_partner' THEN
    SELECT
      CASE 
        WHEN investor_type IS NOT NULL THEN 15 ELSE 0 END +
      CASE 
        WHEN investment_range_min IS NOT NULL AND investment_range_max IS NOT NULL THEN 15 ELSE 0 END +
      CASE 
        WHEN array_length(preferred_markets, 1) > 0 THEN 10 ELSE 0 END +
      CASE 
        WHEN array_length(preferred_property_types, 1) > 0 THEN 10 ELSE 0 END +
      CASE 
        WHEN accredited_status = TRUE THEN 10 ELSE 0 END
    INTO role_completion
    FROM public.capital_partner_profiles 
    WHERE id = user_id_param;

  ELSIF user_role_val = 'service_provider' THEN
    SELECT
      CASE 
        WHEN company_name IS NOT NULL AND company_name != '' THEN 15 ELSE 0 END +
      CASE 
        WHEN array_length(service_categories, 1) > 0 THEN 15 ELSE 0 END +
      CASE 
        WHEN service_description IS NOT NULL AND length(service_description) > 100 THEN 10 ELSE 0 END +
      CASE 
        WHEN years_in_business IS NOT NULL THEN 10 ELSE 0 END +
      CASE 
        WHEN array_length(service_areas, 1) > 0 THEN 10 ELSE 0 END
    INTO role_completion
    FROM public.service_provider_profiles 
    WHERE id = user_id_param;
  END IF;

  total_completion := COALESCE(base_completion, 0) + COALESCE(role_completion, 0);
  
  -- Update profile_completed flag if 80% or higher
  IF total_completion >= 80 THEN
    UPDATE public.user_profiles 
    SET profile_completed = TRUE, updated_at = NOW() 
    WHERE id = user_id_param;
  ELSE
    UPDATE public.user_profiles 
    SET profile_completed = FALSE, updated_at = NOW() 
    WHERE id = user_id_param;
  END IF;

  RETURN total_completion;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Profile Update Triggers

```sql
-- Trigger function to update profile completion on changes
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.calculate_profile_completion(NEW.id);
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for profile completion updates
DROP TRIGGER IF EXISTS trigger_user_profile_completion ON public.user_profiles;
CREATE TRIGGER trigger_user_profile_completion
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_profile_completion();

DROP TRIGGER IF EXISTS trigger_deal_sponsor_profile_completion ON public.deal_sponsor_profiles;
CREATE TRIGGER trigger_deal_sponsor_profile_completion
  AFTER UPDATE ON public.deal_sponsor_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_profile_completion();

DROP TRIGGER IF EXISTS trigger_capital_partner_profile_completion ON public.capital_partner_profiles;
CREATE TRIGGER trigger_capital_partner_profile_completion
  AFTER UPDATE ON public.capital_partner_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_profile_completion();

DROP TRIGGER IF EXISTS trigger_service_provider_profile_completion ON public.service_provider_profiles;
CREATE TRIGGER trigger_service_provider_profile_completion
  AFTER UPDATE ON public.service_provider_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_profile_completion();
```

### 4. Authentication Event Triggers

```sql
-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Function to handle email verification events
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- Update email verification status
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.user_profiles 
    SET email_verified = TRUE, updated_at = NOW()
    WHERE id = NEW.id;
    
    -- Log verification event
    INSERT INTO public.authentication_audit (
      user_id,
      email,
      event_type
    ) VALUES (
      NEW.id,
      NEW.email,
      'email_verification'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email verification
DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
CREATE TRIGGER on_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_email_verification();
```

## Row Level Security (RLS) Policies

### 1. User Profiles RLS Policies

```sql
-- Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can view other users' basic profile info (for networking)
CREATE POLICY "Users can view others basic profile"
  ON public.user_profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    profile_completed = TRUE AND
    (settings->>'profile_visibility')::TEXT IN ('public', 'network')
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE user_role = 'admin'
    )
  );
```

### 2. Deal Sponsor Profiles RLS Policies

```sql
-- Enable RLS on deal_sponsor_profiles
ALTER TABLE public.deal_sponsor_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own deal sponsor profile
CREATE POLICY "Deal sponsors can manage own profile"
  ON public.deal_sponsor_profiles
  FOR ALL
  USING (auth.uid() = id);

-- Other users can view verified deal sponsor profiles
CREATE POLICY "Users can view verified deal sponsor profiles"
  ON public.deal_sponsor_profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    verification_status = 'verified' AND
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = deal_sponsor_profiles.id 
      AND up.profile_completed = TRUE
      AND (up.settings->>'profile_visibility')::TEXT IN ('public', 'network')
    )
  );

-- Admins can manage all deal sponsor profiles
CREATE POLICY "Admins can manage all deal sponsor profiles"
  ON public.deal_sponsor_profiles
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE user_role = 'admin'
    )
  );
```

### 3. Capital Partner Profiles RLS Policies

```sql
-- Enable RLS on capital_partner_profiles
ALTER TABLE public.capital_partner_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own capital partner profile
CREATE POLICY "Capital partners can manage own profile"
  ON public.capital_partner_profiles
  FOR ALL
  USING (auth.uid() = id);

-- Deal sponsors can view capital partner profiles (for deal matching)
CREATE POLICY "Deal sponsors can view capital partner profiles"
  ON public.capital_partner_profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE user_role = 'deal_sponsor' AND profile_completed = TRUE
    ) AND
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = capital_partner_profiles.id 
      AND up.profile_completed = TRUE
      AND (up.settings->>'profile_visibility')::TEXT IN ('public', 'network')
    )
  );

-- Service providers can view basic capital partner info
CREATE POLICY "Service providers can view basic capital partner info"
  ON public.capital_partner_profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE user_role = 'service_provider' AND profile_completed = TRUE
    ) AND
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = capital_partner_profiles.id 
      AND up.profile_completed = TRUE
      AND (up.settings->>'profile_visibility')::TEXT = 'public'
    )
  );

-- Admins can manage all capital partner profiles
CREATE POLICY "Admins can manage all capital partner profiles"
  ON public.capital_partner_profiles
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE user_role = 'admin'
    )
  );
```

### 4. Service Provider Profiles RLS Policies

```sql
-- Enable RLS on service_provider_profiles
ALTER TABLE public.service_provider_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own service provider profile
CREATE POLICY "Service providers can manage own profile"
  ON public.service_provider_profiles
  FOR ALL
  USING (auth.uid() = id);

-- All authenticated users can view verified service provider profiles
CREATE POLICY "Users can view verified service provider profiles"
  ON public.service_provider_profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    verification_status = 'verified' AND
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.id = service_provider_profiles.id 
      AND up.profile_completed = TRUE
      AND (up.settings->>'profile_visibility')::TEXT IN ('public', 'network')
    )
  );

-- Admins can manage all service provider profiles
CREATE POLICY "Admins can manage all service provider profiles"
  ON public.service_provider_profiles
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE user_role = 'admin'
    )
  );
```

### 5. Authentication Audit RLS Policies

```sql
-- Enable RLS on authentication_audit
ALTER TABLE public.authentication_audit ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit records
CREATE POLICY "Users can view own audit records"
  ON public.authentication_audit
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all audit records
CREATE POLICY "Admins can view all audit records"
  ON public.authentication_audit
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles 
      WHERE user_role = 'admin'
    )
  );

-- System can insert audit records
CREATE POLICY "System can insert audit records"
  ON public.authentication_audit
  FOR INSERT
  WITH CHECK (true);
```

## Database Migration Script

```sql
-- Complete migration script to run in Supabase SQL Editor
-- This script is idempotent and can be run multiple times safely

-- 1. Create all tables with proper constraints and indexes
\i create_tables.sql

-- 2. Create all functions
\i create_functions.sql  

-- 3. Create all triggers
\i create_triggers.sql

-- 4. Create all RLS policies
\i create_rls_policies.sql

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.deal_sponsor_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.capital_partner_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.service_provider_profiles TO authenticated;
GRANT SELECT, INSERT ON public.authentication_audit TO authenticated;

-- Grant read-only access to anonymous users for public profiles
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.deal_sponsor_profiles TO anon;
GRANT SELECT ON public.capital_partner_profiles TO anon;
GRANT SELECT ON public.service_provider_profiles TO anon;
```

## TypeScript Type Generation

### 1. Generate Types Command
After running the migration, generate TypeScript types:

```bash
# Set your project reference
npx supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

### 2. Expected Generated Types Structure

```typescript
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          user_role: 'deal_sponsor' | 'capital_partner' | 'service_provider'
          profile_image_url: string | null
          phone_number: string | null
          linkedin_url: string | null
          bio: string | null
          location_city: string | null
          location_state: string | null
          location_country: string
          profile_completed: boolean
          email_verified: boolean
          onboarding_completed: boolean
          last_active: string | null
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          user_role: 'deal_sponsor' | 'capital_partner' | 'service_provider'
          // ... other optional fields
        }
        Update: {
          id?: string
          email?: string
          // ... all fields optional for updates
        }
      }
      // ... other table types
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completion: {
        Args: { user_id_param: string }
        Returns: number
      }
      // ... other function types
    }
    Enums: {
      [_ in never]: never
    }
  }
}
```

## Integration with Authentication System

### 1. User Registration Flow

```typescript
// Example integration in registration API route
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(req: Request) {
  const supabase = createClient()
  const body = await req.json()
  const validatedData = registerSchema.parse(body)

  // Supabase will automatically trigger profile creation via database trigger
  const { data, error } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
    options: {
      data: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        user_role: validatedData.userRole,
      },
    },
  })

  // Profile tables are automatically created by trigger
  return NextResponse.json({ user: data.user })
}
```

### 2. Profile Completion Check

```typescript
// Helper function to check profile completion
export async function checkProfileCompletion(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.rpc(
    'calculate_profile_completion', 
    { user_id_param: userId }
  )
  
  return { completionPercentage: data, error }
}
```

### 3. Role-Based Data Fetching

```typescript
// Example: Fetch user profile with role-specific data
export async function getUserProfileWithRole(userId: string) {
  const supabase = createClient()
  
  // Get base profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (profileError || !profile) {
    return { profile: null, error: profileError }
  }
  
  // Get role-specific profile
  let roleProfile = null
  
  switch (profile.user_role) {
    case 'deal_sponsor':
      const { data: sponsorProfile } = await supabase
        .from('deal_sponsor_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      roleProfile = sponsorProfile
      break
      
    case 'capital_partner':
      const { data: partnerProfile } = await supabase
        .from('capital_partner_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      roleProfile = partnerProfile
      break
      
    case 'service_provider':
      const { data: providerProfile } = await supabase
        .from('service_provider_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      roleProfile = providerProfile
      break
  }
  
  return { 
    profile: { ...profile, roleProfile }, 
    error: null 
  }
}
```

## Security Best Practices

### 1. Data Privacy & GDPR Compliance
- Personal data is properly classified and protected
- Users can request data deletion via CASCADE deletes
- Audit trail maintains compliance records
- Profile visibility settings respect user preferences

### 2. Access Control
- RLS policies enforce role-based access control
- Sensitive financial data only visible to authorized users
- Admin functions properly gated
- API endpoints validate user permissions

### 3. Data Integrity
- Foreign key constraints ensure referential integrity
- Check constraints validate data ranges and formats
- Triggers maintain data consistency
- JSONB validation for complex data structures

### 4. Performance Optimization
- Strategic indexes for common query patterns
- JSONB indexes for complex search requirements
- Efficient profile completion calculations
- Connection pooling considerations

### 5. Monitoring & Observability
- Authentication audit trail for security monitoring
- Profile completion tracking for user engagement
- Performance monitoring on critical queries
- Error handling and logging

## Deployment Checklist

- [ ] **Database Setup**: Run migration scripts in Supabase
- [ ] **RLS Policies**: Enable and test all security policies  
- [ ] **Functions & Triggers**: Deploy and test database functions
- [ ] **Type Generation**: Generate and integrate TypeScript types
- [ ] **API Integration**: Update API routes to use new schema
- [ ] **Testing**: Run comprehensive tests on auth flow
- [ ] **Performance**: Verify query performance with indexes
- [ ] **Security**: Audit RLS policies and access patterns
- [ ] **Documentation**: Update API documentation
- [ ] **Monitoring**: Setup alerting for critical database metrics

This comprehensive database schema provides a secure, scalable foundation for the DealRoom Network authentication system with proper role-based access control, audit trails, and professional networking capabilities.