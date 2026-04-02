# Auth Contract (Frontend)

## Version
- `v2026-04`
- Source of truth in code: `src/services/AuthService.ts`, `src/services/WorkspaceService.ts`, `src/plugins/userStore.ts`

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
- `GET /api/workspaces`

## Token Contract
- Access token is used as `Authorization: Bearer <token>`.
- Refresh is called with body `{ "refreshToken": "..." }`.
- Token claims used by frontend:
  - `user_id`
  - `workspaceId` (when tenant-scoped)
  - `tenantRole` (when tenant-scoped)
  - `userRoles`
  - `workspaces`

## Notes
- Paths without `/api` are non-canonical for current frontend integration.
- Context switch (`select-workspace` / `clear-workspace`) must be followed by token replacement in client state.
- Frontend canonical token and session parsing is workspace-first (`workspaceId`, `workspaces`).
