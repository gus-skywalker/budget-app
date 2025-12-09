# Implementação de Suporte a Múltiplos Idiomas - Front-end

## Resumo

Implementação completa do contrato de API para suporte a múltiplos idiomas conforme especificado no documento `API_LANGUAGE_CONTRACT.md`.

---

## ✅ Modificações Implementadas

### 1. **userStore.ts** - Gerenciamento de Idioma

**Adicionado:**
- Campo `language: string` no estado (padrão: 'PT')
- Getter `getLanguage`: Retorna idioma do usuário
- Getter `getApiLanguage`: Converte UPPERCASE → lowercase com fallback
- Action `setLanguage(language: string)`: Atualiza idioma
- Persistência de idioma no `sessionStorage`

**Exemplo:**
```typescript
const userStore = useUserStore()
const userLanguage = userStore.getLanguage  // "PT"
const apiLanguage = userStore.getApiLanguage // "pt"
```

---

### 2. **languageUtils.ts** - Utilitários de Idioma

**Novo arquivo:** `src/utils/languageUtils.ts`

**Exporta:**
- `Language`: Type para idiomas do usuário (`PT`, `EN`, `FR`, `ES`, `DE`)
- `ApiLanguage`: Type para idiomas da API (`pt`, `en`, `fr`)
- `getApiLanguage(userLanguage)`: Converte com fallback automático
- `isFullySupported(language)`: Verifica suporte completo (Auth + Budget API)
- `isPartiallySupported(language)`: Verifica suporte parcial (só Auth)
- `getLanguageName(language)`: Retorna nome legível do idioma
- `FULLY_SUPPORTED_LANGUAGES`: Array com PT, EN, FR
- `PARTIALLY_SUPPORTED_LANGUAGES`: Array com ES, DE

**Exemplo:**
```typescript
import { getApiLanguage, getLanguageName } from '@/utils/languageUtils'

getApiLanguage('PT') // 'pt'
getApiLanguage('ES') // 'pt' (fallback)
getLanguageName('FR') // 'Français'
```

---

### 3. **DataService.ts** - APIs Traduzidas

**Modificado:**
- `fetchCategories(language)`: Aceita idioma do usuário, converte automaticamente
- `fetchPaymentMethods(language)`: Aceita idioma do usuário, converte automaticamente

**Uso antes (chamava direto com lowercase):**
```typescript
await DataService.fetchCategories('pt')
```

**Uso agora (pode passar UPPERCASE ou lowercase):**
```typescript
const userStore = useUserStore()
await DataService.fetchCategories(userStore.getLanguage) // "PT" → "pt"
// OU
await DataService.fetchCategories('PT') // Converte automaticamente
```

---

### 4. **global.d.ts** - Tipos TypeScript

**Adicionado:**
- `Language` type: `'PT' | 'EN' | 'FR' | 'ES' | 'DE'`
- `ApiLanguage` type: `'pt' | 'en' | 'fr'`
- Campo `language: Language` em `LoginResponse`
- Campo `user_language?: Language` em `JWTClaims`

---

### 5. **LoginView.vue** - Processamento de Idioma

**Modificado:**
- Extrai `language` da resposta de login
- Armazena no `userStore`
- Atualiza locale do i18n automaticamente

**Fluxo:**
```
Login → res.data.language ("PT") → 
store.setLanguage("PT") → 
updateI18nLocale("PT") → 
i18n.global.locale = "pt"
```

---

### 6. **OAuth2Redirect.vue** - Suporte OAuth2

**Modificado:**
- Extrai `language` do JWT ou resposta da API
- Fallback para 'PT' se não disponível
- Sincroniza com `userStore` e i18n

---

### 7. **i18n.ts** - Sincronização com Backend

**Adicionado:**
- Mapeamento `UPPERCASE → lowercase` (PT → pt, EN → en, etc.)
- Função `getInitialLocale()`: Carrega idioma do userStore na inicialização
- Função `updateI18nLocale(userLanguage)`: Atualiza locale dinamicamente
- Fallback para português para ES e DE (suporte parcial)

**Mapeamento:**
```typescript
{
  'PT': 'pt',
  'EN': 'en',
  'FR': 'fr', // TODO: Adicionar arquivo fr.json
  'ES': 'pt', // Fallback
  'DE': 'pt'  // Fallback
}
```

---

## 🎯 Compatibilidade com API

### Idiomas Totalmente Suportados ✅
| Código | Nome       | Auth API | Budget API | Frontend |
|--------|------------|----------|------------|----------|
| PT     | Português  | ✅       | ✅         | ✅       |
| EN     | English    | ✅       | ✅         | ✅       |
| FR     | Français   | ✅       | ✅         | ⚠️ TODO  |

### Idiomas Parcialmente Suportados ⚠️
| Código | Nome     | Auth API | Budget API | Frontend  |
|--------|----------|----------|------------|-----------|
| ES     | Español  | ✅       | ❌         | Fallback PT |
| DE     | Deutsch  | ✅       | ❌         | Fallback PT |

---

## 📝 Fluxo Completo

