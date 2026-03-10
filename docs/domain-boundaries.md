# Budget App Domain Boundaries

## Frontend Boundary
`budget-app` is an application-layer client. It composes user flows across bounded contexts but does not own backend domain logic.

## Consumed Bounded Contexts
- `auth`: identity, login/signup, token refresh, active company context
- `budget-api`: core workspace and financial domain operations
- `payment-api`: no direct canonical usage from frontend billing orchestration

## Boundary Rules
- Domain rules and ownership checks remain server-side.
- Frontend sends canonical identifiers (`subjectType`, `subjectId`, `actor`) for billing orchestration.
- Frontend must avoid sending PII in cross-service billing command payloads.
- Tenant context must be token-driven, not inferred from local-only state.

## Data Ownership
- Owned: session/UI state, local preferences, in-progress flow context.
- Not owned: user identity source of truth, workspace aggregates, subscription lifecycle truth.
