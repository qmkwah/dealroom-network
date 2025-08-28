import {
  createOpportunitySchema,
  updateOpportunitySchema,
  opportunityFilterSchema,
  opportunitySearchSchema,
  type CreateOpportunityInput,
  type UpdateOpportunityInput
} from '@/lib/validations/opportunities'

describe('Opportunity Validation Schemas', () => {
  describe('createOpportunitySchema', () => {
    const validOpportunityData: CreateOpportunityInput = {
      title: 'Test Property',
      propertyType: 'multifamily',
      description: 'Test description for validation',
      street: '123 Test St',
      city: 'Test City',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      squareFootage: 10000,
      yearBuilt: 2020,
      unitCount: 50,
      totalInvestment: 1000000,
      minimumInvestment: 50000,
      targetReturn: 12.5,
      holdPeriod: 60,
      acquisitionFee: 2.5,
      managementFee: 1.5,
      dispositionFee: 2.0,
      status: 'draft'
    }

    it('should validate complete valid opportunity data', () => {
      const result = createOpportunitySchema.safeParse(validOpportunityData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validOpportunityData)
      }
    })

    describe('title validation', () => {
      it('should require title', () => {
        const result = createOpportunitySchema.safeParse({ ...validOpportunityData, title: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Title is required')
        }
      })

      it('should limit title length to 200 characters', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          title: 'A'.repeat(201) 
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Title must be less than 200 characters')
        }
      })
    })

    describe('address validation', () => {
      it('should require street address', () => {
        const result = createOpportunitySchema.safeParse({ ...validOpportunityData, street: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Street address is required')
        }
      })

      it('should require city', () => {
        const result = createOpportunitySchema.safeParse({ ...validOpportunityData, city: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('City is required')
        }
      })

      it('should validate state length', () => {
        const result = createOpportunitySchema.safeParse({ ...validOpportunityData, state: 'A' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('State is required')
        }
      })

      it('should validate zip code length', () => {
        const result = createOpportunitySchema.safeParse({ ...validOpportunityData, zipCode: '123' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('ZIP code must be at least 5 characters')
        }
      })
    })

    describe('property details validation', () => {
      it('should validate property type enum', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          propertyType: 'invalid-type' as any 
        })
        expect(result.success).toBe(false)
      })

      it('should require minimum description length', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          description: 'short' 
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Description must be at least 10 characters')
        }
      })

      it('should validate square footage range', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          squareFootage: 0 
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Square footage must be greater than 0')
        }
      })

      it('should validate year built range', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          yearBuilt: 1700 
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Year built must be after 1800')
        }
      })
    })

    describe('financial structure validation', () => {
      it('should validate minimum total investment', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          totalInvestment: 50000 
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Total investment must be at least $100,000')
        }
      })

      it('should validate target return range', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          targetReturn: 60 
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Target return cannot exceed 50%')
        }
      })

      it('should validate minimum investment not exceeding total', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          totalInvestment: 100000,
          minimumInvestment: 150000 
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Minimum investment cannot exceed total investment')
        }
      })

      it('should validate hold period range', () => {
        const result = createOpportunitySchema.safeParse({ 
          ...validOpportunityData, 
          holdPeriod: 6 
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Hold period must be at least 12 months')
        }
      })
    })
  })

  describe('updateOpportunitySchema', () => {
    it('should allow partial updates', () => {
      const partialUpdate = { title: 'Updated Title' }
      const result = updateOpportunitySchema.safeParse(partialUpdate)
      expect(result.success).toBe(true)
    })

    it('should validate provided fields', () => {
      const partialUpdate = { title: '' }
      const result = updateOpportunitySchema.safeParse(partialUpdate)
      expect(result.success).toBe(false)
    })
  })

  describe('opportunityFilterSchema', () => {
    it('should parse valid filter options', () => {
      const filters = {
        propertyTypes: ['multifamily', 'office'],
        investmentRange: [100000, 5000000],
        returnRange: [8, 15],
        page: 1,
        limit: 20
      }
      const result = opportunityFilterSchema.safeParse(filters)
      expect(result.success).toBe(true)
    })

    it('should apply default values', () => {
      const result = opportunityFilterSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
        expect(result.data.sortBy).toBe('created_at')
        expect(result.data.sortOrder).toBe('desc')
      }
    })

    it('should validate limit bounds', () => {
      const result = opportunityFilterSchema.safeParse({ limit: 100 })
      expect(result.success).toBe(false)
    })
  })

  describe('opportunitySearchSchema', () => {
    it('should validate search with query and filters', () => {
      const search = {
        query: 'luxury apartment',
        filters: {
          propertyTypes: ['multifamily'],
          investmentRange: [500000, 2000000]
        },
        page: 1,
        limit: 10
      }
      const result = opportunitySearchSchema.safeParse(search)
      expect(result.success).toBe(true)
    })

    it('should require search query', () => {
      const result = opportunitySearchSchema.safeParse({})
      expect(result.success).toBe(false)
      if (!result.success) {
        console.log('Search validation errors:', result.error.issues.map(i => i.message))
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('should limit search query length', () => {
      const result = opportunitySearchSchema.safeParse({
        query: 'A'.repeat(201)
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Search query too long')
      }
    })
  })
})