// LandingPage.vue
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
          @click.prevent="$router.push({ name: 'choose-plan' })">
          Assine Agora
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Decisões financeiras melhores começam com clareza compartilhada.</h1>
        <p>
          O CoBudget é uma plataforma de decisão financeira colaborativa criada para famílias e times que levam planejamento a sério.
        </p>
        <button class="btn btn-primary cta-btn"
          @click.prevent="$router.push({ name: 'login', query: { signup: 'true' } })">
          Começar gratuitamente
        </button>
        <p class="micro-proof" style="margin-top:8px; font-size:13px; color:#888;">
          Sem cartão de crédito • Cancelamento simples • Seus dados protegidos
        </p>
      </div>
      <div class="hero-image">
        <img src="/hero_image.jpg" alt="Planejamento Financeiro" />
      </div>
    </section>

    <!-- Seção IA -->
    <!-- Seção de Dor (Cards) -->
    <section class="section pain-section">
      <h2 class="pain-title">Decisões financeiras compartilhadas carregam riscos invisíveis.</h2>
      <div class="pain-list">
        <div class="pain-card">
          <span class="pain-icon">👁️</span>
          <strong>Informações descentralizadas</strong>
          <p>Dados dispersos dificultam a análise estratégica</p>
        </div>
        <div class="pain-card">
          <span class="pain-icon">📉</span>
          <strong>Falta de visão consolidada</strong>
          <p>Ausência de panorama financeiro integrado</p>
        </div>
        <div class="pain-card">
          <span class="pain-icon">🧮</span>
          <strong>Impactos não simulados</strong>
          <p>Decisões tomadas sem antecipar consequências</p>
        </div>
        <div class="pain-card">
          <span class="pain-icon">📅</span>
          <strong>Planejamento desconectado da execução</strong>
          <p>Metas e ações não se conversam</p>
        </div>
        <div class="pain-card">
          <span class="pain-icon">🔗</span>
          <strong>Responsabilidades pouco claras</strong>
          <p>Falta de definição sobre papéis e entregas</p>
        </div>
      </div>
      <p class="pain-bottom"></p>
    </section>

    <!-- Virada -->
    <section class="section" style="background:linear-gradient(135deg,#f5f7ff 0%,#eef2ff 100%); padding:60px 20px;">
      <h2 style="text-align:center; color:var(--purple);">O CoBudget organiza, projeta e antecipa.</h2>
      <p style="text-align:center; max-width:600px; margin:24px auto 0; color:var(--dark-gray); font-size:18px;">
        Centralize receitas, despesas e metas em um único ambiente.<br>
        Visualize o impacto antes de agir.<br>
        Tome decisões com base em dados — não em suposições.
      </p>
    </section>

    <!-- Para Famílias -->
    <section class="section benefits-section">
      <h3 style="text-align:center; color:var(--purple);">Estrutura financeira para decisões familiares conscientes.</h3>
      <div class="benefits-list">
        <div class="benefit-card">
          <span class="benefit-icon">🧾</span>
          <strong>Contas centralizadas</strong>
          <p>Gestão integrada de receitas e despesas familiares</p>
        </div>
        <div class="benefit-card">
          <span class="benefit-icon">👨‍👩‍👧‍👦</span>
          <strong>Metas compartilhadas</strong>
          <p>Todos acompanham objetivos e avanços</p>
        </div>
        <div class="benefit-card">
          <span class="benefit-icon">✈️</span>
          <strong>Planejamento de conquistas</strong>
          <p>Viagens, casa e investimentos sob controle</p>
        </div>
        <div class="benefit-card">
          <span class="benefit-icon">🤝</span>
          <strong>Responsabilidade distribuída</strong>
          <p>Transparência e clareza para todos os membros</p>
        </div>
      </div>
      <p style="text-align:center; margin-top:24px; color:#666; font-size:17px;"></p>
    </section>

    <!-- Para Times e Startups -->
    <section class="section benefits-section">
      <h3 style="text-align:center; color:var(--purple);">Inteligência financeira para times que crescem com responsabilidade.</h3>
      <div class="benefits-list">
        <div class="benefit-card">
          <span class="benefit-icon">🏢</span>
          <strong>Orçamento por área</strong>
          <p>Gestão segmentada e transparente de recursos</p>
        </div>
        <div class="benefit-card">
          <span class="benefit-icon">💹</span>
          <strong>Fluxo de caixa consolidado</strong>
          <p>Visão estratégica para decisões de crescimento</p>
        </div>
        <div class="benefit-card">
          <span class="benefit-icon">🧮</span>
          <strong>Simulação de cenários</strong>
          <p>Antecipe impactos antes de agir</p>
        </div>
        <div class="benefit-card">
          <span class="benefit-icon">🔍</span>
          <strong>Responsabilidade clara</strong>
          <p>Participação e entendimento de todos</p>
        </div>
      </div>
      <p style="text-align:center; margin-top:24px; color:#666; font-size:17px;"></p>
    </section>

    <!-- Inteligência (Reposicionada) -->
    <section id="ai" class="section ai-section">
      <div class="ai-content">
        <div class="ai-text">
          <h2>Inteligência aplicada à decisão.</h2>
          <p>
            O CoBudget utiliza análise de dados para antecipar tendências, recomendar ações e fortalecer a tomada de decisão.<br>
            Não é apenas registro. É orientação estratégica contínua.
          </p>
          <ul>
            <li>Alertas sobre desvios e padrões atípicos</li>
            <li>Projeção de fluxo de caixa</li>
            <li>Simulação de impacto antes de decidir</li>
            <li>Recomendações automáticas para otimização</li>
          </ul>
          <div class="ai-cta">
            <button class="btn btn-primary" @click.prevent="$router.push({ name: 'dashboard' })">
              Ver IA em ação
            </button>
            <button class="btn btn-secondary" @click.prevent="$router.push({ name: 'choose-plan' })">
              Começar agora
            </button>
          </div>
        </div>
        <div class="ai-highlights">
          <article class="ai-card">
            <h3>Fluxo de Caixa Preditivo</h3>
            <p>Antecipe receitas, despesas e riscos de déficit.</p>
            <span>Insights em tempo real</span>
          </article>
          <article class="ai-card">
            <h3>Simulação de Impacto</h3>
            <p>Visualize o efeito de cada decisão antes de executar.</p>
            <span>Decida com confiança</span>
          </article>
          <article class="ai-card">
            <h3>Recomendações Inteligentes</h3>
            <p>Receba sugestões automáticas para otimizar recursos.</p>
            <span>Otimização contínua</span>
          </article>
        </div>
      </div>
    </section>

    <!-- Benefícios -->
    <!-- Diferenciação -->
    <section id="benefits" class="section benefits-section">
      <h2 style="text-align:center; color:var(--purple);">Não é ERP corporativo. Não é planilha improvisada. Não é aplicativo individual.</h2>
      <p style="text-align:center; max-width:600px; margin:24px auto 0; color:var(--dark-gray); font-size:18px;">
        É uma plataforma estruturada para decisões financeiras compartilhadas.
      </p>
    </section>

    <!-- Testemunhos -->
    <!-- Prova Social -->
    <section id="testimonials" class="section testimonials-section">
      <h2 style="text-align:center; color:var(--purple);">O que nossos usuários dizem</h2>
      <div class="testimonials-container">
        <div class="testimonial-item">
          <p>"Finalmente conseguimos visualizar todo o orçamento da casa sem discussões. Em poucas semanas, já sabíamos onde economizar."</p>
          <h4>Casal usuário</h4>
        </div>
        <div class="testimonial-item">
          <p>"Nossa startup ganhou previsibilidade de caixa. O time inteiro entende o impacto de cada decisão."</p>
          <h4>Founder SaaS</h4>
        </div>
      </div>
    </section>

    <!-- Segurança -->
    <!-- Segurança -->
    <section id="security" class="section security-section">
      <h2>Segurança no nível que decisões financeiras exigem</h2>
      <div class="security-content">
        <ul>
          <li>Criptografia avançada</li>
          <li>Autenticação em dois fatores</li>
          <li>Arquitetura segura</li>
          <li>Controle de acesso por perfil</li>
        </ul>
      </div>
    </section>

    <!-- Seção de Planos -->
    <!-- Planos (Conversão Direta) -->
    <section id="plans" class="section plans-section">
      <h2>Comece com clareza hoje.</h2>
      <p style="text-align:center; max-width:600px; margin:24px auto 0; color:var(--dark-gray); font-size:18px;">
        Experimente gratuitamente.<br>
        Evolua conforme sua família ou seu time cresce.
      </p>
      <div class="plans-container">
        <div class="plan-item">
          <h3>Plano Mensal</h3>
          <p class="price">{{ planDetails.MONTHLY.displayPrice }}</p>
          <button class="btn btn-primary cta-btn" @click.prevent="redirectToCheckout('MONTHLY')">
            Começar grátis
          </button>
        </div>
        <div class="plan-item">
          <h3>Plano Anual</h3>
          <p class="price">{{ planDetails.ANNUAL.displayPrice }}</p>
          <button class="btn btn-primary cta-btn" @click.prevent="redirectToCheckout('ANNUAL')">
            Ver planos
          </button>
        </div>
      </div>
    </section>

    <!-- Contato -->
    <section id="contact" class="section contact-section">
      <div class="contact-container">
        <h2>Entre em Contato Conosco</h2>
        <p style="margin-bottom:18px; color:var(--purple); font-size:16px; font-weight:500;">
          E-mail: <a href="mailto:help@cobudget.app" style="color:var(--dark-purple); font-weight:600; text-decoration:underline;">help@cobudget.app</a> ou <a href="mailto:contact@cobudget.app" style="color:var(--dark-purple); font-weight:600; text-decoration:underline;">contact@cobudget.app</a>
        </p>
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
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Enviando...' : 'Enviar' }}
          </button>
        </form>
      </div>
    </section>

    <!-- Footer -->
    <!-- CTA Final Forte -->
    <footer class="footer">
      <div class="footer-content">
        <h2 style="color:var(--yellow); margin-bottom:16px;">Clareza não é luxo. É responsabilidade.</h2>
        <p style="color:var(--white); font-size:18px; margin-bottom:24px;">Organize, projete e decida com confiança.<br>CoBudget — Plataforma de decisão financeira colaborativa.</p>
        <div class="footer-cta">
          <button class="btn btn-primary cta-btn" @click.prevent="$router.push({ name: 'choose-plan' })">
            Começar gratuitamente agora
          </button>
        </div>
        <div class="footer-links">
          <a href="#">Sobre</a>
          <a href="#benefits">Benefícios</a>
          <a href="#testimonials">Depoimentos</a>
          <a href="#security">Segurança</a>
          <a href="#contact">Contato</a>
        </div>
        <div class="footer-links footer-info">
          <a @click.prevent="$router.push('/privacy-policy')">Política de Privacidade</a>
          <a @click.prevent="$router.push('/terms-of-use')">Termos de Uso</a>
          <a @click.prevent="$router.push('/cookie-policy')">Política de Cookies</a>
        </div>
        <div class="footer-info">
          <p>&copy; 2024 CoBudget. Todos os direitos reservados. Powered by Les Monades</p>
        </div>
      </div>
    </footer>
    <PrivacyControls />
  </v-container>
