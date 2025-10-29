import axios from 'axios'
import router from '../router'
import { computed } from 'vue'
import { useUserStore } from '../plugins/userStore.ts'
import { useBankStore } from '@/plugins/bankStore.ts'

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

// Interceptor para adicionar o token JWT em todas as requisições
axiosInstance.interceptors.request.use(
  (config) => {
    if (access_token.value) {
      config.headers.Authorization = `Bearer ${access_token.value}`

      if (nubankToken.value) {
        const nubankTokenString = String(nubankToken.value)
        config.headers['X-Nubank-Token'] = nubankTokenString
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para lidar com erros de autenticação (token expirado, por exemplo)
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
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
        // Chamada OAuth2 para renovar o token usando o refresh token
        const response = await axios.post(`${import.meta.env.VITE_AUTH_URL}/oauth2/token`, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })

        const { access_token, refresh_token } = response.data
        
        userStore.setToken(access_token)
        userStore.setRefreshToken(refresh_token)
        
        originalRequest.headers['Authorization'] = 'Bearer ' + access_token
        processQueue(null, access_token)
        
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
