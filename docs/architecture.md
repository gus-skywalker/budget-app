# Budget App Architecture

## Runtime Architecture
- Framework: Vue 3 + Vite + Pinia
- API access: Axios interceptor with centralized JWT/refresh handling
- Main integration modules:
  - `AuthService` for `auth`
  - `WorkspaceService`, `BillingDecisionService`, `BillingOrchestrationService` for `budget-api`

## Main Interaction Patterns
- Authenticated requests use interceptor-injected `Authorization` header.
- `401` handling triggers centralized refresh logic (`userStore.tryRefreshToken`).
- Tenant context switching rehydrates tokens and workspace state.
- Billing checkout uses decision + async orchestration endpoints in `budget-api`.
- Post-auth onboarding routing is centralized in `OnboardingOrchestrator`.

## Onboarding Orchestrator
- Canonical module: `src/services/OnboardingOrchestrator.ts`.
- Centralizes post-auth decisions for:
  - workspace required (`create-workspace`)
  - workspace selection required (`select-workspace`)
  - direct continuation to target flow (`redirect` route)
- Supports redirect canonicalization (`/path?plan=...`) to preserve business-plan intent across login and workspace selection flows.
- Also exposes `resolveOnboardingBannerState(...)` consumed by global onboarding status UI.

## Onboarding Status Banner
- Component: `src/components/OnboardingStatusBanner.vue`.
- Rendered globally for authenticated users in `App.vue`.
- Shows current onboarding progress (`Autenticacao`, `Workspace`, `Assinatura`) and contextual CTA:
  - create workspace
  - select workspace
  - choose plan

## Billing Client Policy
- Canonical billing frontend path is:
  - `BillingDecisionService` -> `/api/billing/decision`
  - `BillingOrchestrationService` -> `/api/billing/subscriptions/*` and `/api/billing/operations/*`
- Legacy direct `payment-api` client was removed from frontend source.

## Documentation Audit Summary
- Existing docs include valuable API contracts but are fragmented by topic.
- Some docs still describe older direct billing interactions against `payment-api`.
- Active billing flows use `BillingDecisionService` and `BillingOrchestrationService` only.