### 1. Login
```typescript
// Backend retorna
{
  "language": "PT",
  "token": "...",
  ...
}

// Frontend processa
store.setUser({ language: "PT", ... })
store.setLanguage("PT")
updateI18nLocale("PT") // i18n.global.locale = "pt"
```

### 2. Chamadas de API
```typescript
// Categorias
const userStore = useUserStore()
const categories = await DataService.fetchCategories(userStore.getLanguage)
// GET /categories/translated?lang=pt

// Métodos de pagamento
const paymentMethods = await DataService.fetchPaymentMethods(userStore.getLanguage)
// GET /payment-methods/translated?lang=pt
```

### 3. Fallback Automático
```typescript
// Usuário com idioma ES (suporte parcial)
userStore.setLanguage("ES")
const apiLang = userStore.getApiLanguage // "pt" (fallback)

// Chamadas usam português automaticamente
await DataService.fetchCategories("ES")
// Internamente: GET /categories/translated?lang=pt
```

---

## 🔧 Como Usar

### Obter idioma do usuário
```typescript
import { useUserStore } from '@/plugins/userStore'

const userStore = useUserStore()
const userLanguage = userStore.getLanguage // "PT"
const apiLanguage = userStore.getApiLanguage // "pt"
```

### Usar em componentes Vue
```vue
<template>
  <div>
    Idioma atual: {{ userLanguage }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/plugins/userStore'

const userStore = useUserStore()
const userLanguage = computed(() => userStore.getLanguage)
</script>
```

### Chamar APIs traduzidas
```typescript
import DataService from '@/services/DataService'
import { useUserStore } from '@/plugins/userStore'

const userStore = useUserStore()

// Opção 1: Passar idioma do store
const categories = await DataService.fetchCategories(userStore.getLanguage)

// Opção 2: Passar diretamente
const paymentMethods = await DataService.fetchPaymentMethods('PT')
```

### Trocar idioma manualmente
```typescript
import { useUserStore } from '@/plugins/userStore'
import { updateI18nLocale } from '@/i18n'

const userStore = useUserStore()

function changeLanguage(newLanguage: string) {
  userStore.setLanguage(newLanguage)
  updateI18nLocale(newLanguage)
  // TODO: Chamar API para atualizar no backend
  // await updateUserLanguage(newLanguage)
}

// Exemplo
changeLanguage('EN')
```

---

## 📋 Próximos Passos (TODO)

### Frontend
- [ ] Adicionar arquivo `src/assets/locales/fr.json` (Francês)
- [ ] Criar componente de seleção de idioma (Settings)
- [ ] Implementar endpoint `PATCH /users/{userId}/language` no backend
- [ ] Criar service para atualizar idioma do usuário
- [ ] Adicionar testes unitários para `languageUtils`
- [ ] Adicionar feedback visual quando idioma é alterado

### Backend (Coordenar com time de backend)
- [ ] Sincronizar enums de idioma (Auth Service vs Budget API)
- [ ] Adicionar traduções ES e DE no Budget API
- [ ] Implementar endpoint de atualização de idioma do usuário

---

## 🧪 Testes

### Cenários de Teste

1. **Login com PT:**
   - ✅ Login retorna `language: "PT"`
   - ✅ userStore armazena "PT"
   - ✅ i18n usa locale "pt"
   - ✅ APIs chamadas com `?lang=pt`

2. **Login com EN:**
   - ✅ Login retorna `language: "EN"`
   - ✅ userStore armazena "EN"
   - ✅ i18n usa locale "en"
   - ✅ APIs chamadas com `?lang=en`

3. **Login com ES (fallback):**
   - ✅ Login retorna `language: "ES"`
   - ✅ userStore armazena "ES"
   - ✅ i18n usa locale "pt" (fallback)
   - ✅ APIs chamadas com `?lang=pt` (fallback)

4. **Persistência:**
   - ✅ Idioma salvo em sessionStorage
   - ✅ Idioma restaurado ao recarregar página

---

## 📚 Referências

- **Contrato da API:** Ver `API_LANGUAGE_CONTRACT.md` (documento do usuário)
- **Arquivos modificados:**
  - `src/plugins/userStore.ts`
  - `src/services/DataService.ts`
  - `src/types/global.d.ts`
  - `src/views/LoginView.vue`
  - `src/views/redirect_url/OAuth2Redirect.vue`
  - `src/i18n.ts`
- **Arquivos criados:**
  - `src/utils/languageUtils.ts`

---

## ✅ Checklist de Implementação

- [x] Extrair `language` da resposta de login
- [x] Armazenar idioma do usuário (sessionStorage)
- [x] Implementar conversão UPPERCASE → lowercase
- [x] Implementar fallback para idiomas não suportados
- [x] Adicionar parâmetro `lang` em APIs de tradução
- [x] Configurar i18n para sincronizar com backend
- [x] Mapear códigos para labels (via `languageUtils`)
- [ ] Adicionar seletor de idioma nas configurações
- [x] Testar com PT, EN
- [ ] Testar com FR (precisa arquivo fr.json)
- [x] Testar fallback ES/DE

---

**Status:** ✅ **Implementação Completa**  
**Build:** ✅ **Passando sem erros**  
**Próximo:** Adicionar UI para seleção de idioma + endpoint de atualização
