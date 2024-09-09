<template>
  <v-container id="color-setup">
    <!-- Header -->
    <header class="header">
        <div class="logo">
          <img src="/logo.jpg" alt="Logo" />
        </div>
        <nav class="nav">
          <ul>
            <li><a href="#">Sobre</a></li>
            <li><a href="#benefits">Benefícios</a></li>
            <li><a href="#testimonials">Depoimentos</a></li>
            <li><a href="#security">Segurança</a></li>
            <li><a href="#contact">Contato</a></li>
          </ul>
        </nav>
        <button class="btn btn-primary login-btn" @click.prevent="$router.push({ name: 'login' })">
          Login
        </button>
        <button class="btn btn-secondary signup-btn" @click.prevent="$router.push({ name: 'login' })">
          Assine Agora
        </button>
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
          <p>
            Crie planos financeiros sob medida para atingir seus objetivos a médio e longo prazo.
          </p>
        </div>
        <div class="benefit-item">
          <img src="/support.jpg" alt="Controle" />
          <h3>Controle Total</h3>
          <p>Monitore suas despesas, receitas e investimentos em uma única plataforma intuitiva.</p>
        </div>
        <div class="benefit-item">
          <img src="/security.jpg" alt="Segurança" />
          <h3>Segurança de Dados</h3>
          <p>
            Suas informações financeiras estão protegidas com as mais avançadas tecnologias de
            segurança.
          </p>
        </div>
        <div class="benefit-item">
          <img src="/growth.jpg" alt="Crescimento" />
          <h3>Crescimento Financeiro</h3>
          <p>Receba recomendações de investimento personalizadas para maximizar seu retorno.</p>
        </div>
      </div>
    </section>

    <!-- Depoimentos -->
    <section id="testimonials" class="section testimonials-section">
      <h2>O Que Nossos Clientes Dizem</h2>
      <div class="testimonials-container">
        <!-- <div class="testimonial-item">
          <img src="/testimonials/client1.jpg" alt="Cliente 1" class="client-photo">
          <p>"Esta ferramenta transformou minha maneira de gerenciar minhas finanças. Agora me sinto mais seguro sobre
            meu futuro financeiro."</p>
          <h4>Maria Silva</h4>
        </div>
        <div class="testimonial-item">
          <img src="/testimonials/client2.jpg" alt="Cliente 2" class="client-photo">
          <p>"Com o planejamento personalizado, consegui economizar mais e investir de forma inteligente. Recomendo a
            todos!"</p>
          <h4>João Pereira</h4>
        </div>
        <div class="testimonial-item">
          <img src="/testimonials/client3.jpg" alt="Cliente 3" class="client-photo">
          <p>"A segurança dos meus dados me dá tranquilidade para focar no crescimento das minhas finanças."</p>
          <h4>Ana Costa</h4>
        </div> -->
      </div>
    </section>

    <!-- Segurança e Garantia -->
    <section id="security" class="section security-section">
      <h2>Segurança e Confiabilidade</h2>
      <div class="security-container">
        <div class="security-content">
          <p>
            Nossa aplicação financeira utiliza tecnologias de ponta para garantir a segurança dos
            seus dados. Estamos comprometidos com a sua privacidade e segurança.
          </p>
          <ul>
            <!-- <li><img src="/icons/ssl.png" alt="SSL"> Criptografia SSL</li>
            <li><img src="/icons/iso.png" alt="ISO"> Certificação ISO 27001</li>
            <li><img src="/icons/partners.png" alt="Parceiros"> Parcerias com instituições financeiras renomadas</li> -->
          </ul>
        </div>
        <div class="security-image">
          <!-- <img src="/security_badge.jpg" alt="Segurança"> -->
        </div>
      </div>
    </section>

    <!-- QR Code de Doação -->
    <section id="donation" class="section donation-section">
      <div class="donation-container">
        <h2>Ajude a Manter o Projeto Vivo</h2>
        <p class="donation-subtitle">
          Sua contribuição é essencial para a continuidade e evolução do nosso trabalho.
        </p>

        <div class="donation-options">
          <div class="donation-card">
            <h3>Doação Única</h3>
            <p>Faça uma doação única e ajude-nos a alcançar novos objetivos.</p>
            <button class="donation-button">Doar Agora</button>
          </div>
          <div class="donation-card">
            <h3>Doação Pix</h3>
            <p>
              Escaneie o QR code abaixo e ajude a financiar a construção desta ferramenta incrível!
            </p>
            <img src="/qrcode-pix.png" alt="QR Code para Doação" class="qr-code" />
          </div>
        </div>
        <div class="donation-footer">
          <p>Qualquer valor é bem-vindo e faz toda a diferença. Obrigado pelo seu apoio!</p>
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
            Pronto para Transformar Suas Finanças? Inscreva-se Agora!
          </button>
        </div>
        <div class="footer-info">
          <p>&copy; 2024 Sua Fintech. Todos os direitos reservados.</p>
          <div class="social-icons">
            <!-- <a href="#"><img src="/icons/facebook.png" alt="Facebook"></a>
            <a href="#"><img src="/icons/twitter.png" alt="Twitter"></a>
            <a href="#"><img src="/icons/linkedin.png" alt="LinkedIn"></a> -->
          </div>
        </div>
      </div>
    </footer>
  </v-container>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {}
  },
  methods: {
    // Você pode adicionar métodos adicionais aqui se necessário
  }
}
</script>

