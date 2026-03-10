# ADR-001 Frontend Billing Through Budget API

## Status
Accepted

## Context
Direct frontend calls to billing provider-facing APIs couple UI to payment internals and bypass core-domain authorization policies.

## Decision
Frontend billing orchestration uses `budget-api` decision and command endpoints as the primary flow. Payment-provider concerns remain backend-internal.

## Consequences
- UI depends on async command-status polling.
- Core-domain ownership checks are centralized server-side.
- Legacy direct payment client code should be treated as compatibility-only until removed.
