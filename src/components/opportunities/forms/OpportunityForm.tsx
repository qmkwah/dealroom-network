'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createOpportunitySchema, createDraftSchema, type CreateOpportunityInput } from '@/lib/validations/opportunities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { propertyTypes } from '@/lib/validations/opportunities'

interface OpportunityFormProps {
  mode?: 'create' | 'edit'
  initialData?: Partial<CreateOpportunityInput>
  onSubmit: (data: CreateOpportunityInput) => Promise<{ id: string }>
  onSaveAsDraft?: (data: Partial<CreateOpportunityInput>) => Promise<void>
  onPublish?: (data: CreateOpportunityInput) => Promise<{ id: string }>
}

export function OpportunityForm({
  mode = 'create',
  initialData,
  onSubmit,
  onSaveAsDraft,
  onPublish
}: OpportunityFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<CreateOpportunityInput>({
    resolver: zodResolver(createOpportunitySchema),
    mode: 'onChange', // Enable real-time validation
    defaultValues: {
      title: '',
      propertyType: 'multifamily',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      squareFootage: undefined,
      yearBuilt: undefined,
      unitCount: undefined,
      description: '',
      totalInvestment: undefined,
      minimumInvestment: undefined,
      targetReturn: undefined,
      holdPeriod: undefined,
      acquisitionFee: 0,
      managementFee: 0,
      dispositionFee: 0,
      status: 'draft',
      ...initialData
    }
  })

  // Auto-save draft to localStorage
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (mode === 'create') {
        localStorage.setItem('opportunity-draft', JSON.stringify(value))
      }
    })
    return () => subscription.unsubscribe()
  }, [form, mode])

  // Recover draft on mount
  useEffect(() => {
    if (mode === 'create' && !initialData) {
      const saved = localStorage.getItem('opportunity-draft')
      if (saved) {
        try {
          const draftData = JSON.parse(saved)
          form.reset(draftData)
        } catch (recoveryError) {
          console.error('Failed to recover draft:', recoveryError)
        }
      }
    }
  }, [mode, initialData, form])

  const handleSubmit = async (data: CreateOpportunityInput) => {
    // Trigger validation to show all errors
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Please fix the validation errors before publishing')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await onSubmit(data)
      
      // Clear draft on successful submission
      if (mode === 'create') {
        localStorage.removeItem('opportunity-draft')
      }
      
      toast.success(`Opportunity ${mode === 'create' ? 'created' : 'updated'} successfully!`)
      
      // Redirect to opportunity page
      router.push(`/dashboard/opportunities/${result.id}`)
      
    } catch (error: unknown) {
      console.error('Submission error:', error)
      const errorMessage = error instanceof Error ? error.message : `Failed to ${mode === 'create' ? 'create' : 'update'} opportunity`
      setError(errorMessage)
      toast.error(`Error ${mode === 'create' ? 'creating' : 'updating'} opportunity`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!onSaveAsDraft) return

    const currentData = form.getValues()
    
    // Validate draft data using draft schema
    const draftValidation = createDraftSchema.safeParse(currentData)
    if (!draftValidation.success) {
      // Trigger validation to show errors
      await form.trigger(['title', 'propertyType'])
      toast.error('Please fill in the required fields (Title and Property Type) to save draft')
      return
    }

    setIsDraftSaving(true)
    setError(null)
    
    try {
      // Add status to ensure it's a draft
      await onSaveAsDraft({...currentData, status: 'draft'})
      toast.success('Draft saved successfully!')
    } catch (error) {
      console.error('Failed to save draft:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft'
      setError(errorMessage)
      toast.error('Failed to save draft')
    } finally {
      setIsDraftSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!onPublish) return

    // Trigger form validation for all fields
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Please fix all validation errors before publishing')
      setError('Please fix all validation errors before publishing')
      return
    }

    const formData = form.getValues()
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await onPublish(formData as CreateOpportunityInput)
      toast.success('Opportunity published successfully!')
      router.push(`/dashboard/opportunities/${result.id}`)
    } catch (error) {
      console.error('Failed to publish:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish opportunity'
      setError(errorMessage)
      toast.error('Failed to publish opportunity')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    if (mode === 'create') {
      localStorage.removeItem('opportunity-draft')
    }
    router.back()
  }

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
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Property Details Section */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>
                Provide detailed information about your investment property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Property Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Premium Multifamily Property in Manhattan" {...field} />
                    </FormControl>
                    <FormDescription>Required for all opportunities</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Property Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Street Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        City <span className="text-red-500">*</span>
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        State <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        ZIP Code <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="squareFootage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Footage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10000" 
                          min="100"
                          max="50000000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange(undefined)
                            } else {
                              const numValue = parseInt(value)
                              if (!isNaN(numValue) && numValue >= 0) {
                                field.onChange(numValue)
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2020" 
                          min="1900"
                          max={new Date().getFullYear().toString()}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange(undefined)
                            } else {
                              const numValue = parseInt(value)
                              if (!isNaN(numValue) && numValue >= 1900 && numValue <= new Date().getFullYear()) {
                                field.onChange(numValue)
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Count</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          min="1"
                          max="10000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange(undefined)
                            } else {
                              const numValue = parseInt(value)
                              if (!isNaN(numValue) && numValue >= 1) {
                                field.onChange(numValue)
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Property Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the property, its location, amenities, and investment potential..." 
                        className="resize-none" 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of at least 10 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financial Structure Section */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Structure</CardTitle>
              <CardDescription>
                Define the investment terms and expected returns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Total Investment <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000000" 
                          min="100000"
                          max="1000000000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange(undefined)
                            } else {
                              const numValue = parseFloat(value)
                              if (!isNaN(numValue) && numValue >= 0) {
                                field.onChange(numValue)
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Minimum $100,000</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Minimum Investment <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000" 
                          min="10000"
                          max="100000000"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange(undefined)
                            } else {
                              const numValue = parseFloat(value)
                              if (!isNaN(numValue) && numValue >= 0) {
                                field.onChange(numValue)
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Minimum $10,000</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Target Return (%) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="12.5" 
                          min="0.1"
                          max="100"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange(undefined)
                            } else {
                              const numValue = parseFloat(value)
                              if (!isNaN(numValue) && numValue >= 0) {
                                field.onChange(numValue)
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Annual return percentage (0.1-100%)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="holdPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Hold Period (Months) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60" 
                          min="1"
                          max="360"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '') {
                              field.onChange(undefined)
                            } else {
                              const numValue = parseInt(value)
                              if (!isNaN(numValue) && numValue >= 1) {
                                field.onChange(numValue)
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>1-360 months (1-30 years)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} className="border border-input">
                Cancel
              </Button>
              {onSaveAsDraft && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveAsDraft}
                  disabled={isDraftSaving || isLoading}
                  className="border border-input"
                >
                  {isDraftSaving 
                    ? 'Saving...' 
                    : (mode === 'create' ? 'Save as Draft' : 'Save Draft')
                  }
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {mode === 'edit' && onPublish && (
                <Button 
                  type="button" 
                  onClick={handlePublish}
                  disabled={isLoading || isDraftSaving}
                  className="border border-input"
                >
                  {isLoading ? 'Publishing...' : 'Publish Opportunity'}
                </Button>
              )}
              
              {mode === 'create' && (
                <Button type="submit" disabled={isLoading || isDraftSaving} className="border border-input">
                  {isLoading ? 'Publishing...' : 'Publish Opportunity'}
                </Button>
              )}
              
              {mode === 'edit' && !onPublish && (
                <Button type="submit" disabled={isLoading} className="border border-input">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}