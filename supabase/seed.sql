-- Seed data for development and testing
-- This file will be run after migrations during db reset

-- Insert sample users (these will be created by Supabase Auth in production)
-- For development, you can create test users through the Supabase dashboard

-- Sample investment opportunities (these will need valid sponsor_id values)
-- You'll need to replace the sponsor_id values with actual user IDs from your auth.users table

-- Example of how to insert sample data (uncomment and modify as needed):
/*
INSERT INTO investment_opportunities (
  sponsor_id,
  title,
  property_type,
  description,
  street,
  city,
  state,
  zip_code,
  country,
  square_footage,
  year_built,
  unit_count,
  total_investment,
  minimum_investment,
  target_return,
  hold_period,
  acquisition_fee,
  management_fee,
  disposition_fee,
  status,
  is_featured
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual user ID
  'Downtown Office Tower',
  'office',
  'Prime downtown office building with excellent tenant mix and strong cash flow. Located in the heart of the business district with easy access to transportation.',
  '123 Main Street',
  'New York',
  'NY',
  '10001',
  'US',
  50000,
  1995,
  25,
  5000000,
  100000,
  8.5,
  60,
  2.0,
  1.5,
  3.0,
  'active',
  true
);
*/

-- Note: In production, users will be created through Supabase Auth
-- and investment opportunities will be created by authenticated sponsors
-- through the application interface.

-- The seed file is primarily useful for:
-- 1. Development testing
-- 2. Demo data
-- 3. Initial setup data that doesn't depend on user authentication
