# Phase 2: Investment Opportunity Management - Frontend Architecture & UI Design

## Overview
This document provides a comprehensive frontend architecture plan for Phase 2: Investment Opportunity Management system. The design follows established patterns from the authentication system, leverages Shadcn/ui components, and implements a mobile-first responsive approach.

## Existing Foundation Analysis

### Current Tech Stack
- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Forms**: React Hook Form with Zod validation (established pattern in `LoginForm.tsx`)
- **State Management**: React hooks with client-side state management
- **Notifications**: Sonner for toast notifications
- **Database**: Supabase with SSR integration

### Established Patterns from Authentication System
```typescript
// Pattern established in LoginForm.tsx
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
})

// Error handling pattern
className={errors.email ? 'border-red-500' : ''}
{errors.email && (
  <p className="text-sm text-red-500">{errors.email.message}</p>
)}

// Loading state pattern
<Button disabled={isLoading}>
  {isLoading ? 'Signing in...' : 'Sign In'}
</Button>
```

### Available Shadcn/ui Components
Currently installed: alert, avatar, badge, button, calendar, card, checkbox, dialog, dropdown-menu, form, input, label, popover, progress, select, separator, skeleton, switch, table, tabs, textarea

## Component Architecture Design

### 1. Directory Structure
```
src/components/
├── opportunities/
│   ├── forms/
│   │   ├── OpportunityForm.tsx (Main multi-step form container)
│   │   ├── PropertyDetailsStep.tsx
│   │   ├── FinancialStructureStep.tsx
│   │   ├── DocumentUploadStep.tsx
│   │   ├── PreviewStep.tsx
│   │   └── FormProgress.tsx
│   ├── cards/
│   │   ├── OpportunityCard.tsx
│   │   ├── OpportunityCardSkeleton.tsx
│   │   └── OpportunityComparison.tsx
│   ├── details/
│   │   ├── OpportunityDetails.tsx
│   │   ├── PropertyDetailsSection.tsx
│   │   ├── FinancialMetricsSection.tsx
│   │   ├── SponsorInfoSection.tsx
│   │   └── DocumentGallery.tsx
│   ├── search/
│   │   ├── OpportunitySearch.tsx
│   │   ├── OpportunityFilters.tsx
│   │   ├── SearchResults.tsx
│   │   └── FilterSidebar.tsx
│   └── analytics/
│       ├── OpportunityAnalytics.tsx
│       └── ViewTracker.tsx
├── layout/
│   ├── OpportunityLayout.tsx
│   └── DashboardLayout.tsx
└── ui/ (existing Shadcn/ui components)
```

## Part 1: Opportunity Creation Components

### 1.1 Multi-Step Form Architecture

#### `OpportunityForm.tsx` - Main Container
```typescript
interface OpportunityFormProps {
  initialData?: Partial<OpportunityFormData>
  mode?: 'create' | 'edit'
  opportunityId?: string
}

interface OpportunityFormData {
  // Property Details
  title: string
  propertyType: PropertyType
  address: AddressInput
  squareFootage: number
  yearBuilt: number
  unitCount?: number
  
  // Financial Structure
  totalInvestment: number
  minimumInvestment: number
  targetReturn: number
  holdPeriod: number
  acquisitionFee: number
  managementFee: number
  
  // Documents
  offeringMemorandum?: File
  financialProjections?: File
  propertyImages?: File[]
  
  // Status
  status: 'draft' | 'review' | 'active' | 'closed'
}

// Multi-step form with progress tracking
const steps = [
  { id: 1, title: 'Property Details', component: PropertyDetailsStep },
  { id: 2, title: 'Financial Structure', component: FinancialStructureStep },
  { id: 3, title: 'Documents', component: DocumentUploadStep },
  { id: 4, title: 'Preview', component: PreviewStep }
]
```

**Key Features:**
- Progress indicator using Shadcn/ui Progress component
- Form state persistence in localStorage
- Step validation before navigation
- URL-based step routing (`/opportunities/create?step=2`)
- Responsive design with mobile-friendly navigation

#### `FormProgress.tsx` - Progress Indicator
```typescript
interface FormProgressProps {
  currentStep: number
  totalSteps: number
  steps: FormStep[]
  onStepClick: (step: number) => void
  completedSteps: number[]
}

// Uses Shadcn/ui Progress and Badge components
// Visual progress bar with step indicators
// Click-to-navigate for completed steps only
```

### 1.2 Property Details Step

