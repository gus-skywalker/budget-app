# Billing and Workspace in the Frontend

## Purpose

This document defines the frontend contract for billing after the billing-account-first backend refactor.

### Core frontend principles

- The frontend **does not know** who owns the subscription.
- The frontend **never sends** `billingAccountId`.
- Billing is treated as **global account state**.
- `workspaceId` is used only as **UI and operational context**.
- The backend is the only source of truth for:
  - plan type
  - subscription status
  - limits
  - capabilities
  - checkout / portal redirects

---

## 1. Checkout Flow

### What the frontend sends

The frontend sends only:

- `plan`
- `actor`
- `workspaceId` (current workspace context, when required by backend)
- pricing context metadata (`preferredCurrency`, `countryCode`, `browserLocale`, `uiLocale`)
- tracing/idempotency fields (`correlationId`, `messageId`)

The frontend does **not** send:

- `billingAccountId`
- `subjectType`
- `subjectId`
- ownership hints

### What the backend resolves

The backend resolves:

- the canonical billing account
- whether premium access already exists
- trial policy
- whether checkout should start
- the redirect URL for the payment provider

### What the frontend does after response

1. User selects a plan in `ChoosePlan`
2. The app ensures the user is authenticated and has workspace context for the checkout route
3. `CheckoutView` requests `/billing/decision`
4. If backend returns `NOOP_ALREADY_PREMIUM`, the UI stops checkout and refreshes normal app flow
5. If backend returns `START_SUBSCRIPTION`, the frontend posts `/billing/subscriptions/start`
6. The frontend polls `/billing/operations/{messageId}`
7. When `redirectUrl` is returned, the browser navigates to the provider checkout
8. The frontend does **not** mutate billing state locally

### Diagram

```text
ChoosePlan
  -> /checkout?plan=...
  -> Billing decision request
  -> budget-api resolves billing account internally
  -> command accepted
  -> poll operation status
  -> redirectUrl received
  -> browser redirects to provider checkout
```

---

## 2. Billing State Flow

### Source of truth

The canonical billing state for the UI comes from:

- `GET /billing/access?workspaceId=...`

The frontend treats this response as the billing summary.

### Fields consumed by the UI

The UI renders backend-provided fields such as:

- `hasPremiumAccess`
- `subscriptionStatus`
- `currentPlanTier`
- `currentBillingCycle`
- `currentPlanId`
- `trialEndsAt`
- `nextBillingDate`
- `workspaceQuota`
- `paymentProviderReachable`
- `subscriptionDataSource`

### When the frontend refreshes billing state

The frontend refreshes billing state:

- when opening Settings / Subscription
- after checkout success polling
- after plan change / portal / cancel actions
- when workspace context changes
- when quota-sensitive screens need current limits

### How the UI reacts

- If `hasPremiumAccess` is false, premium UI stays disabled
- If `subscriptionStatus` is `TRIALING`, show trial messaging
- If provider reachability is degraded, show warning state and disable destructive actions when needed
- If `workspaceQuota` is returned, show quota counts as informational/operational context

### Diagram

```text
Workspace context selected
  -> frontend requests billing summary
  -> budget-api resolves global billing state
  -> frontend renders returned plan/status/limits
  -> frontend never reconstructs plan state locally
```

---

## 3. Workspace vs Billing Separation

### Workspace = operational context

Workspace is used to:

- determine the active app context
- scope workspace-aware API calls
- drive permission checks on backend entrypoints
- provide context for quota and management views

Workspace is **not** treated as:

- subscription owner
- billing identity
- payment provider identity

### Billing = global state

Billing is treated in the frontend as:

- one global account-level subscription state
- resolved by backend
- rendered through a billing summary response

If the frontend code is tempted to answer _"who owns the subscription?"_, the correct answer is:

> the frontend does not know

### Diagram

```text
Frontend
  active workspace ----> operational context only
  billing summary -----> global state only

Backend
  resolves ownership internally
```

---

## 4. Onboarding Scenarios

### User without workspace

- Cannot complete billing actions that require workspace context
- Onboarding redirects to workspace creation / selection first
- No ownership decision is made in the frontend

### User with one workspace

- Workspace may be auto-selected during onboarding
- Billing actions use that workspace only as context
- Summary still represents global billing state

### User with multiple workspaces

- Active workspace comes from current selection
- Switching workspace refreshes billing summary reads
- Subscription is still displayed as global billing, not as workspace-owned billing

### Invited user

- Must enter the app through a valid workspace context
- Backend remains responsible for permission checks
- Frontend must not infer if the invitee is the billing owner

### Quota reached

- Frontend reads quota information from billing summary
- Workspace creation / upgrade prompts are triggered by backend-driven plan/quota state
- Frontend does not compute commercial rules beyond simple UI display of returned status

---

## 5. Error Handling

### Failed checkout

- Show backend-provided error when available
- Allow retry from `CheckoutView`
- Do not mark local billing state as upgraded

### Stale state after redirect

- `StripeSuccess` polls billing summary until premium access appears
- Checkout context in session storage stores only:
  - `workspaceId`
  - `workspaceName`
  - `plan`
  - `correlationId`
- No ownership identifiers are stored in the browser

### Retry behavior

- New checkout attempts generate a fresh `messageId`
- Polling stops on `FAILED` or after timeout
- Portal opening and cancel flows reuse backend operation status patterns

### Provider degradation

- If the billing summary indicates local fallback / provider degradation, actions may be disabled
- UI shows degraded state instead of inventing a result

---

## 6. Validation Scenarios

The frontend must behave correctly for:

1. **Single workspace user**
   - billing summary loads using the active workspace
   - checkout starts without ownership logic in the client

2. **Multiple workspace user**
   - switching workspace refreshes the summary context
   - no client-side ownership transfer logic exists

3. **Workspace deletion**
   - stale workspace context must be replaced by a valid current workspace selection
   - billing state remains backend-driven

4. **Plan upgrade**
   - the UI asks backend for decision
   - the provider redirect comes from `redirectUrl`

5. **Workspace quota reached**
   - create-workspace flow reads current plan/quota through billing summary
   - UI blocks additional creation only as a reflection of backend state

6. **Invite acceptance**
   - workspace context becomes active
   - billing remains global and backend-resolved

---

## 7. Frontend implementation notes

### Current canonical frontend helpers

- `src/services/BillingOrchestrationService.ts`
- `src/services/BillingDecisionService.ts`
- `src/services/BillingWorkspaceContext.ts`

### Main screens updated to respect the contract

- `src/views/ChoosePlan.vue`
- `src/views/CheckoutView.vue`
- `src/components/SubscriptionManagement.vue`
- `src/views/redirect_url/StripeSuccess.vue`
- `src/views/DashboardView.vue`
- `src/views/CreateWorkspaceView.vue`

### Storage policy

Allowed in session storage for billing redirect continuity:

- workspace context
- plan
- correlation id

Not allowed in frontend storage:

- `billingAccountId`
- ownership role assumptions
- local subscription ownership snapshots

---

## 8. Anti-patterns to avoid

Do not reintroduce any of the following in frontend code:

- `subjectType` / `subjectId` billing orchestration
- `checkoutUrl` fallback aliases
- `billingAccountId` request or browser storage
- plan ownership inference
- workspace-as-owner semantics
- local computation of premium eligibility as source of truth

---

## Final rule

When implementing billing UI in the frontend:

```text
Workspace = context
Billing = global backend state
Ownership = unknown to the frontend
```

