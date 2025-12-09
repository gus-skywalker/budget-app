<template>
  <div>Redirecting...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import AuthService from '@/services/AuthService'
import { updateI18nLocale } from '@/i18n'

const router = useRouter()
const userStore = useUserStore()

const extractTokenFromUrl = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const refreshToken = urlParams.get('refreshToken')
  const email = urlParams.get('email')

  console.log('OAuth2 callback - token:', token ? 'presente' : 'ausente')
  
  if (token && email) {
    try {
      // Decodifica JWT para extrair informações
      const decodedToken = jwtDecode(token)
      const companies = decodedToken.companies || []
      const companyId = decodedToken.companyId || null
      
      console.log('Companies from JWT:', companies)
      
      // Armazena tokens
      userStore.setToken(token)
      if (refreshToken) {
        userStore.setRefreshToken(refreshToken)
      }
      userStore.setAuth(true)

      // Busca informações completas do usuário
      const res = await AuthService.userTokenInfo()
      const userLanguage = res.data.language || decodedToken.user_language || 'PT'
      
      // Define usuário com empresas
      userStore.setUser({
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        language: userLanguage,
        companies: companies
      })
      
      // Configura idioma e sincroniza i18n
      userStore.setLanguage(userLanguage)
      await updateI18nLocale(userLanguage)
      
      userStore.setCompanies(companies)
      
      // Fluxo de decisão (mesmo do login tradicional)
      if (companies.length === 0) {
        // Sem empresas - redireciona para criar
        router.push('/settings')
      } else if (companyId === null && companies.length > 0) {
        // Precisa selecionar empresa
        if (companies.length === 1) {
          // Auto-seleciona única empresa
          userStore.setCurrentCompany(companies[0].companyId, companies[0].role, companies[0].companyName)
          router.push('/dashboard')
        } else {
          // Múltiplas empresas - vai para login para mostrar seletor
          router.push('/login')
        }
      } else {
        // Empresa já selecionada
        const userRole = decodedToken.userRole || decodedToken.role
        const selectedCompany = companies.find(c => c.companyId === companyId)
        userStore.setCurrentCompany(companyId, userRole, selectedCompany?.companyName)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro no OAuth2 redirect:', error)
      router.push('/login')
    }
  } else {
    console.log('OAuth2 falhou - token ou email ausente')
    router.push('/login')
  }
}

onMounted(() => {
  extractTokenFromUrl()
})
</script>
