# Auth Contract (Frontend)

Este documento consolida os contratos atualmente consumidos pelo front-end (Vue 3) com o **Auth Service**.

Escopo:
- Endpoints e payloads usados pelo front.
- Regras de multi-tenant (B2B) baseadas em JWT.
- Refresh token e comportamento esperado do interceptor.

Fontes de verdade no código:
- `src/services/AuthService.ts`
- `src/services/CompanyService.ts`
- `src/services/axiosInterceptor.ts`
- `src/plugins/userStore.ts`
- `src/views/LoginView.vue`
- `src/views/redirect_url/OAuth2Redirect.vue`

---

## 1) URLs e headers

### Base URLs
- **Auth Service**: `VITE_AUTH_URL`
- **Budget API** (não-Auth): `VITE_API_BASE_URL`

### Autorização
- Todo request autenticado deve enviar:
  - `Authorization: Bearer <accessToken>`
- Header adicional (quando aplicável):
  - `X-Nubank-Token: <string>` (fluxos bancários)

---

## 2) Sessão e persistência (frontend)

- O front persiste o estado do usuário em **`sessionStorage`** na key `userStore`.
- O `axiosInterceptor` trata `401` como token expirado e tenta refresh automaticamente.
- Se refresh falhar, o usuário é deslogado e redirecionado para `/login`.

---

## 3) Endpoints do Auth

### 3.1 Login (password flow)

**Endpoint**
- `POST /auth/signin`

**Request body (frontend)**
```json
{
  "email": "user@email.com",
  "password": "..."
}
```

**Response (mínimo esperado pelo frontend)**
> Backend validado (Jan/2026): o access token vem em `token` (não em `accessToken`/`access_token`).

```json
{
  "id": "user123",
  "username": "João Silva",
  "email": "user@email.com",
  "language": "PT",

  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",

  "companyId": null,
  "tenantRole": null,

  "companies": [
    {"companyId": "company-456", "companyName": "Tech Solutions", "role": "ROLE_ADMIN"}
  ]
}
```

**Decisão pós-login (frontend)**
- `companies.length === 0` → segue em **modo pessoal**.
- `companyId != null` e `tenantRole != null` → usuário já está em **modo tenant**, segue para dashboard.
- `companies.length === 1` e sem tenant ativo → auto chama `POST /auth/select-company`.
- `companies.length > 1` e sem tenant ativo → abre seletor de empresa (modal ou rota `/select-company`).

---

### 3.2 Refresh token

**Endpoint**
- `POST /auth/refresh`

**Request (backend atual)**
- Header: `Authorization: Bearer <refreshToken>`

