<template>
  <div class="cookie-policy-container">
    <h1>Política de Cookies</h1>
    <div class="cookie-summary">
      <p>
        O CoBudget utiliza cookies e tecnologias equivalentes para autenticação de sessão, segurança da conta,
        continuidade do workspace e preferências operacionais do usuário.
      </p>
      <p>
        Esses mecanismos ajudam a manter o acesso autenticado, a renovar sessões com segurança e a preservar escolhas
        como idioma, contexto de workspace e fluxos legais relacionados a consentimento e privacidade.
      </p>
    </div>
    <p>
      Este site utiliza cookies para melhorar a sua experiência. Para saber mais sobre como utilizamos cookies,
      você pode ler nossa
      <a href="https://www.iubenda.com/privacy-policy/82185492/cookie-policy"
        class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe" title="Política de Cookies">
        Política de Cookies
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
  name: 'CookiePolicy',
  setup() {
    onMounted(loadIubendaEmbed)
  }
}
</script>

<style scoped>
.cookie-policy-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

.cookie-policy-container h1 {
  margin-bottom: 20px;
}

.cookie-policy-container p {
  line-height: 1.6;
}

.cookie-summary {
  margin: 0 auto 24px;
  max-width: 860px;
  text-align: left;
  display: grid;
  gap: 12px;
}
</style>
