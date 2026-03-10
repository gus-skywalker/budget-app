# Budget App Architecture

## Runtime Architecture
- Framework: Vue 3 + Vite + Pinia
- API access: Axios interceptor with centralized JWT/refresh handling
- Main integration modules:
  - `AuthService` for `auth`
  - `CompanyService`, `BillingDecisionService`, `BillingOrchestrationService` for `budget-api`

## Main Interaction Patterns
- Authenticated requests use interceptor-injected `Authorization` header.
- `401` handling triggers centralized refresh logic (`userStore.tryRefreshToken`).
- Tenant context switching rehydrates tokens and company state.
- Billing checkout uses decision + async orchestration endpoints in `budget-api`.

## Billing Client Policy
- Canonical billing frontend path is:
  - `BillingDecisionService` -> `/api/billing/decision`
  - `BillingOrchestrationService` -> `/api/billing/subscriptions/*` and `/api/billing/operations/*`
- Legacy direct `payment-api` client was removed from frontend source.

## Documentation Audit Summary
- Existing docs include valuable API contracts but are fragmented by topic.
- Some docs still describe older direct billing interactions against `payment-api`.
- Active billing flows use `BillingDecisionService` and `BillingOrchestrationService` only.
