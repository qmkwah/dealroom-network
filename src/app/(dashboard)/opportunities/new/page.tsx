'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { opportunitySchema, type OpportunityInput } from '@/lib/validations/opportunity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OpportunityPreview } from '@/components/opportunities/OpportunityPreview'
import { 
  CheckCircleIcon, 
  AlertCircleIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon,
  BuildingIcon,
  DollarSignIcon,
  CalendarIcon,
  EyeIcon,
  PlayIcon
} from 'lucide-react'

const steps = [
  { id: 1, title: 'Basic Information', icon: BuildingIcon },
  { id: 2, title: 'Property Details', icon: BuildingIcon },
  { id: 3, title: 'Financial Structure', icon: DollarSignIcon },
  { id: 4, title: 'Investment Terms', icon: DollarSignIcon },
  { id: 5, title: 'Strategy & Timeline', icon: CalendarIcon },
  { id: 6, title: 'Visibility Settings', icon: EyeIcon }
]

export default function NewOpportunityPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(opportunitySchema),
    mode: 'onBlur',
    defaultValues: {
      status: 'draft' as const,
      public_listing: false,
      featured_listing: false,
      accredited_only: true,
      property_address: {
        country: 'US'
      }
    }
  })

  // Get current form data for preview
  const formData = watch()

  const progress = (currentStep / steps.length) * 100

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['opportunity_name', 'opportunity_description', 'status'] as const
      case 2:
        return [
          'property_address.street',
          'property_address.city', 
          'property_address.state',
          'property_address.zip',
          'property_type',
          'property_subtype',
          'total_square_feet',
          'number_of_units',
          'year_built',
          'property_condition'
        ] as const
      case 3:
        return [
          'total_project_cost',
          'equity_requirement',
          'debt_amount',
          'debt_type',
          'loan_to_cost_ratio',
          'loan_to_value_ratio'
        ] as const
      case 4:
        return [
          'minimum_investment',
          'maximum_investment',
          'target_raise_amount',
          'projected_irr',
          'projected_total_return_multiple',
          'projected_hold_period_months',
          'cash_on_cash_return',
          'preferred_return_rate'
        ] as const
      case 5:
        return [
          'investment_strategy',
          'business_plan',
          'value_creation_strategy',
          'exit_strategy',
          'fundraising_deadline',
          'expected_closing_date',
          'construction_start_date',
          'stabilization_date',
          'projected_exit_date'
        ] as const
      case 6:
        return [
          'public_listing',
          'featured_listing',
          'accredited_only',
          'geographic_restrictions'
        ] as const
      default:
        return []
    }
  }

  const onSubmit = async (data: OpportunityInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create opportunity')
      }

      const result = await response.json()
      router.push(`/dashboard/opportunities/${result.id}`)
    } catch (error: any) {
      console.error('Opportunity creation error:', error)
      setError(error.message || 'Failed to create opportunity. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opportunity_name">Opportunity Name *</Label>
              <Input
                id="opportunity_name"
                placeholder="e.g., Downtown Apartment Complex Acquisition"
                {...register('opportunity_name')}
              />
              {errors.opportunity_name && (
                <p className="text-sm text-red-600">{errors.opportunity_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunity_description">Description</Label>
              <Textarea
                id="opportunity_description"
                placeholder="Describe the investment opportunity..."
                rows={4}
                {...register('opportunity_description')}
              />
              {errors.opportunity_description && (
                <p className="text-sm text-red-600">{errors.opportunity_description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="fundraising">Fundraising</SelectItem>
                  <SelectItem value="due_diligence">Due Diligence</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  placeholder="123 Main Street"
                  {...register('property_address.street')}
                />
                {errors.property_address?.street && (
                  <p className="text-sm text-red-600">{errors.property_address.street.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  {...register('property_address.city')}
                />
                {errors.property_address?.city && (
                  <p className="text-sm text-red-600">{errors.property_address.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  maxLength={2}
                  {...register('property_address.state')}
                />
                {errors.property_address?.state && (
                  <p className="text-sm text-red-600">{errors.property_address.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  placeholder="10001"
                  {...register('property_address.zip')}
                />
                {errors.property_address?.zip && (
                  <p className="text-sm text-red-600">{errors.property_address.zip.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <Select
                  value={watch('property_type')}
                  onValueChange={(value) => setValue('property_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multifamily">Multifamily</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="mixed_use">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
                {errors.property_type && (
                  <p className="text-sm text-red-600">{errors.property_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_subtype">Property Subtype</Label>
                <Input
                  id="property_subtype"
                  placeholder="e.g., Apartment Complex"
                  {...register('property_subtype')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_square_feet">Square Feet</Label>
                <Input
                  id="total_square_feet"
                  type="number"
                  placeholder="50000"
                  {...register('total_square_feet', { valueAsNumber: true })}
                />
                {errors.total_square_feet && (
                  <p className="text-sm text-red-600">{errors.total_square_feet.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_of_units">Number of Units</Label>
                <Input
                  id="number_of_units"
                  type="number"
                  placeholder="100"
                  {...register('number_of_units', { valueAsNumber: true })}
                />
                {errors.number_of_units && (
                  <p className="text-sm text-red-600">{errors.number_of_units.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_built">Year Built</Label>
                <Input
                  id="year_built"
                  type="number"
                  placeholder="2020"
                  {...register('year_built', { valueAsNumber: true })}
                />
                {errors.year_built && (
                  <p className="text-sm text-red-600">{errors.year_built.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_condition">Property Condition</Label>
              <Select
                value={watch('property_condition')}
                onValueChange={(value) => setValue('property_condition', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_project_cost">Total Project Cost *</Label>
                <Input
                  id="total_project_cost"
                  type="number"
                  placeholder="5000000"
                  {...register('total_project_cost', { valueAsNumber: true })}
                />
                {errors.total_project_cost && (
                  <p className="text-sm text-red-600">{errors.total_project_cost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="equity_requirement">Equity Requirement *</Label>
                <Input
                  id="equity_requirement"
                  type="number"
                  placeholder="1500000"
                  {...register('equity_requirement', { valueAsNumber: true })}
                />
                {errors.equity_requirement && (
                  <p className="text-sm text-red-600">{errors.equity_requirement.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="debt_amount">Debt Amount</Label>
                <Input
                  id="debt_amount"
                  type="number"
                  placeholder="3500000"
                  {...register('debt_amount', { valueAsNumber: true })}
                />
                {errors.debt_amount && (
                  <p className="text-sm text-red-600">{errors.debt_amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt_type">Debt Type</Label>
                <Select
                  value={watch('debt_type')}
                  onValueChange={(value) => setValue('debt_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select debt type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_loan">Bank Loan</SelectItem>
                    <SelectItem value="bridge_loan">Bridge Loan</SelectItem>
                    <SelectItem value="construction_loan">Construction Loan</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loan_to_cost_ratio">Loan-to-Cost Ratio</Label>
                <Input
                  id="loan_to_cost_ratio"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.75"
                  {...register('loan_to_cost_ratio', { valueAsNumber: true })}
                />
                {errors.loan_to_cost_ratio && (
                  <p className="text-sm text-red-600">{errors.loan_to_cost_ratio.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan_to_value_ratio">Loan-to-Value Ratio</Label>
                <Input
                  id="loan_to_value_ratio"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.70"
                  {...register('loan_to_value_ratio', { valueAsNumber: true })}
                />
                {errors.loan_to_value_ratio && (
                  <p className="text-sm text-red-600">{errors.loan_to_value_ratio.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimum_investment">Minimum Investment *</Label>
                <Input
                  id="minimum_investment"
                  type="number"
                  placeholder="50000"
                  {...register('minimum_investment', { valueAsNumber: true })}
                />
                {errors.minimum_investment && (
                  <p className="text-sm text-red-600">{errors.minimum_investment.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximum_investment">Maximum Investment</Label>
                <Input
                  id="maximum_investment"
                  type="number"
                  placeholder="500000"
                  {...register('maximum_investment', { valueAsNumber: true })}
                />
                {errors.maximum_investment && (
                  <p className="text-sm text-red-600">{errors.maximum_investment.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_raise_amount">Target Raise Amount *</Label>
                <Input
                  id="target_raise_amount"
                  type="number"
                  placeholder="1500000"
                  {...register('target_raise_amount', { valueAsNumber: true })}
                />
                {errors.target_raise_amount && (
                  <p className="text-sm text-red-600">{errors.target_raise_amount.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projected_irr">Projected IRR</Label>
                <Input
                  id="projected_irr"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.15"
                  {...register('projected_irr', { valueAsNumber: true })}
                />
                {errors.projected_irr && (
                  <p className="text-sm text-red-600">{errors.projected_irr.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projected_total_return_multiple">Return Multiple</Label>
                <Input
                  id="projected_total_return_multiple"
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="1.8"
                  {...register('projected_total_return_multiple', { valueAsNumber: true })}
                />
                {errors.projected_total_return_multiple && (
                  <p className="text-sm text-red-600">{errors.projected_total_return_multiple.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projected_hold_period_months">Hold Period (Months)</Label>
                <Input
                  id="projected_hold_period_months"
                  type="number"
                  placeholder="60"
                  {...register('projected_hold_period_months', { valueAsNumber: true })}
                />
                {errors.projected_hold_period_months && (
                  <p className="text-sm text-red-600">{errors.projected_hold_period_months.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cash_on_cash_return">Cash-on-Cash Return</Label>
                <Input
                  id="cash_on_cash_return"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.08"
                  {...register('cash_on_cash_return', { valueAsNumber: true })}
                />
                {errors.cash_on_cash_return && (
                  <p className="text-sm text-red-600">{errors.cash_on_cash_return.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_return_rate">Preferred Return Rate</Label>
                <Input
                  id="preferred_return_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  placeholder="0.06"
                  {...register('preferred_return_rate', { valueAsNumber: true })}
                />
                {errors.preferred_return_rate && (
                  <p className="text-sm text-red-600">{errors.preferred_return_rate.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investment_strategy">Investment Strategy</Label>
                <Select
                  value={watch('investment_strategy')}
                  onValueChange={(value) => setValue('investment_strategy', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy_hold">Buy & Hold</SelectItem>
                    <SelectItem value="value_add">Value Add</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="opportunistic">Opportunistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit_strategy">Exit Strategy</Label>
                <Select
                  value={watch('exit_strategy')}
                  onValueChange={(value) => setValue('exit_strategy', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exit strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="refinance">Refinance</SelectItem>
                    <SelectItem value="hold_indefinitely">Hold Indefinitely</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_plan">Business Plan</Label>
              <Textarea
                id="business_plan"
                placeholder="Describe the business plan..."
                rows={3}
                {...register('business_plan')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value_creation_strategy">Value Creation Strategy</Label>
              <Textarea
                id="value_creation_strategy"
                placeholder="Describe the value creation strategy..."
                rows={3}
                {...register('value_creation_strategy')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fundraising_deadline">Fundraising Deadline</Label>
                <Input
                  id="fundraising_deadline"
                  type="date"
                  {...register('fundraising_deadline')}
                />
                {errors.fundraising_deadline && (
                  <p className="text-sm text-red-600">{errors.fundraising_deadline.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_closing_date">Expected Closing Date</Label>
                <Input
                  id="expected_closing_date"
                  type="date"
                  {...register('expected_closing_date')}
                />
                {errors.expected_closing_date && (
                  <p className="text-sm text-red-600">{errors.expected_closing_date.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="construction_start_date">Construction Start Date</Label>
                <Input
                  id="construction_start_date"
                  type="date"
                  {...register('construction_start_date')}
                />
                {errors.construction_start_date && (
                  <p className="text-sm text-red-600">{errors.construction_start_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stabilization_date">Stabilization Date</Label>
                <Input
                  id="stabilization_date"
                  type="date"
                  {...register('stabilization_date')}
                />
                {errors.stabilization_date && (
                  <p className="text-sm text-red-600">{errors.stabilization_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="projected_exit_date">Projected Exit Date</Label>
                <Input
                  id="projected_exit_date"
                  type="date"
                  {...register('projected_exit_date')}
                />
                {errors.projected_exit_date && (
                  <p className="text-sm text-red-600">{errors.projected_exit_date.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="public_listing"
                  checked={watch('public_listing')}
                  onCheckedChange={(checked) => setValue('public_listing', checked as boolean)}
                />
                <Label htmlFor="public_listing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Public Listing
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Make this opportunity visible to all registered users
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured_listing"
                  checked={watch('featured_listing')}
                  onCheckedChange={(checked) => setValue('featured_listing', checked as boolean)}
                />
                <Label htmlFor="featured_listing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Featured Listing
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Promote this opportunity in featured sections
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accredited_only"
                  checked={watch('accredited_only')}
                  onCheckedChange={(checked) => setValue('accredited_only', checked as boolean)}
                />
                <Label htmlFor="accredited_only" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Accredited Investors Only
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Restrict access to accredited investors only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geographic_restrictions">Geographic Restrictions</Label>
              <Input
                id="geographic_restrictions"
                placeholder="e.g., US, CA, NY (comma-separated)"
                onChange={(e) => {
                  const value = e.target.value
                  const restrictions = value ? value.split(',').map(s => s.trim()) : []
                  setValue('geographic_restrictions', restrictions)
                }}
              />
              <p className="text-sm text-muted-foreground">
                Optional: Restrict access to specific states/countries
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create Investment Opportunity</h1>
            <p className="text-muted-foreground">
              Create a comprehensive investment opportunity profile to connect with potential investors
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of {steps.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = currentStep > step.id
                const isCurrent = currentStep === step.id
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2 
                      ${isCompleted 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : isCurrent 
                          ? 'border-primary text-primary' 
                          : 'border-muted-foreground/30 text-muted-foreground'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`
                      ml-2 text-sm font-medium hidden sm:inline
                      ${isCurrent ? 'text-primary' : 'text-muted-foreground'}
                    `}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-4 sm:w-8 h-px bg-muted-foreground/30 mx-2 sm:mx-4" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const currentStepData = steps.find(s => s.id === currentStep)
                    if (currentStepData?.icon) {
                      const Icon = currentStepData.icon
                      return <Icon className="w-5 h-5" />
                    }
                    return null
                  })()}
                  {steps.find(s => s.id === currentStep)?.title}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Enter the basic information about your investment opportunity'}
                  {currentStep === 2 && 'Provide details about the property location and characteristics'}
                  {currentStep === 3 && 'Define the financial structure and debt information'}
                  {currentStep === 4 && 'Set investment terms and return projections'}
                  {currentStep === 5 && 'Describe your strategy and key timeline dates'}
                  {currentStep === 6 && 'Configure visibility and access settings'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircleIcon className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {renderStep()}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Previous
                </Button>
                
                {/* Preview Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  Preview
                </Button>
              </div>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Opportunity'}
                  <CheckCircleIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Opportunity Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <OpportunityPreview opportunityData={{ 
              ...formData, 
              status: formData.status || 'draft',
              property_address: {
                ...formData.property_address,
                country: formData.property_address?.country || 'US'
              },
              public_listing: formData.public_listing ?? false,
              featured_listing: formData.featured_listing ?? false,
              accredited_only: formData.accredited_only ?? true
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}