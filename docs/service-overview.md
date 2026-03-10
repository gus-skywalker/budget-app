# Budget App Service Overview

## Purpose
`budget-app` is the primary user interface for CoBudget and the main client of backend services.

## Responsibilities
- Authentication and onboarding screens
- Workspace and financial workflow UI
- Tenant context management in client state
- API consumption of `auth`, `budget-api`, and billing-related endpoints
- Checkout and subscription UX orchestration

## Frontend Scope Limits
- No ownership of business domain invariants
- No direct ownership of billing truth or Stripe state
- No persistence of canonical backend domain beyond client/session state

## Integration Responsibilities
- Maintain valid JWT session and refresh flow
- Route user actions to the correct bounded context API
- Poll command/status endpoints when asynchronous orchestration is required
