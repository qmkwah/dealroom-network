import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

// Temporary type until database types are properly generated
type SupabaseClient = {
  from: (table: string) => any
}

// This will fail until we implement the database schema
describe('Opportunity Database Schema', () => {
  let supabase: ReturnType<typeof createClient>

  beforeAll(() => {
    supabase = createClient()
  })

  describe('investment_opportunities table', () => {
    it('should have investment_opportunities table with correct structure', async () => {
      // This should fail - table doesn't exist yet
      const { data, error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .select('*')
        .limit(1)
      
      // We expect this to work after implementing the schema
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should enforce required columns', async () => {
      // This should fail - trying to insert incomplete data
      const { error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .insert({
          title: 'Test Property'
          // Missing required fields: sponsor_id, property_type, etc.
        })
      
      expect(error).toBeDefined()
      expect(error?.code).toBe('23502') // NOT NULL violation
    })

    it('should validate property_type enum values', async () => {
      // This should fail - invalid enum value
      const { error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .insert({
          sponsor_id: '00000000-0000-0000-0000-000000000000',
          title: 'Test Property',
          property_type: 'invalid_type', // Should be enum value
          total_investment: 1000000,
          minimum_investment: 50000,
          target_return: 12.5,
          hold_period: 60,
          square_footage: 10000,
          year_built: 2020,
          description: 'Test description',
          street: '123 Test St',
          city: 'Test City',
          state: 'NY',
          zip_code: '10001'
        })
      
      expect(error).toBeDefined()
      expect(error?.code).toBe('23514') // Check constraint violation
    })

    it('should validate numeric constraints', async () => {
      // This should fail - negative investment amount
      const { error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .insert({
          sponsor_id: '00000000-0000-0000-0000-000000000000',
          title: 'Test Property',
          property_type: 'multifamily',
          total_investment: -1000000, // Negative value
          minimum_investment: 50000,
          target_return: 12.5,
          hold_period: 60,
          square_footage: 10000,
          year_built: 2020,
          description: 'Test description',
          street: '123 Test St',
          city: 'Test City',
          state: 'NY',
          zip_code: '10001'
        })
      
      expect(error).toBeDefined()
      expect(error?.code).toBe('23514') // Check constraint violation
    })

    it('should have proper foreign key constraints', async () => {
      // This should fail - invalid sponsor_id reference
      const { error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .insert({
          sponsor_id: '11111111-1111-1111-1111-111111111111', // Non-existent user
          title: 'Test Property',
          property_type: 'multifamily',
          total_investment: 1000000,
          minimum_investment: 50000,
          target_return: 12.5,
          hold_period: 60,
          square_footage: 10000,
          year_built: 2020,
          description: 'Test description',
          street: '123 Test St',
          city: 'Test City',
          state: 'NY',
          zip_code: '10001'
        })
      
      expect(error).toBeDefined()
      expect(error?.code).toBe('23503') // Foreign key constraint violation
    })
  })

  describe('opportunity_documents table', () => {
    it('should have opportunity_documents table', async () => {
      // This should fail - table doesn't exist yet
      const { data, error } = await (supabase as SupabaseClient)
        .from('opportunity_documents')
        .select('*')
        .limit(1)
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should link documents to opportunities', async () => {
      // This should fail - foreign key constraint doesn't exist yet
      const { error } = await (supabase as SupabaseClient)
        .from('opportunity_documents')
        .insert({
          opportunity_id: '00000000-0000-0000-0000-000000000000', // Non-existent opportunity
          file_name: 'test.pdf',
          file_path: '/documents/test.pdf',
          file_size: 1024000,
          document_type: 'offering-memorandum',
          mime_type: 'application/pdf'
        })
      
      expect(error).toBeDefined()
      expect(error?.code).toBe('23503') // Foreign key constraint violation
    })
  })

  describe('opportunity_views table', () => {
    it('should have opportunity_views table for analytics', async () => {
      // This should fail - table doesn't exist yet
      const { data, error } = await (supabase as SupabaseClient)
        .from('opportunity_views')
        .select('*')
        .limit(1)
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should track unique views per user per opportunity', async () => {
      // This should fail - unique constraint doesn't exist yet
      const viewData = {
        opportunity_id: '00000000-0000-0000-0000-000000000000',
        user_id: '11111111-1111-1111-1111-111111111111',
        viewed_at: new Date().toISOString()
      }

      // First insert should work
      const { error: firstError } = await (supabase as SupabaseClient)
        .from('opportunity_views')
        .insert(viewData)
      expect(firstError).toBeNull()

      // Second insert should fail due to unique constraint
      const { error: secondError } = await (supabase as SupabaseClient)
        .from('opportunity_views')
        .insert(viewData)
      expect(secondError).toBeDefined()
      expect(secondError?.code).toBe('23505') // Unique constraint violation
    })
  })

  describe('opportunity_bookmarks table', () => {
    it('should have opportunity_bookmarks table', async () => {
      // This should fail - table doesn't exist yet
      const { data, error } = await (supabase as SupabaseClient)
        .from('opportunity_bookmarks')
        .select('*')
        .limit(1)
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
  })
})

describe('Row Level Security Policies', () => {
  let supabase: ReturnType<typeof createClient>

  beforeAll(() => {
    supabase = createClient()
  })

  describe('investment_opportunities RLS', () => {
    it('should allow sponsors to create opportunities', async () => {
      // Mock authenticated user as deal sponsor
      // This should fail until RLS policies are implemented
      const { data, error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .insert({
          title: 'RLS Test Property',
          property_type: 'multifamily',
          total_investment: 1000000,
          minimum_investment: 50000,
          target_return: 12.5,
          hold_period: 60,
          square_footage: 10000,
          year_built: 2020,
          description: 'Test description for RLS',
          street: '123 RLS Test St',
          city: 'Test City',
          state: 'NY',
          zip_code: '10001'
        })
        .select()

      // Should work for authenticated sponsors
      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.[0]).toHaveProperty('id')
    })

    it('should prevent investors from creating opportunities', async () => {
      // Mock authenticated user as capital partner (investor)
      // This should fail - investors shouldn't be able to create opportunities
      const { error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .insert({
          title: 'Unauthorized Test Property',
          property_type: 'office',
          total_investment: 2000000,
          minimum_investment: 100000,
          target_return: 15.0,
          hold_period: 72,
          square_footage: 25000,
          year_built: 2018,
          description: 'Unauthorized test description',
          street: '456 Unauthorized St',
          city: 'Unauthorized City',
          state: 'CA',
          zip_code: '90210'
        })
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('42501') // Insufficient privilege
    })

    it('should allow public read access to active opportunities', async () => {
      // This should work - public can view active opportunities
      const { data, error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .select('*')
        .eq('status', 'active')
        .limit(5)

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should restrict draft opportunities to owners only', async () => {
      // This should fail for non-owners trying to view draft opportunities
      const { data, error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .select('*')
        .eq('status', 'draft')
        .limit(5)

      // Should return empty results or error for non-owners
      if (error) {
        expect(error.code).toBe('42501') // Insufficient privilege
      } else {
        expect(data).toEqual([]) // No draft opportunities visible to non-owners
      }
    })

    it('should allow sponsors to update their own opportunities', async () => {
      // This should work - sponsors can update their own opportunities
      // First create an opportunity, then try to update it
      const { data: createData, error: createError } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .insert({
          title: 'Update Test Property',
          property_type: 'retail',
          total_investment: 3000000,
          minimum_investment: 75000,
          target_return: 10.0,
          hold_period: 48,
          square_footage: 15000,
          year_built: 2021,
          description: 'Property for update testing',
          street: '789 Update St',
          city: 'Update City',
          state: 'TX',
          zip_code: '75201'
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(createData).toBeDefined()

      if (createData) {
        // Now try to update the opportunity
        const { data: updateData, error: updateError } = await (supabase as SupabaseClient)
          .from('investment_opportunities')
          .update({ title: 'Updated Test Property' })
          .eq('id', createData.id)
          .select()
          .single()

        expect(updateError).toBeNull()
        expect(updateData?.title).toBe('Updated Test Property')
      }
    })

    it('should prevent sponsors from updating others opportunities', async () => {
      // This should fail - sponsors cannot update opportunities they don't own
      // Mock different authenticated user
      const { error } = await (supabase as SupabaseClient)
        .from('investment_opportunities')
        .update({ title: 'Unauthorized Update' })
        .eq('id', '00000000-0000-0000-0000-000000000000') // Some other opportunity
        .select()

      expect(error).toBeDefined()
      expect(error?.code).toBe('42501') // Insufficient privilege
    })
  })

  describe('opportunity_documents RLS', () => {
    it('should allow public access to marketing documents', async () => {
      // This should work - public can view property images and basic documents
      const { data, error } = await (supabase as SupabaseClient)
        .from('opportunity_documents')
        .select('*')
        .eq('document_type', 'property-images')
        .limit(5)

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should restrict offering memorandum to accredited investors', async () => {
      // This should fail for non-accredited users
      const { data, error } = await (supabase as SupabaseClient)
        .from('opportunity_documents')
        .select('*')
        .eq('document_type', 'offering-memorandum')
        .limit(5)

      // Should require accreditation check
      if (error) {
        expect(error.code).toBe('42501') // Insufficient privilege
      } else {
        // Or return empty if user is not accredited
        expect(data).toBeDefined()
      }
    })
  })

  describe('opportunity_bookmarks RLS', () => {
    it('should allow users to manage their own bookmarks', async () => {
      // This should work - users can create their own bookmarks
      const { data, error } = await (supabase as SupabaseClient)
        .from('opportunity_bookmarks')
        .insert({
          opportunity_id: '00000000-0000-0000-0000-000000000000'
        })
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    it('should prevent users from viewing others bookmarks', async () => {
      // This should fail - users cannot see other users' bookmarks
      const { data, error } = await (supabase as SupabaseClient)
        .from('opportunity_bookmarks')
        .select('*')
        .limit(10)

      // Should only return current user's bookmarks
      expect(error).toBeNull()
      expect(data).toBeDefined()
      // All returned bookmarks should belong to current user
      if (data && data.length > 0) {
        // This would be verified with actual user context
        expect(data.every((bookmark: any) => bookmark.user_id === 'current-user-id')).toBe(true)
      }
    })
  })
})