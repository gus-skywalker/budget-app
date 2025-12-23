# Copilot Instructions for `budget-app`

## Project Overview
- **Framework:** Vue 3 + Vite + TypeScript (see `src/`, `vite.config.ts`)
- **State:** Pinia stores in `src/plugins/` (`userStore.ts`, `bankStore.ts`)
- **Services:** Domain services in `src/services/` (Axios-based, one per domain)
- **UI:** Vuetify 3 components in `src/components/` and `src/views/`
- **i18n:** Vue I18n with locales in `src/assets/locales/` (`en.json`, `pt.json`)
- **AI/ML:** AI features in `src/components/ai/` + `src/services/aiService.ts`
- **Architecture:** Multi-tenant B2B with company-scoped data (see B2B section below)
- **Languages:** Multi-language support with backend sync (see Language section below)

## Key Workflows
- **Install:** `npm install`
- **Dev:** `npm run dev` (Vite hot-reload on port 5173)
- **Build:** `npm run build` (type-check + bundle)
- **Type check:** `npm run type-check` (`vue-tsc --build`)
- **Test:** `npm run test:unit` (Vitest + jsdom)
- **Lint:** `npm run lint` (ESLint + Prettier)
- **Production:** `pm2 start server.cjs --name "budget-app" --env production -- PORT=3001`

## B2B Multi-Tenant Architecture

### User-Company Model
- Users can belong to **multiple companies** with different roles (`ADMIN`, `USER`, `VIEWER`)
- `userStore` tracks: `currentCompanyId`, `currentRole`, and `companies[]`
- All API requests auto-include `Authorization: Bearer {token}` via `axiosInterceptor.ts`

### API Contract (Backend B2B)

#### Login Response Structure
```json
{
  "id": "user123",
  "username": "João Silva",
  "email": "user@email.com",
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "companyId": null,  // null = not selected, string = selected
  "companies": [
    {"companyId": "company-456", "companyName": "Tech Solutions", "role": "ADMIN"}
  ]
}
```

#### Key Endpoints
- `POST /auth/signin` - Login (returns structure above)
- `POST /auth/select-company` - Select company, returns new `accessToken` + `refreshToken`
- `POST /companies` - Create company (requires auth)
- `GET /companies` - List user's companies (requires auth)

### JWT Structure
**Before company selection:**
```json
{
  "user_id": "123",
  "companies": [{"companyId": "...", "companyName": "...", "role": "ADMIN"}],
  // companyId and userRole are ABSENT
}
```

**After company selection:**
```json
{
  "user_id": "123",
  "companyId": "company-456",  // NOW PRESENT
  "userRole": "ADMIN",         // NOW PRESENT
  "companies": [...]
}
```

Use `jwtDecode()` from `jwt-decode` package to parse (see `LoginView.vue:255`)

### Critical Flows
1. **Login** (`LoginView.vue`):
   - Get response with `companies[]` and `companyId`
   - **Decision logic:**
     - `companies.length === 0` → redirect to create company
     - `companyId === null && companies.length > 0` → show `CompanySelector.vue`
     - `companyId !== null` → company already selected, go to dashboard

2. **Company Selection** (`CompanySelector.vue`, `CompanySwitcher.vue`):
   - Call `POST /auth/select-company { companyId }` → get new tokens
   - **CRITICAL:** Replace old token with new `accessToken` and `refreshToken`
   - Decode new JWT to extract `companyId` and `userRole`
   - Update `userStore.setCurrentCompany(companyId, role, name)`
   - Reload app to refresh company-scoped data

3. **API Requests**:
   - `axiosInterceptor.ts` auto-adds `Authorization` header
   - Token refresh on 401 via `/oauth2/token` with `refresh_token` grant

### Key Files
- `src/plugins/userStore.ts`: State management (token, companies, currentCompanyId, language)
- `src/views/LoginView.vue`: Login + company selection logic + language initialization
- `src/views/redirect_url/OAuth2Redirect.vue`: OAuth2 callback handling
- `src/components/CompanySelector.vue`: Modal for multi-company users
- `src/components/CompanySwitcher.vue`: Header dropdown to switch companies
- `src/services/CompanyService.ts`: Company API endpoints
- `src/services/axiosInterceptor.ts`: Auto-inject tokens, handle 401 refresh

## Multi-Language Architecture

### Language Model
- **Supported Languages:**
  - **Full support:** PT, EN, FR (complete translations)
  - **Partial support:** ES, DE (fallback to PT for missing translations)
- Backend returns language in **UPPERCASE** (PT, EN, FR, ES, DE)
- Frontend stores in **UPPERCASE**, converts to **lowercase** for API calls (pt, en, fr)
- i18n uses **lowercase** locale codes ('pt', 'en')

### API Contract (Backend Languages)

#### Login Response Structure
```json
{
  "id": "user123",
  "username": "João Silva",
  "email": "user@email.com",
  "language": "PT",  // UPPERCASE from backend
  "token": "eyJhbG...",
  "companies": [...]
}
```

