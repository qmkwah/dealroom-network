import { z } from 'zod'

// Property Types
export const propertyTypes = [
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
] as const

export type PropertyType = typeof propertyTypes[number]

// Opportunity Status
export const opportunityStatuses = [
  'draft',
  'review',
  'active',
  'closed',
  'archived'
] as const

export type OpportunityStatus = typeof opportunityStatuses[number]

// Simplified flat schema that matches database structure
export const createOpportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  propertyType: z.enum(propertyTypes),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(3, 'State must be 2-3 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  country: z.string(),
  squareFootage: z.number().min(100, 'Square footage must be at least 100 sq ft').max(50000000, 'Square footage too large'),
  yearBuilt: z.number().min(1900, 'Year built must be after 1900').max(new Date().getFullYear(), 'Year built cannot be in the future'),
  unitCount: z.number().min(1, 'Unit count must be at least 1').max(10000, 'Unit count too large'),
  totalInvestment: z.number().min(100000, 'Total investment must be at least $100,000').max(1000000000, 'Total investment too large'),
  minimumInvestment: z.number().min(10000, 'Minimum investment must be at least $10,000').max(100000000, 'Minimum investment too large'),
  targetReturn: z.number().min(0.1, 'Target return must be at least 0.1%').max(100, 'Target return cannot exceed 100%'),
  holdPeriod: z.number().min(1, 'Hold period must be at least 1 month').max(360, 'Hold period cannot exceed 30 years'),
  acquisitionFee: z.number().min(0, 'Acquisition fee cannot be negative').max(10, 'Acquisition fee cannot exceed 10%'),
  managementFee: z.number().min(0, 'Management fee cannot be negative').max(5, 'Management fee cannot exceed 5%'),
  dispositionFee: z.number().min(0, 'Disposition fee cannot be negative').max(10, 'Disposition fee cannot exceed 10%'),
  status: z.enum(['draft', 'review', 'active'])
}).refine(data => data.minimumInvestment <= data.totalInvestment, {
  message: 'Minimum investment cannot exceed total investment',
  path: ['minimumInvestment']
})

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>

// Draft schema - requires essential fields for meaningful draft
export const createDraftSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  propertyType: z.enum(propertyTypes, 'Property type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  street: z.string().min(1, 'Street address is required').optional(),
  city: z.string().min(1, 'City is required').optional(), 
  state: z.string().min(2, 'State is required').optional(),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters').optional(),
  country: z.string().optional(),
  squareFootage: z.number().min(100, 'Square footage must be at least 100 sq ft').optional(),
  yearBuilt: z.number().min(1900, 'Year built must be after 1900').max(new Date().getFullYear(), 'Year built cannot be in the future').optional(),
  unitCount: z.number().min(1, 'Unit count must be at least 1').optional(),
  totalInvestment: z.number().min(100000, 'Total investment must be at least $100,000').optional(),
  minimumInvestment: z.number().min(10000, 'Minimum investment must be at least $10,000').optional(),
  targetReturn: z.number().min(0.1, 'Target return must be at least 0.1%').max(100, 'Target return cannot exceed 100%').optional(),
  holdPeriod: z.number().min(1, 'Hold period must be at least 1 month').max(360, 'Hold period cannot exceed 30 years').optional(),
  acquisitionFee: z.number().min(0, 'Acquisition fee cannot be negative').max(10, 'Acquisition fee cannot exceed 10%').optional(),
  managementFee: z.number().min(0, 'Management fee cannot be negative').max(5, 'Management fee cannot exceed 5%').optional(),
  dispositionFee: z.number().min(0, 'Disposition fee cannot be negative').max(10, 'Disposition fee cannot exceed 10%').optional(),
  status: z.literal('draft')
})

export type CreateDraftInput = z.infer<typeof createDraftSchema>

// Update schema allows partial updates
export const updateOpportunitySchema = createOpportunitySchema.partial()

export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>

// Filter schema for searching
export const opportunityFilterSchema = z.object({
  propertyTypes: z.array(z.enum(propertyTypes)).optional(),
  investmentRange: z.tuple([z.number(), z.number()]).optional(),
  returnRange: z.tuple([z.number(), z.number()]).optional(),
  locations: z.array(z.string()).optional(),
  status: z.array(z.enum(opportunityStatuses)).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['created_at', 'total_investment', 'target_return', 'title']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export type OpportunityFilterInput = z.infer<typeof opportunityFilterSchema>

// Search schema
export const opportunitySearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Search query too long'),
  filters: opportunityFilterSchema.omit({ page: true, limit: true }).optional()
}).merge(
  opportunityFilterSchema.pick({ page: true, limit: true, sortBy: true, sortOrder: true })
)

export type OpportunitySearchInput = z.infer<typeof opportunitySearchSchema>