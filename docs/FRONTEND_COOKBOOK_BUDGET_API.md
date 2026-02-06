# Frontend Cookbook — Budget API (Budget App)

Objetivo: ser um guia prático para o `budget-app` consumir o `budget-api` **sem ambiguidade**, usando apenas endpoints **canônicos**.

> Fonte de verdade de endpoints: `budget-api/docs/CONSOLIDACAO-ENDPOINTS.md` e `/q/openapi`.

---

## 0) Base URL / Auth

- `VITE_API_BASE_URL` deve apontar para `http://<host>:<port>/api`.
  - Ex dev: `http://localhost:8080/api`

Headers (enviados automaticamente pelo `axiosInterceptor`):
- `Authorization: Bearer <jwt>`

### Auth vs Budget: quem é dono do quê?

| Capacidade / Regra de negócio | Fonte de verdade | Como o frontend deve usar |
|---|---|---|
| Autenticar (signin/signup/refresh) | `auth-api` | Usar endpoints em `/auth/*` e armazenar tokens no `userStore` |
| Selecionar tenant (company ativa) e enriquecer o JWT com `companyId` | `auth-api` | `POST /auth/select-company` (volta tokens novos). Para voltar ao modo pessoal: `POST /auth/clear-company` |
| Criar Company (B2B) | `budget-api` | `POST /companies` (cria e publica `CompanyCreated`). Depois chamar `POST /auth/select-company` |
| CRUD de Company (ler/atualizar/deletar) | `budget-api` | `GET/PUT/DELETE /companies/{companyId}` (exige `companyId` no token == path) |
| Invites de Company | `budget-api` | `GET/POST/DELETE /companies/{companyId}/invites` |
| Membros da Company | `budget-api` | `GET /companies/{companyId}/members` (COMPANY-scope; usa `companyId` do JWT) |
| Regras de escopo (USER/COMPANY/GROUP) | `budget-api` | O escopo é definido por (JWT + path). Group-scope sempre via `/groups/{groupId}` |
| Integração entre serviços (eventos) | Event-driven | Não chamar diretamente `payment-api`/eventos. Effects chegam por consistência eventual (ex.: `stripeCustomerId`) |

Regras de escopo:
- Sem `/groups/{groupId}` no path ⇒ escopo **COMPANY** (se `companyId` existir no JWT) senão **USER**.
- Com `/groups/{groupId}` no path ⇒ escopo **GROUP** (backend valida membership ACCEPTED).

---

## 1) Fluxo: “Entrar como Company” e listar grupos

### 1.1 Selecionar company (auth)
Backend: `auth-api`

1) `POST {AUTH_URL}/auth/select-company`
```json
{ "companyId": "..." }
```
2) Recebe novos tokens; armazenar no userStore.

### 1.2 Descobrir grupos disponíveis para a company
Backend: `budget-api`

- `GET /companies/{companyId}/groups`

Notas:
- Esse endpoint valida `companyId` do path == `companyId` do JWT.
- Use isso pra montar o “switcher” de grupos/workspaces.

---

## 1.B) Fluxo: Criar Company (B2B) + Enriquecer Token

**Objetivo:** company é criada no `budget-api` (source of truth). O `auth-api` apenas re-emite JWT com `companyId` via seleção.

1) Frontend cria company no **budget-api**:
- `POST /companies`

Body (JSON):
```json
{ "name": "ACME", "description": "Opcional" }
```

2) Após receber `companyId`, frontend pede novo token no **auth-api**:
- `POST {VITE_AUTH_URL}/auth/select-company`
```json
{ "companyId": "..." }
```

3) Salvar os tokens retornados (access/refresh) e seguir usando os endpoints de escopo COMPANY.

Endpoints úteis após company existir (COMPANY-scope):
- `GET /companies/{companyId}`
- `PUT /companies/{companyId}`
- `DELETE /companies/{companyId}`

Notas:
- O `stripeCustomerId` pode aparecer depois (consistência eventual via eventos). A UI deve tolerar esse estado.

---

## 2) Fluxo: Expenses

### 2.1 Listar expenses (Company/User scope)
- `GET /expenses`

### 2.2 CRUD expense por ID (Company/User scope)
- `GET /expenses/{id}`
- `POST /expenses`
- `PUT /expenses/{id}`
- `DELETE /expenses/{id}`

### 2.3 Upload/remoção de attachment
- `POST /expenses/{expenseId}/attachment` (multipart)
- `DELETE /expenses/{expenseId}/attachment/{attachmentId}`

### 2.4 Expenses por grupo (Group scope — canônico)
- `GET /groups/{groupId}/expenses`
- `POST /groups/{groupId}/expenses`
- `GET /groups/{groupId}/expenses/{id}`
- `PUT /groups/{groupId}/expenses/{id}`
- `DELETE /groups/{groupId}/expenses/{id}`

---

## 3) Fluxo: Incomes

### 3.1 Listar incomes (Company/User scope)
- `GET /incomes`

### 3.2 CRUD income por ID
- `GET /incomes/{id}`
- `POST /incomes`
- `PUT /incomes/{id}`
- `DELETE /incomes/{id}`

