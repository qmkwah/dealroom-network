'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { OpportunityFiltersComponent, type OpportunityFilters } from '@/components/filters/opportunity-filters'
import { OpportunitySearch } from '@/components/search/opportunity-search'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Grid3x3,
  List,
  Plus,
  AlertCircle,
  Building2
} from 'lucide-react'
import Link from 'next/link'

interface Opportunity {
  id: string
  opportunity_name: string
  opportunity_description: string
  property_type: string
  property_subtype?: string
  investment_strategy: string
  total_project_cost: number
  equity_requirement: number
  minimum_investment: number
  maximum_investment?: number
  target_raise_amount: number
  projected_irr?: number
  projected_total_return_multiple?: number
  projected_hold_period_months?: number
  cash_on_cash_return?: number
  preferred_return_rate?: number
  property_address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  total_square_feet?: number
  number_of_units?: number
  year_built?: number
  fundraising_deadline?: string
  expected_closing_date?: string
  featured_listing: boolean
  accredited_only: boolean
  status: string
  created_at: string
  sponsor_id: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function OpportunitiesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Get initial values from URL params
  const getInitialFilters = useCallback((): OpportunityFilters => {
    return {
      property_type: searchParams.get('property_type') || undefined,
      investment_strategy: searchParams.get('investment_strategy') || undefined,
      min_investment: searchParams.get('min_investment') ? Number(searchParams.get('min_investment')) : undefined,
      max_investment: searchParams.get('max_investment') ? Number(searchParams.get('max_investment')) : undefined,
      min_irr: searchParams.get('min_irr') ? Number(searchParams.get('min_irr')) : undefined,
      max_irr: searchParams.get('max_irr') ? Number(searchParams.get('max_irr')) : undefined,
      state: searchParams.get('state') || undefined,
      city: searchParams.get('city') || undefined,
    }
  }, [searchParams])

  const [filters, setFilters] = useState<OpportunityFilters>(getInitialFilters)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '')

  // Update URL params when filters or search change
  const updateUrlParams = useCallback((newFilters: OpportunityFilters, newSearchTerm: string, page: number = 1) => {
    const params = new URLSearchParams()
    
    if (newSearchTerm) params.set('keyword', newSearchTerm)
    if (newFilters.property_type) params.set('property_type', newFilters.property_type)
    if (newFilters.investment_strategy) params.set('investment_strategy', newFilters.investment_strategy)
    if (newFilters.min_investment) params.set('min_investment', newFilters.min_investment.toString())
    if (newFilters.max_investment) params.set('max_investment', newFilters.max_investment.toString())
    if (newFilters.min_irr) params.set('min_irr', newFilters.min_irr.toString())
    if (newFilters.max_irr) params.set('max_irr', newFilters.max_irr.toString())
    if (newFilters.state) params.set('state', newFilters.state)
    if (newFilters.city) params.set('city', newFilters.city)
    if (page > 1) params.set('page', page.toString())

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname

    router.replace(newUrl, { scroll: false })
  }, [pathname, router])

  // Fetch opportunities
  const fetchOpportunities = useCallback(async (
    currentFilters: OpportunityFilters, 
    currentSearchTerm: string, 
    currentPage: number = 1
  ) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', pagination.limit.toString())
      params.set('status', 'published')

      if (currentSearchTerm) params.set('keyword', currentSearchTerm)
      if (currentFilters.property_type) params.set('property_type', currentFilters.property_type)
      if (currentFilters.investment_strategy) params.set('investment_strategy', currentFilters.investment_strategy)
      if (currentFilters.min_investment) params.set('min_investment', currentFilters.min_investment.toString())
      if (currentFilters.max_investment) params.set('max_investment', currentFilters.max_investment.toString())
      if (currentFilters.min_irr) params.set('min_irr', currentFilters.min_irr.toString())
      if (currentFilters.max_irr) params.set('max_irr', currentFilters.max_irr.toString())
      if (currentFilters.state) params.set('state', currentFilters.state)
      if (currentFilters.city) params.set('city', currentFilters.city)

      const response = await fetch(`/api/opportunities/search?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities')
      }

      const data = await response.json()
      setOpportunities(data.opportunities || [])
      setPagination(data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  // Handle filter changes
  const handleFiltersChange = (newFilters: OpportunityFilters) => {
    setFilters(newFilters)
    updateUrlParams(newFilters, searchTerm, 1)
    fetchOpportunities(newFilters, searchTerm, 1)
  }

  // Handle search changes
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    updateUrlParams(filters, newSearchTerm, 1)
    fetchOpportunities(filters, newSearchTerm, 1)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({})
    updateUrlParams({}, searchTerm, 1)
    fetchOpportunities({}, searchTerm, 1)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    updateUrlParams(filters, searchTerm, newPage)
    fetchOpportunities(filters, searchTerm, newPage)
  }

  // Initial load
  useEffect(() => {
    const currentPage = parseInt(searchParams.get('page') || '1')
    fetchOpportunities(filters, searchTerm, currentPage)
  }, []) // Only run on mount

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Investment Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Discover and invest in vetted real estate opportunities
          </p>
        </div>
        <Button asChild>
          <Link href="/opportunities/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Link>
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <OpportunitySearch
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, description, location..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            size="sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <OpportunityFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        {/* Main Content */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                `Showing ${opportunities.length} of ${pagination.total} opportunities`
              )}
            </div>
            {pagination.total > 0 && (
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-64">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}. Please try again or contact support if the problem persists.
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && opportunities.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or clearing your filters
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Opportunities Grid */}
          {!loading && !error && opportunities.length > 0 && (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, pagination.page - 2) + i
                if (pageNumber > pagination.totalPages) return null
                
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}