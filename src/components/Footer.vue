<template>
    <footer class="app-footer">
        <div class="footer-content">
            <p>&copy; 2024 Wallet Connect. Todos os direitos reservados. Powered by Les Monades</p>
            <div class="footer-links">
                <a @click.prevent="$router.push('/privacy-policy')">Política de Privacidade</a>
                <a @click.prevent="$router.push('/terms-of-use')">Termos de Uso</a>
                <a @click.prevent="$router.push('/cookie-policy')">Política de Cookies</a>
            </div>
            <v-list class="horizontal-list">
                <v-list-item v-for="lang in availableLanguages" :key="lang.value" @click="$i18n.locale = lang.value"
                    class="horizontal-list-item">
                    {{ lang.text }}
                </v-list-item>
            </v-list>


        </div>
    </footer>
</template>

<script setup>
// Nenhuma lógica adicional é necessária para o footer
const availableLanguages = [
    { text: 'English', value: 'en' },
    { text: 'Português', value: 'pt' },
];
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
    cursor: pointer;
}

.footer-links a:hover {
    text-decoration: underline;
}

.horizontal-list {
    display: flex;
    flex-direction: row;
    /* Alinha os itens na horizontal */
    gap: 10px;
    /* Espaçamento entre os itens */
    padding: 0;
}

.horizontal-list-item {
    display: inline-flex;
    /* Garante que o item siga o fluxo horizontal */
    align-items: center;
    cursor: pointer;
    padding: 0 10px;
    /* Opcional: Ajuste o espaçamento interno */
}
</style>