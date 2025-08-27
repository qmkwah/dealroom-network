# Phase 2: Investment Opportunity Management - Comprehensive Testing Strategy

## Overview
This document provides a complete testing strategy for Phase 2: Investment Opportunity Management system following Test-Driven Development (TDD) principles. All tests must be written first (RED phase) before implementing any feature code.

## Test Framework Configuration

### Current Setup
- **Testing Framework**: Jest with React Testing Library (established in Session 3)
- **Database Testing**: Supabase test database with RLS policies
- **File Upload Testing**: Mock Supabase storage with file handling
- **Form Testing**: React Hook Form + Zod validation testing
- **API Testing**: Next.js API route testing with MSW (Mock Service Worker)

### Test Structure Organization
```
src/__tests__/
├── components/
│   ├── opportunities/
│   │   ├── OpportunityForm.test.tsx
│   │   ├── OpportunityCard.test.tsx
│   │   ├── OpportunityList.test.tsx
│   │   ├── OpportunityDetails.test.tsx
│   │   ├── DocumentGallery.test.tsx
│   │   ├── PropertyDetails.test.tsx
│   │   ├── FinancialStructure.test.tsx
│   │   ├── OpportunitySearch.test.tsx
│   │   ├── OpportunityFilters.test.tsx
│   │   ├── OpportunityComparison.test.tsx
│   │   └── OpportunityAnalytics.test.tsx
│   └── forms/
│       ├── MultiStepForm.test.tsx
│       ├── FormProgress.test.tsx
│       └── FileUpload.test.tsx
├── api/
│   └── opportunities/
│       ├── create.test.ts
│       ├── update.test.ts
│       ├── delete.test.ts
│       ├── list.test.ts
│       ├── search.test.ts
│       ├── analytics.test.ts
│       └── upload.test.ts
├── lib/
│   ├── opportunities/
│   │   ├── validation.test.ts
│   │   ├── calculations.test.ts
│   │   ├── utils.test.ts
│   │   ├── filters.test.ts
│   │   └── recommendations.test.ts
│   └── upload/
│       ├── fileUpload.test.ts
│       └── documentManager.test.ts
├── integration/
│   ├── opportunity-lifecycle.test.tsx
│   ├── opportunity-search-flow.test.tsx
│   ├── opportunity-booking-flow.test.tsx
│   └── opportunity-analytics-flow.test.tsx
└── e2e/
    ├── opportunity-creation.spec.ts
    ├── opportunity-discovery.spec.ts
    └── opportunity-management.spec.ts
```

## Part 1: Opportunity Creation & Management Tests (RED Phase)

### 1.1 Opportunity Posting Form Validation Tests

