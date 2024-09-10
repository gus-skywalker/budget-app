<template>
  <div>Redirecting...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'
import AuthService from '@/services/AuthService';

const router = useRouter()
const userStore = useUserStore()

const extractTokenFromUrl = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  console.log(urlParams);
  const token = urlParams.get('token')
  const email = urlParams.get('email')

  if (token && email) {
    console.log('Passou com sucesso pelo token')
    userStore.setAuth(true)
    userStore.setToken(token)
    userStore.setUser({ email: email })

    AuthService.userTokenInfo()
      .then((res) => {
        console.log(res.data);
        userStore.setUser({
          username: res.data.username,
          email: res.data.email,
          id: res.data.id,
          language: res.data.language,
          userRole: res.data.userRole,
          createdAt: res.data.createdAt
        })
      })
      .catch((error) => {
        console.error('Erro ao buscar informações do usuário:', error)
      });
    router.push('/')
  } else {
    console.log('Falhamos em autenticar')
    router.push('/login')
  }
}

onMounted(() => {
  extractTokenFromUrl()
})
</script>
