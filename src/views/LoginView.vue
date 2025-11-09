<template>
  <div class="app-container login-page">
    <!-- Snackbar de erro -->
    <transition name="fade">
      <div v-if="error" class="snackbar error-snackbar" @click="closeNotification('error')">
        {{ error }}
        <span class="close-btn">&times;</span>
      </div>
    </transition>
    <!-- Snackbar de sucesso -->
    <transition name="fade">
      <div v-if="loginSuccess" class="snackbar success-snackbar" @click="closeNotification('success')">
        {{ loginSuccess }}
        <span class="close-btn">&times;</span>
      </div>
    </transition>
    <!-- Snackbar de erro do signup -->
    <transition name="fade">
      <div v-if="signupError" class="snackbar error-snackbar" @click="closeNotification('signupError')">
        {{ signupError }}
        <span class="close-btn">&times;</span>
      </div>
    </transition>
    <!-- Snackbar de sucesso do signup -->
    <transition name="fade">
      <div v-if="signupSuccess" class="snackbar success-snackbar" @click="closeNotification('signupSuccess')">
        {{ signupSuccess }}
        <span class="close-btn">&times;</span>
      </div>
    </transition>

    <div class="login-wrapper">
      <!-- Lado esquerdo - Branding / Hero -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="brand-logo">
            <img src="/logo.jpg" alt="CoBudget Logo" class="logo-image" />
          </div>
          <h1 class="hero-title">CoBudget</h1>
          <p class="hero-subtitle">Sua jornada financeira começa aqui</p>
          <div class="hero-features">
            <div class="feature-item">
              <v-icon color="white" size="24">mdi-shield-check</v-icon>
              <span>Segurança garantida</span>
            </div>
            <div class="feature-item">
              <v-icon color="white" size="24">mdi-chart-line</v-icon>
              <span>Controle total das finanças</span>
            </div>
            <div class="feature-item">
              <v-icon color="white" size="24">mdi-account-group</v-icon>
              <span>Gestão em grupo</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lado direito - Formulário -->
      <div class="form-section">
        <div class="form-container">
          <!-- Login Form -->
          <div v-if="!showSignupForm" class="auth-form">
            <h2 class="form-title">{{ $t('authentication.login.title') }}</h2>
            <p class="form-description">Acesse sua conta para continuar</p>
            
            <form @submit.prevent="userLogin">
              <div class="form-group">
                <label for="email">{{ $t('authentication.login.email_label') }}</label>
                <input 
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
                    :type="showPassword ? 'text' : 'password'" 
                    v-model="userData.password" 
                    :placeholder="$t('authentication.login.password_label')"
                    required 
                  />
                  <span class="toggle-password" @click="togglePasswordVisibility" :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                    <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </span>
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
                <span>ou</span>
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
                Ao fazer login, você concorda com nossos 
                <router-link to="/terms-of-use">Termos de Uso</router-link> e 
                <router-link to="/privacy-policy">Política de Privacidade</router-link>
              </p>
            </form>
          </div>

          <!-- Signup Form -->
          <div v-if="showSignupForm" class="auth-form">
            <h2 class="form-title">{{ $t('authentication.signup.title') }}</h2>
            <p class="form-description">Crie sua conta gratuita</p>
            
            <form @submit.prevent="userSignup">
              <div class="form-group">
                <label for="username">{{ $t('authentication.signup.username_label') }}</label>
                <input type="text" v-model="signupData.username" :placeholder="$t('authentication.signup.username_label')"
                  required />
              </div>
              
              <div class="form-group">
                <label for="email">{{ $t('authentication.signup.email_label') }}</label>
                <input type="email" v-model="signupData.email" :placeholder="$t('authentication.signup.email_label')"
                  required />
              </div>
              
              <div class="form-group password-field">
                <label for="password">{{ $t('authentication.signup.password_label') }}</label>
                <div class="password-input-wrapper">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    v-model="signupData.password"
                    :placeholder="$t('authentication.signup.password_label')" 
                    required 
                  />
                  <span class="toggle-password" @click="togglePasswordVisibility" :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                    <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </span>
                </div>
              </div>
              
              <div class="form-group password-field">
                <label for="confirmPassword">{{ $t('authentication.signup.confirm_password_label') }}</label>
                <div class="password-input-wrapper">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    v-model="signupData.confirmPassword"
                    :placeholder="$t('authentication.signup.confirm_password_label')" 
                    required 
                  />
                  <span class="toggle-password" @click="toggleConfirmPasswordVisibility" :title="showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'">
                    <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </span>
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
                Ao criar uma conta, você concorda com nossos 
                <router-link to="/terms-of-use">Termos de Uso</router-link> e 
                <router-link to="/privacy-policy">Política de Privacidade</router-link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
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
const authUrl = import.meta.env.VITE_AUTH_URL

onMounted(() => {
  console.log(route.query);
  if (route.query && route.query.signup === 'true') {
    toggleForm(true);
  }
});

