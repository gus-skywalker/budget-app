# Implementação do Contrato B2B - Front-end

## Resumo das Modificações

Todas as alterações foram implementadas para alinhar o front-end com o contrato da API B2B conforme especificado.

---

## 1. Novo Serviço: `CompanyService.ts`

**Localização:** `src/services/CompanyService.ts`

Implementa os 3 endpoints principais:

```typescript
- create(companyName: string)        // POST /companies
- getAll()                           // GET /companies  
- selectCompany(companyId: string)   // POST /auth/select-company
```

---

## 2. Atualização do `userStore.ts`

**Modificação:** Método `setCurrentCompany()` agora aceita `companyName` opcional

```typescript
setCurrentCompany(companyId: string, role: string, companyName?: string)
```

Atualiza automaticamente o nome da empresa no array `companies` se fornecido.

---

## 3. `LoginView.vue` - Fluxo de Decisão Completo

### Mudanças principais:

1. **Processa resposta diretamente da API** (não mais do JWT):
   ```typescript
   const companies = res.data.companies || []
   const companyId = res.data.companyId || null
   ```

2. **Implementa fluxo de decisão de 3 etapas**:
   - `companies.length === 0` → Redireciona para criar empresa (`/settings`)
   - `companyId === null && companies.length > 0` → Exibe seletor (se múltiplas) ou auto-seleciona (se única)
   - `companyId !== null` → Empresa já selecionada, extrai `userRole` do JWT

3. **`handleCompanySelection()` agora é assíncrono**:
   - Chama `CompanyService.selectCompany()`
   - Substitui tokens (`accessToken`, `refreshToken`)
   - Decodifica novo JWT para obter `companyId` e `userRole`
   - Atualiza `userStore` com novos dados

---

## 4. `CompanySwitcher.vue` - Integração com API

### Mudanças:

1. **Função `switchCompany()` agora é assíncrona**
2. **Chama API `select-company`** antes de trocar contexto:
   ```typescript
   const res = await CompanyService.selectCompany(company.companyId)
   userStore.setToken(res.data.accessToken)
   userStore.setRefreshToken(res.data.refreshToken)
   ```
3. **Decodifica novo JWT** para extrair `userRole`
4. **Adiciona loading state** para evitar cliques duplicados

---

## 5. `OAuth2Redirect.vue` - Alinhamento com Fluxo de Login

### Mudanças:

1. **Processa `refreshToken`** da query string (se presente)
2. **Decodifica JWT** para extrair `companies`, `companyId`
3. **Implementa mesmo fluxo de decisão** do login tradicional
4. **Redireciona apropriadamente**:
   - Sem empresas → `/settings`
   - Única empresa → Auto-seleciona e vai para `/dashboard`
   - Múltiplas empresas sem seleção → `/login` (para mostrar seletor)

---

## 6. Tipos TypeScript

**Novos arquivos:**

### `src/services/CompanyService.d.ts`
Define interfaces para:
- `Company`
- `CreateCompanyResponse`
- `SelectCompanyResponse`

### `src/types/global.d.ts`
Adiciona interfaces:
- `JWTClaims` - Estrutura completa do JWT (com campos opcionais `companyId`, `userRole`)
- `LoginResponse` - Resposta da API `/auth/signin`

---

## 7. Documentação Atualizada

**`.github/copilot-instructions.md`** agora inclui:
- Estrutura da resposta de login
- Endpoints chave da API B2B
- Estrutura do JWT (antes/depois da seleção)
- Fluxo de decisão detalhado (3 etapas)
- Referências aos arquivos críticos

---

## Validações Implementadas

✅ **Login tradicional:** Processa `companies[]` e `companyId` da resposta  
✅ **Login OAuth2:** Processa JWT com `companies[]` e `companyId`  
✅ **Seleção de empresa:** Chama API, substitui tokens, decodifica JWT  
✅ **Troca de empresa:** Chama API, obtém novos tokens, recarrega app  
✅ **Fluxo de decisão:** 3 cenários (sem empresa, precisa selecionar, já selecionada)  
✅ **Tipos TypeScript:** Interfaces completas para API e JWT  

---

## Pontos Críticos

### ⚠️ IMPORTANTE: Token Replacement

Após chamar `POST /auth/select-company`, o front-end SEMPRE:

1. Substitui `token` antigo por `accessToken` da resposta
2. Substitui `refreshToken` antigo por novo `refreshToken`
3. Decodifica o **novo** token para extrair `companyId` e `userRole`
4. Atualiza `userStore.setCurrentCompany()`

**Locais implementados:**
- `LoginView.vue` → `handleCompanySelection()`
- `CompanySwitcher.vue` → `switchCompany()`

---

## Compatibilidade com Backend

O front-end agora está 100% alinhado com o contrato da API:

| Endpoint | Implementado | Arquivo |
|----------|--------------|---------|
| `POST /auth/signin` | ✅ | `LoginView.vue` |
| `POST /auth/select-company` | ✅ | `CompanyService.ts`, `LoginView.vue`, `CompanySwitcher.vue` |
| `POST /companies` | ✅ | `CompanyService.ts` |
| `GET /companies` | ✅ | `CompanyService.ts` |

---

## Como Testar

1. **Login com múltiplas empresas:**
   - Fazer login → ver seletor
   - Selecionar empresa → chamar API
   - Verificar novos tokens no `sessionStorage`

2. **Login com empresa já selecionada:**
   - Backend retorna `companyId !== null`
   - Front-end extrai `userRole` do JWT
   - Vai direto para dashboard

3. **Troca de empresa:**
   - Clicar no dropdown do header
   - Selecionar empresa diferente
   - Verificar chamada API + novos tokens
   - App recarrega com dados da nova empresa

---

## Próximos Passos (Opcional)

- [ ] Criar tela dedicada para criação de empresa (atualmente redireciona para `/settings`)
- [ ] Adicionar testes unitários para `CompanyService`
- [ ] Adicionar loading indicator no `CompanySwitcher`
- [ ] Implementar tratamento de erro mais robusto (toasts/snackbars)
