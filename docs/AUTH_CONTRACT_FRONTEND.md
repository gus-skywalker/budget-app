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
- `POST /api/auth/session/bootstrap`
- `POST /api/auth/select-workspace`
- `POST /api/auth/clear-workspace`
- `GET /api/workspaces`

## Token Contract
- Access token is used as `Authorization: Bearer <token>`.
- Refresh token is stored by backend in HttpOnly cookie and is never read by frontend code.
- Refresh call is `POST /api/auth/refresh` with empty body and `withCredentials: true`.
- Session restore on app startup uses `POST /api/auth/session/bootstrap` with `withCredentials: true`.
- Token claims used by frontend:
  - `user_id`
  - `workspaceId` (when tenant-scoped)
  - `tenantRole` (when tenant-scoped)
  - `userRoles`
  - `workspaces`

## Notes
- Paths without `/api` are non-canonical for current frontend integration.
- Context switch (`select-workspace` / `clear-workspace`) must be followed by token replacement in client state.
- `select-workspace` / `clear-workspace` return only access token in body; refresh rotation happens via cookie.
- Frontend canonical token and session parsing is workspace-first (`workspaceId`, `workspaces`).
- Active workspace in frontend state is operational context only; it must not be treated as billing ownership information.
