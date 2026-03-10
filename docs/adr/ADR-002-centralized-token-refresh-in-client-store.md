# ADR-002 Centralized Token Refresh In Client Store

## Status
Accepted

## Context
Distributed refresh logic across services/components causes inconsistent auth recovery behavior and retry loops.

## Decision
JWT refresh handling is centralized in Axios interceptor + user store (`tryRefreshToken`), with queued retry behavior during refresh in-flight.

## Consequences
- Authentication recovery behavior is uniform across API clients.
- Refresh contract changes in `auth` affect one integration point.
- Broken refresh responses can impact all API calls until fixed.
