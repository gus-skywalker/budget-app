# Implementação Multi-Tenant (B2B) - Front-end

## Resumo das Modificações

O front-end foi refatorado para suportar multiempresa (multi-tenant B2B), permitindo que usuários pertençam a múltiplas empresas e alternem entre elas.

---

## 1. Estrutura de Dados

### User Store (Pinia)
```typescript
interface Company {
  companyId: string
  companyName?: string
  role: string // 'admin', 'member', 'viewer'
}

interface User {
  id?: string
  username?: string
  email?: string
  companies?: Company[]
}

state: {
  token: string | null
  refreshToken: string | null
  auth: boolean
  user: User
  currentCompanyId: string | null
  currentRole: string | null
}
```

### JWT Claims Esperados
```json
{
  "sub": "user-uuid",
  "email": "user@email.com",
  "companies": [
    {
      "companyId": "empresa-uuid-1",
      "companyName": "Nome da Empresa 1",
      "role": "admin"
    },
    {
      "companyId": "empresa-uuid-2",
      "companyName": "Nome da Empresa 2",
      "role": "member"
    }
  ]
}
```

---

## 2. Fluxos de Cadastro

### 2.1 Cadastro com Criação de Empresa
**Endpoint:** `POST /auth/signup?createCompany=true&companyName=MinhaEmpresa`

**Body:**
```json
{
  "username": "Nome do Usuário",
  "email": "user@example.com",
  "password": "senha123",
  "language": "PT"
}
```

**Comportamento esperado:**
- Cria o usuário
- Cria a empresa com o nome fornecido
- Vincula o usuário como `admin` da nova empresa
- Retorna JWT com a empresa no claim `companies`

---

### 2.2 Cadastro via Convite
**Endpoint:** `POST /auth/signup?companyId=empresa-uuid&inviteToken=abc123`

**Body:**
```json
{
  "username": "Nome do Usuário",
  "email": "user@example.com",
  "password": "senha123",
  "language": "PT"
}
```

**Comportamento esperado:**
- Valida o `inviteToken` para o `companyId`
- Cria o usuário (ou vincula se já existir)
- Vincula o usuário à empresa com o papel definido no convite
- Retorna JWT com a empresa no claim `companies`

---

### 2.3 Cadastro Simples (sem empresa)
**Endpoint:** `POST /auth/signup`

**Body:**
```json
{
  "username": "Nome do Usuário",
  "email": "user@example.com",
  "password": "senha123",
  "language": "PT"
}
```

**Comportamento esperado:**
- Cria o usuário sem vínculo com empresa
- Retorna JWT com `companies: []`

---

## 3. Fluxo de Login

