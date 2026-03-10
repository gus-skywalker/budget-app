# ADR-003 Separate API Clients Per Bounded Context

## Status
Accepted

## Context
CoBudget UI interacts with multiple backend bounded contexts that evolve independently.

## Decision
Frontend keeps explicit service clients per backend boundary (`AuthService`, budget-domain services, billing orchestration services), instead of a single undifferentiated API client.

## Consequences
- API contract changes are localized by context.
- Documentation and ownership are clearer for frontend integration points.
- Legacy clients can coexist temporarily during migration with explicit deprecation tracking.
