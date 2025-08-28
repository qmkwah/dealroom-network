export const propertyTypes = [
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed_use', label: 'Mixed Use' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'self_storage', label: 'Self Storage' },
  { value: 'land', label: 'Land' },
  { value: 'other', label: 'Other' }
]

export const propertySubtypes = [
  // Multifamily subtypes
  { value: 'apartment', label: 'Apartment Complex', propertyType: 'multifamily' },
  { value: 'condominium', label: 'Condominium', propertyType: 'multifamily' },
  { value: 'townhome', label: 'Townhome', propertyType: 'multifamily' },
  { value: 'student_housing', label: 'Student Housing', propertyType: 'multifamily' },
  { value: 'senior_housing', label: 'Senior Housing', propertyType: 'multifamily' },
  { value: 'affordable_housing', label: 'Affordable Housing', propertyType: 'multifamily' },
  
  // Office subtypes
  { value: 'office_building', label: 'Office Building', propertyType: 'office' },
  { value: 'medical_office', label: 'Medical Office', propertyType: 'office' },
  { value: 'flex_office', label: 'Flex/Creative Office', propertyType: 'office' },
  { value: 'coworking', label: 'Coworking Space', propertyType: 'office' },
  
  // Retail subtypes
  { value: 'shopping_center', label: 'Shopping Center', propertyType: 'retail' },
  { value: 'strip_center', label: 'Strip Center', propertyType: 'retail' },
  { value: 'single_tenant', label: 'Single Tenant', propertyType: 'retail' },
  { value: 'restaurant', label: 'Restaurant', propertyType: 'retail' },
  { value: 'mall', label: 'Mall', propertyType: 'retail' },
  
  // Industrial subtypes
  { value: 'warehouse', label: 'Warehouse', propertyType: 'industrial' },
  { value: 'distribution', label: 'Distribution Center', propertyType: 'industrial' },
  { value: 'manufacturing', label: 'Manufacturing', propertyType: 'industrial' },
  { value: 'flex_industrial', label: 'Flex Industrial', propertyType: 'industrial' },
  
  // Hospitality subtypes
  { value: 'hotel', label: 'Hotel', propertyType: 'hospitality' },
  { value: 'motel', label: 'Motel', propertyType: 'hospitality' },
  { value: 'resort', label: 'Resort', propertyType: 'hospitality' },
  { value: 'extended_stay', label: 'Extended Stay', propertyType: 'hospitality' }
]

export const investmentStrategies = [
  { value: 'value_add', label: 'Value-Add' },
  { value: 'core_plus', label: 'Core Plus' },
  { value: 'opportunistic', label: 'Opportunistic' },
  { value: 'core', label: 'Core' },
  { value: 'development', label: 'Development' },
  { value: 'redevelopment', label: 'Redevelopment' },
  { value: 'distressed', label: 'Distressed' }
]

export const propertyConditions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'renovated', label: 'Recently Renovated' }
]

export const debtTypes = [
  { value: 'bank_loan', label: 'Bank Loan' },
  { value: 'bridge_loan', label: 'Bridge Loan' },
  { value: 'construction_loan', label: 'Construction Loan' },
  { value: 'mezzanine', label: 'Mezzanine Financing' },
  { value: 'seller_financing', label: 'Seller Financing' },
  { value: 'sba_loan', label: 'SBA Loan' },
  { value: 'hard_money', label: 'Hard Money' },
  { value: 'other', label: 'Other' }
]

export const exitStrategies = [
  { value: 'sale', label: 'Sale' },
  { value: 'refinance', label: 'Refinance' },
  { value: 'hold', label: 'Long-term Hold' },
  { value: 'ipo', label: 'IPO/Public Offering' },
  { value: 'merger', label: 'Merger/Acquisition' }
]

export const opportunityStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Under Review' },
  { value: 'published', label: 'Published' },
  { value: 'funded', label: 'Fully Funded' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' }
]