#### `PropertyDetailsStep.tsx`
```typescript
interface PropertyDetailsData {
  title: string
  propertyType: 'multifamily' | 'office' | 'retail' | 'industrial' | 'mixed-use'
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  squareFootage: number
  yearBuilt: number
  unitCount?: number
  propertyImages: File[]
}

// Form using Shadcn/ui components:
// - Input for text fields
// - Select for property type dropdown
// - Custom address validation with geocoding
// - File upload for property images with preview
// - Form validation with Zod schema
```

**Key Features:**
- Address autocomplete with geocoding integration
- Property type selection with conditional fields
- Multi-image upload with drag-and-drop
- Image preview with cropping capability
- Real-time validation feedback

### 1.3 Financial Structure Step

#### `FinancialStructureStep.tsx`
```typescript
interface FinancialStructureData {
  totalInvestment: number
  minimumInvestment: number
  targetReturn: number
  holdPeriod: number
  
  // Fee Structure
  acquisitionFee: number
  managementFee: number
  dispositionFee: number
  
  // Calculated Fields (auto-computed)
  projectedReturns: number[]
  irr: number
  equityMultiple: number
}

// Real-time calculations with visual charts
// Uses Chart component for financial projections
// Input validation for realistic ranges
```

**Key Features:**
- Real-time financial calculations
- Interactive charts showing projections
- Fee calculator with industry benchmarks
- Input validation for realistic ranges
- Responsive number formatting

### 1.4 Document Upload Step

#### `DocumentUploadStep.tsx`
```typescript
interface DocumentUploadData {
  offeringMemorandum?: File
  financialProjections?: File
  propertyImages: File[]
  additionalDocuments: File[]
}

// Drag-and-drop file upload
// File type validation
// Progress indicators for uploads
// Preview functionality for documents
```

**Key Features:**
- Drag-and-drop file upload interface
- File type and size validation
- Upload progress indicators
- Document preview with PDF viewer
- Secure file storage integration

### 1.5 Preview Step

#### `PreviewStep.tsx`
```typescript
// Complete opportunity preview
// Edit buttons for each section
// Final validation before submission
// Terms of service acknowledgment
```

**Key Features:**
- Complete opportunity preview
- Section-by-section editing capability
- Final validation checklist
- Terms acknowledgment
- Publication controls

## Part 2: Opportunity Discovery Components

### 2.1 Opportunity Listing

#### `OpportunityList.tsx`
```typescript
interface OpportunityListProps {
  opportunities: Opportunity[]
  loading: boolean
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
  filters: OpportunityFilters
  onFilterChange: (filters: OpportunityFilters) => void
}

// Grid/List toggle
// Infinite scroll pagination
// Loading skeletons
// Empty state handling
```

**Layout Options:**
- **Grid View**: 3-column on desktop, 2-column on tablet, 1-column on mobile
- **List View**: Detailed horizontal cards with more information
- **Responsive Design**: Automatic column adjustment based on screen size

### 2.2 Opportunity Cards

#### `OpportunityCard.tsx`
```typescript
interface OpportunityCardProps {
  opportunity: Opportunity
  variant?: 'compact' | 'detailed'
  showBookmark?: boolean
  showComparison?: boolean
  onClick?: (opportunity: Opportunity) => void
}

// Key information display:
// - Property image with overlay
// - Title and location
// - Investment amount and minimum
// - Target return and hold period
// - Sponsor information
// - Status badge
// - Action buttons (bookmark, share, inquire)
```

**Card Features:**
- Hover effects with smooth transitions
- Bookmark functionality with heart icon
- Share dropdown menu
- Quick action buttons
- Loading skeleton variant
- Accessibility-compliant interaction

### 2.3 Search and Filtering

#### `OpportunitySearch.tsx`
```typescript
interface SearchProps {
  query: string
  onQueryChange: (query: string) => void
  suggestions: string[]
  onSuggestionSelect: (suggestion: string) => void
  isLoading: boolean
}

// Uses Shadcn/ui Command component for search
// Debounced search with 300ms delay
// Search history and suggestions
// Full-text search across multiple fields
```

#### `OpportunityFilters.tsx`
```typescript
interface FiltersProps {
  filters: OpportunityFilters
  onFiltersChange: (filters: OpportunityFilters) => void
  availableFilters: FilterOptions
  isMobile?: boolean
}

interface OpportunityFilters {
  propertyTypes: PropertyType[]
  investmentRange: [number, number]
  returnRange: [number, number]
  locations: string[]
  status: OpportunityStatus[]
  sponsorRating: number
}

// Filter categories:
// - Property Type (checkbox group)
// - Investment Amount (slider range)
// - Target Return (slider range)
// - Location (multi-select with search)
// - Status (radio group)
// - Sponsor Rating (star rating)
```

