# Architecture Decision Records — budget-app

All ADRs are **Accepted** and validated against the current codebase (2026-05-18).

| ADR | Decision | Code evidence |
|---|---|---|
| [ADR-001](ADR-001-frontend-billing-through-budget-api.md) | Frontend billing uses `budget-api` decision/command endpoints — no direct payment-api calls | `BillingDecisionService.ts` → `/billing/decision`; `BillingOrchestrationService.ts` → `/billing/subscriptions/*` |
| [ADR-002](ADR-002-centralized-token-refresh-in-client-store.md) | JWT refresh centralized in Axios interceptor + `userStore.tryRefreshToken()` with retry queue | `axiosInterceptor.ts` L96-130; `userStore.ts` L670 |
| [ADR-003](ADR-003-separate-api-clients-per-bounded-context.md) | Separate API clients per bounded context (`AuthService` → `VITE_AUTH_URL`; budget domain → `VITE_API_BASE_URL`) | `AuthService.ts`, `axiosInterceptor.ts`, `BillingDecisionService.ts`, `BillingOrchestrationService.ts` |
| [ADR-004](ADR-004-centralize-frontend-onboarding-routing.md) | `OnboardingOrchestrator` as canonical post-auth routing module | `src/services/OnboardingOrchestrator.ts` + test suite |
| [ADR-005](ADR-005-scenario-versioning-after-decision-votes.md) | Scenarios become immutable after decision votes — new version via `cloneFrom` | `ScenarioEditorView.vue`, `ScenariosHubView.vue`, `ScenarioBuilderView.vue`, `DebtScenarioBuilderView.vue`: `cloneFrom` + `locked='1'` |

> Decisions in these ADRs are enforced through code patterns, not runtime locks. Changes to these flows must update the corresponding ADR.