</template>

<script>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PrivacyControls from '@/components/compliance/PrivacyControls.vue'
import { PLAN_DETAILS, formatPlanAmount } from '@/constants/plans'
import { useUserStore } from '@/plugins/userStore'
import NotificationService from '@/services/NotificationService'

export default {
  components: {
    PrivacyControls,
  },
  name: 'LandingPage',
  data() {
    return {
      isMenuOpen: false,
      planDetails: PLAN_DETAILS,
      contactForm: {
        name: '',
        email: '',
        message: ''
      },
      isSubmitting: false
    };
  },
  methods: {
    toggleMenu(event) {
      this.isMenuOpen = !this.isMenuOpen;
      event.currentTarget.classList.toggle('active');
    },
    async handleSubmit() {
      if (!this.contactForm.email.includes('@')) {
        alert('Por favor, insira um e-mail válido.');
        return;
      }

      if (this.isSubmitting) return;

      this.isSubmitting = true;

      try {
        await NotificationService.sendContactForm(this.contactForm);
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        this.contactForm = { name: '', email: '', message: '' };
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        const errorMessage = error.response?.data?.error || 'Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato diretamente em help@cobudget.app';
        alert(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },
  async redirectToCheckout(plan) {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) {
        localStorage.setItem('selectedPlan', plan)
        this.$router.push({ name: 'login', query: { redirect: '/choose-plan', plan } })
        return
      }
      this.$router.push({ name: 'choose-plan', query: { plan } })
    },
    formatAmount(amount) {
      return formatPlanAmount(amount);
    }
  },
};
</script>

<style scoped>
/* Importa fonte moderna para títulos e destaques */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Roboto:wght@400;500;700&display=swap');

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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.v-container {
  max-width: none !important;
  padding: 0 !important;
}

body {
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  overflow-x: hidden;
  color: var(--dark-gray);
  background: #fafbfc;
  letter-spacing: 0.01em;
}

/* Títulos principais */
h1, .hero-content h1 {
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  font-weight: 900;
  font-size: 2.8rem;
  color: var(--purple);
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin-bottom: 12px;
  text-shadow: 0 2px 12px rgba(142,68,173,0.07);
}

h2, .section h2 {
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  font-weight: 700;
  font-size: 2.1rem;
  color: var(--dark-purple);
  letter-spacing: -0.2px;
  margin-bottom: 10px;
  line-height: 1.18;
}

h3, .section h3 {
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  font-weight: 600;
  font-size: 1.35rem;
  color: var(--purple);
  margin-bottom: 8px;
  letter-spacing: 0.01em;
}

h4, .benefit-item h4, .testimonial-item h4 {
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  font-weight: 600;
  font-size: 1.08rem;
  color: var(--dark-purple);
  margin-bottom: 2px;
}

p, .section p, .benefit-item p, .testimonial-item p, .ai-text p {
  font-family: 'Roboto', 'Inter', Arial, sans-serif;
  font-size: 1.08rem;
  color: var(--dark-gray);
  line-height: 1.7;
  margin-bottom: 8px;
}

ul, .section ul {
  font-size: 1.08rem;
  line-height: 1.7;
  color: var(--dark-gray);
  margin-bottom: 8px;
}

li {
  margin-bottom: 6px;
}

.micro-proof {
  font-size: 0.95rem !important;
  color: #888 !important;
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  letter-spacing: 0.02em;
}

/* Dor - Cards */
.pain-section {
  background: #fff;
  padding: 60px 20px;
}
.pain-title {
  text-align: center;
  color: var(--purple);
  margin-bottom: 32px;
}
.pain-list {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
}
.pain-card {
  background: #f8f9f9;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(142,68,173,0.06);
  padding: 32px 24px 22px 24px;
  flex: 1 1 200px;
  min-width: 200px;
  max-width: 240px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pain-icon {
  font-size: 2.1rem;
  margin-bottom: 12px;
  display: block;
}
.pain-card strong {
  color: var(--purple);
  font-size: 1.13rem;
  margin-bottom: 6px;
}
.pain-card p {
  color: var(--dark-gray);
  font-size: 1.01rem;
  margin-bottom: 0;
}
.pain-bottom {
  text-align: center;
  margin-top: 32px;
  color: #666;
  font-size: 17px;
}

/* Suaviza o visual dos botões */
.btn, .cta-btn {
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
  font-weight: 600;
  font-size: 1.08rem;
  letter-spacing: 0.01em;
  border-radius: 7px;
  box-shadow: 0 2px 8px rgba(243,156,18,0.07);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.btn-primary {
  background: var(--orange);
  color: #fff;
  border: none;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: var(--dark-orange);
  color: #fff;
  box-shadow: 0 4px 16px rgba(243,156,18,0.13);
}
.btn-secondary {
  background: #fff;
  color: var(--purple);
  border: 2px solid var(--purple);
}
.btn-secondary:hover {
  background: var(--purple);
  color: #fff;
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
  position: relative;
  width: 30px;
  height: 25px;
}

.menu-icon {
  width: 100%;
  height: 3px;
  background-color: var(--dark-gray);
  border-radius: 5px;
  position: absolute;
  transition: all 0.3s ease-in-out;
}

.menu-icon:nth-child(1) {
  top: 0;
}

.menu-icon:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}

.menu-icon:nth-child(3) {
  bottom: 0;
}

/* Animação do menu quando ativo */
.menu-toggle.active .menu-icon:nth-child(1) {
  transform: rotate(45deg);
  top: 50%;
}

.menu-toggle.active .menu-icon:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active .menu-icon:nth-child(3) {
  transform: rotate(-45deg);
  bottom: 40%;
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
  margin-top: 20px;
  background-color: var(--light-gray);
  gap: 40px;
}

.hero-content {
  flex: 1 1 40%;
}

.hero-image {
  flex: 1 1 60%;
  display: flex;
  justify-content: center;
  min-width: 320px;
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
  max-width: 520px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08);
}

/* AI Section */
.ai-section {
  background: linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%);
  padding: 80px 20px;
}

