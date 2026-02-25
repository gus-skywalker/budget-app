# Billing Decision — Frontend integration (compat / migration guide)

Status: **draft**  
Last update: 2026-02-24

This document guides how `budget-app` should integrate with **budget-api** billing decision endpoint while keeping backward compatibility during the frontend refactor.

Source of truth (backend):
- `budget-api/docs/BILLING_DECISION_CONTRACT.md`

---

## 1) Endpoint

- `POST /api/billing/decision`

Headers:
- `Authorization: Bearer <jwt>`
- `X-Correlation-Id: <id>` (preferred)

Body:
- JSON (see sections below)

---

## 2) Goal

The endpoint answers, in a provider-agnostic way:
- who is the **billing subject** (`subjectType`, `subjectId`)
- whether the caller should **start a subscription flow now** (`action`)

This is intentionally detached from signup. The frontend should call this endpoint when the user explicitly requests an upgrade / checkout / premium feature.

---

## 3) Identity migration (canonical vs legacy)

### 3.1 Canonical identity (preferred)

Always prefer sending:
- `subjectType`: `USER | COMPANY`
- `subjectId`: string

You may still include `userId` / `companyId` for compatibility, but the frontend should treat `subjectType + subjectId` as the *only* stable identity for billing flows.

### 3.2 Legacy identity (temporary)

Supported for backward compatibility:
- `userId`
- `companyId`

Backend will derive `subjectType/subjectId` when missing.

---

## 4) How to choose subjectType/subjectId in the frontend

This follows the same scope rules used elsewhere (JWT + path), but billing is **not** group-owned.

Recommended selection:

1) If the JWT contains `companyId` claim (default token-scope COMPANY):
- `subjectType = "COMPANY"`
- `subjectId = <companyId>`

2) Else (default token-scope USER):
- `subjectType = "USER"`
- `subjectId = <userId>`

> Even when the UI is inside a group context, billing should currently target USER or COMPANY (the payer), not GROUP.

---

## 5) Request payload (recommended)

Minimum required fields:
- `plan`
- `actor` (internal id; no PII)

Recommended canonical request:
```json
{
  "plan": "MONTHLY",
  "subjectType": "USER",
  "subjectId": "user-1",
  "actor": "user-1"
}
```

Legacy-compatible request (avoid for new code):
```json
{
  "plan": "BUSINESS_MONTHLY",
  "companyId": "company-1",
  "actor": "user-1"
}
```

PII is forbidden. Do not send:
- `email`, `userName`, `cnpj`, `billingAddress`

---

## 6) Response handling (what the frontend should do)

Key fields:
- `action`:
  - `START_SUBSCRIPTION` → proceed to checkout
  - `NOOP_ALREADY_PREMIUM` → do not start checkout (user already has premium)
- `subjectType`, `subjectId` → persist in checkout state/context
- `correlationId` → persist for tracing; forward to any downstream calls

Suggested UI flow:

- Call `/billing/decision` when user clicks "Upgrade".
- If `action == START_SUBSCRIPTION`:
  - start checkout
  - attach `{subjectType, subjectId, correlationId, plan}` to the checkout context
- If `action == NOOP_ALREADY_PREMIUM`:
  - show premium enabled state
  - skip checkout

---

## 7) Compatibility notes

During migration, you may still have older frontend code paths that only know `userId` / `companyId`.

Rules:
- Continue to pass them if needed.
- But always consume `subjectType` and `subjectId` from the **response** and carry those forward.

This makes the flow resilient even if backend derivation rules evolve.

