<script setup lang="ts">
const setupSteps = [
  {
    step: '01',
    title: 'Connect your workspace',
    description:
      'Espaco reservado para imagens e instrucoes sobre criacao de workspace, contexto compartilhado e configuracao inicial.',
  },
  {
    step: '02',
    title: 'Import and organize data',
    description:
      'Base para explicar conciliacao, categorias, contas e a primeira rotina operacional dentro do produto.',
  },
  {
    step: '03',
    title: 'Use planning and AI with confidence',
    description:
      'Pronto para receber walkthroughs de budget, cenarios, metas e os recursos assistidos por IA.',
  },
]

const contentTracks = [
  {
    label: 'Docs',
    title: 'Implementation guides and visual checklists',
    text: 'Podemos transformar esta coluna em uma mini central de ajuda com screenshots anotados, fluxos operacionais e boas praticas.',
  },
  {
    label: 'Ops',
    title: 'Operational routines for teams',
    text: 'Espaco para documentar o que revisar diariamente, semanalmente e mensalmente em um workspace ativo.',
  },
  {
    label: 'Blog',
    title: 'Educational content that grows with the product',
    text: 'Base inicial para artigos de onboarding, explainers de funcionalidades e conteudo de descoberta.',
  },
]

const draftPosts = [
  'How to onboard a finance workspace without chaos',
  'What to review every week inside CoBudget',
  'Where AI helps, and where human review still matters',
]
</script>

<template>
  <section class="welcome-shell">
    <div class="hero-grid">
      <article class="hero-copy">
        <span class="eyebrow">Onboarding Foundation</span>
        <h1>The future home for setup guides, visual instructions and product education.</h1>
        <p class="hero-text">
          Esta tela agora serve como base de produto: onboarding tecnico no topo, blocos para tutoriais visuais no
          meio e o inicio de uma area editorial para documentacao e blog.
        </p>

        <div class="signal-row">
          <span>Guided setup</span>
          <span>Annotated screenshots</span>
          <span>Knowledge center</span>
        </div>
      </article>

      <article class="hero-preview">
        <div class="preview-frame">
          <img src="/img/wallet-tech-circuit.jpg" alt="Tech onboarding preview" />
        </div>
        <p class="preview-caption">Hero placeholder for future product walkthrough visuals.</p>
      </article>
    </div>

    <section class="section-block">
      <div class="section-heading">
        <span class="section-tag">Quick Start</span>
        <h2>Three onboarding stages already structured for future media</h2>
      </div>

      <div class="steps-grid">
        <article v-for="item in setupSteps" :key="item.step" class="step-card">
          <span class="step-number">{{ item.step }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <div class="media-slot">
            <span>Instructional image or short video placeholder</span>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block feature-panel">
      <div class="feature-copy">
        <span class="section-tag">Content Architecture</span>
        <h2>A flexible structure for docs, support and activation content</h2>
        <p>
          Podemos usar esta area para misturar explicacao de produto, cards de suporte, notas de implementacao e
          pequenos tutoriais com linguagem mais operacional.
        </p>
      </div>

      <div class="tracks-grid">
        <article v-for="track in contentTracks" :key="track.label" class="track-card">
          <span class="track-label">{{ track.label }}</span>
          <h3>{{ track.title }}</h3>
          <p>{{ track.text }}</p>
        </article>
      </div>
    </section>

    <section class="section-block docs-grid">
      <article class="docs-visual">
        <img src="/img/monitoring.jpg" alt="Monitoring workflow placeholder" />
      </article>

      <article class="docs-copy">
        <span class="section-tag">Visual Docs</span>
        <h2>Prepared for screenshots, callouts and operational notes</h2>
        <ul>
          <li>Step-by-step workspace setup guides</li>
          <li>Flows for reconciliation, budgeting and review routines</li>
          <li>Annotated examples for goals, decisions and scenarios</li>
        </ul>
      </article>
    </section>

    <section class="section-block">
      <div class="section-heading">
        <span class="section-tag">Blog Seed</span>
        <h2>Starter cards for the first product education posts</h2>
      </div>

      <div class="blog-grid">
        <article v-for="post in draftPosts" :key="post" class="blog-card">
          <span class="blog-kicker">Draft idea</span>
          <h3>{{ post }}</h3>
          <p>Placeholder editorial block ready to become an article, release note or educational playbook.</p>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.welcome-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 20px 56px;
}

.hero-grid,
.docs-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 24px;
}

.hero-copy,
.hero-preview,
.step-card,
.feature-panel,
.track-card,
.docs-copy,
.docs-visual,
.blog-card {
  border: 1px solid rgba(23, 32, 51, 0.1);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.hero-copy {
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.12), transparent 34%),
    linear-gradient(135deg, #f6f1e7 0%, #eef1f4 100%);
}

.eyebrow,
.section-tag,
.track-label,
.blog-kicker,
.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow,
.section-tag {
  padding: 7px 11px;
  background: rgba(32, 95, 99, 0.1);
  color: #205f63;
}

