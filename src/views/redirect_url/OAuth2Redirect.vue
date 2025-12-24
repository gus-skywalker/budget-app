<template>
  <div>Redirecting...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'
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
      userStore.setToken(token)
      if (refreshToken) {
        userStore.setRefreshToken(refreshToken)
      }
      userStore.setAuth(true)
      userStore.syncFromToken(token)

      const res = await AuthService.userTokenInfo()
      const userLanguage = res.data.language || userStore.getLanguage || 'PT'

      userStore.setUser({
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        language: userLanguage,
        companies: userStore.getCompanies
      })

      await updateI18nLocale(userLanguage)

      const companies = userStore.getCompanies || []

      if (!companies.length) {
        router.push('/settings')
        return
      }

      if (userStore.isTenantMode) {
        router.push('/dashboard')
        return
      }

      if (companies.length === 1) {
        try {
          await userStore.selectCompany(companies[0].companyId)
          router.push('/dashboard')
        } catch (selectionError) {
          console.error('Erro ao auto-selecionar empresa via OAuth2:', selectionError)
          router.push({ name: 'select-company', query: { redirect: '/dashboard' } })
        }
        return
      }

      router.push({ name: 'select-company', query: { redirect: '/dashboard' } })
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