#### `src/__tests__/components/opportunities/OpportunityForm.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('OpportunityForm', () => {
  // Form Validation Tests
  describe('Form Validation', () => {
    it('should fail validation with empty required fields')
    it('should validate property type selection')
    it('should validate investment amount range')
    it('should validate target return percentages')
    it('should validate address format and required fields')
    it('should validate financial structure completeness')
    it('should validate offering memorandum file requirements')
    it('should show appropriate error messages for each field')
  });

  // Form Submission Tests
  describe('Form Submission', () => {
    it('should prevent submission with invalid data')
    it('should show loading state during submission')
    it('should handle API errors gracefully')
    it('should redirect to preview page on successful submission')
    it('should save draft data to localStorage during editing')
  });

  // Form Reset and Recovery Tests
  describe('Form State Management', () => {
    it('should recover form data from localStorage on page reload')
    it('should clear draft data on successful submission')
    it('should reset form to initial state when cancelled')
  });
});
```

### 1.2 Multi-Step Form Progress Tracking Tests

#### `src/__tests__/components/forms/MultiStepForm.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('MultiStepForm', () => {
  // Progress Tracking Tests
  describe('Progress Tracking', () => {
    it('should initialize with first step active')
    it('should update progress indicator when moving between steps')
    it('should validate current step before allowing navigation')
    it('should prevent navigation to future steps until current is valid')
    it('should allow navigation back to completed steps')
    it('should show completion percentage correctly')
  });

  // Navigation Tests
  describe('Step Navigation', () => {
    it('should navigate forward when current step is valid')
    it('should prevent forward navigation with invalid data')
    it('should navigate backward without validation')
    it('should handle browser back/forward buttons')
    it('should persist step state in URL parameters')
  });

  // Data Persistence Tests
  describe('Data Persistence', () => {
    it('should persist form data between step changes')
    it('should validate data integrity across steps')
    it('should handle partial form saves')
  });
});
```

### 1.3 Property Details and Address Validation Tests

#### `src/__tests__/components/opportunities/PropertyDetails.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('PropertyDetails', () => {
  // Address Validation Tests
  describe('Address Validation', () => {
    it('should validate complete address with street, city, state, zip')
    it('should integrate with geocoding service for address verification')
    it('should show suggestions for partial addresses')
    it('should handle invalid addresses gracefully')
    it('should validate zip code format by region')
  });

  // Property Information Tests
  describe('Property Information', () => {
    it('should validate property type selection from allowed options')
    it('should validate square footage as positive number')
    it('should validate number of units for multifamily properties')
    it('should validate year built as realistic historical date')
    it('should calculate property metrics correctly')
  });

  // Property Images Tests
  describe('Property Images', () => {
    it('should upload property images with correct file types')
    it('should validate image file size limits')
    it('should display image preview after upload')
    it('should handle multiple image uploads')
    it('should allow image deletion and reordering')
  });
});
```

### 1.4 Financial Structure Calculations Tests

#### `src/__tests__/components/opportunities/FinancialStructure.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('FinancialStructure', () => {
  // Investment Amount Tests
  describe('Investment Calculations', () => {
    it('should calculate total investment amount correctly')
    it('should validate minimum investment thresholds')
    it('should calculate investment splits between equity/debt')
    it('should validate return percentages are realistic')
    it('should calculate projected returns based on inputs')
  });

  // Financial Projections Tests
  describe('Financial Projections', () => {
    it('should generate 5-year cash flow projections')
    it('should calculate IRR based on investment structure')
    it('should calculate equity multiple on investment')
    it('should validate hold period assumptions')
    it('should handle different exit scenarios')
  });

  // Fee Structure Tests
  describe('Fee Structure', () => {
    it('should calculate acquisition fees correctly')
    it('should calculate asset management fees over time')
    it('should calculate disposition fees at exit')
    it('should validate fee percentages are within market ranges')
  });
});
```

### 1.5 Document Upload Functionality Tests

#### `src/__tests__/components/forms/FileUpload.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('FileUpload', () => {
  // File Upload Tests
  describe('File Upload', () => {
    it('should accept PDF files for offering memorandum')
    it('should accept Excel files for financial projections')
    it('should accept image files for property photos')
    it('should reject files exceeding size limits')
    it('should reject unauthorized file types')
    it('should show upload progress during file transfer')
  });

  // File Management Tests
  describe('File Management', () => {
    it('should display uploaded file list with names and sizes')
    it('should allow file deletion from upload queue')
    it('should prevent duplicate file uploads')
    it('should handle upload failures gracefully')
    it('should retry failed uploads automatically')
  });

  // File Security Tests
  describe('File Security', () => {
    it('should validate file content matches extension')
    it('should scan files for malicious content')
    it('should generate secure file URLs')
    it('should enforce access permissions on files')
  });
});
```

### 1.6 Opportunity Preview Generation Tests

#### `src/__tests__/components/opportunities/OpportunityPreview.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('OpportunityPreview', () => {
  // Preview Generation Tests
  describe('Preview Generation', () => {
    it('should generate complete opportunity preview from form data')
    it('should display all property details correctly')
    it('should show financial projections in formatted tables')
    it('should display uploaded documents with download links')
    it('should calculate and display key investment metrics')
  });

  // Preview Editing Tests
  describe('Preview Editing', () => {
    it('should allow editing specific sections from preview')
    it('should maintain data integrity when returning to edit')
    it('should highlight incomplete or missing information')
    it('should validate all required fields before final submission')
  });
});
```

### 1.7 Opportunity Status Management Tests

#### `src/__tests__/lib/opportunities/status.test.ts`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('Opportunity Status Management', () => {
  // Status Transitions Tests
  describe('Status Transitions', () => {
    it('should transition from draft to review status')
    it('should transition from review to active status')
    it('should transition from active to closed status')
    it('should prevent invalid status transitions')
    it('should log status change history')
  });

  // Status Permissions Tests
  describe('Status Permissions', () => {
    it('should only allow owner to change opportunity status')
    it('should restrict status changes based on current state')
    it('should validate required fields for each status')
    it('should notify relevant parties of status changes')
  });
});
```

