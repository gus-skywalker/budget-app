# Budget API — Scope Contract (USER / COMPANY / GROUP)

Status: **draft (Fase 4 backend concluída; contrato frontend pendente)**  
Última atualização: 2026-01-22

Este documento define o **contrato de escopo** que o `budget-app` deve seguir ao chamar o `budget-api`.

> Fonte de verdade (backend):
> - `budget-api/docs/implementation-plan-option-b.md`
> - `budget-api/docs/architecture-collaboration-scope.md`
> - `budget-api/docs/phase-4-implementation-checklist.md`

---

## 1) Base URL e autenticação

- **Base URL** (dev): `http://localhost:8080`
- **Base path**: `/api`
- **Swagger UI**: `http://localhost:8080/q/swagger-ui/`
- **OpenAPI JSON**: `http://localhost:8080/q/openapi`

Headers:
- `Authorization: Bearer <jwt>`

---

## 2) Regras de escopo (decisão)

### 2.1 Default token-scope (sem `groupId` na URL)
Quando o endpoint **não** contém `groups/{groupId}`:

- Se o JWT tiver claim `companyId` → o backend usa **COMPANY scope**.
- Caso contrário → o backend usa **USER scope**.

### 2.2 Group-scope explícito (canônico)
Quando a operação for para um grupo, o `groupId` deve ser explícito no path (owner-first):

- Ex.: `/api/groups/{groupId}/expenses`
- Ex.: `/api/groups/{groupId}/incomes`
- Ex.: `/api/groups/{groupId}/financial-goals`

O backend valida que o usuário do token é membro do grupo com status **ACCEPTED**.

### 2.3 Status codes típicos
- `200 OK`: leitura/alteração retornando payload
- `201 Created`: criação (alguns endpoints podem retornar `200` no MVP)
- `204 No Content`: delete
- `400 Bad Request`: payload inválido
- `401 Unauthorized`: sem token / token inválido
- `403 Forbidden`: não é membro do grupo (group-scope)
- `404 Not Found`: recurso inexistente **ou** não pertence ao escopo

---

## 3) Convenções importantes

- **Não** inferir escopo por UI: o escopo é definido pela combinação (JWT + path). 
- **Não** criar endpoints `/companies/{companyId}` no frontend para Income/Expense nesta fase.
- IDs:
  - `groupId` é interno do Budget API (numérico / Long)

---

## 4) Links para contratos de features

- Income/Expense (Fase 4): ver `INCOME_EXPENSE_CONTRACT.md`
- Financial Goals (Fase 3): contrato via Swagger (ver seção "/api/financial-goals")