**Filter Features:**
- Collapsible filter sections
- Active filter badges
- Clear all filters functionality
- Filter persistence in URL
- Mobile-friendly drawer on small screens

### 2.4 Opportunity Details Page

#### `OpportunityDetails.tsx`
```typescript
// Full page layout with multiple sections
// Tabbed interface for different information categories
// Action panel for inquiries and bookmarking
// Related opportunities section
```

**Page Sections:**
1. **Hero Section**: Property image gallery, key metrics, action buttons
2. **Property Details**: Location, specifications, description
3. **Financial Information**: Investment terms, projections, returns
4. **Sponsor Information**: Track record, team, previous deals
5. **Documents**: Offering materials (access-controlled)
6. **Q&A Section**: Common questions and answers

### 2.5 Document Gallery

#### `DocumentGallery.tsx`
```typescript
interface DocumentGalleryProps {
  documents: Document[]
  userAccess: AccessLevel
  onDocumentView: (documentId: string) => void
  onDocumentDownload: (documentId: string) => void
}

// Document categories:
// - Offering Memorandum
// - Financial Projections
// - Property Reports
// - Legal Documents
// - Marketing Materials
```

**Features:**
- Document thumbnails with type icons
- Access control based on user credentials
- In-browser PDF viewer
- Download tracking and analytics
- Watermarking for sensitive documents

## Part 3: Interactive Features & State Management

### 3.1 Form State Management

#### Multi-Step Form State Pattern
```typescript
// Custom hook for form state management
const useOpportunityForm = (initialData?: Partial<OpportunityFormData>) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OpportunityFormData>(initialData || {})
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isDraft, setIsDraft] = useState(false)
  
  // Form persistence in localStorage
  const saveDraft = useCallback(() => {
    localStorage.setItem('opportunity-draft', JSON.stringify(formData))
    setIsDraft(true)
  }, [formData])
  
  // Step validation
  const validateStep = useCallback((step: number) => {
    return opportunitySchemas[step].safeParse(formData[step]).success
  }, [formData])
  
  return {
    currentStep,
    formData,
    completedSteps,
    isDraft,
    setCurrentStep,
    updateFormData,
    saveDraft,
    validateStep
  }
}
```

### 3.2 Search and Filter State

#### Search State Management
```typescript
const useOpportunitySearch = () => {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<OpportunityFilters>({})
  const [results, setResults] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  
  // Debounced search
  const debouncedQuery = useDebounce(query, 300)
  
  // URL state synchronization
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (Object.keys(filters).length > 0) {
      params.set('filters', JSON.stringify(filters))
    }
    params.set('view', view)
    
    window.history.replaceState({}, '', `?${params.toString()}`)
  }, [query, filters, view])
  
  return {
    query,
    filters,
    results,
    isLoading,
    view,
    setQuery,
    setFilters,
    setView,
    search: debouncedSearch
  }
}
```

### 3.3 Comparison State

#### Opportunity Comparison Hook
```typescript
const useOpportunityComparison = () => {
  const [comparisonList, setComparisonList] = useState<string[]>([])
  const [isComparing, setIsComparing] = useState(false)
  
  const addToComparison = (opportunityId: string) => {
    if (comparisonList.length < 4) {
      setComparisonList([...comparisonList, opportunityId])
    }
  }
  
  const removeFromComparison = (opportunityId: string) => {
    setComparisonList(comparisonList.filter(id => id !== opportunityId))
  }
  
  const clearComparison = () => {
    setComparisonList([])
    setIsComparing(false)
  }
  
  return {
    comparisonList,
    isComparing,
    addToComparison,
    removeFromComparison,
    clearComparison,
    startComparison: () => setIsComparing(true)
  }
}
```

## Part 4: Responsive Design Strategy

### 4.1 Breakpoint Strategy
```typescript
// Tailwind CSS breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}
```

### 4.2 Component Responsive Patterns

