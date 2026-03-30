# Auth Contract (Frontend)

## Version
- `v2026-03`
- Source of truth in code: `src/services/AuthService.ts`, `src/services/CompanyService.ts`, `src/plugins/userStore.ts`

## Base URL
- `VITE_AUTH_URL`

## Canonical Endpoint Prefix
- All auth routes are under `/api/auth/*`

## Endpoints Used By Frontend
- `POST /api/auth/signin`
- `POST /api/auth/signup`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/auth/userinfo`
- `PUT /api/auth/{userId}`
- `DELETE /api/auth/{userId}`
- `POST /api/auth/refresh`
- `POST /api/auth/select-workspace`
- `POST /api/auth/clear-workspace`
- `GET /api/companies`

## Token Contract
- Access token is used as `Authorization: Bearer <token>`.
- Refresh is called with body `{ "refreshToken": "..." }`.
- Token claims used by frontend:
  - `user_id`
  - `companyId` (when tenant-scoped)
  - `tenantRole` (when tenant-scoped)
  - `userRoles`
  - `companies`

## Notes
- Paths without `/api` are non-canonical for current frontend integration.
- Context switch (`select-workspace` / `clear-workspace`) must be followed by token replacement in client state.
- `select-company` / `clear-company` remain backend compatibility aliases only.