### Login
**Endpoint:** `POST /auth/signin`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response esperado:**
```json
{
  "id": "user-uuid",
  "username": "Nome do Usuário",
  "email": "user@example.com",
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

**JWT deve conter:**
- Claim `companies` com array de empresas do usuário
- Cada empresa com `companyId`, `companyName` (opcional), e `role`

**Comportamento no front-end:**
1. Decodifica o JWT
2. Extrai o array `companies`
3. Se múltiplas empresas: exibe modal de seleção
4. Se uma empresa: seleciona automaticamente
5. Armazena `currentCompanyId` e `currentRole` no store

---

## 4. Gerenciamento de Convites

### 4.1 Enviar Convite
**Endpoint:** `POST /companies/:companyId/invite`

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Body:**
```json
{
  "email": "user@example.com",
  "role": "member"
}
```

**Comportamento esperado:**
- Valida que o usuário autenticado é `admin` da empresa
- Cria um convite com token único
- Envia email com link: `/register?companyId=xxx&inviteToken=yyy&email=user@example.com&companyName=MinhaEmpresa`

---

### 4.2 Listar Convites Pendentes
**Endpoint:** `GET /companies/:companyId/invites`

**Headers:**
```
Authorization: Bearer {jwt-token}
```

**Response esperado:**
```json
[
  {
    "id": "invite-uuid",
    "email": "user@example.com",
    "role": "member",
    "createdAt": "2025-12-07T12:00:00Z",
    "status": "pending"
  }
]
```

---

### 4.3 Cancelar Convite
**Endpoint:** `DELETE /companies/:companyId/invites/:inviteId`

**Headers:**
```
Authorization: Bearer {jwt-token}
```

---

### 4.4 Validar Convite
**Endpoint:** `GET /invites/validate/:inviteToken`

**Response esperado:**
```json
{
  "valid": true,
  "companyId": "empresa-uuid",
  "companyName": "Nome da Empresa",
  "email": "user@example.com",
  "role": "member"
}
```

---

## 5. Segurança e Claims JWT

### Importante:
- **Após o login, o front-end NÃO envia `companyId` como parâmetro em requisições.**
- O backend deve extrair o `companyId` do contexto de empresa ativa do usuário (claim JWT ou sessão).
- O front-end utiliza o `currentCompanyId` apenas para exibição (UI) e troca de contexto.

### Exemplo de requisição pós-login:
```
GET /expenses
Authorization: Bearer {jwt-token}
```

O backend deve:
1. Decodificar o JWT
2. Identificar o usuário
3. Obter o contexto de empresa ativa (se múltiplas, pode ser armazenado em sessão ou claim adicional)
4. Filtrar despesas pela empresa ativa

---

## 6. Componentes Criados

### 6.1 CompanySelector.vue
Modal para seleção de empresa após login (quando usuário tem múltiplas empresas).

### 6.2 CompanySwitcher.vue
Menu dropdown no header para trocar de empresa a qualquer momento.

### 6.3 InviteManager.vue
Interface para admins gerenciarem convites (enviar, listar, cancelar).

---

## 7. Serviços Criados

### InviteService.js
```javascript
InviteService.inviteUser(companyId, email, role)
InviteService.listInvites(companyId)
InviteService.cancelInvite(companyId, inviteId)
InviteService.validateInvite(inviteToken)
```

---

## 8. Próximos Passos

### Backend:
1. Implementar endpoints de convite (`/companies/:id/invite`, etc.)
2. Adicionar claim `companies` no JWT durante login/signup
3. Criar lógica de validação de `inviteToken`
4. Implementar filtros de dados por `companyId` (extraído do JWT)
5. Permitir criação de empresa via flag `createCompany` no signup

### Front-end:
1. Integrar `CompanySwitcher` no header/navegação principal
2. Adicionar `InviteManager` na view de configurações (apenas para admins)
3. Implementar guards de rota baseados em `currentRole` (ex: admin-only routes)
4. Adicionar tratamento de erros e validações adicionais

---

## 9. Exemplo de Fluxo Completo

### Cenário: Admin convida novo usuário

1. **Admin acessa InviteManager** (configurações da empresa)
2. **Preenche email e papel** (ex: `user@example.com`, `member`)
3. **Front-end envia:** `POST /companies/empresa-uuid/invite`
4. **Backend cria convite** e envia email com link
5. **Usuário clica no link:** `/register?companyId=empresa-uuid&inviteToken=abc123&email=user@example.com`
6. **RegisterView detecta convite** e exibe formulário pré-preenchido
7. **Usuário preenche dados** e submete
8. **Front-end envia:** `POST /auth/signup?companyId=empresa-uuid&inviteToken=abc123`
9. **Backend valida token, cria/vincula usuário** e retorna JWT
10. **Front-end redireciona para login**
11. **Usuário faz login** e empresa já está vinculada

---

## 10. Contrato de API - Resumo

| Endpoint | Método | Descrição | Autenticação |
|----------|--------|-----------|--------------|
| `/auth/signup` | POST | Cadastro simples | Não |
| `/auth/signup?createCompany=true&companyName=X` | POST | Cadastro com criação de empresa | Não |
| `/auth/signup?companyId=X&inviteToken=Y` | POST | Cadastro via convite | Não |
| `/auth/signin` | POST | Login | Não |
| `/companies/:id/invite` | POST | Enviar convite | Sim (admin) |
| `/companies/:id/invites` | GET | Listar convites | Sim (admin) |
| `/companies/:id/invites/:inviteId` | DELETE | Cancelar convite | Sim (admin) |
| `/invites/validate/:token` | GET | Validar convite | Não |

---

## 11. Variáveis de Ambiente

### Front-end (.env)
```
VITE_AUTH_URL=http://localhost:8080
```

---

## Contato para Dúvidas

Se precisar de mais detalhes ou ajustes, entre em contato com o time de front-end.

**Data de implementação:** 07/12/2025
**Branch:** `feature/b2b`
