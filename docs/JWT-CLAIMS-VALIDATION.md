# JWT Claims Validation Guide

Reference contract that keeps Auth Service, Budget API and Frontend aligned on tenant-aware JWT processing for both B2B and B2C users.

## 1. Claims Catalog

| Claim | Purpose | Validation Owner | Rules + Notes |
| --- | --- | --- | --- |
| `sub` | Canonical principal identifier (not for display) | **Auth Service** issues it, **Budget API** logs it | May be email (password flow) or provider username (OAuth2). Never show in UI. Budget API logs it but does not re-authenticate. |
| `user_id` | Internal UUID mirror of `sub` | **Auth Service** | Must equal the persisted user record. Used when cross-checking memberships or loading profiles. |
| `user_email` | Display + notification data | **Auth Service** validates; **Frontend** only displays | Treated as read-only metadata. Never trust it as the caller identifier. |
| `user_fullname` | Preferred display name | **Frontend** | Primary source for UI labels (reports, headers). Fall back to `user_email` if missing. |
| `user_language` | Preferred locale | **Auth Service** emits uppercase ISO (PT/EN/FR/ES/DE); **Frontend** converts to lowercase for i18n | Reject custom values before they reach backend APIs. |
| `scope` | OAuth2 scopes | **Auth Service** + **Gateway** | Password flow => space-delimited string. OAuth2 => array. Gateway enforces scopes; Budget API does **not** branch tenant behavior on scopes. |
| `userRoles` | Global authorities across all memberships | **Auth Service**, consumed by **Gateway** or any global guard | Must be subset of roles on the user account. Never use for tenant-level checks. |
| `companies[]` | Snapshot of every company the user belongs to | **Auth Service** populates; **Frontend** renders selector | Elements follow `{ companyId, companyName?, role? }`. `companyName` may be empty, `role` may be `null`. Treat as read-only. |
| `companyId` | Currently selected tenant | **Auth Service** + **Budget API** | Only set after `/auth/select-company` (or auto-selection during signup). Tenant APIs **must** reject requests when absent. |
| `userRole` | Role inside the `companyId` tenant | **Auth Service** + **Budget API** | Derived from the membership used in `companyId`. Only reliable source for tenant authorization. |
| `companies[].role` | Role per company entry | **Auth Service** | When select-company runs, the relevant entry is copied into `userRole`. |
| `exp` / `iat` | Expiration / issued-at timestamps | **Auth Service** signs; **Gateway/Budget API** verify | `exp` = `iat + 1h` for access tokens, `iat + 30d` for refresh. Clients may show countdowns but cannot bypass expiry. |

> **Use the claims, not request bodies.** Tenant identifiers must flow exclusively through JWT claims; clients never send `companyId` or roles in payloads or headers.

## 2. Processing Workflow by Layer

### Auth Service
- Validates credentials and memberships.
- Injects `companies`, `userRoles` for every token. Adds `companyId` + `userRole` only after the user explicitly selects (or creates) a company.
- Reissues tokens whenever company context changes (`/auth/select-company`, `/auth/users/{id}/switch-company`). No revocation store exists; older tokens simply expire.

### Frontend
- Reads claims with `userStore.syncFromToken` and persists the original “personal” token pair for fallback.
- Uses `companies` to decide whether to auto-select, show the selector, or keep the user in personal mode (absence of `companyId`).
- Never sends tenant identifiers outside the Authorization header. UI toggles rely on `userRole` but trust backend enforcement.

### Budget API
- Requires `companyId` for tenant endpoints. Scope every repository/service call using `companyId` + `userRole` from the token.
- Must stop reading legacy `role`/`roles` claims; only `userRole`/`userRoles` are authored by Auth.
- Should return 403 when `companyId` is missing or when membership fails verification against Auth.

### Gateway / Security Filter
- Enforces `scope` and `userRoles` for non-tenant features (billing portal, platform admin, etc.).
- Blocks expired/tampered tokens before they reach downstream services.

## 3. Auth Token States (Dec 2025 behavior)

