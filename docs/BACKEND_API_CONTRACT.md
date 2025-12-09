# Backend API Contract (B2B Multi-tenant)

Este documento descreve o contrato API esperado pelo frontend `budget-app` para suportar o fluxo B2B multi-tenant, autenticação, seleção de empresa, idiomas e erros. Objetivo: fornecer exemplos claros de requests/responses, cabeçalhos, claims do JWT e recomendações para versão/OpenAPI.

**Observação:** muitos exemplos seguem o formato já implementado no frontend (ver `src/plugins/userStore.ts` e `src/i18n.ts`).

---

**Prefixo base:**
- Todas as rotas usam base `{{API_BASE_URL}}` (configurado via `VITE_API_BASE_URL`).
- Requisições autenticadas devem incluir o header: `Authorization: Bearer {accessToken}`.

**Conteúdo esperado dos tokens:**
- `accessToken` e `refreshToken` (JWT ou opaque string) retornados no login e no select-company.

JWT - claims esperadas (antes de seleção de empresa):
```json
{
  "user_id": "123",
  "companies": [
    { "companyId": "company-456", "companyName": "Tech Solutions", "role": "ADMIN" }
  ]
}
```

JWT - claims após seleção de empresa (após POST `/auth/select-company`):
```json
{
  "user_id": "123",
  "companyId": "company-456",
  "userRole": "ADMIN",
  "user_language": "EN",
  "companies": [ ... ]
}
```

Campos críticos:
- `companyId` (string) — id da empresa atualmente selecionada; ausente antes da seleção.
- `userRole` (string) — papel do usuário na company atual (e.g., `ADMIN`, `USER`, `VIEWER`).
- `user_language` (UPPERCASE) — linguagem preferida; mapeada no frontend para locales (`PT` → `pt`, `EN` → `en`, `FR` → `fr`, `ES/DE` → fallback `pt`).

---

**Endpoints principais**

1) POST /auth/signin
- Descrição: autentica usuário e retorna perfil + tokens + lista de empresas.
- Request body (JSON):
```json
{ "username": "user@example.com", "password": "senha" }
```
- Success response (200):
```json
{
  "id": "user123",
  "username": "João Silva",
  "email": "user@email.com",
  "language": "PT",
  "token": "<accessToken>",
  "refreshToken": "<refreshToken>",
  "companyId": null,
  "companies": [
    {"companyId": "company-456", "companyName": "Tech Solutions", "role": "ADMIN"}
  ]
}
```
- Errors: 401 Unauthorized (invalid credentials), 429 Rate limit.

cURL example:
```bash
curl -X POST "${API_BASE_URL}/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"senha"}'
```

2) POST /auth/select-company
- Descrição: seleciona uma company (multi-tenant) e retorna novos tokens (company-scoped).
- Auth: Requer `Authorization: Bearer {accessToken}` (token obtido no signin)
- Request body:
```json
{ "companyId": "company-456" }
```
- Success (200):
```json
{
  "accessToken": "<newAccessToken>",
  "refreshToken": "<newRefreshToken>",
  "companyId": "company-456",
  "userRole": "ADMIN"
}
```
- Comportamento crítico no frontend: "Substituir" o token antigo pelo novo `accessToken` e `refreshToken`, decodificar o novo JWT para extrair `companyId` e `userRole` e atualizar `userStore.setCurrentCompany(companyId, role, name)`, então recarregar os dados da aplicação.

cURL example:
```bash
curl -X POST "${API_BASE_URL}/auth/select-company" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${OLD_ACCESS_TOKEN}" \
  -d '{"companyId":"company-456"}'
```

3) POST /oauth2/token (refresh)
- Descrição: trocar `refresh_token` por novo `access_token` (OAuth2-compat).
- Request form-data (x-www-form-urlencoded):
  - `grant_type=refresh_token`
  - `refresh_token={refreshToken}`
  - `client_id` / `client_secret` conforme configurado (se aplicável)
- Success (200): standard OAuth2 response:
```json
{
  "access_token": "<accessToken>",
  "refresh_token": "<refreshToken>",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```
- Frontend: axios interceptor deve tentar refresh em 401 e, se bem-sucedido, repetir request original.

4) GET /companies
- Descrição: lista companies do usuário.
- Auth: `Authorization: Bearer {accessToken}`
- Response (200):
```json
[
  { "companyId": "company-456", "companyName": "Tech Solutions", "role": "ADMIN" }
]
```