.ai-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
  align-items: center;
}

.ai-text .tag {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.9rem;
  color: #7c3aed;
  font-weight: 600;
}

.ai-text h2 {
  font-size: 2.5rem;
  margin: 12px 0;
  color: #1f2933;
}

.ai-text ul {
  margin: 16px 0 24px;
  padding-left: 20px;
  color: #374151;
}

.ai-text li {
  margin-bottom: 10px;
}

.ai-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 28px;
}

.ai-highlights {
  display: grid;
  gap: 20px;
}
.ai-cta .btn-primary {
  box-shadow: 0 4px 18px rgba(243,156,18,0.13), 0 1.5px 0 var(--orange);
  font-size: 1.13rem;
  padding: 14px 32px;
  font-weight: 700;
  letter-spacing: 0.01em;
  border-radius: 8px;
  transition: box-shadow 0.2s, background 0.2s;
}
.ai-cta .btn-primary:hover {
  box-shadow: 0 8px 28px rgba(243,156,18,0.18), 0 2px 0 var(--dark-orange);
  background: var(--dark-orange);
}
.ai-cta .btn-secondary {
  font-size: 1.13rem;
  padding: 14px 32px;
  font-weight: 700;
  border-radius: 8px;
  border-width: 2px;
  border-style: solid;
  border-color: var(--purple);
  color: var(--purple);
  background: #fff;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.ai-cta .btn-secondary:hover {
  background: var(--purple);
  color: #fff;
  border-color: var(--dark-purple);
}

