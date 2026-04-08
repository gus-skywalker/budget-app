<template>
  <div class="verify-email-page">
    <div class="card">
      <h1>Verify Email</h1>

      <p v-if="loading">Validating your token...</p>
      <p v-else-if="success" class="success">Email verified successfully</p>
      <p v-else class="error">{{ errorMessage }}</p>

      <button type="button" class="btn" @click="goToLogin">
        Go to login
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthService from '@/services/AuthService'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const success = ref(false)
const errorMessage = ref('Could not verify your email. Please request a new verification link.')

onMounted(async () => {
  const token = typeof route.query.token === 'string' ? route.query.token : ''
  if (!token) {
    loading.value = false
    errorMessage.value = 'Verification token is missing.'
    return
  }

  try {
    await AuthService.verifyEmail(token)
    success.value = true
  } catch (error: any) {
    const reason = error?.response?.data?.message || error?.response?.data?.error || ''
    if (String(reason).includes('TOKEN_EXPIRED')) {
      errorMessage.value = 'This verification link has expired. Please request a new one.'
    } else if (String(reason).includes('INVALID_OR_USED_TOKEN')) {
      errorMessage.value = 'This verification link is invalid or already used.'
    }
  } finally {
    loading.value = false
  }
})

const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<style scoped>
.verify-email-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf3 100%);
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

h1 {
  margin: 0 0 12px;
  font-size: 1.6rem;
  color: #111827;
}

p {
  margin: 0 0 18px;
  color: #4b5563;
  line-height: 1.5;
}

.success {
  color: #166534;
}

.error {
  color: #b91c1c;
}

.btn {
  border: 0;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  padding: 10px 16px;
  cursor: pointer;
}

.btn:hover {
  background: #1d4ed8;
}
</style>

