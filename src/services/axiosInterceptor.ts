import axios from 'axios'
import router from '../router'
import { computed } from 'vue'
import { useUserStore } from '../plugins/userStore'
import { useBankStore } from '@/plugins/bankStore.ts'

const access_token = computed(() => useUserStore().getToken)
const nubankToken = computed(() => useBankStore().getNubankToken)
const apiUrl = import.meta.env.VITE_API_BASE_URL

const axiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 300000,
  withCredentials: true
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
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se a resposta for 401 (Não autorizado), você pode redirecionar o usuário para a página de login
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