### 3.3 Incomes por grupo (Group scope — canônico)
- `GET /groups/{groupId}/incomes`
- `POST /groups/{groupId}/incomes`
- `GET /groups/{groupId}/incomes/{id}`
- `PUT /groups/{groupId}/incomes/{id}`
- `DELETE /groups/{groupId}/incomes/{id}`

---

## 4) Fluxo: Financial Goals + Contributions

### 4.1 Goals (Company/User scope)
- `GET /financial-goals`
- `POST /financial-goals`
- `PUT /financial-goals/{goalId}`
- `DELETE /financial-goals/{goalId}`

### 4.2 Goals (Group scope — canônico)
- `GET /groups/{groupId}/financial-goals`
- `POST /groups/{groupId}/financial-goals`
- `PUT /groups/{groupId}/financial-goals/{goalId}`
- `DELETE /groups/{groupId}/financial-goals/{goalId}`

### 4.3 Contributions (Company/User scope)
- `GET /financial-goals/{goalId}/contributions`
- `POST /financial-goals/{goalId}/contributions`
- `DELETE /financial-goals/{goalId}/contributions/{contributionId}`

### 4.4 Contributions (Group scope — canônico)
- `GET /groups/{groupId}/financial-goals/{goalId}/contributions`
- `POST /groups/{groupId}/financial-goals/{goalId}/contributions`
- `DELETE /groups/{groupId}/financial-goals/{goalId}/contributions/{contributionId}`

---

## 5) Fluxo: Groups + Invites

### 5.1 CRUD mínimo de groups
- `GET /groups`
- `POST /groups`

### 5.2 Convidar membro para grupo (canônico)
- `POST /groups/{groupId}/invites`
```json
{ "email": "convidado@exemplo.com" }
```

### 5.3 Aceitar/recusar convite via token (canônico)
- `POST /groups/{groupId}/invites/{token}/accept`
- `POST /groups/{groupId}/invites/{token}/decline`

Notas:
- O frontend geralmente obtém `token` via link enviado por e-mail.

### 5.4 Ver membros do grupo
- `GET /groups/{groupId}/members`

### 5.5 Listar/cancelar convites do grupo
- `GET /groups/{groupId}/invites`
- `DELETE /groups/{groupId}/invites/{inviteId}`

---

## 6) Erros comuns (como tratar)

- `401`: token ausente/expirado ⇒ fluxo de refresh do `axiosInterceptor`.
- `403`: group scope sem membership ACCEPTED.
- `404`: recurso não existe **ou** não pertence ao escopo (comportamento esperado).

---

## 7) Migração (legado removido)

Os seguintes endpoints foram removidos do backend para evitar ambiguidade:
- `/expenses/groups/*`
- `/incomes/groups/*`
- `/financial-goals/groups/*`
- `/financial-goals/groups/*/financial-goals/*/contributions`
- `/groups/{groupId}/invite`
- `/groups/{groupId}/respond`
- `/companies/groups/{groupId}/companies`

---

## Índice rápido (services → endpoints)

| Service (budget-app) | Base | Endpoints canônicos |
|---|---|---|
| `ExpenseService` | `/expenses` | `GET/POST /expenses`, `GET/PUT/DELETE /expenses/{id}`, `POST /expenses/{expenseId}/attachment`, `DELETE /expenses/{expenseId}/attachment/{attachmentId}`, `GET /expenses/monthly` |
| `IncomeService` | `/incomes` | `GET/POST /incomes`, `GET/PUT/DELETE /incomes/{id}`, `GET /incomes/date`, `PUT /incomes/{incomeId}/{months}/toggle-recurring` |
| `FinancialGoalService` | `/financial-goals` | `GET/POST /financial-goals`, `PUT/DELETE /financial-goals/{id}`, `POST /financial-goals/suggest-goals`, `POST/DELETE /financial-goals/{goalId}/contributions...` |
| `GroupService` | `/groups` | `GET/POST /groups`, `POST /groups/{groupId}/invites`, `GET /groups/{groupId}/invites`, `DELETE /groups/{groupId}/invites/{inviteId}`, `POST /groups/{groupId}/invites/{token}/accept|decline`, `GET /groups/{groupId}/members` |
| `DataService` | (root) | `GET /categories/translated`, `GET /payment-methods/translated`, `GET /dashboard/chart`, `GET /dashboard/overview` |
| `NotificationService` | `/notifications` | `GET /notifications`, `PUT /notifications/{id}/accept|decline`, alerts: `/notifications/alerts/*`, e-mails: `/notifications/sendEmail/*` |
| `BankService` | `/nubank` + `/nubank-bills` | `POST /nubank/authenticate`, `POST /nubank/request-code`, `POST /nubank/exchange-cert`, `GET /nubank-bills/getMonthlyExpenses/{year}/{month}` |
| `ReportService` | `/reports` | `POST /reports/expenses/{format}`, `POST /reports/incomes/{format}` |
| `AiService` | `/ai/*` | `POST /ai/anomalies`, `POST /ai/categorize`, `POST /ai/predictions/monthly-expenses`, `POST /ai/savings-recommendations`, `POST /ai/cashflow-insights` |