**Response (backend atual)**
```json
{
  "accessToken": "<newAccessToken>",
  "refreshToken": "<newRefreshToken>",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Regras**
- Usado automaticamente no `axiosInterceptor` após `401`.
- Deve retornar um novo access token válido.
- O access token retornado deve refletir o **contexto atual** do usuário (tenant ou pessoal), conforme estado persistido no backend.

---

### 3.3 User info

**Endpoint**
- `GET /auth/userinfo`

**Response (mínimo usado pelo frontend)**
```json
{
  "id": "user123",
  "username": "João Silva",
  "email": "user@email.com",
  "language": "PT"
}
```

Observação (backend validado Jan/2026): o endpoint pode estar lendo `language` de um claim que não é emitido por todos os fluxos.
O frontend deve considerar o `user_language` do JWT como fonte principal (com fallback para `res.data.language` quando existir).

Uso principal:
- Completar perfil após OAuth2 redirect.

---

## 4) Multi-tenant (B2B)

### 4.1 Selecionar empresa ativa (entrar em tenant mode)

**Endpoint**
- `POST /auth/select-company`

**Request body**
```json
{
  "companyId": "company-456"
}
```

**Response (esperado pelo frontend)**
```json
{
  "accessToken": "<tenantScopedAccessToken>",
  "refreshToken": "<refreshToken>",
  "tenantRole": "ROLE_ADMIN"
}
```

**Efeito esperado**
- O novo access token deve incluir `companyId` e `tenantRole` (e possivelmente `userRole` legado).
- O frontend passa a considerar `isTenantMode = true`.

---

### 4.2 Limpar empresa ativa (voltar para modo pessoal)

**Endpoint**
- `POST /auth/clear-company`

**Response (esperado pelo frontend)**
```json
{
  "accessToken": "<personalAccessToken>",
  "refreshToken": "<refreshToken>"
}
```

**Efeito esperado**
- O novo access token deve omitir `companyId` e `tenantRole`.
- O frontend zera `currentCompanyId` e `tenantRole`.

---

## 5) Endpoints de empresas (no Auth Service)

Base:
- `VITE_AUTH_URL/companies`

### 5.1 Criar empresa
- `POST /companies`

Request body
```json
{
  "companyName": "Minha Empresa",
  "description": "Opcional"
}
```

### 5.2 Listar empresas do usuário
- `GET /companies`

### 5.3 Detalhes / update / membros / delete
- `GET /companies/{companyId}`
- `PUT /companies/{companyId}`
- `GET /companies/{companyId}/members`
- `DELETE /companies/{companyId}`

---

## 6) OAuth2 redirect (contrato de callback)

### 6.1 Callback route no frontend
- Rota frontend: `/oauth2/redirect`

### 6.2 Query params esperados pelo frontend
- `token` (access token)
- `refreshToken` (opcional)
- `email` (usado como sinal de sucesso no callback atual)

Exemplo:
```
/oauth2/redirect?token=...&refreshToken=...&email=user@email.com
```

Após receber `token`, o frontend:
1) Salva token(s), marca `auth=true`, faz `syncFromToken(token)`.
2) Chama `GET /auth/userinfo` para completar `id/username/email/language`.
3) Decide tenant vs pessoal e navega (auto-select se houver 1 empresa).

---

## 7) JWT claims (contrato consumido pelo frontend)

### 7.1 Claims usadas
- Identidade:
  - `user_id`
  - `user_email` (opcional; exibido)
  - `user_fullname` (opcional; exibido)
- Idioma:
  - `user_language` (UPPERCASE: `PT|EN|FR|ES|DE`)
- Multi-tenant:
  - `companies`: array com `{ companyId, companyName?, role? }`
  - `companyId` (presente apenas em tenant mode)
  - `tenantRole` (preferencial)
  - `userRole` (legado; pode não existir)
  - `role` (fallback extra; tolerado)
- Papéis globais:
  - `userRoles` (array ou string space-delimited; tolerado)

### 7.2 Regras do frontend
- **Modo pessoal**: ausência de `companyId` implica tenant desativado.
- **Modo tenant**: `companyId` + algum role resolvido (`tenantRole || userRole || role`).
- O frontend não envia `companyId` em headers/payloads para APIs de domínio; tenant é inferido pelo backend via JWT.

---

## 8) Idiomas (contrato com Auth)
# Frontend ↔ Auth Service — Contrato (Hard-cut)

Este documento é a **fonte de verdade** do contrato consumido pelo front-end (Vue 3) com o **Auth Service** após o hard-cut.

- Sem legados: não existe `token`, `access_token`, `refresh_token`, nem refresh via header.
- Padrão único de tokens: `accessToken` e `refreshToken`.

---

## Base URL
- Auth Service: `VITE_AUTH_URL`

Todos os endpoints abaixo são relativos a `VITE_AUTH_URL`.

---

## Headers
- Requests autenticadas: `Authorization: Bearer <accessToken>`

---

## Endpoints

### 1) Login
`POST /auth/signin`

**Request**
```json
{ "email": "user@email.com", "password": "..." }
```

**Response (UserResponse)**
```json
{
  "id": "user123",
  "username": "João",
  "email": "user@email.com",
  "language": "PT",
  "userRole": ["ROLE_USER"],

  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",

  "companyId": null,
  "companies": [
    { "companyId": "company-456", "companyName": "Tech", "role": "ROLE_ADMIN" }
  ]
}
```

---

### 2) Refresh token
`POST /auth/refresh`

**Request**
```json
{ "refreshToken": "<refreshToken>" }
```

**Response (TokenResponse)**
```json
{ "accessToken": "<newAccessToken>", "refreshToken": "<newRefreshToken>" }
```

Campos opcionais (se presentes): `tokenType`, `expiresIn`.

---

### 3) Selecionar empresa (entrar em tenant mode)
`POST /auth/select-company`

**Headers**
- `Authorization: Bearer <accessToken>`

**Request**
```json
{ "companyId": "company-456" }
```

**Response**
```json
{
  "accessToken": "<tenantScopedAccessToken>",
  "refreshToken": "<refreshToken>",
  "companyId": "company-456",
  "tenantRole": "ROLE_ADMIN"
}
```

---

### 4) Limpar empresa (voltar para modo pessoal)
`POST /auth/clear-company`

**Headers**
- `Authorization: Bearer <accessToken>`

**Request**
- sem body

**Response**
```json
{ "accessToken": "<personalAccessToken>", "refreshToken": "<refreshToken>" }
```

---

### 5) Userinfo
`GET /auth/userinfo`

**Headers**
- `Authorization: Bearer <accessToken>`

**Response mínima**
```json
{
  "id": "user123",
  "username": "João",
  "email": "user@email.com",
  "language": "PT",
  "tenantRole": ["ROLE_ADMIN"],
  "pictureUrl": ""
}
```

Notas:
- `language` é derivado da claim `user_language` do JWT.

---

## Invariáveis multi-tenant (B2B)
- Token tenant-scoped: contém `companyId` e `tenantRole`.
- Token personal: não contém `companyId`.
- Tenant é inferido exclusivamente pelo JWT (não enviar companyId em headers/payloads para APIs de domínio).
