<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <v-container id="color-setup">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <img src="/logo.jpg" alt="Logo" />
      </div>
      <nav class="nav">
        <div class="menu-toggle" aria-label="Fazer login" @click="toggleMenu">
          <span class=" menu-icon"></span>
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
        <button class="btn btn-primary login-btn" aria-label="Fazer login"
          @click.prevent="$router.push({ name: 'login' })">
          Login
        </button>
        <button class="btn btn-secondary signup-btn" aria-label="Fazer login"
          @click.prevent="$router.push({ name: 'signup' })">
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

    <!-- Testemunhos -->
    <section id="testimonials" class="section testimonials-section">
      <h2>O Que Nossos Clientes Dizem</h2>
      <div class="testimonials-container">
        <div class="testimonial-item">
          <!-- <img src="/customer1.jpg" alt="Cliente 1" /> -->
          <p>"Excelente ferramenta! Meu controle financeiro nunca foi tão fácil e eficiente."</p>
          <h4>Maria Silva</h4>
        </div>
        <div class="testimonial-item">
          <!-- <img src="/customer2.jpg" alt="Cliente 2" /> -->
          <p>"A interface é intuitiva e as recomendações de investimento são ótimas."</p>
          <h4>João Santos</h4>
        </div>
        <div class="testimonial-item">
          <!-- <img src="/customer3.jpg" alt="Cliente 3" /> -->
          <p>"Segurança e suporte de primeira linha. Recomendo a todos!"</p>
          <h4>Ana Oliveira</h4>
        </div>
      </div>
    </section>

    <!-- Segurança -->
    <section id="security" class="section security-section">
      <h2>Segurança de Dados</h2>
      <div class="security-content">
        <p>Na nossa plataforma, a segurança dos seus dados é nossa prioridade. Utilizamos criptografia de ponta a ponta
          e proteções avançadas para garantir que suas informações financeiras estejam sempre seguras.</p>
        <ul>
          <li>Criptografia SSL de alta segurança</li>
          <li>Autenticação de dois fatores</li>
          <li>Monitoramento contínuo de ameaças</li>
        </ul>
      </div>
    </section>

    <!-- Seção de Planos -->
    <section id="plans" class="section plans-section">
      <h2>Escolha o Seu Plano</h2>
      <div class="plans-container">
        <div class="plan-item">
          <h3>Plano Mensal</h3>
          <p class="price">R$ 29,00 / mês</p>
          <p>Comece com a nossa plataforma gratuitamente e, após 30 dias, continue com o plano mensal.</p>
          <button class="btn btn-primary cta-btn" @click.prevent="$router.push({ name: 'signup' })">
            Assine Mensalmente
          </button>
        </div>
        <div class="plan-item">
          <h3>Plano Anual</h3>
          <p class="price">R$ 299,00 / ano</p>
          <p>Ao invés de pagar R$ 348,00 (12 x R$ 29,00), aproveite o plano anual com um desconto especial.</p>
          <button class="btn btn-primary cta-btn" @click.prevent="$router.push({ name: 'signup' })">
            Assine Anualmente
          </button>
        </div>
      </div>
    </section>

    <!-- Contato -->
    <section id="contact" class="section contact-section">
      <div class="contact-container">
        <h2>Entre em Contato Conosco</h2>
        <form class="contact-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Nome:</label>
            <input type="text" id="name" v-model="contactForm.name" required />
          </div>
          <div class="form-group">
            <label for="email">E-mail:</label>
            <input type="email" id="email" v-model="contactForm.email" required />
          </div>
          <div class="form-group">
            <label for="message">Mensagem:</label>
            <textarea id="message" v-model="contactForm.message" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Enviar</button>
        </form>
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
    <PrivacyControls />
  </v-container>
</template>

<script>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PrivacyControls from '@/components/compliance/PrivacyControls.vue'