### 1.8 API Routes Testing

#### `src/__tests__/api/opportunities/create.test.ts`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('/api/opportunities/create', () => {
  // Authentication Tests
  describe('Authentication', () => {
    it('should reject unauthenticated requests with 401')
    it('should reject non-sponsor users with 403')
    it('should allow authenticated sponsors to create opportunities')
  });

  // Data Validation Tests
  describe('Data Validation', () => {
    it('should validate required opportunity fields')
    it('should validate financial structure data')
    it('should validate property details')
    it('should return validation errors for invalid data')
  });

  // Database Operations Tests
  describe('Database Operations', () => {
    it('should create opportunity record in database')
    it('should handle database connection errors')
    it('should rollback transaction on file upload failure')
    it('should return created opportunity with ID')
  });
});
```

## Part 2: Opportunity Discovery & Browsing Tests (RED Phase)

### 2.1 Opportunity Listing with Filtering Logic Tests

#### `src/__tests__/components/opportunities/OpportunityList.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('OpportunityList', () => {
  // List Display Tests
  describe('List Display', () => {
    it('should display opportunities in grid layout')
    it('should show loading state while fetching data')
    it('should handle empty opportunity list')
    it('should paginate results with infinite scroll')
    it('should display opportunity cards with key metrics')
  });

  // Filtering Tests
  describe('Filtering Logic', () => {
    it('should filter by property type (multifamily, retail, office, etc.)')
    it('should filter by investment amount range')
    it('should filter by target return percentage')
    it('should filter by geographic location')
    it('should filter by opportunity status (active, closed)')
    it('should apply multiple filters simultaneously')
    it('should persist filter state in URL parameters')
  });

  // Sorting Tests
  describe('Sorting Options', () => {
    it('should sort by investment amount (high to low, low to high)')
    it('should sort by target return percentage')
    it('should sort by creation date (newest first, oldest first)')
    it('should sort by location proximity')
  });
});
```

### 2.2 Search Functionality and Full-Text Search Tests

#### `src/__tests__/components/opportunities/OpportunitySearch.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('OpportunitySearch', () => {
  // Search Functionality Tests
  describe('Search Functionality', () => {
    it('should perform full-text search across opportunity descriptions')
    it('should search property addresses and locations')
    it('should search property types and asset classes')
    it('should search sponsor names and company names')
    it('should handle search query with no results')
    it('should highlight search terms in results')
  });

  // Search Performance Tests
  describe('Search Performance', () => {
    it('should debounce search queries to prevent excessive API calls')
    it('should cache search results for common queries')
    it('should return results within acceptable time limits')
    it('should handle search queries with special characters')
  });

  // Search Suggestions Tests
  describe('Search Suggestions', () => {
    it('should provide autocomplete suggestions while typing')
    it('should suggest popular search terms')
    it('should suggest location-based searches')
    it('should save and suggest recent search queries')
  });
});
```

### 2.3 Opportunity Card Component Rendering Tests

#### `src/__tests__/components/opportunities/OpportunityCard.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('OpportunityCard', () => {
  // Card Display Tests
  describe('Card Display', () => {
    it('should display opportunity title and property type')
    it('should show investment amount and minimum investment')
    it('should display target return percentage and hold period')
    it('should show property location and key metrics')
    it('should display sponsor name and rating')
    it('should show opportunity status badge')
  });

  // Card Interactions Tests
  describe('Card Interactions', () => {
    it('should navigate to detailed view when clicked')
    it('should show bookmark button for authenticated users')
    it('should display sharing options menu')
    it('should show inquiry button for eligible investors')
  });

  // Card Image Tests
  describe('Card Images', () => {
    it('should display property primary image with lazy loading')
    it('should show placeholder image when no image available')
    it('should handle image loading errors gracefully')
  });
});
```

### 2.4 Detailed Opportunity View Page Tests

#### `src/__tests__/components/opportunities/OpportunityDetails.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('OpportunityDetails', () => {
  // Page Layout Tests
  describe('Page Layout', () => {
    it('should display opportunity header with key information')
    it('should show property details section')
    it('should display financial projections and returns')
    it('should show sponsor information and track record')
    it('should display document gallery for offering materials')
  });

  // Access Control Tests
  describe('Access Control', () => {
    it('should show public information to unauthenticated users')
    it('should require authentication for detailed financial data')
    it('should restrict document access to qualified investors')
    it('should show inquiry form to eligible users only')
  });

  // Interactive Elements Tests
  describe('Interactive Elements', () => {
    it('should allow bookmarking the opportunity')
    it('should enable sharing via social media or email')
    it('should show inquiry submission form')
    it('should display contact sponsor button')
  });
});
```

### 2.5 Document Gallery Display Tests

#### `src/__tests__/components/opportunities/DocumentGallery.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('DocumentGallery', () => {
  // Gallery Display Tests
  describe('Gallery Display', () => {
    it('should display uploaded documents with names and types')
    it('should show document thumbnails where applicable')
    it('should organize documents by category (offering memo, financials, etc.)')
    it('should display document upload date and size')
  });

  // Document Access Tests
  describe('Document Access', () => {
    it('should require authentication to view documents')
    it('should validate user accreditation status before access')
    it('should track document view analytics')
    it('should generate secure download URLs with expiration')
    it('should watermark downloaded documents with user info')
  });

  // Document Viewer Tests
  describe('Document Viewer', () => {
    it('should open PDF documents in inline viewer')
    it('should handle Excel/spreadsheet document viewing')
    it('should provide download options for all document types')
    it('should handle document viewing errors gracefully')
  });
});
```

### 2.6 Opportunity Comparison Functionality Tests

#### `src/__tests__/components/opportunities/OpportunityComparison.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('OpportunityComparison', () => {
  // Comparison Setup Tests
  describe('Comparison Setup', () => {
    it('should allow adding opportunities to comparison list')
    it('should limit comparison to maximum of 3-4 opportunities')
    it('should persist comparison list across browser sessions')
    it('should remove opportunities from comparison list')
  });

  // Comparison Display Tests
  describe('Comparison Display', () => {
    it('should display opportunities side-by-side in comparison table')
    it('should highlight key differences between opportunities')
    it('should show financial metrics comparison')
    it('should display property details comparison')
    it('should show sponsor information side-by-side')
  });

  // Comparison Analytics Tests
  describe('Comparison Analytics', () => {
    it('should calculate return-adjusted risk metrics')
    it('should rank opportunities by investment criteria')
    it('should highlight best-performing metrics for each opportunity')
  });
});
```

### 2.7 Bookmarking/Favoriting Features Tests

#### `src/__tests__/lib/opportunities/bookmarks.test.ts`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('Opportunity Bookmarks', () => {
  // Bookmark Management Tests
  describe('Bookmark Management', () => {
    it('should add opportunity to user bookmarks')
    it('should remove opportunity from user bookmarks')
    it('should prevent duplicate bookmarks for same opportunity')
    it('should handle bookmark operations for unauthenticated users')
  });

  // Bookmark Display Tests
  describe('Bookmark Display', () => {
    it('should show bookmark status on opportunity cards')
    it('should display user\'s bookmarked opportunities list')
    it('should organize bookmarks by categories or folders')
    it('should allow sorting bookmarked opportunities')
  });

  // Bookmark Notifications Tests
  describe('Bookmark Notifications', () => {
    it('should notify users of updates to bookmarked opportunities')
    it('should send alerts when bookmarked opportunities close')
    it('should notify of price or terms changes')
  });
});
```