- **Login (POST `/auth/signin`)** → returns access + refresh + `companies`. Access token includes `companyId`/`userRole` only when the user profile already stores a company.
- **Refresh (POST `/auth/refresh`)** → expects refresh token (`token_type = refresh_token`). Emits a fresh pair mirroring the user profile’s current `companyId`. Previous refresh tokens remain valid until `exp`.
- **Select company (POST `/auth/select-company` or `/auth/users/{userId}/switch-company`)** → validates membership, persists `companyId`, emits new tokens carrying `companyId` + `userRole`.
- **Personal mode** → when `user.companyId` is `null`, Auth omits `companyId` and `userRole`. There is no endpoint yet to “clear” the active company; frontend must keep personal tokens cached until backend delivers `/auth/clear-company`.
- **Invites** → only creation/list/cancel exist today (`POST /companies/{companyId}/invite`). Accept flow/endpoints are still pending. Authorization relies on server-side membership checks (`ROLE_ADMIN` or `ROLE_CLIENT`).

## 4. Role Terminology (Canonical)

- `userRole` (singular) = role tied to the current `companyId`. Mandatory for every tenant-scoped decision, UI or API.
- `userRoles` (plural) = set of all roles across memberships (`ROLE_ADMIN`, `ROLE_CLIENT`, `ROLE_USER`, `OAUTH2_USER`, ...). Use only for cross-tenant/global decisions.
- **Rule of thumb:** tenant logic = `companyId` + `userRole`; platform-wide logic = `userRoles`.

## 5. Backend Alignment Snapshot (Dec 2025)

| Topic | Current State |
| --- | --- |
| Claim emission | Access tokens always include `companies` + `userRoles`; optional claims appear only when non-null. OAuth2 adds `user_name`/`picture`. |
| Refresh tokens | Minimal payload (`sub`, `user_id`, `iat`, `exp`, `token_type`). No tenant data. |
| Company switch | Issues fresh access/refresh tokens; older ones stay valid until expiry. |
| Company list payload | `{ companyId, companyName?, role? }` with no hard size limit. UI must handle empty names or roles. |
| Membership changes | No JWT revocation. Auth endpoints still hit the DB to confirm membership; Budget API currently trusts claims only (needs tightening). |
| Invite API | `POST /companies/{companyId}/invite` + list/cancel endpoints exist; accept endpoint is not implemented yet. |

## 6. Known Gaps & Required Changes

1. **Clear company / personal mode** — Auth must expose `/auth/select-company` accepting `companyId = null` (or provide `/auth/clear-company`) so users can exit tenant context without relying on cached personal tokens.
2. **Budget API claim usage** — Update `JwtUtils` + guards to read `userRole`/`userRoles` and ROLE_* values; reject requests lacking `companyId` with 403.
3. **Invite acceptance** — Backend needs the accept endpoint to complete the lifecycle promised by the UI.
4. **Error semantics** — Standardize 400 vs 403 responses for tenant violations and document them in OpenAPI.

## 7. Contract: Responsibilities & Deadlines

| Area | Owner | Commitment | Deadline |
| --- | --- | --- | --- |
| Token claims | Auth Service | Keep emitting `userRole`, `userRoles`, `companies` as defined; include `companyId` immediately after `/auth/select-company`; omit it in personal mode. | Already in place |
| Personal mode exit | Auth Service | Add `/auth/select-company` support for `companyId = null` (or new `/auth/clear-company`) returning tenant-free tokens. | Jan 10 2026 |
| Role naming alignment | Budget API | Read `userRole` / `userRoles` (ROLE_* values) instead of legacy `role`/`roles`. | Jan 05 2026 |
| Tenant enforcement | Budget API | Reject tenant-scoped calls missing `companyId`; verify membership with Auth before processing. | Jan 20 2026 |
| Invite flow | Backend Platform | Ship invite-accept endpoint / status updates while keeping ROLE_ADMIN/ROLE_CLIENT authorization on create/cancel. | Jan 31 2026 |
| Frontend token handling | Frontend | Use `userRole`/`userRoles` for UI gating, treat missing `companyId` as personal mode, call `/auth/select-company` on tenant switch. | Already in place |
| Personal token cache | Frontend | Persist personal access/refresh tokens until backend offers official “clear company” endpoint. | Already in place |
| Error semantics | Backend Platform | Publish shared guideline for tenant errors (400 vs 403) and reflect it in Auth + Budget API OpenAPI specs. | Feb 07 2026 |

**Review cadence:** revisit this guide monthly (or after auth changes) and update the contract table whenever scope, claims, or deadlines shift.
