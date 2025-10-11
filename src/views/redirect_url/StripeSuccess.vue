<template>
  <v-container>
    <h2>Pagamento realizado com sucesso!</h2>
    <p>Obrigado por se inscrever. Seus dados de pagamento foram processados com sucesso.</p>
    <p>Assinatura ID: {{ sessionId }}</p>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      sessionId: ''
    }
  },
  mounted() {
    // Extrair o session_id da URL de sucesso
    this.sessionId = new URLSearchParams(window.location.search).get('session_id')
  }
}
</script>