### 2.8 Analytics and View Tracking Tests

#### `src/__tests__/components/opportunities/OpportunityAnalytics.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('OpportunityAnalytics', () => {
  // View Tracking Tests
  describe('View Tracking', () => {
    it('should track unique views per opportunity')
    it('should track total view count over time')
    it('should track view duration and engagement metrics')
    it('should track geographic distribution of viewers')
  });

  // Interest Analytics Tests
  describe('Interest Analytics', () => {
    it('should track bookmark/favorite interactions')
    it('should track inquiry submissions')
    it('should track document downloads')
    it('should track sharing activity')
  });

  // Sponsor Analytics Tests
  describe('Sponsor Analytics', () => {
    it('should show opportunity performance dashboard to sponsors')
    it('should display conversion funnel metrics')
    it('should show investor engagement analytics')
    it('should track lead quality scoring')
  });
});
```

### 2.9 Recommendation Engine Algorithm Tests

#### `src/__tests__/lib/opportunities/recommendations.test.ts`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('Recommendation Engine', () => {
  // Algorithm Tests
  describe('Recommendation Algorithm', () => {
    it('should recommend opportunities based on user investment history')
    it('should recommend based on user profile and preferences')
    it('should recommend based on geographic preferences')
    it('should recommend based on investment amount ranges')
    it('should recommend based on risk tolerance indicators')
  });

  // Recommendation Quality Tests
  describe('Recommendation Quality', () => {
    it('should exclude already viewed opportunities from recommendations')
    it('should prioritize recently posted opportunities')
    it('should balance recommendation diversity and relevance')
    it('should avoid recommending closed or inactive opportunities')
  });

  // Machine Learning Tests
  describe('Machine Learning Features', () => {
    it('should improve recommendations based on user interactions')
    it('should learn from bookmark patterns')
    it('should adapt to inquiry and investment behavior')
    it('should handle cold start problem for new users')
  });
});
```