.ai-card {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.12);
}

.ai-card h3 {
  margin-bottom: 10px;
  color: #111827;
}

.ai-card span {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.85rem;
  color: #6d28d9;
  font-weight: 600;
}


/* Benefícios - Cards */
.benefits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
}
.benefit-card {
  background: #f8f9f9;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(142,68,173,0.06);
  padding: 32px 24px 22px 24px;
  flex: 1 1 200px;
  min-width: 200px;
  max-width: 240px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.benefit-icon {
  font-size: 2.1rem;
  margin-bottom: 12px;
  display: block;
}
.benefit-card strong {
  color: var(--purple);
  font-size: 1.13rem;
  margin-bottom: 6px;
}
.benefit-card p {
  color: var(--dark-gray);
  font-size: 1.01rem;
  margin-bottom: 0;
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
    min-width: 280px; /* Largura mínima para evitar boxes muito estreitos */
    background-color: var(--light-gray);
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-sizing: border-box; /* Garante que o padding não aumente a largura */
    margin: 0 auto; /* Centraliza os items quando em coluna */
  }  .testimonial-item img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 15px;
  }

  .testimonial-item p {
    font-style: italic;
    color: var(--dark-gray);
    margin-bottom: 10px;
    word-wrap: break-word; /* Garante que palavras longas quebrem */
    overflow-wrap: break-word; /* Suporte adicional para quebra de palavras */
  }

  .testimonial-item h4 {
    color: var(--dark-gray);
  }/* Segurança */
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
  cursor: pointer;
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
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    flex-direction: column;
    gap: 5px;
    order: 2;
    z-index: 11; /* Garante que fique acima dos outros elementos */
  }

  .nav ul {
    position: absolute;
    top: 75px;
    right: 5px;
    background-color: var(--light-gray);
    padding: 20px;
    flex-direction: column;
    width: 200px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-20px);
    transition: all 0.3s ease-in-out;
  }

  .nav ul.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    display: flex;
  }

  .nav a {
    padding: 10px 0;
    text-align: center;
    display: block;
  }

  .auth-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-right: 60px; /* Espaço para o menu sandwich */
    z-index: 10;
  }

  .login-btn,
  .signup-btn {
    padding: 8px 12px;
    font-size: 14px;
    white-space: nowrap; /* Evita quebra de linha no texto do botão */
  }

  .hero {
    flex-direction: column;
    align-items: center;
    padding: 50px 20px;
    text-align: center;
    margin-top: 50px;
  }

  .hero-content {
    width: 100%;
    margin-bottom: 30px; /* Adiciona espaço entre o conteúdo e a imagem */
  }

  .hero-image {
    width: 100%;
  }

  .hero-content h1 {
    font-size: 34px;
  }

  .hero-content p {
    font-size: 16px;
    margin-top: 10px;
  }

  .hero-content .cta-btn {
    margin-top: 20px; /* Adiciona espaço acima do botão */
    margin-bottom: 20px; /* Adiciona espaço abaixo do botão */
  }

  .hero-image img {
    width: 100%;
    max-width: 90vw;
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
    width: 180px;
    height: 180px;
  }

  .testimonials-container {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .testimonial-item {
    width: 100%;
    max-width: 400px;
    margin: 0 auto 20px;
    padding: 25px 20px;
  }

  .testimonial-item p {
    font-size: 14px;
    padding: 0 10px;
    margin-bottom: 15px;
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

  .ai-section {
    padding: 60px 20px;
  }

  .ai-content {
    grid-template-columns: 1fr;
  }

  .ai-text ul {
    text-align: left;
  }

  .ai-cta {
    justify-content: center;
  }
}
</style>