#### JWT Structure (After Language Selection)
```json
{
  "user_id": "123",
  "user_language": "EN",  // UPPERCASE in JWT
  "companyId": "company-456",
  "userRole": "ADMIN"
}
```

### Language Conversion Flow
1. **Login/OAuth2:**
   - Backend returns `language: "PT"` (uppercase)
   - Store in `userStore.language` as is (uppercase)
   - Call `updateI18nLocale(language)` to sync i18n

2. **API Requests (Categories/Payment Methods):**
   - `DataService.fetchCategories(userStore.getLanguage)`
   - Service uses `languageUtils.getApiLanguage()` to convert PT→pt
   - Sends `/categories/translated?lang=pt` (lowercase)

3. **Language Utilities (`src/utils/languageUtils.ts`):**
   - `getApiLanguage('PT')` → 'pt'
   - `getApiLanguage('ES')` → 'pt' (fallback for partial support)
   - `isFullySupported('FR')` → true
   - `isPartiallySupported('DE')` → true

### Critical Flows
1. **Login Language Initialization:**
   ```typescript
   // LoginView.vue or OAuth2Redirect.vue
   const language = response.data.language // "PT"
   userStore.setLanguage(language)
   await updateI18nLocale(language) // Converts to 'pt' internally
   ```

2. **Fetching Translated Data:**
   ```typescript
   // Any component needing categories
   const userLanguage = userStore.getLanguage // "PT"
   const categories = await DataService.fetchCategories(userLanguage)
   // Internally calls: GET /categories/translated?lang=pt
   ```

3. **i18n Locale Mapping:**
   - `updateI18nLocale('PT')` → sets `i18n.global.locale.value = 'pt'`
   - `updateI18nLocale('ES')` → sets `i18n.global.locale.value = 'pt'` (fallback)
   - `updateI18nLocale('EN')` → sets `i18n.global.locale.value = 'en'`

### Key Files (Language)
- `src/utils/languageUtils.ts`: Language conversion, validation, fallback logic
- `src/i18n.ts`: i18n configuration with backend sync (`updateI18nLocale`)
- `src/plugins/userStore.ts`: `language` state, `getLanguage`, `getApiLanguage` getters
- `src/services/DataService.ts`: Translated categories/payment methods endpoints
- `src/types/global.d.ts`: `Language` and `ApiLanguage` type definitions

## Project Conventions
- **TypeScript-first:** Use `.ts` for logic, `.vue` SFCs with `<script setup lang="ts">`
- **Services pattern:** One service per domain (e.g., `ExpenseService.ts`, `AuthService.ts`)
  - Export default object with methods like `getAll()`, `create(data)`, `update(id, data)`
  - All use `axiosInterceptor` instance (never raw `axios`)
- **Stores:** Pinia stores in `src/plugins/`, persist to `sessionStorage` (see `userStore.saveState()`)
- **i18n:** All user-facing text via `$t('key')` (see `src/i18n.ts`)
- **Routing:** Protected routes use `meta: { requiresAuth: true }` (see `src/router/index.ts`)

## API Integration
- **Base URL:** `import.meta.env.VITE_API_BASE_URL` (axios default)
- **Auth URL:** `import.meta.env.VITE_AUTH_URL` (for `/auth/*` endpoints)
- **Token storage:** `userStore.token` + `userStore.refreshToken` (sessionStorage)
- **Error handling:** `axiosInterceptor.ts` catches 401 → auto-refresh → retry request

### Example Service (Follow this pattern)
```typescript
import axiosInterceptor from './axiosInterceptor'
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/expenses`

export default {
  getAll(): Promise<any> {
    return axiosInterceptor.get(API_URL)
  },
  create(data: any): Promise<any> {
    return axiosInterceptor.post(API_URL, data)
  }
}
```

## Common Tasks
- **Add endpoint:** Create method in relevant `src/services/*Service.ts`
- **Add route:** Update `src/router/index.ts` (set `meta.requiresAuth` if needed)
- **Add i18n string:** Update `src/assets/locales/en.json` + `pt.json`
- **Add AI feature:** Component in `src/components/ai/`, service in `aiService.ts`
- **Debug auth:** Check `userStore` state in Vue DevTools, verify JWT claims with `jwtDecode()`

## References
- `README.md`: PM2 commands, dependencies
- `B2B_FRONTEND_IMPLEMENTATION.md`: Detailed B2B implementation notes
- `B2B_SUMMARY.md`: Executive summary of multi-tenant features
- `LANGUAGE_IMPLEMENTATION.md`: Complete language/i18n implementation guide
- `src/services/axiosInterceptor.ts`: Auth flow + token refresh logic
- `src/plugins/userStore.ts`: User state structure (auth, companies, language)
- `src/utils/languageUtils.ts`: Language conversion utilities and constants

---
**When in doubt:** Check similar files in the same directory for patterns (services, components, views).
