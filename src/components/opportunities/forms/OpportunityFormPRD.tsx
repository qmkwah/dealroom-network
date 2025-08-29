'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { opportunitySchema, type OpportunityInput } from '@/lib/validations/opportunity'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AlertCircle, Save, Eye, Send, Calendar, DollarSign, Building2, MapPin } from 'lucide-react'
import { propertyTypes, investmentStrategies, exitStrategies, debtTypes, propertyConditions } from '@/lib/constants/opportunities'
import DocumentUpload from './DocumentUpload'

interface OpportunityFormProps {
  mode?: 'create' | 'edit'
  initialData?: Partial<OpportunityInput>
  onSubmit: (data: OpportunityInput) => Promise<{ id: string }>
  onSaveAsDraft?: (data: Partial<OpportunityInput>) => Promise<void>
  onPublish?: (data: OpportunityInput) => Promise<{ id: string }>
}

const RequiredIndicator = () => (
  <span className="text-red-500 font-semibold" aria-label="Required field">*</span>
)

export function OpportunityFormPRD({
  mode = 'create',
  initialData,
  onSubmit,
  onSaveAsDraft,
  onPublish,
}: OpportunityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [opportunityId, setOpportunityId] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<OpportunityInput>({
    resolver: zodResolver(opportunitySchema) as any, // Temporary fix until database schema is updated
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      opportunity_name: '',
      opportunity_description: '',
      property_type: 'multifamily',
      property_address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US'
      },
      total_square_feet: undefined,
      year_built: undefined,
      number_of_units: undefined,
      total_project_cost: undefined,
      equity_requirement: undefined,
      minimum_investment: undefined,
      maximum_investment: undefined,
      target_raise_amount: undefined,
      projected_irr: undefined,
      projected_hold_period_months: undefined,
      investment_strategy: undefined,
      business_plan: '',
      value_creation_strategy: '',
      exit_strategy: undefined,
      status: 'draft',
      public_listing: false,
      featured_listing: false,
      accredited_only: true,
      ...initialData
    }
  })

  // Auto-save draft to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (mode === 'create') {
        localStorage.setItem('opportunity-draft-prd', JSON.stringify(value))
      }
    })
    return () => subscription.unsubscribe()
  }, [form, mode])

  // Recover draft on mount
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      const saved = localStorage.getItem('opportunity-draft-prd')
      if (saved) {
        try {
          const draftData = JSON.parse(saved)
          form.reset(draftData)
          toast.info('Draft restored from previous session')
        } catch (recoveryError) {
          console.error('Failed to recover draft:', recoveryError)
        }
      }
    }
  }, [mode, initialData, form])

  // Reset initial data when it changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset(initialData)
      // Initialize documents and opportunity ID for edit mode
      if ((initialData as any).property_documents) {
        setDocuments((initialData as any).property_documents)
      }
      if ((initialData as any).id) {
        setOpportunityId((initialData as any).id)
      }
    }
  }, [mode, initialData, form])

  // Document management handlers
  const handleDocumentUploaded = (document: any) => {
    setDocuments(prev => [...prev, document])
    toast.success('Document uploaded successfully!')
  }

  const handleDocumentDeleted = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    toast.success('Document deleted successfully!')
  }

  const handleSubmit = async (data: OpportunityInput) => {
    // Trigger validation to show all errors
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Please fix the validation errors before submitting')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const result = await onSubmit(data)
      
      // Set opportunity ID for document uploads if in create mode
      if (mode === 'create' && result.id) {
        setOpportunityId(result.id)
      }
      
      toast.success(mode === 'create' ? 'Opportunity created successfully!' : 'Opportunity updated successfully!')
      
      // Clear draft on successful submission
      if (mode === 'create') {
        localStorage.removeItem('opportunity-draft-prd')
      }
      
      router.push(`/dashboard/opportunities/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to save opportunity')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async () => {
    if (!onPublish) return
    
    // Trigger validation to show all errors
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Please fix all validation errors before publishing')
      return
    }
    
    const formData = form.getValues()
    
    try {
      setIsSubmitting(true)
      const result = await onPublish(formData as OpportunityInput)
      toast.success('Opportunity published successfully!')
      router.push(`/dashboard/opportunities/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publishing failed')
      toast.error('Failed to publish opportunity')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!onSaveAsDraft) return
    
    const formData = form.getValues()
    
    try {
      setIsDraftSaving(true)
      await onSaveAsDraft(formData)
      toast.success('Draft saved successfully!')
    } catch (err) {
      toast.error('Failed to save draft')
    } finally {
      setIsDraftSaving(false)
    }
  }

  // Get form validation state
  const formState = form.formState
  const hasErrors = Object.keys(formState.errors).length > 0
  const isFormDirty = formState.isDirty

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create Investment Opportunity' : 'Edit Opportunity'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'create' 
            ? 'Share your real estate investment opportunity with qualified investors. Fields marked with * are required for publishing.'
            : 'Update your investment opportunity details'
          }
        </p>
        {hasErrors && (
          <Badge variant="destructive" className="inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {Object.keys(formState.errors).length} validation error(s) found
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide the fundamental details about your investment opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="opportunity_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Opportunity Name <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Premium Multifamily Property in Manhattan" 
                        {...field} 
                        className="font-medium"
                      />
                    </FormControl>
                    <FormDescription>A clear, descriptive name for your investment opportunity</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="opportunity_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Opportunity Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the investment opportunity, highlighting key benefits and features..."
                        className="min-h-[120px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Detailed description of the investment opportunity</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="property_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Property Type <RequiredIndicator />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Property Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Location
              </CardTitle>
              <CardDescription>
                Specify the property's physical location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="property_address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-1">
                      Street Address <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="property_address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        City <RequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="property_address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        State <RequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="NY" maxLength={2} {...field} />
                      </FormControl>
                      <FormDescription>2-character state code</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="property_address.zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        ZIP Code <RequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="property_address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Country</FormLabel>
                      <FormControl>
                        <Input placeholder="US" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Structure Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Structure
              </CardTitle>
              <CardDescription>
                Define the financial aspects of your investment opportunity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_project_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Total Project Cost <RequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000000" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Total cost of the project in USD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equity_requirement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Equity Requirement <RequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="250000" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Required equity investment in USD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minimum_investment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Minimum Investment <RequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Minimum investment per investor in USD</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_raise_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        Target Raise Amount <RequiredIndicator />
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500000" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Target amount to raise from investors</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Investment Strategy Section */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Strategy</CardTitle>
              <CardDescription>
                Define your investment approach and strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="investment_strategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Investment Strategy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select investment strategy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {investmentStrategies.map((strategy) => (
                          <SelectItem key={strategy.value} value={strategy.value}>
                            {strategy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Business Plan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your business plan and execution strategy..."
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Detailed business plan and execution strategy</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Documents Section */}
          {opportunityId && (
            <>
              <div className="border-t my-6"></div>
              <DocumentUpload
                opportunityId={opportunityId}
                documents={documents}
                onDocumentUploaded={handleDocumentUploaded}
                onDocumentDeleted={handleDocumentDeleted}
                disabled={isSubmitting}
              />
            </>
          )}

          <div className="border-t my-6"></div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start">
            <div className="flex flex-col sm:flex-row gap-2">
              {onSaveAsDraft && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={isDraftSaving || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isDraftSaving ? 'Saving Draft...' : 'Save as Draft'}
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
                variant="default"
              >
                <Eye className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Opportunity' : 'Update Opportunity'}
              </Button>

              {onPublish && (
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || hasErrors}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Publishing...' : 'Publish'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}