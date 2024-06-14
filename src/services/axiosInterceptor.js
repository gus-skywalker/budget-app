import axios from 'axios'
import router from '../router'
import { computed } from 'vue'
import { useUserStore } from '../plugins/userStore.ts'

const access_token = computed(() => useUserStore().getToken)

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000
})

// // Function to initialize the axios instance with interceptors
// function createAxiosInstance() {
//   const store = useStore() // Ensure this is within the composition API context
//   const access_token = computed(() => store.getters.token)

//   const axiosInstance = axios.create({
//     baseURL: 'http://localhost:8080/api',
//     timeout: 5000,
//   })
// }

// Interceptor para adicionar o token JWT em todas as requisições
axiosInstance.interceptors.request.use(
  (config) => {
    if (access_token.value) {
      config.headers.Authorization = `Bearer ${access_token.value}`
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
      router.push('/login') // Ajuste o caminho conforme necessário
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
