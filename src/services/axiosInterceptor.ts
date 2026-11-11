import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import router from '../router'
import { computed } from 'vue'
import { useUserStore } from '../plugins/userStore'
import { useBankStore } from '@/plugins/bankStore'
import { buildBudgetApiMockResponse, isBudgetApiRequest } from '@/utils/devBudgetApiMock'

const access_token = computed(() => useUserStore().getToken)
const nubankToken = computed(() => useBankStore().getNubankToken)
const workspaceId = computed(() => useUserStore().getCurrentWorkspaceId)
const apiUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

const isAbsoluteUrl = (url?: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(String(url || ''))

const isBudgetApiTarget = (config: AxiosRequestConfig): boolean => {
  const rawUrl = String(config.url || '')
  if (!rawUrl) return true
  if (!isAbsoluteUrl(rawUrl)) return true
  return rawUrl.startsWith(apiUrl)
}

const extractWorkspaceIdFromRequest = (config: AxiosRequestConfig): string | null => {
  try {
    const rawUrl = String(config.url || '')
    if (!rawUrl) return null
    const base = String((config as any).baseURL || apiUrl || window.location.origin)
    const resolved = isAbsoluteUrl(rawUrl) ? rawUrl : new URL(rawUrl, base).toString()
    const path = new URL(resolved).pathname
    const match = path.match(/\/(?:api\/)?workspaces\/([0-9a-fA-F-]{36})(?:\/|$)/)
    return match?.[1] ? String(match[1]) : null
  } catch {
    return null
  }
}

const shouldSkipWorkspaceHeader = (config: AxiosRequestConfig): boolean => {
  try {
    const rawUrl = String(config.url || '')
    const base = String((config as any).baseURL || apiUrl || window.location.origin)
    const resolved = isAbsoluteUrl(rawUrl) ? rawUrl : new URL(rawUrl, base).toString()
    const path = new URL(resolved).pathname
    return /\/(?:api\/)?shared-expense-agreements\/received(?:\/|$)/.test(path)
  } catch {
    return false
  }
}

const axiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 300000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      if (typeof (config.headers as any)?.delete === 'function') {
        ;(config.headers as any).delete('Content-Type')
        ;(config.headers as any).delete('content-type')
      } else if (config.headers) {
        delete (config.headers as any)['Content-Type']
        delete (config.headers as any)['content-type']
      }
    }

    if (isBudgetApiRequest(config)) {
      config.adapter = () => buildBudgetApiMockResponse(config)
    }

    if (access_token.value) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access_token.value}`;
      if (isBudgetApiTarget(config) && !shouldSkipWorkspaceHeader(config)) {
        // Some endpoints (e.g. GET /workspaces/:id) require workspace context even before
        // the store has the current workspace selected. Infer it from the URL when needed.
        const inferredWorkspaceId = extractWorkspaceIdFromRequest(config)
        const headerWorkspaceId = inferredWorkspaceId || workspaceId.value
        if (headerWorkspaceId) {
          config.headers['X-Workspace-Id'] = String(headerWorkspaceId);
        }
      }
      if (nubankToken.value) {
        config.headers['X-Nubank-Token'] = String(nubankToken.value);
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token as string)
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config: any }) => {
    const originalRequest = error.config
    const status = error.response?.status
    const errorBody = typeof error.response?.data === 'string'
      ? error.response?.data
      : JSON.stringify(error.response?.data || {})
    const looksLikeExpiredJwt = /jwt.*(expired|no longer valid|expiration time|invalidjwt)/i.test(String(errorBody || ''))
    const userStore = useUserStore()

    // Quando já estamos deslogados, não tentamos "ressuscitar" a sessão com refresh.
    // Isso evita loops de refresh/login depois do logout ou em rotas públicas.
    if (!userStore.isAuthenticated && !userStore.getToken) {
      return Promise.reject(error)
    }

    // Fluxo principal: 401 visível -> tenta refresh
    if ((status === 401 || status === 403 || (status === 500 && looksLikeExpiredJwt)) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return axiosInstance(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }
      originalRequest._retry = true
      isRefreshing = true
      try {
        // Use the userStore action for refresh logic
        const success = await userStore.tryRefreshToken()
        if (success && userStore.token) {
          originalRequest.headers['Authorization'] = 'Bearer ' + userStore.token
          processQueue(null, userStore.token)
          return axiosInstance(originalRequest)
        } else {
          processQueue('Refresh failed', null)
          if (!userStore.isAuthenticated) {
            router.push('/login')
          }
          return Promise.reject(error)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        if (!userStore.isAuthenticated) {
          router.push('/login')
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
