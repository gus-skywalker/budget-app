<template>
    <div class="container">
      <div v-if="!showSignupForm">
        <form @submit.prevent="userLogin">
          <h2>Login</h2>
          <div class="imgcontainer">
            <img src="https://cdn.icon-icons.com/icons2/2468/PNG/512/user_kids_avatar_user_profile_icon_149314.png" alt="Avatar" class="avatar" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" v-model="userData.email" placeholder="user@email.com" required />
          </div>
          <div class="form-group">
            <label for="passcode">Password</label>
            <input type="password" v-model="userData.password" placeholder="Please enter your password" required />
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
          <div v-if="error" class="error">{{ error }}</div>
          <div class="oauth-buttons">
            <button class="oauth-button" @click.prevent="loginWithGoogle">
              <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" width="20" height="20" />
              Login with Google
            </button>
            <button class="oauth-button" @click.prevent="loginWithGitHub">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111432.png" alt="GitHub" width="20" height="20" />
              Login with GitHub
            </button>
          </div>
          <p>Not registered yet? <a href="#" @click.prevent="toggleForm(true)">Create an account</a>.</p>
        </form>
      </div>
  
      <div v-if="showSignupForm">
        <form @submit.prevent="userSignup">
          <h2>Signup</h2>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" v-model="signupData.username" placeholder="Enter your username" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" v-model="signupData.email" placeholder="user@email.com" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" v-model="signupData.password" placeholder="Please enter your password" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" v-model="signupData.confirmPassword" placeholder="Please confirm your password" required />
          </div>
          <button type="submit" class="btn btn-primary">Signup</button>
          <div v-if="signupError" class="error">{{ signupError }}</div>
          <div v-if="signupSuccess" class="success">{{ signupSuccess }}</div>
          <p>Already have an account? <a href="#" @click.prevent="toggleForm(false)">Login here</a>.</p>
        </form>
      </div>
    </div>
  </template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'
import axios from 'axios'

const userStore = useUserStore();  // Use a store de Pinia
const router = useRouter()
const userData = ref({ email: '', password: '' })
const signupData = ref({ email: '', password: '', confirmPassword: '', username: '' })
const error = ref(null)
const signupError = ref(null)
const signupSuccess = ref(null)
const showSignupForm = ref(false);
const authUrl = import.meta.env.VITE_AUTH_URL;

const userLogin = async () => {
    try {
        const res = await axios.post(`${authUrl}/auth/signin`, userData.value)
        userStore.setAuth(true);
        userStore.setToken(res.data.token);
        userStore.setUser({
            username: res.data.username,
            email: res.data.email,
            id: res.data.id,
            language: res.data.language,
            userRole: res.data.userRole,
            createdAt: res.data.createdAt,
        });
        router.push('/dashboard')
    } catch (err) {
        error.value = 'Invalid credentials. Please try again.'
    }
}

const userSignup = async () => {
    if (signupData.value.password !== signupData.value.confirmPassword) {
        signupError.value = 'Passwords do not match. Please try again.';
        return;
    }
    try {
        const res = await axios.post(`${authUrl}/auth/signup`, {
            email: signupData.value.email,
            password: signupData.value.password,
            username: signupData.value.username,
            language: 'PT'
        })

        if (res.status === 201) {
            signupSuccess.value = 'Account created successfully.';
        }

    } catch (err) {
        signupError.value = 'Error creating account. Please try again.'
    }
}

const loginWithGoogle = async () => {
    window.location.href = `${authUrl}/oauth2/authorization/google`;
}

const loginWithGitHub = () => {
    window.location.href = `${authUrl}/oauth2/authorization/github`;
}

const toggleForm = (isSignup) => {
    showSignupForm.value = isSignup;
}

</script>

<style scoped>
form {
  text-align: center;
}

.container {
  max-width: 300px;
  margin: 0 auto; /* Adicionado para centralizar horizontalmente */
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center; /* Adicionado para centralizar horizontalmente */
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
  margin-bottom: 10px; /* Adicionado para adicionar espaçamento entre os campos */
}

a {
  text-decoration: underline;
  color: blue; /* Adicionado para estilo do link */
}

label {
  display: block;
  margin-bottom: 10px;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
}

button[type="submit"] {
  background-color: #4CAF50;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #3e8e41;
}

.oauth-buttons {
  margin-top: 20px;
}

.oauth-button {
  background-color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.oauth-button img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.error {
  color: red;
  margin-bottom: 20px;
  background-color: #f2dede; /* Adicionado para estilo do erro */
  padding: 10px;
}

.success {
  color: green;
  margin-bottom: 20px;
  background-color: #f2dede; /* Adicionado para estilo do sucesso */
  padding: 10px;
}
</style>
