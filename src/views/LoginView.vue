<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'

const store = useStore()
const router = useRouter()
const userData = ref({ email: '', password: '' })
const error = ref(null)

const userLogin = async () => {
    try {
        const res = await axios.post('http://localhost:9000/auth/signin', userData.value)
        console.log(res);
        store.commit('SET_AUTH', true)
        store.commit('SET_TOKEN', res.data.token)
        store.commit('SET_USER', res.data.username)
        router.push('/')
    } catch (err) {
        error.value = 'Invalid credentials. Please try again.'
    }
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