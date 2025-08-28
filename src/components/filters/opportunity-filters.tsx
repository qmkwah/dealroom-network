'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Slider } from '@/components/ui/slider' // Not implemented yet
import { Badge } from '@/components/ui/badge'
import { X, Filter, RotateCcw } from 'lucide-react'
import { propertyTypes, investmentStrategies, propertySubtypes } from '@/lib/constants/opportunities'

export interface OpportunityFilters {
  property_type?: string
  property_subtype?: string
  investment_strategy?: string
  min_investment?: number
  max_investment?: number
  min_irr?: number
  max_irr?: number
  state?: string
  city?: string
  status?: string
}

interface OpportunityFiltersProps {
  filters: OpportunityFilters
  onFiltersChange: (filters: OpportunityFilters) => void
  onClearFilters: () => void
  className?: string
}

export function OpportunityFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  className = "" 
}: OpportunityFiltersProps) {
  const [localFilters, setLocalFilters] = useState<OpportunityFilters>(filters)

  const updateFilter = (key: keyof OpportunityFilters, value: any) => {
    // Convert "all" to undefined to clear the filter
    const filterValue = value === 'all' || value === '' ? undefined : value
    const newFilters = { ...localFilters, [key]: filterValue }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const removeFilter = (key: keyof OpportunityFilters) => {
    const newFilters = { ...localFilters }
    delete newFilters[key]
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearAll = () => {
    setLocalFilters({})
    onClearFilters()
  }

  const activeFiltersCount = Object.keys(localFilters).filter(key => 
    localFilters[key as keyof OpportunityFilters] !== undefined && 
    localFilters[key as keyof OpportunityFilters] !== ''
  ).length

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 px-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Type Filter */}
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select
            value={localFilters.property_type || 'all'}
            onValueChange={(value) => updateFilter('property_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Property Subtype Filter */}
        {localFilters.property_type && (
          <div className="space-y-2">
            <Label>Property Subtype</Label>
            <Select
              value={localFilters.property_subtype || 'all'}
              onValueChange={(value) => updateFilter('property_subtype', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subtype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subtypes</SelectItem>
                {propertySubtypes
                  .filter(subtype => subtype.propertyType === localFilters.property_type)
                  .map((subtype) => (
                    <SelectItem key={subtype.value} value={subtype.value}>
                      {subtype.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Investment Strategy Filter */}
        <div className="space-y-2">
          <Label>Investment Strategy</Label>
          <Select
            value={localFilters.investment_strategy || 'all'}
            onValueChange={(value) => updateFilter('investment_strategy', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              {investmentStrategies.map((strategy) => (
                <SelectItem key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Investment Range Filter */}
        <div className="space-y-4">
          <Label>Minimum Investment Range</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Min ($)</Label>
                <Input
                  type="number"
                  placeholder="50,000"
                  value={localFilters.min_investment || ''}
                  onChange={(e) => updateFilter('min_investment', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max ($)</Label>
                <Input
                  type="number"
                  placeholder="500,000"
                  value={localFilters.max_investment || ''}
                  onChange={(e) => updateFilter('max_investment', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* IRR Range Filter */}
        <div className="space-y-4">
          <Label>Projected IRR (%)</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Min (%)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="8.0"
                value={localFilters.min_irr || ''}
                onChange={(e) => updateFilter('min_irr', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max (%)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="25.0"
                value={localFilters.max_irr || ''}
                onChange={(e) => updateFilter('max_irr', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>

        {/* Location Filters */}
        <div className="space-y-3">
          <Label>Location</Label>
          <div className="space-y-3">
            <Input
              placeholder="State (e.g., NY, CA)"
              value={localFilters.state || ''}
              onChange={(e) => updateFilter('state', e.target.value || undefined)}
            />
            <Input
              placeholder="City"
              value={localFilters.city || ''}
              onChange={(e) => updateFilter('city', e.target.value || undefined)}
            />
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {localFilters.property_type && (
                <Badge variant="secondary" className="text-xs">
                  {propertyTypes.find(t => t.value === localFilters.property_type)?.label}
                  <button
                    onClick={() => removeFilter('property_type')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.investment_strategy && (
                <Badge variant="secondary" className="text-xs">
                  {investmentStrategies.find(s => s.value === localFilters.investment_strategy)?.label}
                  <button
                    onClick={() => removeFilter('investment_strategy')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.min_investment && (
                <Badge variant="secondary" className="text-xs">
                  Min: ${localFilters.min_investment.toLocaleString()}
                  <button
                    onClick={() => removeFilter('min_investment')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.max_investment && (
                <Badge variant="secondary" className="text-xs">
                  Max: ${localFilters.max_investment.toLocaleString()}
                  <button
                    onClick={() => removeFilter('max_investment')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.state && (
                <Badge variant="secondary" className="text-xs">
                  State: {localFilters.state}
                  <button
                    onClick={() => removeFilter('state')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {localFilters.city && (
                <Badge variant="secondary" className="text-xs">
                  City: {localFilters.city}
                  <button
                    onClick={() => removeFilter('city')}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}