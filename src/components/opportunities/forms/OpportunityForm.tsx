'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createOpportunitySchema, type CreateOpportunityInput } from '@/lib/validations/opportunities'
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
}

export function OpportunityForm({
  mode = 'create',
  initialData,
  onSubmit,
  onSaveAsDraft
}: OpportunityFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<CreateOpportunityInput>({
    resolver: zodResolver(createOpportunitySchema),
    defaultValues: {
      title: '',
      propertyType: 'multifamily',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      squareFootage: 1000,
      yearBuilt: new Date().getFullYear(),
      unitCount: 1,
      description: 'This is a placeholder description for validation.',
      totalInvestment: 100000,
      minimumInvestment: 10000,
      targetReturn: 10,
      holdPeriod: 60,
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
      router.push(`/opportunities/${result.id}`)
      
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

    setIsLoading(true)
    try {
      const currentData = form.getValues()
      await onSaveAsDraft(currentData)
      toast.success('Draft saved successfully!')
    } catch (error) {
      console.error('Failed to save draft:', error)
      toast.error('Failed to save draft')
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
            ? 'Share your real estate investment opportunity with qualified investors'
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
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Premium Multifamily Property in Manhattan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
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
                      <FormLabel>Street Address</FormLabel>
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
                      <FormLabel>City</FormLabel>
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
                      <FormLabel>State</FormLabel>
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
                      <FormLabel>ZIP Code</FormLabel>
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
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                    <FormLabel>Property Description</FormLabel>
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
                      <FormLabel>Total Investment</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000000" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                      <FormLabel>Minimum Investment</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                      <FormLabel>Target Return (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="12.5" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Annual return percentage (1-50%)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="holdPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hold Period (Months)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>12-240 months</FormDescription>
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
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              {mode === 'create' && onSaveAsDraft && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveAsDraft}
                  disabled={isLoading}
                >
                  Save as Draft
                </Button>
              )}
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create Opportunity' : 'Update Opportunity')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}