.hero-copy h1 {
  margin: 14px 0 14px;
  font-family: 'Manrope', sans-serif;
  font-size: clamp(2.5rem, 4.6vw, 4.6rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: #172033;
}

.hero-text {
  max-width: 62ch;
  margin: 0;
  color: #536177;
  line-height: 1.7;
  font-size: 1.04rem;
}

.signal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.signal-row span {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.72);
  color: #243244;
  font-weight: 600;
}

.hero-preview {
  padding: 18px;
  background: linear-gradient(180deg, #182434 0%, #223246 100%);
}

.preview-frame,
.docs-visual {
  overflow: hidden;
  border-radius: 18px;
}

.preview-frame img,
.docs-visual img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.preview-caption {
  margin: 12px 0 0;
  color: rgba(226, 232, 240, 0.88);
}

.section-block {
  margin-top: 28px;
}

.section-heading {
  margin-bottom: 16px;
}

.section-heading h2,
.feature-copy h2,
.docs-copy h2 {
  margin: 12px 0 0;
  font-family: 'Manrope', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.04;
  letter-spacing: -0.04em;
  color: #172033;
}

.steps-grid,
.tracks-grid,
.blog-grid {
  display: grid;
  gap: 18px;
}

.steps-grid,
.blog-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.tracks-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 22px;
}

.step-card,
.blog-card,
.track-card,
.docs-copy {
  padding: 22px;
  background: #ffffff;
}

.step-number {
  width: 44px;
  height: 44px;
  background: rgba(182, 85, 31, 0.12);
  color: #9b4c1e;
}

.step-card h3,
.track-card h3,
.blog-card h3 {
  margin: 14px 0 8px;
  color: #172033;
  font-size: 1.2rem;
}

.step-card p,
.track-card p,
.feature-copy p,
.docs-copy ul,
.blog-card p {
  color: #5b6475;
  line-height: 1.65;
}

.media-slot {
  display: grid;
  place-items: center;
  min-height: 180px;
  margin-top: 18px;
  border-radius: 18px;
  border: 1px dashed rgba(32, 95, 99, 0.28);
  background: linear-gradient(135deg, rgba(32, 95, 99, 0.08) 0%, rgba(182, 85, 31, 0.08) 100%);
  color: #355469;
  font-weight: 700;
  text-align: center;
}

.feature-panel {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafb 0%, #edf2f6 100%);
}

.track-label,
.blog-kicker {
  padding: 6px 10px;
  background: color-mix(in srgb, var(--cb-primary) 10%, transparent);
  color: var(--cb-primary);
}

.docs-visual {
  min-height: 320px;
}

.docs-copy ul {
  margin: 16px 0 0;
  padding-left: 20px;
}

.v-theme--dark .hero-copy,
.v-theme--dark .hero-preview,
.v-theme--dark .step-card,
.v-theme--dark .feature-panel,
.v-theme--dark .track-card,
.v-theme--dark .docs-copy,
.v-theme--dark .docs-visual,
.v-theme--dark .blog-card {
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 24px 42px rgba(0, 0, 0, 0.26);
}

.v-theme--dark .hero-copy {
  background:
    radial-gradient(circle at top left, rgba(45, 125, 125, 0.24), transparent 34%),
    linear-gradient(135deg, #132033 0%, #182434 100%);
}

.v-theme--dark .eyebrow,
.v-theme--dark .section-tag {
  background: rgba(125, 211, 252, 0.12);
  color: #9ddcfb;
}

.v-theme--dark .hero-copy h1,
.v-theme--dark .section-heading h2,
.v-theme--dark .feature-copy h2,
.v-theme--dark .docs-copy h2,
.v-theme--dark .step-card h3,
.v-theme--dark .track-card h3,
.v-theme--dark .blog-card h3 {
  color: #f8fafc;
}

.v-theme--dark .hero-text,
.v-theme--dark .step-card p,
.v-theme--dark .track-card p,
.v-theme--dark .feature-copy p,
.v-theme--dark .docs-copy ul,
.v-theme--dark .blog-card p,
.v-theme--dark .preview-caption {
  color: #cbd5e1;
}

.v-theme--dark .signal-row span,
.v-theme--dark .step-card,
.v-theme--dark .track-card,
.v-theme--dark .docs-copy,
.v-theme--dark .blog-card {
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
}

.v-theme--dark .feature-panel {
  background: linear-gradient(135deg, #131d2d 0%, #162132 100%);
}

.v-theme--dark .step-number {
  background: rgba(217, 141, 44, 0.16);
  color: #ffd39b;
}

.v-theme--dark .track-label,
.v-theme--dark .blog-kicker {
  background: color-mix(in srgb, var(--cb-primary) 16%, transparent);
  color: var(--cb-primary);
}

.v-theme--dark .media-slot {
  border-color: rgba(125, 211, 252, 0.2);
  background: linear-gradient(135deg, rgba(32, 95, 99, 0.18) 0%, rgba(182, 85, 31, 0.14) 100%);
  color: #dbeafe;
}

@media (max-width: 960px) {
  .hero-grid,
  .docs-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .welcome-shell {
    padding: 24px 14px 40px;
  }

  .hero-copy,
  .hero-preview,
  .step-card,
  .feature-panel,
  .track-card,
  .docs-copy,
  .blog-card {
    border-radius: 20px;
  }

  .hero-copy {
    padding: 24px;
  }
}
</style>
