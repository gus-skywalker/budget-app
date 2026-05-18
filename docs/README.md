# budget-app — Documentation

For cross-service architecture, events, and product contracts, see the central hub:
→ [`~/workspace/budget/docs/README.md`](../../docs/README.md)

---

## Service Docs (flat root)

| File | What it covers |
|---|---|
| [architecture.md](architecture.md) | Runtime architecture (Vue3/Vite/Pinia), interaction patterns, onboarding orchestrator, billing client policy |
| [AUTH_CONTRACT_FRONTEND.md](AUTH_CONTRACT_FRONTEND.md) | Detailed frontend auth contract: endpoints, token model, workspace context rules |
| [domain-boundaries.md](domain-boundaries.md) | Frontend boundary rules: what the frontend owns vs. backend-owned domain |
| [integration-flows.md](integration-flows.md) | Step-by-step flows: auth, signup, reactivation, onboarding, workspace, billing upgrade |
| [service-overview.md](service-overview.md) | Purpose, responsibilities, scope limits, integration responsibilities |
| [deprecations.md](deprecations.md) | Removed APIs and their replacements (`PaymentService` → `BillingDecisionService` + `BillingOrchestrationService`) |
| [scenario-decision-flow-audit.md](scenario-decision-flow-audit.md) | Scenario/Decision flow current state, cleanup log, technical debt |
| [TODO.md](TODO.md) | Pending UI/UX issues needing triage |

## Architecture Decision Records

→ [`adr/README.md`](adr/README.md) — all 5 ADRs, validated against code 2026-05-18

## Frontend Wording & Flow Reference

→ [`frontend/billing-and-workspace.md`](frontend/billing-and-workspace.md) — canonical wording for billing/workspace separation
→ [`frontend/decision-engine-e2e-demo.md`](frontend/decision-engine-e2e-demo.md) — canonical decision engine flow reference

## PRD Snapshot

→ [`prd/current-product-scope.md`](prd/current-product-scope.md)

## Central Docs this Service Consumes

| Topic | Central document |
|---|---|
| Frontend-facing service summary | [`docs/current/frontend-contract.md`](../../docs/current/frontend-contract.md) |
| Workspace model and collaboration rules | [`docs/current/workspace-model.md`](../../docs/current/workspace-model.md) |
| Billing architecture | [`docs/current/billing-architecture.md`](../../docs/current/billing-architecture.md) |
| Event flow | [`docs/current/event-flow.md`](../../docs/current/event-flow.md) |
| UC01 use case spec | [`docs/current/use-cases/uc01-debt-payment-decision.md`](../../docs/current/use-cases/uc01-debt-payment-decision.md) |