<style scoped>
/* Variáveis de Cores */
#color-setup {
  --orange: #ffa07a;
  --dark-orange: #ff6f00;
  --yellow: #f7dc6f;
  --purple: #7a288a;
  --dark-purple: #5c3c8a;
  --blue: #2e86c1;
  --green: #28b463;
  --white: #ffffff;
  --light-gray: #f0f0f0;
  --dark-gray: #333333;
}

/* Reset básico */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Header */
.header {
  background-color: #d5cbcb; /* cor cinza escura */
  opacity: 0.8; /* 80% de opacidade */
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.nav ul {
  list-style: none;
  display: flex;
  gap: 20px;
}

.nav a {
  color: var(--white);
  text-decoration: none;
  font-weight: 500;
  padding: 10px 15px;
  /* Adiciona padding para o efeito de fundo suave */
  border-radius: 5px;
  /* Bordas arredondadas para os botões */
}

.nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
  /* Fundo suave ao passar o mouse */
  color: var(--yellow);
}

.login-btn,
.signup-btn {
  margin-left: 10px;
}

.login-btn {
  background-color: var(--yellow);
  color: var(--dark-gray);
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.login-btn:hover {
  background-color: var(--orange);
}

.signup-btn {
  background-color: var(--green);
  color: var(--white);
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.signup-btn:hover {
  background-color: var(--dark-purple);
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
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 18px;
  color: var(--dark-gray);
  margin-bottom: 30px;
}

/* Call-to-Action */
.cta-btn {
  background-color: var(--orange);
  /* Altera a cor para laranja */
  color: var(--white);
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
}

.cta-btn:hover {
  background-color: var(--dark-orange);
  /* Você pode definir uma cor escura para hover se desejar */
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

/* Seção de Benefícios */
.benefits-section {
  background-color: var(--white);
  padding: 60px 40px;
  text-align: center;
}

.benefits-section h2 {
  font-size: 36px;
  color: var(--dark-gray);
  margin-bottom: 40px;
}

.benefits-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.benefit-item {
  width: 22%;
  background-color: var(--light-gray);
  padding: 20px;
  border-radius: 10px;
  transition: transform 0.3s;
}

.benefit-item:hover {
  transform: translateY(-10px);
}

.benefit-item img {
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
}

.benefit-item h3 {
  font-size: 20px;
  color: var(--dark-gray);
  margin-bottom: 10px;
}

.benefit-item p {
  font-size: 16px;
  color: var(--dark-gray);
}

/* Seção de Depoimentos */
.testimonials-section {
  background-color: var(--orange);
  padding: 60px 40px;
  text-align: center;
  color: var(--white);
}

.testimonials-section h2 {
  font-size: 36px;
  margin-bottom: 40px;
}

.testimonials-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.testimonial-item {
  width: 30%;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 10px;
  color: var(--white);
  transition: transform 0.3s;
}

.testimonial-item:hover {
  transform: translateY(-10px);
}

.client-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
}

.testimonial-item p {
  font-size: 16px;
  margin-bottom: 15px;
}

.testimonial-item h4 {
  font-size: 18px;
  font-weight: 600;
}

/* Seção de Segurança */
.security-section {
  background-color: var(--white);
  padding: 60px 40px;
  text-align: center;
}

.security-section h2 {
  font-size: 36px;
  color: var(--dark-gray);
  margin-bottom: 40px;
}

.security-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.security-content {
  width: 50%;
  text-align: left;
}

.security-content p {
  font-size: 18px;
  color: var(--dark-gray);
  margin-bottom: 20px;
}

.security-content ul {
  list-style: none;
  padding: 0;
}

.security-content li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.security-content li img {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.security-image img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

/* Estilos para a seção de doações */
.donation-section {
  background-color: #f8f9fa;
  /* Cor de fundo suave */
  padding: 60px 20px;
  text-align: center;
}

.donation-container {
  max-width: 1200px;
  margin: 0 auto;
}

.donation-container h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
}

.donation-subtitle {
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 40px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.donation-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  /* Para garantir que o layout seja responsivo */
}

.donation-card {
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  text-align: left;
  transition: transform 0.3s ease-in-out;
}

.donation-card:hover {
  transform: translateY(-10px);
}

.donation-card h3 {
  font-size: 1.75rem;
  color: #333;
  margin-bottom: 15px;
}

.donation-card p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
}

.donation-button {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.donation-button:hover {
  background-color: #218838;
}

.donation-footer {
  margin-top: 40px;
  font-size: 1rem;
  color: #666;
}

/* Footer */
.footer {
  background-color: var(--blue);
  padding: 40px;
  color: var(--white);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.footer-links a {
  color: var(--white);
  text-decoration: none;
  font-weight: 500;
}

.footer-links a:hover {
  color: var(--yellow);
}

.footer-cta {
  margin-bottom: 20px;
}

.footer-info {
  text-align: center;
}

.footer-info p {
  margin-bottom: 10px;
}

.social-icons {
  display: flex;
  gap: 10px;
}

.social-icons img {
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: transform 0.3s;
}

.social-icons img:hover {
  transform: scale(1.1);
}

.qr-code {
  width: 50%;
  max-width: 300px;
  height: auto;
}

/* Responsividade */
@media (max-width: 1200px) {
  .benefit-item,
  .testimonial-item {
    width: 45%;
  }

  .security-container {
    flex-direction: column;
    align-items: center;
  }

  .security-content,
  .security-image {
    width: 100%;
  }

  .hero {
    flex-direction: column;
    text-align: center;
  }

  .hero-content,
  .hero-image {
    width: 100%;
  }

  .hero-content h1 {
    font-size: 32px;
  }

  .hero-content p {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .benefit-item,
  .testimonial-item {
    width: 100%;
  }

  .donation-options {
    flex-direction: column;
  }

  .donation-card {
    max-width: 50%;
  }

  .nav ul {
    flex-direction: column;
    gap: 10px;
    background-color: var(--blue);
    position: absolute;
    top: 80px;
    right: 40px;
    padding: 20px;
    border-radius: 10px;
    display: none;
  }

  .nav ul.active {
    display: flex;
  }

  .header {
    position: relative;
  }

  .menu-toggle {
    display: block;
    cursor: pointer;
  }

  .menu-toggle img {
    width: 30px;
    height: 30px;
  }
}
</style>
