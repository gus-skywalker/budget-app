<template>
  <v-container>
    <!-- Header -->
    <header class="header">
      <img src="/logo.jpg" alt="Logo" class="logo" />
      <h1>{{ $t('theWelcome.header.title') }}</h1>
    </header>

    <div class="container">
      <!-- Section 1: Financial Planning -->
      <section class="section">
        <div class="section-image">
          <img src="/actress.jpg" :alt="$t('theWelcome.section1.imageAlt')" />
        </div>
        <div class="section-content">
          <h2>{{ $t('theWelcome.section1.title') }}</h2>
          <p>{{ $t('theWelcome.section1.p1') }}</p>
          <p>{{ $t('theWelcome.section1.p2') }}</p>
        </div>
      </section>

      <section class="ai-highlight">
        <p class="tag">{{ $t('theWelcome.ai.tag') }}</p>
        <h2>{{ $t('theWelcome.ai.title') }}</h2>
        <p>{{ $t('theWelcome.ai.desc') }}</p>
        <div class="ai-grid">
          <article>
            <h3>{{ $t('theWelcome.ai.features.forecast.title') }}</h3>
            <p>{{ $t('theWelcome.ai.features.forecast.desc') }}</p>
          </article>
          <article>
            <h3>{{ $t('theWelcome.ai.features.anomaly.title') }}</h3>
            <p>{{ $t('theWelcome.ai.features.anomaly.desc') }}</p>
          </article>
          <article>
            <h3>{{ $t('theWelcome.ai.features.savings.title') }}</h3>
            <p>{{ $t('theWelcome.ai.features.savings.desc') }}</p>
          </article>
          <article>
            <h3>{{ $t('theWelcome.ai.features.autocategorize.title') }}</h3>
            <p>{{ $t('theWelcome.ai.features.autocategorize.desc') }}</p>
          </article>
        </div>
      </section>

      <!-- Section 2: Control and Management -->
      <section class="section">
        <div class="section-image">
          <img src="/controle_gestao.jpg" :alt="$t('theWelcome.section2.imageAlt')" />
        </div>
        <div class="section-content">
          <h2>{{ $t('theWelcome.section2.title') }}</h2>
          <p>{{ $t('theWelcome.section2.p1') }}</p>
          <p>{{ $t('theWelcome.section2.p2') }}</p>
        </div>
      </section>

      <!-- Section 3: Security and Protection -->
      <section class="section">
        <div class="section-image">
          <img src="/seguranca.jpg" :alt="$t('theWelcome.section3.imageAlt')" />
        </div>
        <div class="section-content">
          <h2>{{ $t('theWelcome.section3.title') }}</h2>
          <p>{{ $t('theWelcome.section3.p1') }}</p>
          <p>{{ $t('theWelcome.section3.p2') }}</p>
        </div>
      </section>

      <!-- Section 4: Advantages -->
      <section class="section">
        <div class="section-image">
          <img src="/vantagens.jpg" :alt="$t('theWelcome.section4.imageAlt')" />
        </div>
        <div class="section-content">
          <h2>{{ $t('theWelcome.section4.title') }}</h2>
          <p>{{ $t('theWelcome.section4.p1') }}</p>
          <p>{{ $t('theWelcome.section4.p2') }}</p>
        </div>
      </section>

      <!-- Section 5: Support and Help -->
      <section class="section">
        <div class="section-image">
          <img src="/suporte.jpg" :alt="$t('theWelcome.section5.imageAlt')" />
        </div>
        <div class="section-content">
          <h2>{{ $t('theWelcome.section5.title') }}</h2>
          <p>{{ $t('theWelcome.section5.p1') }}</p>
          <p>{{ $t('theWelcome.section5.p2') }}</p>
        </div>
      </section>
    </div>
  </v-container>
</template>

<style>
.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

.header {
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
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

.ai-highlight {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 50px;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.08);
}

.ai-highlight .tag {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.85rem;
  font-weight: 600;
  color: #7c3aed;
}

.ai-highlight h2 {
  font-size: 2.2rem;
  margin: 10px 0 15px;
  color: #0f172a;
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.ai-grid article {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(124, 58, 237, 0.15);
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.05);
}

.ai-grid h3 {
  margin-bottom: 8px;
  color: #1e1b4b;
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
  gap: 20px;
}

.section-image {
  flex: 1 1 320px;
  margin: 10px;
  display: flex;
  justify-content: center;
}

.section-image img {
  width: 100%;
  max-width: 800px;
  height: auto;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.15);
}

.section-content {
  flex: 1 1 360px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
  gap: 10px;
}

.section-content h2 {
  margin-top: 0;
}

.section-content p {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .section {
    flex-direction: column;
    text-align: center;
  }

  .ai-highlight {
    padding: 30px 20px;
  }

  .ai-grid {
    grid-template-columns: 1fr;
  }

  .section-image,
  .section-content {
    width: 100%;
    align-items: center;
  }

  .section-content {
    text-align: center;
  }

  .section-image img {
    max-width: 90vw;
  }
}
</style>