export default {
  components: {
    PrivacyControls,
  },
  name: 'LandingPage',
  data() {
    return {
      isMenuOpen: false,
      contactForm: {
        name: '',
        email: '',
        message: ''
      }
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    handleSubmit() {
      if (!this.contactForm.email.includes('@')) {
        alert('Por favor, insira um e-mail válido.');
        return;
      }
      console.log('Formulário enviado:', this.contactForm);
      alert('Mensagem enviada com sucesso!');
      this.contactForm = { name: '', email: '', message: '' }; // Limpa o formulário
    }
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
  top: 0;
  left: 0;
  right: 0;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100px;
  /* Ajuste a altura conforme necessário */
  position: fixed;
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
  font-family: 'Roboto', sans-serif;
  overflow-x: hidden;
}

/* Ajuste a largura do logo e navegação conforme necessário */
.logo img {
  width: 95px;
  height: 95px;
  margin-top: 17px;
  border-radius: 50%;
  /* Faz a imagem circular */
  object-fit: cover;
}

.nav ul {
  list-style: none;
  display: flex;
  gap: 15px;
  transition: transform 0.3s ease;
  margin: 0;
}

.nav ul {
  display: flex;
  /* Garante que o menu seja visível no modo desktop */
  position: relative;
  top: 0;
  right: 0;
  background-color: transparent;
  /* Altere se precisar de fundo */
  padding: 0;
  /* Remove padding que pode estar causando o problema */
  box-shadow: none;
  /* Remove a sombra se não for necessária */
}

.nav ul.active {
  display: flex;
}

.nav a {
  color: var(--dark-gray);
  text-decoration: none;
  font-weight: 500;
  padding: 5px 10px;
  display: block;
  /* Garante que os links ocupem o espaço necessário */
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

/* Testemunhos */
.testimonials-section {
  background-color: var(--white);
  padding: 60px 40px;
  text-align: center;
}

.testimonials-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.testimonial-item {
  width: 30%;
  background-color: var(--light-gray);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.testimonial-item img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.testimonial-item p {
  font-style: italic;
  color: var(--dark-gray);
  margin-bottom: 10px;
}

.testimonial-item h4 {
  color: var(--dark-gray);
}

/* Segurança */
.security-section {
  background-color: var(--light-gray);
  padding: 60px 40px;
}

.security-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.security-content ul {
  list-style-type: none;
  padding: 0;
}

.security-content li {
  font-size: 16px;
  color: var(--dark-gray);
  margin-bottom: 10px;
}

.plans-section {
  background-color: var(--white);
  padding: 60px 40px;
  text-align: center;
}

.plans-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.plan-item {
  width: 45%;
  background-color: var(--light-gray);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.plan-item h3 {
  font-size: 24px;
  color: var(--dark-gray);
}

.plan-item .price {
  font-size: 32px;
  color: var(--orange);
  margin: 10px 0;
}

.plan-item p {
  font-size: 16px;
  color: var(--dark-gray);
}

.cta-btn {
  background-color: var(--orange);
  color: var(--white);
  padding: 12px 24px;
  border-radius: 5px;
  margin-top: 20px;
}

.cta-btn:hover {
  background-color: var(--dark-orange);
}

/* Contato */
.contact-section {
  background-color: var(--white);
  padding: 60px 40px;
  text-align: center;
}

.contact-container {
  max-width: 800px;
  margin: 0 auto;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-form label {
  display: block;
  font-size: 16px;
  color: var(--dark-gray);
  text-align: left;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--light-gray);
  border-radius: 5px;
  font-size: 16px;
}

.contact-form button {
  align-self: flex-start;
  background-color: var(--orange);
  color: var(--white);
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.contact-form button:hover {
  background-color: var(--dark-orange);
}

/* Footer */
.footer {
  background-color: var(--dark-gray);
  padding: 40px;
  color: var(--white);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.footer-links a {
  color: var(--white);
  margin-right: 20px;
  text-decoration: none;
  justify-content: center;
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
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    /* Distribui os itens ao longo do header */
    padding: 10px;
  }

  .logo {
    margin-top: 17px;
    flex: 1;
    /* Ajusta a largura da logo */
    text-align: left;
  }

  .logo img {
    width: 80px;
    height: 80px;
  }

  .menu-toggle {
    display: flex;
    position: absolute;
    top: 40px;
    right: 20px;
    flex-direction: column;
    gap: 5px;
    order: 2;
  }

  .nav ul {
    display: none;
    position: absolute;
    top: 75px;
    right: 5px;
    background-color: var(--light-gray);
    padding: 20px;
    flex-direction: column;
    width: 200px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
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
    flex: 1;
    /* Ajusta a largura dos botões */
    text-align: right;
    /* Alinha os botões à direita */
    gap: 10px;
  }

  .login-btn,
  .signup-btn {
    padding: 8px 12px;
    font-size: 14px;
  }

  .hero {
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    text-align: center;
  }

  .hero-content {
    width: 100%;
  }

  .hero-content h1 {
    font-size: 32px;
  }

  .hero-content p {
    font-size: 16px;
    margin-top: 10px;
  }

  .hero-image img {
    width: 100%;
    max-width: 400px;
    height: auto;
  }

  .benefits-container {
    flex-direction: column;
    gap: 20px;
  }

  .benefit-item {
    width: 100%;
    background-color: var(--light-gray);
    padding: 20px;
    border-radius: 10px;
  }

  .benefit-item img {
    width: 80px;
    height: 80px;
  }

  .plan-item {
    width: 100%;
  }

  .contact-form {
    gap: 15px;
  }

  .contact-form input,
  .contact-form textarea {
    padding: 10px;
    font-size: 14px;
  }

  .contact-form button {
    padding: 10px 20px;
    font-size: 14px;
  }

  .footer {
    padding: 20px;
    text-align: center;
  }

  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .footer-links a {
    margin: 0;
  }

  .footer-cta {
    margin-top: 10px;
  }

  .footer-info {
    margin-top: 10px;
  }
}
</style>
