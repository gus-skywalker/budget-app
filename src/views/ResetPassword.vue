<template>
    <div class="auth-page recovery-page">
        <div class="auth-shell single-column">
            <section class="auth-card">
                <button class="brand-link" type="button" @click="router.push({ name: 'landing' })">
                    <img src="/logo.jpg" alt="CoBudget" class="logo-image" />
                    <span>CoBudget</span>
                </button>

                <div class="copy-block">
                    <span class="section-tag">{{ $t('authentication.reset_password.title') }}</span>
                    <h1>{{ $t('authentication.reset_password.title') }}</h1>
                    <p>{{ $t('authentication.reset_password.description') }}</p>
                </div>

                <form class="auth-form" @submit.prevent="handleResetPassword">
                    <div class="form-group">
                        <label for="password">{{ $t('authentication.reset_password.password_label') }}</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            :placeholder="$t('authentication.reset_password.password_placeholder')"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">{{ $t('authentication.reset_password.confirm_password_label') }}</label>
                        <input
                            id="confirmPassword"
                            v-model="confirmPassword"
                            type="password"
                            :placeholder="$t('authentication.reset_password.confirm_password_placeholder')"
                            required
                        />
                    </div>

                    <button type="submit" class="btn btn-primary" :disabled="isLoading">
                        <span v-if="isLoading" class="spinner"></span>
                        <span v-else>{{ $t('authentication.reset_password.submit_button') }}</span>
                    </button>
                </form>

                <p v-if="message" class="message" :class="messageType">{{ message }}</p>

                <p class="back-to-login">
                    <a href="#" @click.prevent="router.push({ name: 'login' })">{{ $t('authentication.reset_password.back_to_login') }}</a>
                </p>
            </section>
        </div>

        <AppFooter />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/Footer.vue'
import AuthService from '@/services/AuthService'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const messageType = ref('')
const isLoading = ref(false)
const token = computed(() => String(route.query.token || ''))

const handleResetPassword = async () => {
    if (!token.value) {
        message.value = t('authentication.reset_password.missing_token')
        messageType.value = 'error'
        return
    }

    if (password.value !== confirmPassword.value) {
        message.value = t('authentication.messages.password_mismatch')
        messageType.value = 'error'
        return
    }

    try {
        isLoading.value = true
        await AuthService.resetPassword(token.value, password.value)
        message.value = t('authentication.reset_password.success_message')
        messageType.value = 'success'
    } catch (err) {
        console.error(err)
        message.value = t('authentication.reset_password.generic_error')
        messageType.value = 'error'
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.auth-page {
    min-height: 100vh;
    padding: 24px;
    background:
        radial-gradient(circle at top left, rgba(32, 95, 99, 0.08), transparent 28%),
        radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.08), transparent 20%),
        linear-gradient(180deg, #fbf8f2 0%, #f8f4ed 52%, #fdfaf5 100%);
}

.auth-shell {
    width: min(720px, 100%);
    margin: 0 auto;
}

.single-column {
    display: block;
}

.auth-card {
    border: 1px solid rgba(23, 32, 51, 0.1);
    box-shadow: 0 12px 28px rgba(23, 32, 51, 0.06);
    border-radius: 32px;
    background: rgba(255, 255, 255, 0.9);
    padding: 32px;
}

.brand-link {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
    border: 0;
    background: transparent;
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: #172033;
    cursor: pointer;
}

.logo-image {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    object-fit: cover;
}

.copy-block {
    display: grid;
    gap: 16px;
    margin-bottom: 28px;
}

.section-tag {
    display: inline-flex;
    width: fit-content;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(32, 95, 99, 0.1);
    color: #173f4b;
    font-family: 'Manrope', sans-serif;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.copy-block h1 {
    margin: 0;
    font-family: 'Manrope', sans-serif;
    font-size: clamp(2rem, 5vw, 3.25rem);
    line-height: 1;
    letter-spacing: -0.04em;
    color: #172033;
}

.copy-block p {
    margin: 0;
    color: #536177;
    line-height: 1.7;
}

.auth-form {
    display: grid;
    gap: 22px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #172033;
}

.form-group input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid rgba(23, 32, 51, 0.14);
    border-radius: 10px;
    background: #fff;
}

.form-group input:focus {
    outline: none;
    border-color: #205f63;
    box-shadow: 0 0 0 4px rgba(32, 95, 99, 0.1);
}

.btn {
    width: 100%;
    padding: 14px 24px;
    border: 1px solid transparent;
    border-radius: 999px;
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
}

.btn-primary {
    background: linear-gradient(135deg, #b6551f 0%, #d16b31 100%);
    color: #fff;
    box-shadow: 0 10px 18px rgba(182, 85, 31, 0.16);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.message {
    margin: 20px 0 0;
    padding: 14px 16px;
    border-radius: 14px;
    line-height: 1.5;
}

.message.success {
    background: rgba(32, 95, 99, 0.12);
    color: #173f4b;
}

.message.error {
    background: rgba(182, 85, 31, 0.1);
    color: #8e4318;
}

.back-to-login {
    margin: 22px 0 0;
    text-align: center;
}

.back-to-login a {
    color: #205f63;
    text-decoration: none;
    font-weight: 600;
}

.back-to-login a:hover {
    text-decoration: underline;
}

.spinner {
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #fff;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    animation: spin 0.8s linear infinite;
    display: inline-block;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
    .auth-page {
        padding: 12px;
    }

    .auth-card {
        padding: 22px;
        border-radius: 24px;
    }
}
</style>
