<template>
    <div>
        Redirecting...
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '@/plugins/userStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const extractTokenFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const email = urlParams.get('email')
    console.log(urlParams);

    if (token && email) {
        console.log('Passou com sucesso pelo token')
        userStore.setAuth(true);
        userStore.setToken(token);
        userStore.setUser({ email: email });
        router.push('/');
    } else {
        console.log('Falhamos em autenticar')
        router.push('/login')
    }
}

onMounted(() => {
    extractTokenFromUrl()
})
</script>