#### Mobile-First Form Design
```typescript
// Multi-step form responsive behavior
<div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Progress indicator */}
  <div className="mb-8">
    <FormProgress 
      variant={isMobile ? 'dots' : 'bar'}
      currentStep={currentStep}
      totalSteps={totalSteps}
    />
  </div>
  
  {/* Form content */}
  <div className="space-y-6 md:space-y-8">
    {renderCurrentStep()}
  </div>
  
  {/* Navigation */}
  <div className="flex flex-col-reverse sm:flex-row justify-between mt-8 gap-4">
    <Button variant="outline" onClick={goToPrevious}>
      Previous
    </Button>
    <Button onClick={goToNext}>
      {isLastStep ? 'Submit' : 'Next'}
    </Button>
  </div>
</div>
```

#### Responsive Card Layout
```typescript
// Opportunity cards grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {opportunities.map(opportunity => (
    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
  ))}
</div>
```

### 4.3 Mobile-Specific Features

#### Filter Drawer for Mobile
```typescript
const FilterDrawer = ({ isOpen, onClose, children }) => (
  <Sheet open={isOpen} onOpenChange={onClose}>
    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
      <SheetHeader>
        <SheetTitle>Filter Opportunities</SheetTitle>
      </SheetHeader>
      <div className="mt-6">
        {children}
      </div>
    </SheetContent>
  </Sheet>
)
```

## Part 5: Performance Optimization

### 5.1 Code Splitting Strategy
```typescript
// Lazy load heavy components
const OpportunityDetails = lazy(() => import('./OpportunityDetails'))
const DocumentGallery = lazy(() => import('./DocumentGallery'))
const OpportunityComparison = lazy(() => import('./OpportunityComparison'))

// Route-based code splitting
const OpportunityRoutes = () => (
  <Routes>
    <Route path="/opportunities" element={
      <Suspense fallback={<OpportunityListSkeleton />}>
        <OpportunityList />
      </Suspense>
    } />
    <Route path="/opportunities/:id" element={
      <Suspense fallback={<OpportunityDetailsSkeleton />}>
        <OpportunityDetails />
      </Suspense>
    } />
  </Routes>
)
```

### 5.2 Image Optimization
```typescript
// Optimized property images
const PropertyImage = ({ src, alt, priority = false }) => (
  <Image
    src={src}
    alt={alt}
    fill
    priority={priority}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="object-cover rounded-lg"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
  />
)
```

### 5.3 Virtual Scrolling for Large Lists
```typescript
// For lists with 1000+ opportunities
import { FixedSizeList as List } from 'react-window'

const VirtualOpportunityList = ({ opportunities }) => (
  <List
    height={600}
    itemCount={opportunities.length}
    itemSize={200}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <OpportunityCard opportunity={opportunities[index]} />
      </div>
    )}
  </List>
)
```

## Part 6: Accessibility Implementation

### 6.1 Form Accessibility
```typescript
// Comprehensive form accessibility
<FormField
  control={form.control}
  name="investmentAmount"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Investment Amount</FormLabel>
      <FormControl>
        <Input
          {...field}
          type="number"
          aria-describedby="investment-description investment-error"
          aria-invalid={!!errors.investmentAmount}
        />
      </FormControl>
      <FormDescription id="investment-description">
        Minimum investment amount is $50,000
      </FormDescription>
      <FormMessage id="investment-error" />
    </FormItem>
  )}
/>
```

### 6.2 Keyboard Navigation
```typescript
// Opportunity card keyboard accessibility
<Card
  className="cursor-pointer focus-within:ring-2 focus-within:ring-primary"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpportunityClick(opportunity.id)
    }
  }}
  role="button"
  aria-label={`View details for ${opportunity.title}`}
>
```

### 6.3 Screen Reader Support
```typescript
// Live regions for dynamic content updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {searchResults.length > 0 && 
    `Found ${searchResults.length} opportunities matching your search`
  }
</div>

// Skip navigation links
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded"
>
  Skip to main content
</a>
```

## Part 7: Loading States & Skeletons

### 7.1 Skeleton Components
```typescript
// Opportunity card skeleton
export const OpportunityCardSkeleton = () => (
  <Card className="w-full">
    <div className="aspect-video">
      <Skeleton className="h-full w-full rounded-t-lg" />
    </div>
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </CardContent>
  </Card>
)

// Form loading skeleton
export const FormSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
)
```

### 7.2 Progressive Loading Strategy
```typescript
// Staggered loading animation
const useStaggeredLoading = (items: any[], delay = 100) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  
  useEffect(() => {
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index])
      }, index * delay)
    })
  }, [items, delay])
  
  return visibleItems
}
```

## Part 8: Error Handling & Validation

