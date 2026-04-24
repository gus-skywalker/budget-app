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
- `GET /oauth2/authorization/{provider}`

## Workspace Endpoints Used By Frontend
- `GET {VITE_API_BASE_URL}/workspaces`
- `POST {VITE_API_BASE_URL}/workspaces`
- `GET {VITE_API_BASE_URL}/workspaces/{workspaceId}`
- `PUT {VITE_API_BASE_URL}/workspaces/{workspaceId}`
- `DELETE {VITE_API_BASE_URL}/workspaces/{workspaceId}`

## Token Contract
- Access token is used as `Authorization: Bearer <token>`.
- Refresh token is stored by backend in HttpOnly cookie and is never read by frontend code.
- Refresh call is `POST /api/auth/refresh` with empty body and `withCredentials: true`.
- Session restore on app startup uses `POST /api/auth/session/bootstrap` with `withCredentials: true`.
- Token claims used by frontend:
  - `user_id`
  - `userRoles`

## Explicit Non-Responsibilities Of Auth
- `auth` is not the source of truth for workspace lists, memberships, tenant roles, invites, or active workspace selection.
- `auth` login/session responses are identity-focused and may omit workspace context entirely.
- Workspace-related events may still arrive during migration, but `auth` should treat them as legacy/no-op inputs.

## Workspace Context Contract
- Frontend sends `X-Workspace-Id` in API requests when a workspace is selected in local store.
- Workspace membership and role list are resolved from `budget-api`, not from `auth`.
- Workspace context is not switched by auth endpoints and is not sourced from JWT claims.
- Selected workspace is maintained in frontend state (`userStore`) and validated server-side per request.

## Notes
- Paths without `/api` are non-canonical for current frontend integration.
- Frontend canonical token and session parsing is identity-first (`user_id`, `userRoles`).
- Active workspace in frontend state is operational context only; it must not be treated as billing ownership information.
- OAuth login starts on the auth host and returns to the frontend callback route `/oauth2/redirect`.