5) POST /companies
- Descrição: criar nova company (usuário autenticado)
- Request body (JSON):
```json
{ "companyName": "Minha Empresa" }
```
- Response (201): criado, retorna company object e possivelmente tokens com companyId setado (opcional).

6) GET /users/me
- Descrição: retorna dados do usuário atual (id, username, email, language, companies[])
- Response (200): similar ao signin success payload.

7) Rotas domain-specific (expenses, incomes, categories, etc.)
- Todos devem aceitar `companyId` via JWT claim (não por query) e aplicar escopo multitenant automaticamente.
- Exemplos:
  - `GET /expenses?month=2025-12`
  - `POST /expenses` (body contém `amount`, `categoryId`, `date`, `groupId?`)

---

**Formato de erros (padrão sugerido)**
- HTTP status + body:
```json
{
  "error": "invalid_request",
  "message": "Descrição legível do erro",
  "details": { ... } // opcional
}
```
- Códigos comuns:
  - 400 Bad Request — validação
  - 401 Unauthorized — token faltando/inválido
  - 403 Forbidden — usuário não tem permissão para a company/ação
  - 404 Not Found — recurso inexistente
  - 409 Conflict — viola regra de negócio (ex: nome de company duplicado)
  - 429 Too Many Requests — rate limit
  - 500 Internal Server Error — problemas de servidor

---

**Linguagem e tradução**
- Backend retorna `language` / `user_language` em UPPERCASE (`PT`, `EN`, `FR`, `ES`, `DE`).
- Frontend deve armazenar em uppercase e mapear para i18n lowercase (`pt`,`en`,`fr`).
- Recomenda-se documentar quais idiomas têm suporte completo/ parcial. Exemplo: `FR` full, `ES` partial (fallback PT).

---

**Segurança e práticas recomendadas**
- `accessToken` curto (ex: 1h), `refreshToken` mais longo e rotativo.
- Ao trocar empresa (select-company), emitir novos tokens com claim `companyId` para simplificar checagens no backend.
- Evitar expor companyId via query string em endpoints que mudam dados; usar JWT claims + RBAC no backend.
- Rate-limit endpoints de autenticação.
- Forçar HTTPS para transporte seguro.

---

**Versionamento e OpenAPI**
- Recomenda-se fornecer uma especificação OpenAPI (v3) pública/privada. Campos mínimos para cada endpoint:
  - Path, method, parameters, requestBody schema, response schemas (200/201/400/401/403/500), securitySchemes (Bearer auth).
- Versionar API via URL: `/api/v1/...`.

---

**Exemplos rápidos de integração (frontend)**
- Login flow:
  1. POST `/auth/signin` → recebe token + companies[]
  2. If `companies.length === 0` → redirect para criar company (`POST /companies`).
  3. If `companyId === null && companies.length > 0` → apresentar `CompanySelector` (frontend) e chamar `POST /auth/select-company`.
  4. Se `companyId !== null` → usar token atual e carregar dados do dashboard.

- Token refresh flow (axios interceptor):
  - On 401: pause outgoing requests, call `/oauth2/token` with `refresh_token`, update tokens in `userStore`, retry original requests. If refresh fails, redirect to login.

---

**Schemas de exemplo (resumido)**

User (response):
```json
{
  "id": "user123",
  "username": "João Silva",
  "email": "user@x.com",
  "language": "PT",
  "companies": [{"companyId":"company-1","companyName":"Acme","role":"ADMIN"}],
  "token": "<accessToken>",
  "refreshToken": "<refreshToken>"
}
```

Company object:
```json
{
  "companyId": "company-456",
  "companyName": "Tech Solutions",
  "role": "ADMIN",
  "createdAt": "2025-12-01T12:34:56Z"
}
```

---

**Checklist de aceitação (frontend ↔ backend)**
- [ ] Endpoints implementados com as respostas e status codes descritos.
- [ ] Tokens emitidos conforme claims documentadas (pre/post company selection).
- [ ] Refresh token endpoint compatível com fluxo do frontend.
- [ ] Error payloads padronizados para tratamento no frontend.
- [ ] OpenAPI/Swagger disponível ou contrato em Markdown sincronizado.

---

Se quiser, posso:
- Gerar um arquivo OpenAPI (YAML) inicial com as rotas críticas (`/auth/*`, `/companies`, `/users/me`) para servir como spec de integração.
- Abrir um PR com essa documentação em `docs/` e linkar no README.

Diga qual opção prefere que eu faça a seguir.