## Part 3: Integration Testing Strategy

### 3.1 Opportunity Lifecycle Integration Tests

#### `src/__tests__/integration/opportunity-lifecycle.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('Opportunity Lifecycle Integration', () => {
  // End-to-End Workflow Tests
  describe('Complete Opportunity Workflow', () => {
    it('should create opportunity from start to finish')
    it('should handle multi-step form submission with file uploads')
    it('should generate preview and publish opportunity')
    it('should allow editing published opportunities')
    it('should track opportunity through status changes')
  });

  // Data Consistency Tests
  describe('Data Consistency', () => {
    it('should maintain data integrity across form steps')
    it('should ensure file uploads are properly linked')
    it('should validate calculated fields remain accurate')
    it('should handle concurrent edits properly')
  });
});
```

### 3.2 Search and Discovery Integration Tests

#### `src/__tests__/integration/opportunity-search-flow.test.tsx`

**Key Test Cases (Write First - RED Phase):**
```typescript
describe('Search and Discovery Integration', () => {
  // Search Flow Tests
  describe('Search Flow', () => {
    it('should perform search and display filtered results')
    it('should combine search with filters effectively')
    it('should maintain search state across page navigation')
    it('should handle complex search queries with multiple terms')
  });

  // Discovery Features Tests
  describe('Discovery Features', () => {
    it('should show personalized recommendations')
    it('should track user interactions for recommendation improvement')
    it('should handle bookmark and comparison features together')
  });
});
```

## Part 4: Database Testing Strategy

### 4.1 Opportunity Data Model Tests

```sql
-- Test database schema and constraints
CREATE TABLE test_investment_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(200) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  investment_amount DECIMAL(15,2) NOT NULL,
  minimum_investment DECIMAL(15,2) NOT NULL,
  target_return DECIMAL(5,2) NOT NULL,
  hold_period INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Database Test Cases (Write First - RED Phase)

```typescript
describe('Opportunity Database Operations', () => {
  // CRUD Operations Tests
  describe('CRUD Operations', () => {
    it('should create opportunity with all required fields')
    it('should read opportunity with related data')
    it('should update opportunity maintaining data integrity')
    it('should soft delete opportunities preserving history')
  });

  // RLS Policy Tests
  describe('Row Level Security', () => {
    it('should allow sponsors to create their own opportunities')
    it('should restrict opportunity editing to owners only')
    it('should allow public read access to active opportunities')
    it('should restrict private data based on user accreditation')
  });
});
```

## Part 5: Performance and Security Testing

### 5.1 Performance Test Cases (Write First - RED Phase)

```typescript
describe('Opportunity System Performance', () => {
  // Load Performance Tests
  describe('Load Performance', () => {
    it('should load opportunity list within 2 seconds')
    it('should handle 1000+ opportunities without performance degradation')
    it('should implement effective pagination for large datasets')
    it('should cache frequently accessed opportunities')
  });

  // Search Performance Tests
  describe('Search Performance', () => {
    it('should return search results within 1 second')
    it('should handle complex filter combinations efficiently')
    it('should implement search result caching')
  });
});
```

### 5.2 Security Test Cases (Write First - RED Phase)

