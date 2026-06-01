<script setup lang="ts">
import HeroNarrative from '@/components/landing/HeroNarrative.vue'

const quickActions = [
  {
    title: 'Open the onboarding hub',
    description: 'Acesse a base de boas-vindas, tutoriais visuais e futuros guias de produto.',
    to: '/welcome',
  },
  {
    title: 'Go to dashboard',
    description: 'Siga direto para a visao operacional com activity, trends e indicadores principais.',
    to: '/dashboard',
  },
  {
    title: 'Plan with scenarios and goals',
    description: 'Entre no fluxo de planejamento para explorar cenarios, metas e proximos passos.',
    to: '/planning/scenarios',
  },
]
</script>

<template>
  <main class="home-shell">
    <section class="home-hero">
      <div class="hero-copy">
        <span class="eyebrow">Start Here</span>
        <h1>Your product entry point for onboarding, orientation and next actions.</h1>
        <p>
          A `home` agora funciona como tela inicial do ambiente autenticado. Ela pode evoluir para um onboard mais
          guiado, enquanto a experiencia editorial e de explicacao detalhada fica isolada em `/welcome`.
        </p>
      </div>

      <div class="hero-status">
        <span class="hero-status__label">Current intent</span>
        <strong>Home as start screen</strong>
        <p>Use esta area para priorizar o primeiro passo que o usuario deve tomar ao entrar no produto.</p>
      </div>
    </section>

    <section class="home-narrative" aria-label="CoBudget narrative preview">
      <HeroNarrative />
    </section>

    <section class="actions-grid">
      <router-link
        v-for="action in quickActions"
        :key="action.title"
        :to="action.to"
        class="action-card"
      >
        <span class="action-card__kicker">Quick Action</span>
        <h2>{{ action.title }}</h2>
        <p>{{ action.description }}</p>
      </router-link>
    </section>
  </main>
</template>

<style scoped>
.home-shell {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 20px;
  margin-bottom: 28px;
}

.hero-copy,
.hero-status,
.action-card {
  border: 1px solid rgba(23, 32, 51, 0.1);
  border-radius: 24px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

.hero-copy {
  padding: 30px;
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.12), transparent 34%),
    linear-gradient(135deg, #f6f1e7 0%, #eef1f4 100%);
}

.eyebrow,
.action-card__kicker,
.hero-status__label {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow,
.hero-status__label {
  background: rgba(32, 95, 99, 0.1);
  color: #205f63;
}

.hero-copy h1 {
  margin: 14px 0 14px;
  font-family: 'Manrope', sans-serif;
  font-size: clamp(2.2rem, 4vw, 3.8rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  color: #172033;
}

.hero-copy p,
.hero-status p,
.action-card p {
  color: #5b6475;
  line-height: 1.7;
}

.hero-status {
  padding: 24px;
  background: #ffffff;
}

.hero-status strong {
  display: block;
  margin: 16px 0 10px;
  font-size: 1.4rem;
  color: #172033;
}

.home-narrative {
  display: flex;
  justify-content: center;
  margin: 22px 0 30px;
}

.actions-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.action-card {
  display: block;
  padding: 22px;
  background: #ffffff;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 42px rgba(15, 23, 42, 0.12);
}

.action-card__kicker {
  background: color-mix(in srgb, var(--cb-primary) 10%, transparent);
  color: var(--cb-primary);
}

.action-card h2 {
  margin: 14px 0 10px;
  font-size: 1.24rem;
  color: #172033;
}

.v-theme--dark .hero-copy,
.v-theme--dark .hero-status,
.v-theme--dark .action-card {
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 42px rgba(0, 0, 0, 0.24);
}

.v-theme--dark .hero-copy {
  background:
    radial-gradient(circle at top left, rgba(45, 125, 125, 0.24), transparent 34%),
    linear-gradient(135deg, #132033 0%, #182434 100%);
}

.v-theme--dark .hero-status,
.v-theme--dark .action-card {
  background: rgba(15, 23, 42, 0.78);
}

.v-theme--dark .eyebrow,
.v-theme--dark .hero-status__label {
  background: rgba(125, 211, 252, 0.12);
  color: #9ddcfb;
}

.v-theme--dark .action-card__kicker {
  background: color-mix(in srgb, var(--cb-primary) 16%, transparent);
  color: var(--cb-primary);
}

.v-theme--dark .hero-copy h1,
.v-theme--dark .hero-status strong,
.v-theme--dark .action-card h2 {
  color: #f8fafc;
}

.v-theme--dark .hero-copy p,
.v-theme--dark .hero-status p,
.v-theme--dark .action-card p {
  color: #cbd5e1;
}

@media (max-width: 900px) {
  .home-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .home-shell {
    padding: 24px 14px 36px;
  }

  .hero-copy,
  .hero-status,
  .action-card {
    border-radius: 20px;
  }
}
</style>
