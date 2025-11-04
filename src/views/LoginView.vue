<template>
  <div class="app-container">
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
    <div class="container">
      <div v-if="!showSignupForm">
        <form @submit.prevent="userLogin">
          <h2>{{ $t('authentication.login.title') }}</h2>
          <div class="imgcontainer">
            <img src="https://cdn.icon-icons.com/icons2/2468/PNG/512/user_kids_avatar_user_profile_icon_149314.png"
              alt="Avatar" class="avatar" />
          </div>
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
          <div class="button-container">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>{{ $t('authentication.login.login_button') }}</span>
            </button>
            <div class="oauth-buttons">
              <button class="oauth-button" @click.prevent="loginWithGoogle">
                <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" />
                {{ $t('authentication.login.google_login') }}
              </button>
            </div>
          </div>
          <p class="forgot-password-link">
            <a href="#" @click.prevent="goToForgotPassword">{{ $t('authentication.login.forgot_password') }}</a>
          </p>
          <p>
            {{ $t('authentication.login.not_registered') }} <a href="#" @click.prevent="toggleForm(true)">{{
              $t('authentication.login.create_account_link') }}</a>
          </p>
        </form>
      </div>

      <div v-if="showSignupForm">
        <form @submit.prevent="userSignup">
          <h2>{{ $t('authentication.signup.title') }}</h2>
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
          <div class="button-container">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>{{ $t('authentication.signup.signup_button') }}</span>
            </button>
          </div>
          <p>
            {{ $t('authentication.signup.already_registered') }} <a href="#" @click.prevent="toggleForm(false)">{{
              $t('authentication.signup.login_here_link') }}</a>
          </p>
        </form>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import PaymentService from '@/services/PaymentService'
import Footer from '../components/Footer.vue'

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
      }, 1500)
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

const loginWithGitHub = () => {
  window.location.href = `${authUrl}/oauth2/authorization/github`
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

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password-link {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
}

.forgot-password-link a {
  font-size: 0.9em;
  color: #4caf50;
  text-decoration: underline;
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
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  cursor: pointer;
  user-select: none;
  color: #666;
  top: 50%;
  transform: translateY(-50%);
  padding: 5px;
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
  margin-top: 5px;
  display: block;
}

.container {
  flex: 1;
  max-width: 450px;
  padding: 20px;
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-surface-variant));
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: auto;
  color: rgb(var(--v-theme-on-surface));
}

h2 {
  text-align: center;
}

.imgcontainer {
  text-align: center;
  margin: 20px 0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

a {
  text-decoration: underline;
  color: rgb(var(--v-theme-primary));
}

label {
  display: block;
  margin-bottom: 10px;
  color: rgb(var(--v-theme-on-surface));
}

input[type='text'],
input[type='email'],
input[type='password'] {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid rgb(var(--v-theme-surface-variant));
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

button[type='submit'] {
  background-color: #4caf50;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button[type='submit']:hover {
  background-color: #3e8e41;
}

.oauth-buttons {
  margin-top: 20px;
}

.oauth-button {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-surface-variant));
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  color: rgb(var(--v-theme-on-surface));
}

.oauth-button img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.error {
  color: red;
  margin-bottom: 20px;
  background-color: #f2dede;
  padding: 10px;
}

.success {
  color: green;
  margin-bottom: 20px;
  background-color: #dff0d8;
  padding: 10px;
}
</style>
