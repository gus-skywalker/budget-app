# Budget App Domain Boundaries

## Frontend Boundary
`budget-app` is an application-layer client. It composes user flows across bounded contexts but does not own backend domain logic.

## Consumed Bounded Contexts
- `auth`: identity, login/signup, token refresh, active workspace context
- `budget-api`: core workspace and financial domain operations
- `payment-api`: no direct canonical usage from frontend billing orchestration

## Boundary Rules
- Domain rules and ownership checks remain server-side.
- Frontend sends only user intent plus allowed operational context for billing orchestration (for example `plan`, `actor`, `workspaceId`, pricing/tracing metadata).
- Frontend must not know, infer, or persist billing ownership identifiers such as `billingAccountId`.
- Frontend must avoid sending PII in cross-service billing command payloads.
- Tenant context must be token-driven, not inferred from local-only state.

## Data Ownership
- Owned: session/UI state, local preferences, in-progress flow context.
- Not owned: user identity source of truth, workspace aggregates, billing ownership, subscription lifecycle truth.
