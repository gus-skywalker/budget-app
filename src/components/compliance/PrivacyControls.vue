<template>
    <div>
        <!-- Seu conteúdo aqui -->
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    window._iub = window._iub || {};
    window._iub.csConfiguration = {
        siteId: 3765662,
        cookiePolicyId: 82185492,
        lang: 'pt-BR'
    };

    const script1 = document.createElement('script');
    script1.src = 'https://cs.iubenda.com/autoblocking/3765662.js';
    script1.onerror = () => {
        console.error('Erro ao carregar o script de autoblocking');
    };
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://cdn.iubenda.com/cookie_solution/iubenda_cs/1.66.1/core-pt-BR.js';
    script2.charset = 'UTF-8';
    script2.async = true;
    script2.onerror = () => {
        console.error('Erro ao carregar o script do Iubenda');
    };
    document.head.appendChild(script2);
});

</script>

<style scoped>
/* Adicione estilos conforme necessário */
</style>
