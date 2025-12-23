import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import router from '../router'
import { computed } from 'vue'
import { useUserStore } from '../plugins/userStore'
import { useBankStore } from '@/plugins/bankStore'

const access_token = computed(() => useUserStore().getToken)
const nubankToken = computed(() => useBankStore().getNubankToken)
const apiUrl = import.meta.env.VITE_API_BASE_URL

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
    if (access_token.value) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access_token.value}`;
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
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
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
      const userStore = useUserStore()
      const refreshToken = userStore.refreshToken
      if (!refreshToken) {
        userStore.resetUser()
        router.push('/login')
        return Promise.reject(error)
      }
      try {
        // Create form-encoded body
        const params = new URLSearchParams()
        params.append('grant_type', 'refresh_token')
        params.append('refresh_token', userStore.getRefreshToken!)
        
        const response = await axios.post(`${import.meta.env.VITE_AUTH_URL}/oauth2/token`, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        const data = response.data
        const accessToken = data.access_token || data.token || data.accessToken
        const newRefreshToken = data.refresh_token || data.refreshToken
        userStore.setToken(accessToken)
        userStore.setRefreshToken(newRefreshToken)
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken
        processQueue(null, accessToken)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        userStore.resetUser()
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
