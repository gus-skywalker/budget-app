<template>
  <div>Redirecting...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'
import AuthService from '@/services/AuthService'
import { updateI18nLocale } from '@/i18n'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { readInviteAcceptanceContext } from '@/utils/inviteAcceptanceContext'

const router = useRouter()
const userStore = useUserStore()

const extractTokenFromUrl = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const oauthError = urlParams.get('error')
  const purgeAfter = urlParams.get('purgeAfter')
  let token = urlParams.get('accessToken')
  const inviteContext = readInviteAcceptanceContext()
  const redirect = urlParams.get('redirect') || inviteContext?.redirect || null
  const plan = urlParams.get('plan')

  if (oauthError) {
    await router.replace({
      name: 'login',
      query: {
        oauthError,
        purgeAfter: purgeAfter || undefined
      }
    })
    return
  }

  try {
    if (!token) {
      const bootstrap = await AuthService.bootstrapSession()
      token = bootstrap?.data?.accessToken || null
    }

    if (token) {
      userStore.setToken(token)
      userStore.setAuth(true)
      userStore.syncFromToken(token)

      const res = await AuthService.userTokenInfo()
      const userLanguage = res.data.language || userStore.getLanguage || 'PT'

      userStore.setUser({
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        language: userLanguage,
        workspaces: userStore.getWorkspaces
      })

      await updateI18nLocale(userLanguage)

      if (inviteContext?.token && inviteContext?.redirect) {
        await router.replace(inviteContext.redirect)
        return
      }

      await userStore.reconcileWorkspaceContext()
      await userStore.hydrateWorkspaceDetailsFromBudget()

      const onboarding = await OnboardingOrchestrator.resolvePostAuthRoute({
        router,
        userStore,
        redirect,
        plan,
        defaultRedirect: '/dashboard'
      })
      router.push(onboarding.route)
      return
    }

    router.push('/login')
  } catch (error) {
    console.error('Erro no OAuth2 redirect:', error)
    router.push('/login')
  }
}

onMounted(() => {
  extractTokenFromUrl()
})
</script>
