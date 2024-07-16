<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'
import axios from 'axios'

const userStore = useUserStore();  // Use a store de Pinia
const router = useRouter()
const userData = ref({ email: '', password: '' })
const error = ref(null)
const baseUrl = 'https://web-production-c952.up.railway.app';
const localBaseUrl = 'http://localhost:9000';

const userLogin = async () => {
    try {
        const res = await axios.post(`${localBaseUrl}/auth/signin`, userData.value)

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
const loginWithGoogle = async () => {
    // window.location.href = `${localBaseUrl}/oauth2/authorization/google`;
    window.location.href = `${localBaseUrl}/oauth2/authorization/google`;
}

const loginWithGitHub = () => {
    window.location.href = `${localBaseUrl}/oauth2/authorization/github`;
}

</script>

<template>
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
            <input type="password" v-model="userData.password" placeholder="please enter your password" required />

            <button type="submit">Login</button>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
        <div class="oauth-buttons">
            <button @click.prevent="loginWithGoogle">Login with Google</button>
            <button @click.prevent="loginWithGitHub">Login with GitHub</button>
        </div>
    </form>
</template>

<style scoped>
body {
    font-family: Arial, Helvetica, sans-serif;
}

form {
    border: 3px solid #fff;
}

h2 {
    text-align: center;
}

input[type="email"],
input[type="password"] {
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

/* .oauth-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
} */

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