<template>
  <v-container id="color-setup">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <img src="/logo.jpg" alt="Logo" />
      </div>
      <nav class="nav">
        <div class="menu-toggle" @click="toggleMenu">
          <span class="menu-icon"></span>
          <span class="menu-icon"></span>
          <span class="menu-icon"></span>
        </div>
        <ul :class="{ 'active': isMenuOpen }">
          <li><a href="#">Sobre</a></li>
          <li><a href="#benefits">Benefícios</a></li>
          <li><a href="#testimonials">Depoimentos</a></li>
          <li><a href="#security">Segurança</a></li>
          <li><a href="#contact">Contato</a></li>
        </ul>
      </nav>
      <div class="auth-buttons">
        <button class="btn btn-primary login-btn" @click.prevent="$router.push({ name: 'login' })">
          Login
        </button>
        <button class="btn btn-secondary signup-btn" @click.prevent="$router.push({ name: 'signup' })">
          Assine Agora
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Tome o Controle do Seu Futuro Financeiro</h1>
        <p>
          Planeje, gerencie e cresça suas finanças com nossa carteira de fintechs personalizada.
        </p>
        <button class="btn btn-primary cta-btn" @click.prevent="$router.push({ name: 'signup' })">
          Experimente Gratuitamente
        </button>
      </div>
      <div class="hero-image">
        <img src="/hero_image.jpg" alt="Planejamento Financeiro" />
      </div>
    </section>

    <!-- Benefícios -->
    <section id="benefits" class="section benefits-section">
      <h2>Por Que Escolher Nossa Ferramenta</h2>
      <div class="benefits-container">
        <div class="benefit-item">
          <img src="/monitoring.jpg" alt="Planejamento" />
          <h3>Planejamento Personalizado</h3>
          <p>Crie planos financeiros sob medida para atingir seus objetivos.</p>
        </div>
        <div class="benefit-item">
          <img src="/support.jpg" alt="Controle" />
          <h3>Controle Total</h3>
          <p>Monitore suas despesas, receitas e investimentos em uma plataforma intuitiva.</p>
        </div>
        <div class="benefit-item">
          <img src="/security.jpg" alt="Segurança" />
          <h3>Segurança de Dados</h3>
          <p>Seus dados estão protegidos com as mais avançadas tecnologias de segurança.</p>
        </div>
        <div class="benefit-item">
          <img src="/growth.jpg" alt="Crescimento" />
          <h3>Crescimento Financeiro</h3>
          <p>Receba recomendações de investimento para maximizar seu retorno.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#">Sobre</a>
          <a href="#benefits">Benefícios</a>
          <a href="#testimonials">Depoimentos</a>
          <a href="#security">Segurança</a>
          <a href="#contact">Contato</a>
        </div>
        <div class="footer-cta">
          <button class="btn btn-primary cta-btn" @click.prevent="$router.push({ name: 'signup' })">
            Inscreva-se Agora!
          </button>
        </div>
        <div class="footer-info">
          <p>&copy; 2024 Sua Fintech. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  </v-container>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      isMenuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
};
</script>

<style scoped>
/* Configuração de cores */
#color-setup {
  --orange: #f39c12;
  --dark-orange: #e67e22;
  --yellow: #f1c40f;
  --purple: #8e44ad;
  --dark-purple: #5b2c6f;
  --white: #ffffff;
  --light-gray: #f8f9f9;
  --dark-gray: #2c3e50;
}

/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', sans-serif;
  overflow-x: hidden;
  /* Evita o vazamento lateral */
}

.header {
  background-color: var(--light-gray);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 80px;
  /* Ajuste a altura conforme necessário */
}

.section {
  scroll-margin-top: 80px;
  /* Garante que o espaço seja respeitado ao rolar */
}

.menu-toggle {
  display: none;
  cursor: pointer;
  flex-direction: column;
  gap: 5px;
}

.menu-icon {
  width: 25px;
  height: 3px;
  background-color: var(--dark-gray);
  border-radius: 5px;
}

/* Para garantir que a largura total do body não exceda a largura da tela */
body {
  overflow-x: hidden;
}

/* Ajuste a largura do logo e navegação conforme necessário */
.logo img {
  width: 100px;
  height: 100px;
}

.nav ul {
  list-style: none;
  display: flex;
  gap: 15px;
  transition: transform 0.3s ease;
}

.nav ul {
  display: none;
  position: absolute;
  top: 80px;
  right: 0;
  background-color: var(--light-gray);
  padding: 20px;
  flex-direction: column;
  width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav ul.active {
  display: flex;
}

.nav a {
  color: var(--dark-gray);
  text-decoration: none;
  font-weight: 500;
  padding: 5px 10px;
}

.nav a:hover {
  color: var(--yellow);
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.login-btn {
  background-color: var(--yellow);
  color: var(--dark-gray);
  padding: 8px 16px;
  border-radius: 5px;
}

.signup-btn {
  background-color: var(--purple);
  color: var(--white);
  padding: 8px 16px;
  border-radius: 5px;
}

.cta-btn {
  background-color: var(--orange);
  color: var(--white);
  padding: 12px 24px;
  border-radius: 5px;
}


/* Hero Section */
.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80px 40px;
  background-color: var(--light-gray);
}

.hero-content {
  width: 50%;
}

.hero-content h1 {
  font-size: 48px;
  color: var(--dark-gray);
}

.hero-content p {
  margin-top: 20px;
  font-size: 18px;
  color: var(--dark-gray);
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

/* Benefícios */
.benefits-section {
  background-color: var(--white);
  padding: 60px 40px;
  text-align: center;
}

.benefits-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.benefit-item {
  width: 22%;
  background-color: var(--light-gray);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.benefit-item img {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.benefit-item h3 {
  margin-bottom: 10px;
  font-size: 20px;
  color: var(--dark-gray);
}

.benefit-item p {
  color: var(--dark-gray);
}

/* Footer */
.footer {
  background-color: var(--dark-gray);
  padding: 40px;
  color: var(--white);
}

.footer-links a {
  color: var(--white);
  margin-right: 20px;
  text-decoration: none;
}

.footer-cta {
  margin-top: 20px;
}

.footer-info {
  margin-top: 20px;
  text-align: center;
}

/* Botões com hover */
.btn:hover {
  filter: brightness(1.1);
  transition: 0.3s ease;
}

/* Responsividade */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .menu-toggle {
    display: flex;
  }

  .nav ul {
    display: none;
  }

  .nav ul.active {
    display: flex;
  }

  .nav a {
    padding: 10px 0;
    text-align: center;
    display: block;
  }

  .auth-buttons {
    flex-direction: column;
    gap: 5px;
  }

  .login-btn,
  .signup-btn {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
