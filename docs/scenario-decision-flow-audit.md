# Scenario and Decision Flow Audit (Current Contract)

Date: 2026-04-18

This document is now the clean, current-state audit.
Old pre-stabilization findings were intentionally removed to avoid mixed guidance.

## Source of Truth
- Product flow contract: `docs/frontend/decision-engine-e2e-demo.md`
- Governance decision: `docs/adr/ADR-005-scenario-versioning-after-decision-votes.md`

## Canonical Journey (Validated)
`Planning Budget -> New Scenario -> Scenario Result -> Create Decision -> Decisions`

## What Is Stable Now
- Budget CTA goes directly to `/planning/scenarios/new`.
- Scenario links from Activity, Dashboard, and Insights open `/planning/scenarios/:id` directly.
- Notification deep-link opens decision detail via `/decision/:id`.
- Editor preview save persists scenario before creating decision.
- Saved scenario result is snapshot-first; recalculation is explicit (`Recalculate`).
- Scenarios with decision activity (votes or non-OPEN status) are locked for in-place edits.
- Locked scenarios use versioning flow (`cloneFrom`) instead of overwrite.
- Scenario deletion is blocked when linked to a decision (audit preservation).

## Current Business Rules (Operational)
- Decisions are lifecycle-driven (`OPEN`, `APPROVED`, `REJECTED`), not delete-driven.
- Scenario linked to decision must be retained for traceability.
- Post-vote or closed-status scenario changes must happen as a new scenario version.

## NET Cleanup Executed (2026-04-18)
- Removed deprecated `src/views/PlanningScenariosView.vue`.
- Removed unused comparison methods from `src/services/ScenarioService.ts`.
- Removed legacy `route.query.edit` compatibility path from `ScenarioBuilderView`.
- Removed `decisions-scenarios` localStorage coupling from routed flow.

## Remaining Technical Debt
- `InsightsView` still uses `insights-scenarios` localStorage as optional convenience fallback.
- Decisions board can still become visually dense in high-volume workspaces (future UX optimization pass).

## TODO (Future Expurgo Methodology)
- Define retention and purge policy for decisions/scenarios with observability gates.
- Start with archive/soft-delete model before hard purge.
- Require audit trail + dry-run metrics before enabling irreversible cleanup.
