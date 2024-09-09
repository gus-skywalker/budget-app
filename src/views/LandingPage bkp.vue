<template>
  <v-container>
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <img src="/logo.jpg" alt="Logo" />
      </div>
      <nav class="nav">
        <ul>
          <li><a href="#">Sobre</a></li>
          <li><a href="#contact">Contato</a></li>
        </ul>
      </nav>
      <button class="btn btn-primary login-btn" @click.prevent="$router.push({ name: 'login' })">
        Login
      </button>
    </header>

    <!-- Seção 1: Planejamento Financeiro -->
    <section class="section orange">
      <div class="section-content">
        <h2>Planejamento Financeiro</h2>
        <p>Nossa aplicação financeira ajuda você a planejar seu futuro financeiro com confiança.</p>
        <p>
          Com nossa ferramenta, você pode criar um plano personalizado para alcançar seus objetivos
          financeiros.
        </p>
      </div>
      <div class="section-image">
        <img src="/planejamento_financeiro.jpg" alt="Planejamento Financeiro" />
      </div>
    </section>

    <!-- Seção 2: Controle e Gestão -->
    <section class="section red">
      <div class="section-image">
        <img src="/controle_gestao.jpg" alt="Controle e Gestão" />
      </div>
      <div class="section-content">
        <h2>Controle e Gestão</h2>
        <p>
          Nossa aplicação financeira oferece recursos avançados de controle e gestão para ajudá-lo a
          gerenciar suas finanças de forma eficaz.
        </p>
        <p>Você pode acompanhar suas despesas, receitas e investimentos em um só lugar.</p>
      </div>
    </section>

    <!-- Seção 3: Segurança e Proteção -->
    <section class="section purple">
      <div class="section-content">
        <h2>Segurança e Proteção</h2>
        <p>Nossa aplicação financeira é projetada com segurança em mente.</p>
        <p>
          Nós usamos tecnologias de ponta para proteger suas informações financeiras e garantir que
          seus dados sejam seguros.
        </p>
      </div>
      <div class="section-image">
        <img src="/seguranca.jpg" alt="Segurança e Proteção" />
      </div>
    </section>

    <!-- Seção 4: Vantagens -->
    <section class="section orange">
      <div class="section-image">
        <img src="/vantagens.jpg" alt="Vantagens" />
      </div>
      <div class="section-content">
        <h2>Vantagens</h2>
        <p>
          Nossa aplicação financeira oferece uma série de vantagens, incluindo relatórios
          personalizados, alertas de gastos e recomendações de investimento.
        </p>
        <p>Você pode aproveitar ao máximo suas finanças com nossa ferramenta.</p>
      </div>
    </section>

    <!-- Seção 5: Suporte e Ajuda -->
    <section id="contact" class="section red">
      <div class="section-content">
        <h2>Suporte e Ajuda</h2>
        <p>
          Nossa equipe de suporte está sempre pronta para ajudá-lo com qualquer dúvida ou problema
          que você possa ter.
        </p>
        <p>Você pode contar conosco para obter ajuda em qualquer momento.</p>
      </div>
      <div class="section-image">
        <img src="/suporte.jpg" alt="Suporte e Ajuda" />
      </div>
    </section>
  </v-container>
</template>

<style>
/* Cores */
:root {
  --orange: #ffa07a;
  --yellow: #f7dc6f;
  --purple: #7a288a;
  --dark-purple: #5c3c8a;
}

/* Header */
.header {
  background-color: var(--orange);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* .logo {
  margin-right: 20px;
}

.logo img {
  width: 50px;
  height: 50px;
} */

.logo {
  position: absolute;
  top: 10px;
  left: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
}

.nav li {
  margin-right: 20px;
}

.nav a {
  color: #fff;
  text-decoration: none;
}

.nav a:hover {
  color: var(--yellow);
}

.login-btn {
  background-color: #ffc107; /* laranja */
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.login-btn:hover {
  background-color: #ffa07a; /* laranja escuro */
}

/* Seções */
.section {
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section.orange {
  background-color: var(--orange);
}

.section.red {
  background-color: var(--yellow);
}

.section.purple {
  background-color: var(--purple);
}

.section-content {
  width: 50%;
}

.section-image {
  width: 50%;
}

.section-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

h2 {
  color: var(--purple);
  font-size: 24px;
  margin-bottom: 10px;
}

p {
  color: #333;
  font-size: 16px;
  margin-bottom: 20px;
}
</style>
