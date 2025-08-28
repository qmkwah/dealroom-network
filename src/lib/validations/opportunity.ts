import { z } from 'zod'

const propertyTypeSchema = z.enum([
  'multifamily',
  'retail', 
  'office',
  'industrial',
  'land',
  'mixed_use'
])

const statusSchema = z.enum([
  'draft',
  'fundraising', 
  'due_diligence',
  'funded',
  'closed',
  'cancelled'
])

const propertyConditionSchema = z.enum([
  'excellent',
  'good',
  'fair', 
  'poor'
])

const debtTypeSchema = z.enum([
  'bank_loan',
  'bridge_loan',
  'construction_loan',
  'none'
])

const investmentStrategySchema = z.enum([
  'buy_hold',
  'value_add',
  'development',
  'opportunistic'
])

const exitStrategySchema = z.enum([
  'sale',
  'refinance',
  'hold_indefinitely'
])

const propertyAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  zip: z.string().min(5, 'ZIP code is required'),
  country: z.string().optional().default('US')
})

export const opportunitySchema = z.object({
  // Basic Information
  opportunity_name: z.string().min(1, 'Opportunity name is required'),
  opportunity_description: z.string().optional(),
  status: statusSchema.default('draft'),

  // Property Details
  property_address: propertyAddressSchema,
  property_type: propertyTypeSchema,
  property_subtype: z.string().optional(),
  total_square_feet: z.number().int().positive().optional(),
  number_of_units: z.number().int().positive().optional(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  property_condition: propertyConditionSchema.optional(),

  // Financial Structure
  total_project_cost: z.number().positive('Total project cost must be positive'),
  equity_requirement: z.number().positive('Equity requirement must be positive'),
  debt_amount: z.number().positive().optional(),
  debt_type: debtTypeSchema.optional(),
  loan_to_cost_ratio: z.number().min(0).max(1).optional(),
  loan_to_value_ratio: z.number().min(0).max(1).optional(),

  // Investment Terms
  minimum_investment: z.number().positive('Minimum investment must be positive'),
  maximum_investment: z.number().positive().optional(),
  target_raise_amount: z.number().positive('Target raise amount must be positive'),
  projected_irr: z.number().min(0).max(1).optional(),
  projected_total_return_multiple: z.number().min(1).optional(),
  projected_hold_period_months: z.number().int().positive().optional(),
  cash_on_cash_return: z.number().min(0).max(1).optional(),
  preferred_return_rate: z.number().min(0).max(1).optional(),

  // Investment Strategy
  investment_strategy: investmentStrategySchema.optional(),
  business_plan: z.string().optional(),
  value_creation_strategy: z.string().optional(),
  exit_strategy: exitStrategySchema.optional(),

  // Timeline
  fundraising_deadline: z.string().refine((date) => {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime()) && parsed > new Date()
  }, 'Fundraising deadline must be a future date').optional(),
  expected_closing_date: z.string().refine((date) => {
    if (!date) return true
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }, 'Expected closing date must be valid').optional(),
  construction_start_date: z.string().refine((date) => {
    if (!date) return true
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }, 'Construction start date must be valid').optional(),
  stabilization_date: z.string().refine((date) => {
    if (!date) return true
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }, 'Stabilization date must be valid').optional(),
  projected_exit_date: z.string().refine((date) => {
    if (!date) return true
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }, 'Projected exit date must be valid').optional(),

  // Visibility
  public_listing: z.boolean().default(false),
  featured_listing: z.boolean().default(false),
  accredited_only: z.boolean().default(true),
  geographic_restrictions: z.array(z.string()).optional()
})

// Refine schema to ensure maximum investment >= minimum investment
.refine((data) => {
  if (data.maximum_investment && data.minimum_investment) {
    return data.maximum_investment >= data.minimum_investment
  }
  return true
}, {
  message: 'Maximum investment must be greater than or equal to minimum investment',
  path: ['maximum_investment']
})

// Refine schema to ensure target raise >= minimum investment
.refine((data) => {
  return data.target_raise_amount >= data.minimum_investment
}, {
  message: 'Target raise amount must be greater than or equal to minimum investment', 
  path: ['target_raise_amount']
})

export type OpportunityInput = z.infer<typeof opportunitySchema>

// Schema for updating opportunities (all fields optional except id)
export const updateOpportunitySchema = opportunitySchema.partial()

export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>