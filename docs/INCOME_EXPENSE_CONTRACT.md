# Budget API — Income & Expense Contract (Fase 4)

Status: **draft (backend concluído; alinhar frontend)**  
Última atualização: 2026-01-22

Este documento descreve os endpoints e a semântica de **Income** e **Expense** após a Fase 4 (scoping).

> Pré-requisito: entender o contrato de escopo em `BUDGET_API_SCOPE_CONTRACT.md`.

---

## 1) Income

### 1.1 Default scope (USER/COMPANY via JWT)
- `GET /api/incomes`
- `POST /api/incomes`
- `GET /api/incomes/{id}`
- `PUT /api/incomes/{id}`
- `DELETE /api/incomes/{id}`

### 1.2 Group scope (requer membership ACCEPTED)
- `GET /api/incomes/groups/{groupId}`
- `POST /api/incomes/groups/{groupId}`
- `GET /api/incomes/groups/{groupId}/{id}`
- `PUT /api/incomes/groups/{groupId}/{id}`
- `DELETE /api/incomes/groups/{groupId}/{id}`

---

## 2) Expense

### 2.1 Default scope (USER/COMPANY via JWT)
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/{id}`
- `PUT /api/expenses/{id}`
- `DELETE /api/expenses/{id}`

### 2.2 Group scope (requer membership ACCEPTED)
- `GET /api/expenses/groups/{groupId}`
- `POST /api/expenses/groups/{groupId}`
- `GET /api/expenses/groups/{groupId}/{id}`
- `PUT /api/expenses/groups/{groupId}/{id}`
- `DELETE /api/expenses/groups/{groupId}/{id}`

---

## 3) Attachments (Expense)

### 3.1 Default scope (USER/COMPANY via JWT)
- `POST /api/expenses/{expenseId}/attachment` (multipart)
- `DELETE /api/expenses/{expenseId}/attachment/{attachmentId}`

Observações:
- O backend valida ownership via `OwnerScope` (não vaza entre companies/users).
- Group-scope explícito para attachment foi **adiado** (Fase 4.x): não existe `/api/expenses/groups/{groupId}/{expenseId}/attachment` no contrato atual.

---

## 4) Endpoints legados fora do contrato Fase 4

- `GET /api/expenses/monthly`:
  - Combina despesas fixas (DB) + Nubank.
  - Por enquanto é **USER-scope only** (não cobre COMPANY/GROUP).

---

## 5) Notas para o frontend

### 5.1 Como escolher qual endpoint chamar
- Se a tela está no contexto de **grupo/workspace** → usar rotas `/groups/{groupId}`.
- Se a tela está no contexto pessoal ou da empresa selecionada via token → usar rotas default.

### 5.2 Erros esperados
- `403` ao usar group-scope sem membership ACCEPTED.
- `404` quando o ID existe, mas pertence a outro escopo.

