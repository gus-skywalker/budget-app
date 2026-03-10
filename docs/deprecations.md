# Frontend Deprecations

## Billing Client
- `src/services/PaymentService.ts`
- Status: Removed
- Reason: Billing orchestration is centralized in `budget-api`.
- Replacement:
  - `src/services/BillingDecisionService.ts`
  - `src/services/BillingOrchestrationService.ts`
