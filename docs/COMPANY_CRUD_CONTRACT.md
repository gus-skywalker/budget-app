# Contrato atual (Frontend) — CRUD de Empresas

Este documento descreve **o contrato que o frontend está usando hoje** para **CRUD de empresas** (e recursos diretamente acoplados no Settings: membros/convites).

## Base URLs e Autorização

- Requests usam o `axiosInterceptor`, que injeta:
  - `Authorization: Bearer <accessToken>`
- Existem **duas bases** atualmente usadas no frontend:
  - **Empresas (CRUD + members)**: `${VITE_AUTH_URL}`
  - **Convites**: `${VITE_API_BASE_URL}`

> Observação: essa diferença de base URL é intencional no código atual (CompanyService vs InviteService). Se o backend for unificado, vale alinhar para uma base única.

---

## 1) Criar empresa

**Endpoint**
- `POST ${VITE_AUTH_URL}/companies`

**Body (JSON)**
```json
{
  "companyName": "Minha Empresa Ltda",
  "description": "Opcional"
}
```

**Regras/uso no frontend**
- `description` é opcional e só é enviado se existir.

**Response (JSON) — mínimo esperado pelo frontend**
```json
{
  "companyId": "company-123"
}
```

- O frontend aceita também `id` como fallback imediato:
  - `companyId || id` é usado para selecionar a empresa recém-criada.

**Códigos esperados**
- `201` (ou `200`) em sucesso
- `400` validação
- `401` não autenticado

**Pós-ação no frontend**
- Após criar, o frontend chama **select-company** (escopo tenant) com o `companyId`.

---

## 2) Listar empresas do usuário

**Endpoint**
- `GET ${VITE_AUTH_URL}/companies`

**Response (JSON)**
O frontend espera `response.data` como array, com itens no formato:
```json
[
  {
    "companyId": "company-123",
    "companyName": "Minha Empresa",
    "role": "ROLE_ADMIN"
  }
]
```

**Notas**
- `role` é usado para determinar permissões/labels.
- Esse endpoint é usado no Settings também para “refrescar” a lista após exclusão.

**Códigos esperados**
- `200`
- `401`

---

## 3) Obter detalhes de uma empresa

**Endpoint**
- `GET ${VITE_AUTH_URL}/companies/:companyId`

**Response (JSON) — mínimo esperado pelo frontend**
```json
{
  "companyId": "company-123",
  "companyName": "Minha Empresa",
  "description": "Texto opcional"
}
```

**Notas**
- O Settings usa esse endpoint para **popular o formulário**, inclusive para não-admin (read-only).

**Códigos esperados**
- `200`
- `401`
- `403` (se backend restringir por papel)
- `404`

---

## 4) Atualizar empresa

**Endpoint**
- `PUT ${VITE_AUTH_URL}/companies/:companyId`

**Body (JSON)**
```json
{
  "companyName": "Novo Nome",
  "description": "Nova descrição"
}
```

**Notas/uso no frontend**
- O frontend envia **sempre** `companyName` e `description` (pode ser string vazia).
- Após sucesso, o frontend atualiza o nome no `userStore.user.companies[]` para refletir no switcher/header.

**Response**
- O frontend **não depende** de um payload específico; aceita `200/204`.

**Códigos esperados**
- `200` ou `204`
- `401`
- `403` (admin/owner)
- `404`

---

## 5) Remover (excluir) empresa

**Endpoint**
- `DELETE ${VITE_AUTH_URL}/companies/:companyId`

**Notas/uso no frontend**
- Após deletar, o frontend tenta sair do tenant chamando `/auth/clear-company`.
  - Se falhar (ex.: token tenant inválido após delete), o frontend faz logout e redireciona para `/login`.
- Depois, o frontend tenta chamar `GET /companies` para atualizar a lista local.

**Response**
- O frontend não depende de payload; aceita `204`/`200`.

**Códigos esperados**
- `200` ou `204`
- `401`
- `403` (admin/owner)
- `404`

---

## 6) Listar membros da empresa

**Endpoint**
- `GET ${VITE_AUTH_URL}/companies/:companyId/members`

**Response (JSON)**
O frontend espera `response.data` como array:
```json
[
  {
    "id": "user-1",
    "username": "João",
    "email": "joao@empresa.com",
    "role": "ROLE_ADMIN"
  }
]
```

**Notas**
- Atualmente, a UI no Settings só exibe/consulta members para `isTenantAdmin`.

**Códigos esperados**
- `200`
- `401`
- `403`

---

## 7) Convites (pendentes) — recursos acoplados ao Settings

### 7.1 Enviar convite

**Endpoint**
- `POST ${VITE_API_BASE_URL}/companies/:companyId/invite`

**Body (JSON)**
```json
{
  "email": "novo@empresa.com",
  "role": "ROLE_MEMBER"
}
```

**Response**
- O frontend não depende de payload específico.

### 7.2 Listar convites pendentes

**Endpoint**
- `GET ${VITE_API_BASE_URL}/companies/:companyId/invites`

**Response (JSON)**
O frontend espera um array direto (não embrulhado):
```json
[
  {
    "id": "invite-1",
    "email": "novo@empresa.com",
    "role": "ROLE_MEMBER",
    "createdAt": "2026-01-19T12:34:56.000Z"
  }
]
```

> `createdAt` é usado na UI de `InviteManager.vue`.

### 7.3 Cancelar convite

**Endpoint**
- `DELETE ${VITE_API_BASE_URL}/companies/:companyId/invites/:inviteId`

---

## Roles esperadas no frontend

- `ROLE_OWNER`
- `ROLE_ADMIN`
- `ROLE_MEMBER`
- `ROLE_VIEWER`

O frontend também possui mapeamentos legados na UI (ex.: `admin`, `member`, `viewer`), mas o alvo atual é o padrão `ROLE_*`.
