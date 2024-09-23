<template>
    <footer class="app-footer">
        <div class="footer-content">
            <p>&copy; 2024 YourAppName. Todos os direitos reservados.</p>
            <div class="footer-links">
                <a @click.prevent="$router.push('/privacy-policy')">Política de Privacidade</a>
                <a @click.prevent="$router.push('/terms-of-use')">Termos de Uso</a>
                <a @click.prevent="$router.push('/cookie-policy')">Política de Cookies</a>
            </div>
        </div>
    </footer>
</template>

<script setup>
// Nenhuma lógica adicional é necessária para o footer
</script>

<style scoped>
.app-footer {
    background-color: #f9f9f9;
    padding: 20px;
    text-align: center;
    border-top: 1px solid #ccc;
    position: relative;
    width: 100%;
    bottom: 0;
}

.footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.footer-links {
    margin-top: 10px;
}

.footer-links a {
    margin: 0 10px;
    color: blue;
    text-decoration: none;
}

.footer-links a:hover {
    text-decoration: underline;
}
</style>