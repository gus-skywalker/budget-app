<template>
    <div class="privacy-policy-container">
        <h1>Política de Privacidade</h1>
        <p>
            Sua privacidade é importante para nós. Para saber mais sobre como protegemos suas informações, você pode ler
            nossa
            <a href="https://www.iubenda.com/privacy-policy/82185492"
                class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe" title="Política de Privacidade">
                Política de Privacidade
            </a>.
        </p>
    </div>
</template>

<script lang="js">
import { onMounted } from 'vue'

const IUBENDA_SCRIPT_ID = 'iubenda-embed-script'

function loadIubendaEmbed() {
    if (document.getElementById(IUBENDA_SCRIPT_ID)) {
        if (window.iubenda?.embed) {
            window.iubenda.embed()
        }
        return
    }

    const script = document.createElement('script')
    script.id = IUBENDA_SCRIPT_ID
    script.src = 'https://cdn.iubenda.com/iubenda.js'
    script.async = true
    document.head.appendChild(script)
}

export default {
    name: 'PrivacyPolicy',
    setup() {
        onMounted(loadIubendaEmbed)
    }
}
</script>

<style scoped>
.privacy-policy-container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    text-align: center;
}

.privacy-policy-container h1 {
    margin-bottom: 20px;
}

.privacy-policy-container p {
    line-height: 1.6;
}
</style>
