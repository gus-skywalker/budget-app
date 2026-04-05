<template>
  <div class="auth-page login-page">
    <transition name="fade">
      <div v-if="error" class="snackbar error-snackbar" @click="closeNotification('error')">
        {{ error }}
        <span class="close-btn">&times;</span>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="loginSuccess" class="snackbar success-snackbar" @click="closeNotification('success')">
        {{ loginSuccess }}
        <span class="close-btn">&times;</span>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="signupError" class="snackbar error-snackbar" @click="closeNotification('signupError')">
        {{ signupError }}
        <span class="close-btn">&times;</span>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="signupSuccess" class="snackbar success-snackbar" @click="closeNotification('signupSuccess')">
        {{ signupSuccess }}
        <span class="close-btn">&times;</span>
      </div>
    </transition>

    <div class="auth-shell">
      <section class="auth-hero">
        <div class="hero-card">
          <button class="brand-link" type="button" @click="router.push({ name: 'landing' })">
            <img src="/logo.jpg" alt="CoBudget" class="logo-image" />
            <span>CoBudget</span>
          </button>

          <div class="hero-copy">
            <span class="section-tag">{{ showSignupForm ? $t('authentication.signup.title') : $t('authentication.login.title') }}</span>
            <h1>{{ $t('authentication.hero.title') }}</h1>
            <p>{{ $t('authentication.hero.subtitle') }}</p>
          </div>

          <div class="hero-features">
            <div class="feature-item">
              <div class="feature-icon">
                <v-icon size="18">mdi-shield-check-outline</v-icon>
              </div>
              <span>{{ $t('authentication.hero.feature_security') }}</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <v-icon size="18">mdi-finance</v-icon>
              </div>
              <span>{{ $t('authentication.hero.feature_visibility') }}</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <v-icon size="18">mdi-account-group-outline</v-icon>
              </div>
              <span>{{ $t('authentication.hero.feature_collaboration') }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="auth-panel">
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-switch">
              <button
                type="button"
                class="switch-chip"
                :class="{ active: !showSignupForm }"
                @click="toggleForm(false)"
              >
                {{ $t('authentication.login.title') }}
              </button>
              <button
                type="button"
                class="switch-chip"
                :class="{ active: showSignupForm }"
                @click="toggleForm(true)"
              >
                {{ $t('authentication.signup.title') }}
              </button>
            </div>

            <div v-if="!showSignupForm" class="auth-form-header">
              <h2 class="form-title">{{ $t('authentication.login.title') }}</h2>
              <p class="form-description">{{ $t('authentication.login.description') }}</p>
            </div>

            <div v-else class="auth-form-header">
              <h2 class="form-title">{{ $t('authentication.signup.title') }}</h2>
              <p class="form-description">{{ $t('authentication.signup.description') }}</p>
            </div>
          </div>

          <div v-if="!showSignupForm" class="auth-form">
            <form @submit.prevent="userLogin">
              <div class="form-group">
                <label for="email">{{ $t('authentication.login.email_label') }}</label>
                <input
                  id="email"
                  type="email"
                  v-model="userData.email"
                  :placeholder="$t('authentication.login.email_label')"
                  @input="resetEmailValidation"
                  @blur="validateEmail"
                  :class="{ 'invalid-email': !emailValid }"
                  required
                />
                <span v-if="!emailValid" class="error-message">{{ $t('authentication.login.invalid_email') }}</span>
              </div>

              <div class="form-group password-field">
                <label for="password">{{ $t('authentication.login.password_label') }}</label>
                <div class="password-input-wrapper">
                  <input
                    id="password"
                    :type="showPassword ? 'text' : 'password'"
                    v-model="userData.password"
                    :placeholder="$t('authentication.login.password_label')"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="togglePasswordVisibility"
                    :title="showPassword ? $t('authentication.common.hide_password') : $t('authentication.common.show_password')"
                  >
                    <v-icon size="18">{{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
                  </button>
                </div>
              </div>

              <p class="forgot-password-link">
                <a href="#" @click.prevent="goToForgotPassword">{{ $t('authentication.login.forgot_password') }}</a>
              </p>

              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>{{ $t('authentication.login.login_button') }}</span>
              </button>

              <div class="divider">
                <span>{{ $t('authentication.common.or') }}</span>
              </div>

              <button class="oauth-button" @click.prevent="loginWithGoogle">
                <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" />
                {{ $t('authentication.login.google_login') }}
              </button>

              <p class="switch-form">
                {{ $t('authentication.login.not_registered') }}
                <a href="#" @click.prevent="toggleForm(true)">{{ $t('authentication.login.create_account_link') }}</a>
              </p>

              <p class="terms-links">
                {{ $t('authentication.common.login_terms_prefix') }}
                <router-link to="/terms-of-use">{{ $t('authentication.common.terms_of_use') }}</router-link>
                {{ $t('authentication.common.and') }}
                <router-link to="/privacy-policy">{{ $t('authentication.common.privacy_policy') }}</router-link>
              </p>
            </form>

            <div v-if="isDev" class="test-buttons">
              <h4>{{ $t('authentication.common.test_area_title') }}</h4>
              <button @click="mockLogin('no-workspace')" class="btn-test">{{ $t('authentication.common.test_no_workspace') }}</button>
              <button @click="mockLogin('single-workspace')" class="btn-test">{{ $t('authentication.common.test_single_workspace') }}</button>
              <button @click="mockLogin('multiple-workspaces')" class="btn-test">{{ $t('authentication.common.test_multiple_workspaces') }}</button>
            </div>
          </div>

          <div v-else class="auth-form">
            <form @submit.prevent="userSignup">
              <div class="form-group">
                <label for="username">{{ $t('authentication.signup.username_label') }}</label>
                <input id="username" type="text" v-model="signupData.username" :placeholder="$t('authentication.signup.username_label')" required />
              </div>

              <div class="form-group">
                <label for="signup-email">{{ $t('authentication.signup.email_label') }}</label>
                <input id="signup-email" type="email" v-model="signupData.email" :placeholder="$t('authentication.signup.email_label')" required />
              </div>

              <div class="form-group password-field">
                <label for="signup-password">{{ $t('authentication.signup.password_label') }}</label>
                <div class="password-input-wrapper">
                  <input
                    id="signup-password"
                    :type="showPassword ? 'text' : 'password'"
                    v-model="signupData.password"
                    :placeholder="$t('authentication.signup.password_label')"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="togglePasswordVisibility"
                    :title="showPassword ? $t('authentication.common.hide_password') : $t('authentication.common.show_password')"
                  >
                    <v-icon size="18">{{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
                  </button>
                </div>
              </div>

              <div class="form-group password-field">
                <label for="confirmPassword">{{ $t('authentication.signup.confirm_password_label') }}</label>
                <div class="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="signupData.confirmPassword"
                    :placeholder="$t('authentication.signup.confirm_password_label')"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="toggleConfirmPasswordVisibility"
                    :title="showConfirmPassword ? $t('authentication.common.hide_password') : $t('authentication.common.show_password')"
                  >
                    <v-icon size="18">{{ showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
                  </button>
                </div>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>{{ $t('authentication.signup.signup_button') }}</span>
              </button>

              <p class="switch-form">
                {{ $t('authentication.signup.already_registered') }}
                <a href="#" @click.prevent="toggleForm(false)">{{ $t('authentication.signup.login_here_link') }}</a>
              </p>

              <p class="terms-links">
                {{ $t('authentication.common.signup_terms_prefix') }}
                <router-link to="/terms-of-use">{{ $t('authentication.common.terms_of_use') }}</router-link>
                {{ $t('authentication.common.and') }}
                <router-link to="/privacy-policy">{{ $t('authentication.common.privacy_policy') }}</router-link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/plugins/userStore'
import { useRouter, useRoute } from 'vue-router'
import { updateI18nLocale } from '@/i18n'
import AuthService from '@/services/AuthService'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { activateDevQuickAccess, clearDevQuickAccess } from '@/utils/devQuickAccess'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const userData = ref({ email: '', password: '' })
const signupData = ref({ email: '', password: '', confirmPassword: '', username: '' })
const error = ref(null)
const loginSuccess = ref(null)
const signupError = ref(null)
const signupSuccess = ref(null)
const showSignupForm = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const emailValid = ref(true)
const isDev = import.meta.env.DEV

onMounted(() => {
  if (route.query && route.query.signup === 'true') {
    toggleForm(true)
  }
})

const getLoginErrorMessage = (err) => {
  const status = err?.response?.status
  const data = err?.response?.data

  if (err?.code === 'ERR_NETWORK' || !err?.response) {
    return t('authentication.messages.network_error')
  }

  if (status === 401 || status === 403) {
    return t('authentication.messages.login_failed')
  }

  if (status >= 500) {
    return t('authentication.messages.server_unavailable')
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data?.message) {
    return data.message
  }

  return t('authentication.messages.login_unavailable')
}

const userLogin = async () => {
  try {
    isLoading.value = true
    const store = useUserStore()

    const res = await AuthService.signIn(userData.value)
    if (res.data) {
      clearDevQuickAccess()
      store.handleSigninResponse(res.data)
      updateI18nLocale(res.data.language || 'PT')

      try {
        await store.hydrateWorkspaceDetailsFromBudget()
      } catch (hydrateError) {
        console.warn('Não foi possível hidratar detalhes dos workspaces no login.', hydrateError)
      }

      const onboarding = await OnboardingOrchestrator.resolvePostAuthRoute({
        router,
        userStore: store,
        redirect: route.query.redirect,
        plan: route.query.plan,
        defaultRedirect: '/dashboard'
      })

      loginSuccess.value = t('authentication.messages.login_success')
      setTimeout(() => {
        loginSuccess.value = null
        router.push(onboarding.route)
      }, 800)
    }
  } catch (err) {
    console.error('Login error:', err)
    console.error('Store no momento do erro:', useUserStore())

    error.value = getLoginErrorMessage(err)
    setTimeout(() => {
      error.value = null
    }, 4000)
  } finally {
    isLoading.value = false
  }
}

const mockLogin = (scenario) => {
  const store = useUserStore()

  const mockUser = {
    id: 'dev-user-123',
    username: 'Usuario Teste',
    email: 'teste@email.com',
    language: String(locale.value || 'pt').slice(0, 2).toUpperCase()
  }

  const mockToken = `dev.quick-access.${scenario}`

  let workspaces = []

  switch (scenario) {
    case 'no-workspace':
      workspaces = []
      break
    case 'single-workspace':
      workspaces = [
        {
          workspaceId: 'workspace-1',
          workspaceName: 'Meu Workspace',
          role: 'ROLE_ADMIN'
        }
      ]
      break
    case 'multiple-workspaces':
      workspaces = [
        {
          workspaceId: 'workspace-1',
          workspaceName: 'Tech Solutions LTDA',
          role: 'ROLE_ADMIN'
        },
        {
          workspaceId: 'workspace-2',
          workspaceName: 'Startup Inovadora',
          role: 'ROLE_CLIENT'
        },
        {
          workspaceId: 'workspace-3',
          workspaceName: 'Consultoria Estratégica',
          role: 'ROLE_USER'
        }
      ]
      break
    default:
      workspaces = []
  }

  activateDevQuickAccess(scenario, workspaces)

  store.$reset()
  sessionStorage.removeItem('userStore')
  localStorage.removeItem('userPreference')

  store.setUser({
    ...mockUser,
    workspaces
  })
  store.setToken(mockToken)
  store.setAuth(true)
  store.setWorkspaces(workspaces)
  store.clearCurrentWorkspace()

  if (workspaces.length > 1) {
    store.preferredMode = null
    store.preferredWorkspaceId = null
    store.savePreference()
    router.push({ name: 'select-workspace', query: { redirect: '/dashboard' } })
  } else if (workspaces.length === 1) {
    store.setCurrentWorkspace(workspaces[0].workspaceId, workspaces[0].role, workspaces[0].workspaceName)
    store.setPreferredWorkspace(workspaces[0].workspaceId)
    loginSuccess.value = t('authentication.messages.login_success')
    setTimeout(() => {
      loginSuccess.value = null
      router.push('/dashboard')
    }, 800)
  } else {
    store.preferredMode = null
    store.preferredWorkspaceId = null
    store.savePreference()
    loginSuccess.value = t('authentication.messages.login_success')
    setTimeout(() => {
      loginSuccess.value = null
      router.push('/create-workspace')
    }, 800)
  }
}

const userSignup = async () => {
  if (signupData.value.password !== signupData.value.confirmPassword) {
    signupError.value = t('authentication.messages.password_mismatch')
    setTimeout(() => {
      signupError.value = null
    }, 4000)
    return
  }
  try {
    isLoading.value = true

    const requestData = {
      username: signupData.value.username,
      email: signupData.value.email,
      password: signupData.value.password,
      language: String(locale.value || 'pt').slice(0, 2).toUpperCase()
    }

    const res = await AuthService.signUp(requestData)

    if (res.status === 201) {
      signupSuccess.value = t('authentication.messages.signup_success_ready')
      setTimeout(() => {
        signupSuccess.value = null
        clearSignupForm()
        toggleForm(false)
      }, 3000)
    } else {
      signupError.value = t('authentication.messages.signup_failed')
      setTimeout(() => {
        signupError.value = null
      }, 4000)
    }

  } catch (err) {
    console.error('Signup error:', err)
    signupError.value = t('authentication.messages.signup_failed')
    setTimeout(() => {
      signupError.value = null
    }, 4000)
  } finally {
    isLoading.value = false
  }
}

const clearSignupForm = () => {
  signupData.value = { email: '', password: '', confirmPassword: '', username: '' }
}

const toggleForm = (isSignup) => {
  showSignupForm.value = isSignup
  if (isSignup) clearSignupForm()
}

const loginWithGoogle = () => {
  window.location.href = AuthService.getOAuthAuthorizationUrl('google')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailValid.value = emailRegex.test(userData.value.email)
}

const resetEmailValidation = () => {
  emailValid.value = true
}

const closeNotification = (type) => {
  if (type === 'error') error.value = null
  if (type === 'success') loginSuccess.value = null
  if (type === 'signupError') signupError.value = null
  if (type === 'signupSuccess') signupSuccess.value = null
}
</script>

<style>
body:has(.login-page) {
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.08), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.08), transparent 20%),
    linear-gradient(180deg, #fbf8f2 0%, #f8f4ed 52%, #fdfaf5 100%) !important;
  overflow-x: hidden;
}

body:has(.login-page) .v-application {
  background: transparent !important;
}

body:has(.login-page) .v-main {
  background: transparent !important;
  padding: 0 !important;
}

body:has(.login-page) .main-content {
  padding: 0 !important;
  background: transparent !important;
}
</style>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 24px;
  color: #172033;
  font-family: 'Source Sans 3', sans-serif;
}

.auth-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(420px, 0.88fr);
  gap: 22px;
  align-items: stretch;
}

.auth-hero,
.panel-card,
.snackbar {
  border: 1px solid rgba(23, 32, 51, 0.1);
  box-shadow: 0 12px 28px rgba(23, 32, 51, 0.06);
}

.auth-hero {
  min-height: calc(100vh - 48px);
  border-radius: 32px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(242, 236, 227, 0.78) 100%);
  padding: 28px;
}

.hero-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  border: 0;
  background: transparent;
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: #172033;
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.snackbar {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 280px;
  max-width: 90vw;
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 1rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.error-snackbar {
  background: rgba(182, 85, 31, 0.1);
  color: #8e4318;
}
.success-snackbar {
  background: rgba(32, 95, 99, 0.12);
  color: #173f4b;
}
.close-btn {
  margin-left: 24px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
}

.hero-copy {
  display: grid;
  gap: 18px;
  max-width: 540px;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 8px 14px;
  background: rgba(32, 95, 99, 0.1);
  color: #173f4b;
  font-family: 'Manrope', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.hero-copy h1,
.form-title,
.panel-switch,
.btn,
.test-buttons h4 {
  font-family: 'Manrope', sans-serif;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4.4rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.hero-copy p {
  margin: 0;
  color: #536177;
  font-size: 1.12rem;
  line-height: 1.7;
}

.hero-features {
  display: grid;
  gap: 16px;
  margin-top: auto;
}

.feature-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(23, 32, 51, 0.08);
}

.logo-image {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 10px 18px rgba(23, 32, 51, 0.08);
}

.feature-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(32, 95, 99, 0.12);
  color: #173f4b;
}

.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-card {
  width: 100%;
  max-width: 560px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
}

.panel-header {
  display: grid;
  gap: 22px;
  margin-bottom: 26px;
}

.panel-switch {
  display: inline-flex;
  gap: 8px;
  width: fit-content;
  padding: 6px;
  border-radius: 999px;
  background: rgba(23, 32, 51, 0.05);
}

.switch-chip {
  min-height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #536177;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.switch-chip.active {
  background: #ffffff;
  color: #172033;
  box-shadow: 0 6px 14px rgba(23, 32, 51, 0.06);
}

.auth-form {
  width: 100%;
}

.auth-form-header {
  display: grid;
  gap: 8px;
}

.form-title {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.5rem);
  font-weight: 700;
  color: #172033;
}

.form-description {
  margin: 0;
  color: #536177;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #172033;
  font-size: 0.95rem;
}

input[type='text'],
input[type='email'],
input[type='password'] {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(23, 32, 51, 0.14);
  border-radius: 8px;
  background-color: #ffffff;
  color: #1a1a1a;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #205f63;
  box-shadow: 0 0 0 4px rgba(32, 95, 99, 0.1);
}

.password-field {
  position: relative;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  width: 100%;
  padding-right: 45px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  cursor: pointer;
  user-select: none;
  color: #536177;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
}

.toggle-password:hover {
  color: #172033;
}

.invalid-email {
  border-color: #b6551f !important;
  background-color: rgba(182, 85, 31, 0.06) !important;
}

.error-message {
  color: #b6551f;
  font-size: 0.85em;
  margin-top: 6px;
  display: block;
}

.forgot-password-link {
  text-align: right;
  margin-bottom: 24px;
}

.forgot-password-link a {
  font-size: 0.9rem;
  color: #205f63;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password-link a:hover {
  color: #173f4b;
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 14px 24px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #b6551f 0%, #d16b31 100%);
  color: white;
  box-shadow: 0 10px 18px rgba(182, 85, 31, 0.16);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 14px 24px rgba(182, 85, 31, 0.2);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: #536177;
  opacity: 0.7;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  padding: 0 16px;
  font-size: 0.9rem;
}

.oauth-button {
  width: 100%;
  padding: 12px 24px;
  background-color: #ffffff;
  border: 1px solid rgba(23, 32, 51, 0.14);
  border-radius: 999px;
  font-size: 1rem;
  cursor: pointer;
  color: #172033;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.oauth-button:hover {
  border-color: #205f63;
  background-color: rgba(32, 95, 99, 0.04);
}

.oauth-button img {
  width: 20px;
  height: 20px;
}

.switch-form {
  text-align: center;
  margin-top: 32px;
  color: #536177;
  opacity: 0.9;
}

.switch-form a {
  color: #205f63;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.switch-form a:hover {
  color: #173f4b;
  text-decoration: underline;
}

.terms-links {
  text-align: center;
  margin-top: 24px;
  font-size: 0.85rem;
  color: #758298;
  line-height: 1.5;
}

.terms-links a {
  color: #205f63;
  text-decoration: none;
  font-weight: 500;
}

.terms-links a:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-hero {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .auth-page {
    padding: 12px;
  }

  .auth-shell {
    gap: 14px;
  }

  .auth-hero,
  .panel-card {
    border-radius: 24px;
    padding: 20px;
  }

  .hero-copy h1 {
    font-size: clamp(2rem, 11vw, 3rem);
  }

  .panel-card {
    padding: 22px;
  }

  .panel-switch {
    width: 100%;
    justify-content: space-between;
  }

  .switch-chip {
    flex: 1;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .form-title {
    font-size: 1.5rem;
  }

  .form-description {
    font-size: 0.9rem;
  }

  input[type='text'],
  input[type='email'],
  input[type='password'] {
    padding: 12px 14px;
    font-size: 0.95rem;
  }

  .btn {
    padding: 12px 20px;
    font-size: 0.95rem;
  }

  .oauth-button {
    padding: 10px 20px;
    font-size: 0.95rem;
  }
}

.workspace-fields {
  margin-top: 12px;
  padding: 16px;
  background-color: rgba(32, 95, 99, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(32, 95, 99, 0.12);
}

.workspace-fields input.form-control,
.workspace-fields input[type='text'] {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(23, 32, 51, 0.14);
  border-radius: 8px;
  background-color: #ffffff;
  color: #1a1a1a;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.workspace-fields input:focus {
  outline: none;
  border-color: #205f63;
  box-shadow: 0 0 0 3px rgba(32, 95, 99, 0.1);
}

.workspace-fields small {
  display: block;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.1);
}

.test-buttons {
  padding: 16px;
  background-color: rgba(182, 85, 31, 0.08);
  border: 1px solid rgba(182, 85, 31, 0.18);
  border-radius: 16px;
  margin-top: 16px;
}

.test-buttons h4 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: #8e4318;
}

.btn-test {
  display: block;
  width: 100%;
  margin: 6px 0;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid rgba(182, 85, 31, 0.18);
  border-radius: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-test:hover {
  background: rgba(182, 85, 31, 0.08);
  color: #172033;
}
</style>
