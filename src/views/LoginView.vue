<template>
    <div>
        <div v-if="!showSignupForm">
            <form @submit.prevent="userLogin">
                <h2>Login Page</h2>
                <div class="imgcontainer">
                    <img src="https://cdn.icon-icons.com/icons2/2468/PNG/512/user_kids_avatar_user_profile_icon_149314.png"
                        alt="Avatar" class="avatar" />
                </div>

                <div class="container">
                    <label for="email">Email</label>
                    <input type="email" v-model="userData.email" placeholder="abc@gmail.com" required />

                    <label for="passcode">Password</label>
                    <input type="password" v-model="userData.password" placeholder="please enter your password"
                        required />

                    <button type="submit">Login</button>
                </div>
                <div v-if="error" class="error">{{ error }}</div>
                <div class="oauth-buttons">
                    <button @click.prevent="loginWithGoogle">Login with Google</button>
                    <button @click.prevent="loginWithGitHub">Login with GitHub</button>
                </div>
                <p>Not registered yet? <a href="#" @click.prevent="toggleForm(true)">Create an account</a>.</p>
            </form>
        </div>

        <div v-if="showSignupForm">
            <form @submit.prevent="userSignup">
                <h2>Signup Page</h2>
                <div class="container">
                    <label for="username">Username</label>
                    <input type="text" v-model="signupData.username" placeholder="Enter your username" required />

                    <label for="email">Email</label>
                    <input type="email" v-model="signupData.email" placeholder="abc@gmail.com" required />

                    <label for="password">Password</label>
                    <input type="password" v-model="signupData.password" placeholder="please enter your password"
                        required />

                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" v-model="signupData.confirmPassword"
                        placeholder="please confirm your password" required />

                    <button type="submit">Signup</button>
                </div>
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
const baseUrl = import.meta.env.VITE_AUTH_URL;

const userLogin = async () => {
    try {
        const res = await axios.post(`${baseUrl}/auth/signin`, userData.value)

        console.log(res)
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
        router.push('/')
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
        const res = await axios.post(`${baseUrl}/auth/signup`, {
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
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
}

const loginWithGitHub = () => {
    window.location.href = `${baseUrl}/oauth2/authorization/github`;
}

const toggleForm = (isSignup) => {
    showSignupForm.value = isSignup;
}

</script>

<style scoped>
body {
    font-family: Arial, Helvetica, sans-serif;
}

form {
    border: 3px solid #fff;
    margin-bottom: 20px;
}

h2 {
    text-align: center;
}

input[type="email"],
input[type="password"],
input[type="text"] {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 2px solid #ccc;
    box-sizing: border-box;
}

button {
    background-color: #1d71be;
    color: white;
    padding: 14px 20px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    width: 100%;
}

button:hover {
    opacity: 0.8;
}

.imgcontainer {
    text-align: center;
}

img.avatar {
    width: 10%;
    border-radius: 50%;
}

.container {
    padding: 50px;
}

.error {
    color: red;
    text-align: center;
}

.success {
    color: green;
    text-align: center;
}

.oauth-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
}

@media screen and (max-width: 300px) {
    span.psw {
        display: block;
        float: none;
    }

    .cancelbtn {
        width: 100%;
    }
}
</style>