```typescript
describe('Opportunity System Security', () => {
  // Access Control Tests
  describe('Access Control', () => {
    it('should prevent unauthorized opportunity creation')
    it('should restrict sensitive data access to qualified investors')
    it('should validate user permissions for document downloads')
    it('should prevent SQL injection in search queries')
  });

  // Data Protection Tests
  describe('Data Protection', () => {
    it('should sanitize user input in opportunity forms')
    it('should validate file uploads for security threats')
    it('should implement secure file storage with access controls')
    it('should log security-relevant user actions')
  });
});
```

## Part 6: Test Data Setup and Teardown Strategies

### 6.1 Test Data Factory Pattern

```typescript
// src/__tests__/factories/opportunityFactory.ts
export class OpportunityTestFactory {
  static createValidOpportunity() {
    return {
      title: 'Test Multifamily Property',
      property_type: 'multifamily',
      investment_amount: 5000000,
      minimum_investment: 50000,
      target_return: 12.5,
      hold_period: 60,
      // ... other required fields
    };
  }

  static createInvalidOpportunity() {
    return {
      title: '', // Invalid: empty title
      investment_amount: -1000000, // Invalid: negative amount
      // ... other invalid field combinations
    };
  }
}
```

### 6.2 Database Cleanup Strategy

```typescript
describe('Test Setup and Cleanup', () => {
  beforeEach(async () => {
    // Setup clean test database state
    await clearTestOpportunities();
    await seedTestUsers();
    await setupTestStorageBucket();
  });

  afterEach(async () => {
    // Cleanup test data
    await clearTestOpportunities();
    await clearTestFiles();
    await resetTestDatabase();
  });
});
```

## Part 7: Mock Strategy for External Services

### 7.1 Supabase Mocking

```typescript
// Mock Supabase client for testing
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
      })),
    },
  },
}));
```

### 7.2 File Upload Mocking

```typescript
// Mock file upload functionality
const mockFileUpload = {
  uploadSuccess: jest.fn(() => Promise.resolve({
    data: { path: 'test-path/file.pdf' },
    error: null,
  })),
  uploadFailure: jest.fn(() => Promise.resolve({
    data: null,
    error: new Error('Upload failed'),
  })),
};
```

## Implementation Timeline for TDD Approach

### Phase 1: Setup Test Infrastructure (2 hours)
1. Configure Jest test environment for database testing
2. Setup MSW for API route mocking
3. Create test factories for opportunity data
4. Setup file upload mocking strategy

### Phase 2: Write Failing Tests - Opportunity Creation (6 hours)
1. Write all form validation tests (expect failures)
2. Write multi-step form tests (expect failures)
3. Write API route tests (expect failures)
4. Write file upload tests (expect failures)
5. Verify all tests fail appropriately (RED phase complete)

### Phase 3: Write Failing Tests - Opportunity Discovery (6 hours)
1. Write opportunity listing tests (expect failures)
2. Write search and filter tests (expect failures)
3. Write component rendering tests (expect failures)
4. Write analytics and tracking tests (expect failures)
5. Verify all tests fail appropriately (RED phase complete)

### Phase 4: Implement to Make Tests Pass (GREEN Phase)
- Follow implementation plan to make each test pass
- Implement minimum code required for test success
- Verify tests pass incrementally

### Phase 5: Refactor for Quality (REFACTOR Phase)
- Improve code quality while maintaining test success
- Optimize performance and maintainability
- Add additional edge case testing as needed

## Success Criteria for Testing Strategy

### Test Coverage Requirements
- **Unit Tests**: 95%+ coverage for all business logic
- **Integration Tests**: All major user workflows covered
- **API Tests**: 100% coverage for opportunity-related endpoints
- **Component Tests**: All interactive components tested
- **Security Tests**: All access control scenarios covered

### Performance Requirements
- All tests must complete in under 30 seconds
- Database tests must cleanup properly
- File upload tests must use mocked services
- No test should depend on external services

### Quality Gates
- All tests must pass before implementation
- No test should be skipped or disabled
- Test failures must provide clear, actionable error messages
- Tests must be deterministic (no flaky tests)

This comprehensive testing strategy ensures that Phase 2: Investment Opportunity Management system is built with complete test coverage following TDD principles. Every feature will have failing tests written first (RED phase) before any implementation begins.