### 8.1 Form Error Handling
```typescript
// Comprehensive error boundary for forms
interface FormErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class FormErrorBoundary extends Component<{}, FormErrorBoundaryState> {
  constructor(props: {}) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            There was an error with the form. Please refresh and try again.
          </AlertDescription>
        </Alert>
      )
    }
    
    return this.props.children
  }
}
```

### 8.2 Network Error Handling
```typescript
// API error handling hook
const useApiError = () => {
  const [error, setError] = useState<string | null>(null)
  
  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      setError(error.message)
    } else if (typeof error === 'string') {
      setError(error)
    } else {
      setError('An unexpected error occurred')
    }
    
    // Show toast notification
    toast.error(error?.message || 'Something went wrong')
  }, [])
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  return { error, handleError, clearError }
}
```

## Part 9: Testing Integration Points

### 9.1 Component Testing Setup
```typescript
// Test utilities for opportunity components
export const renderOpportunityForm = (props: Partial<OpportunityFormProps> = {}) => {
  const defaultProps: OpportunityFormProps = {
    mode: 'create',
    onSubmit: jest.fn(),
    ...props
  }
  
  return render(
    <QueryProvider>
      <OpportunityForm {...defaultProps} />
    </QueryProvider>
  )
}

// Mock opportunity data factory
export const createMockOpportunity = (overrides: Partial<Opportunity> = {}): Opportunity => ({
  id: 'opp-123',
  title: 'Test Multifamily Property',
  propertyType: 'multifamily',
  totalInvestment: 5000000,
  minimumInvestment: 50000,
  targetReturn: 12.5,
  holdPeriod: 60,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})
```

### 9.2 Integration Test Patterns
```typescript
// Full workflow testing
describe('Opportunity Creation Workflow', () => {
  it('should complete full opportunity creation flow', async () => {
    // Step 1: Property Details
    await fillPropertyDetails()
    await clickNext()
    
    // Step 2: Financial Structure  
    await fillFinancialStructure()
    await clickNext()
    
    // Step 3: Document Upload
    await uploadDocuments()
    await clickNext()
    
    // Step 4: Preview and Submit
    await reviewAndSubmit()
    
    expect(screen.getByText('Opportunity created successfully')).toBeInTheDocument()
  })
})
```

## Part 10: Implementation Timeline

### Phase 1: Foundation Setup (Week 1)
1. **Day 1-2**: Component structure setup and base form architecture
2. **Day 3-4**: Multi-step form implementation with progress tracking
3. **Day 5**: Form validation and state management

### Phase 2: Core Components (Week 2)
1. **Day 1-2**: Property details and financial structure forms
2. **Day 3-4**: Document upload and preview functionality
3. **Day 5**: Opportunity listing and card components

### Phase 3: Search & Discovery (Week 3)
1. **Day 1-2**: Search functionality and filtering system
2. **Day 3-4**: Opportunity details page and document gallery
3. **Day 5**: Comparison and analytics features

### Phase 4: Polish & Optimization (Week 4)
1. **Day 1-2**: Mobile responsiveness and accessibility
2. **Day 3-4**: Performance optimization and error handling
3. **Day 5**: Testing integration and bug fixes

## Success Criteria

### Functional Requirements
- ✅ Multi-step form with progress tracking and validation
- ✅ Comprehensive property details and financial structure input
- ✅ Document upload with preview and security features
- ✅ Advanced search and filtering capabilities
- ✅ Responsive opportunity cards and listing views
- ✅ Detailed opportunity view with all information sections
- ✅ Comparison functionality for up to 4 opportunities
- ✅ Bookmarking and favoriting features

### Technical Requirements
- ✅ TypeScript interfaces for all data structures
- ✅ Zod validation schemas for all forms
- ✅ React Hook Form integration with proper error handling
- ✅ Shadcn/ui component integration throughout
- ✅ Mobile-first responsive design
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Performance optimization with lazy loading
- ✅ Comprehensive error handling and loading states

### Design System Requirements
- ✅ Consistent with existing authentication UI patterns
- ✅ Dark/light mode support throughout
- ✅ Proper spacing and typography using Tailwind classes
- ✅ Hover states and smooth transitions
- ✅ Loading skeletons and progressive enhancement
- ✅ Professional, trustworthy visual design suitable for financial platform

This comprehensive frontend architecture provides a solid foundation for implementing the Investment Opportunity Management system following TDD principles and established patterns from the existing codebase.