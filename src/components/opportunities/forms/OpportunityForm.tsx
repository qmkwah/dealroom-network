// Compatibility export for OpportunityForm
// This ensures tests can import OpportunityForm while we use OpportunityFormPRD as the main implementation

export { OpportunityFormPRD as OpportunityForm } from './OpportunityFormPRD'
export type { OpportunityInput } from '@/lib/validations/opportunity'