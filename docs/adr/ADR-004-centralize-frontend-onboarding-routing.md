# ADR-004 Centralize Frontend Onboarding Routing

## Status
Accepted

## Context
Login, OAuth callback, workspace creation, and workspace selection used partially duplicated routing rules. This caused inconsistent behavior for `redirect` + `plan` flows, mainly in business-plan onboarding (`/choose-plan`) that depends on tenant context.

## Decision
Introduce `OnboardingOrchestrator` (`src/services/OnboardingOrchestrator.ts`) as the canonical frontend module for post-auth routing decisions. All onboarding entry points must delegate to this module to resolve:
- target path canonicalization (`redirect` + `plan`)
- workspace-required branch (`create-workspace`)
- workspace-selection-required branch (`select-workspace`)
- ready-to-continue branch (final target route)

## Consequences
- Reduces divergence between login and OAuth2 paths.
- Preserves business-plan intent across auth and workspace selection transitions.
- Makes onboarding routing rules testable in isolation.
- Requires new onboarding-related changes to be implemented through orchestrator APIs instead of view-local custom logic.
- Enables shared UI state derivation (`OnboardingStatusBanner`) from one canonical onboarding state function.