const userLogin = async () => {
  try {
    isLoading.value = true
    const store = useUserStore()
    console.log('Store antes do login:', {
      methods: Object.keys(store),
      state: {
        token: store.token,
        refreshToken: store.refreshToken,
        auth: store.auth
      }
    })

    const res = await axios.post(`${authUrl}/auth/signin`, userData.value)
    if (res.data) {
      console.log('Login response:', res.data)
      // Primeiro, define o usuário
      store.$patch({
        user: {
          id: res.data.id,
          username: res.data.username,
          email: res.data.email
        }
      })
      // Depois, define os tokens
      store.$patch({
        token: res.data.token,
        refreshToken: res.data.refreshToken,
        auth: true
      })
      // Salva o estado
      store.saveState()
      console.log('Estado final do store:', {
        user: store.user,
        token: store.token,
        refreshToken: store.refreshToken,
        auth: store.auth
      })
      loginSuccess.value = 'Login realizado com sucesso!'
      setTimeout(() => {
        loginSuccess.value = null
        router.push('/dashboard')
      }, 800)
    }
  } catch (err) {
    console.error('Login error:', err)
    console.error('Store no momento do erro:', useUserStore())
    
    // Usar mensagem específica do backend se disponível
    let errorMessage = 'Credenciais inválidas. Tente novamente.'
    if (err.response && err.response.data) {
      if (typeof err.response.data === 'string') {
        errorMessage = err.response.data
      } else if (err.response.data.message) {
        errorMessage = err.response.data.message
      }
    }
    
    error.value = errorMessage
    setTimeout(() => {
      error.value = null
    }, 4000)
  } finally {
    isLoading.value = false
  }
}

const userSignup = async () => {
  if (signupData.value.password !== signupData.value.confirmPassword) {
    signupError.value = 'As senhas não coincidem. Tente novamente.';
    setTimeout(() => {
      signupError.value = null
    }, 4000)
    return;
  }
  try {
    isLoading.value = true
    const res = await axios.post(`${authUrl}/auth/signup`, {
      ...signupData.value,
      language: 'PT',
    });

    if (res.status === 201) {
      signupSuccess.value = 'Conta criada com sucesso! Você já pode fazer login.';
      setTimeout(() => {
        signupSuccess.value = null
        clearSignupForm();
        toggleForm(false);
      }, 3000)
    } else {
      signupError.value = 'Falha ao criar conta. Tente novamente.';
      setTimeout(() => {
        signupError.value = null
      }, 4000)
    }

  } catch (err) {
    console.error('Signup error:', err)
    signupError.value = 'Erro ao criar conta. Tente novamente.';
    setTimeout(() => {
      signupError.value = null
    }, 4000)
  } finally {
    isLoading.value = false
  }
};


const clearSignupForm = () => {
  signupData.value = { email: '', password: '', confirmPassword: '', username: '' }
}

const toggleForm = (isSignup) => {
  showSignupForm.value = isSignup
  if (isSignup) clearSignupForm()
}

const loginWithGoogle = () => {
  window.location.href = `${authUrl}/oauth2/authorization/google`
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

// Toggle de visibilidade da senha
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Validação de email em tempo real
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailValid.value = emailRegex.test(userData.value.email)
}

// Reset validação quando usuário começa a digitar
const resetEmailValidation = () => {
  emailValid.value = true
}

// Notificações: fechar manualmente ou sumir automaticamente
const closeNotification = (type) => {
  if (type === 'error') error.value = null
  if (type === 'success') loginSuccess.value = null
  if (type === 'signupError') signupError.value = null
  if (type === 'signupSuccess') signupSuccess.value = null
}
</script>

<style>
/* Estilo global (sem scoped) para forçar o background na página de login */
body:has(.login-page) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
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
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: transparent;
  position: relative;
  width: 100%;
}

/* Fade transition para snackbar */
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
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  font-size: 1rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.error-snackbar {
  background: #f2dede;
  color: #a94442;
  border: 1px solid #ebccd1;
}
.success-snackbar {
  background: #dff0d8;
  color: #3c763d;
  border: 1px solid #d6e9c6;
}
.close-btn {
  margin-left: 24px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
}

.login-wrapper {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-shadow: none;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
}

/* Hero Section - Lado Esquerdo */
.hero-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 500px;
}

.brand-logo {
  margin-bottom: 30px;
}

.logo-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 50px;
  opacity: 0.95;
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1.1rem;
}

.feature-item i {
  font-size: 1.5rem;
}

/* Form Section - Lado Direito */
.form-section {
  flex: 1;
  background-color: #ffffff;
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 450px;
}

.auth-form {
  width: 100%;
}

.form-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a1a1a;
  text-align: center;
}

.form-description {
  text-align: center;
  color: #666;
  opacity: 0.9;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

input[type='text'],
input[type='email'],
input[type='password'] {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  color: #1a1a1a;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  color: #666;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #333;
}

.toggle-password svg {
  display: block;
}

.invalid-email {
  border-color: #f44336 !important;
  background-color: #ffebee !important;
}

.error-message {
  color: #f44336;
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
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password-link a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
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
  color: #666;
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
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.oauth-button:hover {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.05);
}

.oauth-button img {
  width: 20px;
  height: 20px;
}

.switch-form {
  text-align: center;
  margin-top: 32px;
  color: #666;
  opacity: 0.9;
}

.switch-form a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.switch-form a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.terms-links {
  text-align: center;
  margin-top: 24px;
  font-size: 0.85rem;
  color: #999;
  line-height: 1.5;
}

.terms-links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.terms-links a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 1024px) {
  .login-wrapper {
    flex-direction: column;
    margin: 20px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .hero-section {
    padding: 40px 30px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .form-section {
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  body:has(.login-page) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  }

  .app-container {
    padding: 20px;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-wrapper {
    margin: 0;
    width: 100%;
    max-width: 500px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    background: white;
  }

  .hero-section {
    display: none;
  }
  
  .form-section {
    padding: 40px 24px;
    border-radius: 16px;
  }

  .form-container {
    max-width: 100%;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .logo-image {
    width: 80px;
    height: 80px;
  }

  /* Adicionar pequeno header com logo no mobile */
  .auth-form::before {
    content: '';
    display: block;
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    background-image: url('/logo.jpg');
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    border: 3px solid rgba(102, 126, 234, 0.2);
  }
}

@media (max-width: 480px) {
  .app-container {
    padding: 12px;
  }

  .form-section {
    padding: 32px 20px;
  }

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
</style>
