<template>
    <footer class="app-footer">
        <div class="footer-content">
            <p>{{ t('footer.copyright') }}</p>
            <div class="footer-links">
                <a @click.prevent="$router.push('/privacy-policy')">{{ t('footer.privacy_policy') }}</a>
                <a @click.prevent="$router.push('/terms-of-use')">{{ t('footer.terms_of_use') }}</a>
                <a @click.prevent="$router.push('/cookie-policy')">{{ t('footer.cookie_policy') }}</a>
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
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'AppFooter' });

const { t } = useI18n();

const availableLanguages = [
    { text: 'English', value: 'en' },
    { text: 'Português', value: 'pt' },
];
</script>

<style scoped>
.app-footer {
    background-color: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    padding: 20px;
    text-align: center;
    border-top: 1px solid rgb(var(--v-theme-surface-variant));
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
    color: rgb(var(--v-theme-primary));
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