<template>
     <!-- Header -->
     <header class="header">
      <img src="/logo.jpg" alt="Logo" class="logo">
      <h1>Finance Hub by Les Monades</h1>
    </header>
 <div class="container">

    <!-- Seção 1: Planejamento Financeiro -->
    <section class="section">
      <div class="section-image">
        <img src="/planejamento_financeiro.jpg" alt="Planejamento Financeiro">
      </div>
      <div class="section-content">
        <h2>Planejamento Financeiro</h2>
        <p>Nossa aplicação financeira ajuda você a planejar seu futuro financeiro com confiança.</p>
        <p>Com nossa ferramenta, você pode criar um plano personalizado para alcançar seus objetivos financeiros.</p>
      </div>
    </section>

    <!-- Seção 2: Controle e Gestão -->
    <section class="section">
      <div class="section-image">
        <img src="/controle_gestao.jpg" alt="Controle e Gestão">
      </div>
      <div class="section-content">
        <h2>Controle e Gestão</h2>
        <p>Nossa aplicação financeira oferece recursos avançados de controle e gestão para ajudá-lo a gerenciar suas finanças de forma eficaz.</p>
        <p>Você pode acompanhar suas despesas, receitas e investimentos em um só lugar.</p>
      </div>
    </section>

    <!-- Seção 3: Segurança e Proteção -->
    <section class="section">
      <div class="section-image">
        <img src="/seguranca.jpg" alt="Segurança e Proteção">
      </div>
      <div class="section-content">
        <h2>Segurança e Proteção</h2>
        <p>Nossa aplicação financeira é projetada com segurança em mente.</p>
        <p>Nós usamos tecnologias de ponta para proteger suas informações financeiras e garantir que seus dados sejam seguros.</p>
      </div>
    </section>

    <!-- Seção 4: Vantagens -->
    <section class="section">
      <div class="section-image">
        <img src="/vantagens.jpg" alt="Vantagens">
      </div>
      <div class="section-content">
        <h2>Vantagens</h2>
        <p>Nossa aplicação financeira oferece uma série de vantagens, incluindo relatórios personalizados, alertas de gastos e recomendações de investimento.</p>
        <p>Você pode aproveitar ao máximo suas finanças com nossa ferramenta.</p>
      </div>
    </section>

    <!-- Seção 5: Suporte e Ajuda -->
    <section class="section">
      <div class="section-image">
        <img src="/suporte.jpg" alt="Suporte e Ajuda">
      </div>
      <div class="section-content">
        <h2>Suporte e Ajuda</h2>
        <p>Nossa equipe de suporte está sempre pronta para ajudá-lo com qualquer dúvida ou problema que você possa ter.</p>
        <p>Você pode contar conosco para obter ajuda em qualquer momento.</p>
      </div>
    </section>
  </div>
</template>

<style>
.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

.header {
  background-color: #f0f0f0; /* cor de fundo do header */
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.logo {
  width: 130px; 
  height: 130px;
  margin-right: 10px;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.section-image {
  flex-basis: 40%;
  margin: 20px;
}

.section-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.section-content {
  flex-basis: 60%;
  margin: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: justify;
}



.section-content h2 {
  margin-top: 0;
}

.section-content p {
  margin-bottom: 20px;
}
</style>