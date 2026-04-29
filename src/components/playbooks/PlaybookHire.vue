<template>
  <div class="playbook-hire">
    <v-container class="playbook-shell">
      <section class="playbook-hero">
        <div class="playbook-hero__copy">
          <v-chip size="small" color="error" variant="tonal" class="playbook-badge">
            Decisao critica
          </v-chip>
          <h1 class="playbook-title">Posso contratar agora?</h1>
          <p class="playbook-subtitle">
            Entenda o impacto real de uma nova contratacao antes de tomar a decisao.
          </p>
        </div>

        <v-card class="playbook-summary" rounded="xl" elevation="0">
          <v-card-text>
            <span class="playbook-summary__eyebrow">Decisao orientada por caixa</span>
            <strong
              >Contratar so faz sentido quando o caixa suporta o custo fixo com margem.</strong
            >
          </v-card-text>
        </v-card>
      </section>

      <section class="playbook-section">
        <div class="section-heading">
          <span class="section-kicker">Contexto</span>
          <h2>Quando essa decisao aparece</h2>
        </div>
        <p class="section-copy">
          Esse momento aparece quando a operacao esta crescendo, a equipe esta sobrecarregada ou
          existe uma oportunidade clara de acelerar entrega, vendas ou atendimento.
        </p>
      </section>

      <section class="playbook-section">
        <div class="section-heading">
          <span class="section-kicker">Enquadramento</span>
          <h2>A pergunta real nao e sobre vontade. E sobre sustentabilidade.</h2>
        </div>
        <p class="section-copy">
          A contratacao adiciona custo recorrente, onboarding e mais dependencia do fluxo de caixa.
          O ponto central e saber se a empresa continua saudavel mesmo com essa nova pressao mensal.
        </p>
      </section>

      <section class="playbook-section">
        <div class="section-heading">
          <span class="section-kicker">Impacto financeiro</span>
          <h2>O que muda quando voce contrata</h2>
        </div>

        <v-row class="impact-grid" dense>
          <v-col v-for="item in impactCards" :key="item.title" cols="12" md="4">
            <v-card class="impact-card" rounded="xl" elevation="0" height="100%">
              <v-card-text>
                <div class="impact-card__icon">{{ item.icon }}</div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <v-row class="decision-columns" dense>
        <v-col cols="12" md="6">
          <v-card class="decision-card decision-card--positive" rounded="xl" elevation="0">
            <v-card-text>
              <span class="section-kicker">Faz sentido quando</span>
              <h2>Existem sinais concretos de que o caixa aguenta.</h2>
              <ul class="decision-list">
                <li v-for="item in makesSenseItems" :key="item">{{ item }}</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="decision-card decision-card--warning" rounded="xl" elevation="0">
            <v-card-text>
              <span class="section-kicker">Nao faz sentido quando</span>
              <h2>O time esta tentando resolver incerteza com aumento de custo.</h2>
              <ul class="decision-list">
                <li v-for="item in doesNotMakeSenseItems" :key="item">{{ item }}</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <section class="playbook-section playbook-section--transition">
        <div class="section-heading">
          <span class="section-kicker">Transicao</span>
          <h2>Nao decida no feeling</h2>
        </div>
        <p class="section-copy">
          Simule a contratacao antes de aprovar. Compare o custo mensal, o impacto no caixa e a
          folga necessaria para sustentar a nova estrutura.
        </p>
      </section>

      <div class="playbook-cta">
        <v-card class="playbook-cta__card" rounded="xl" elevation="0">
          <v-card-text class="playbook-cta__content">
            <div>
              <span class="section-kicker">Proximo passo</span>
              <h2>Criar o cenario antes de decidir reduz improviso.</h2>
            </div>
            <v-btn color="primary" size="large" class="playbook-cta__button" @click="goToScenario">
              Criar cenario de contratacao
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const impactCards = [
  {
    icon: '💸',
    title: 'Custo fixo aumenta',
    description:
      'Salario, encargos, ferramentas e adaptacao entram como compromissos recorrentes no mes.'
  },
  {
    icon: '📉',
    title: 'Pressao no caixa',
    description:
      'Mesmo com boa expectativa de retorno, o caixa sente a contratacao antes de capturar resultado.'
  },
  {
    icon: '📈',
    title: 'Potencial de crescimento',
    description:
      'A nova capacidade pode acelerar receita, entrega ou retencao, se houver demanda real.'
  }
]

const makesSenseItems = [
  'Existe demanda clara que a equipe atual nao consegue absorver sem perder qualidade.',
  'O caixa suporta o aumento de custo por varios meses, mesmo sem retorno imediato.',
  'A contratacao destrava uma alavanca importante de receita, operacao ou retencao.',
  'Voce consegue simular o impacto e ainda manter margem de seguranca.'
]

const doesNotMakeSenseItems = [
  'O caixa ja esta apertado e depende de um mes excepcional para fechar bem.',
  'A contratacao esta sendo usada para compensar falta de processo ou prioridade.',
  'Ainda nao existe clareza sobre funcao, entregas ou retorno esperado.',
  'O negocio perde flexibilidade financeira demais se a pessoa entrar agora.'
]

function goToScenario() {
  void router.push('/planning/scenarios/new?template=hire')
}
</script>

<style scoped>
.playbook-hire {
  min-height: 100%;
}

.playbook-shell {
  max-width: 1120px;
  padding-top: 32px;
  padding-bottom: 88px;
}

.playbook-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  gap: 20px;
  align-items: stretch;
  margin-bottom: 28px;
}

.playbook-hero__copy,
.playbook-summary,
.impact-card,
.decision-card,
.playbook-cta__card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
}

.playbook-hero__copy {
  border-radius: 28px;
  padding: 28px;
  background: linear-gradient(145deg, rgba(79, 70, 229, 0.08), rgba(255, 255, 255, 0.96));
}

.playbook-badge {
  margin-bottom: 14px;
  font-weight: 700;
}

.playbook-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
}

.playbook-subtitle {
  margin: 16px 0 0;
  font-size: 1.05rem;
  line-height: 1.65;
  color: #475569;
  max-width: 48rem;
}

.playbook-summary {
  border-radius: 28px;
  padding: 8px;
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 1));
}

.playbook-summary__eyebrow,
.section-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 6px 12px;
  background: rgba(79, 70, 229, 0.08);
  color: #4338ca;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.playbook-summary strong {
  display: block;
  margin-top: 16px;
  font-size: 1.2rem;
  line-height: 1.45;
  color: #0f172a;
}

.playbook-section {
  margin-bottom: 28px;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.section-heading h2 {
  margin: 0;
  font-size: clamp(1.45rem, 3vw, 2.3rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: #0f172a;
}

.section-copy {
  margin: 0;
  max-width: 52rem;
  font-size: 1rem;
  line-height: 1.7;
  color: #475569;
}

.impact-grid {
  margin-top: 6px;
}

.impact-card {
  border-radius: 24px;
}

.impact-card__icon {
  font-size: 1.7rem;
  margin-bottom: 14px;
}

.impact-card h3,
.decision-card h2,
.playbook-cta__content h2 {
  margin: 0 0 10px;
  font-size: 1.15rem;
  line-height: 1.35;
  color: #0f172a;
}

.impact-card p {
  margin: 0;
  line-height: 1.6;
  color: #475569;
}

.decision-columns {
  margin-bottom: 28px;
}

.decision-card {
  border-radius: 24px;
  height: 100%;
}

.decision-card--positive {
  background: linear-gradient(180deg, rgba(236, 253, 245, 0.92), rgba(255, 255, 255, 1));
}

.decision-card--warning {
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.92), rgba(255, 255, 255, 1));
}

.decision-list {
  margin: 16px 0 0;
  padding-left: 18px;
  color: #334155;
}

.decision-list li {
  margin-bottom: 10px;
  line-height: 1.6;
}

.playbook-section--transition {
  border-radius: 24px;
  padding: 24px;
  background: rgba(248, 250, 252, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.playbook-cta {
  position: sticky;
  bottom: 16px;
  z-index: 3;
}

.playbook-cta__card {
  border-radius: 26px;
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
}

.playbook-cta__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 22px;
}

.playbook-cta__button {
  flex: 0 0 auto;
  font-weight: 700;
}

.v-theme--dark .playbook-hero__copy,
.v-theme--dark .playbook-summary,
.v-theme--dark .impact-card,
.v-theme--dark .decision-card,
.v-theme--dark .playbook-cta__card,
.v-theme--dark .playbook-section--transition {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(148, 163, 184, 0.14);
}

.v-theme--dark .playbook-title,
.v-theme--dark .playbook-summary strong,
.v-theme--dark .section-heading h2,
.v-theme--dark .impact-card h3,
.v-theme--dark .decision-card h2,
.v-theme--dark .playbook-cta__content h2 {
  color: #f8fafc;
}

.v-theme--dark .playbook-subtitle,
.v-theme--dark .section-copy,
.v-theme--dark .impact-card p,
.v-theme--dark .decision-list {
  color: #cbd5e1;
}

@media (max-width: 960px) {
  .playbook-hero {
    grid-template-columns: 1fr;
  }

  .playbook-cta__content {
    flex-direction: column;
    align-items: stretch;
  }

  .playbook-cta__button {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .playbook-shell {
    padding-top: 20px;
    padding-bottom: 72px;
  }

  .playbook-hero__copy,
  .playbook-summary,
  .playbook-section--transition {
    padding: 20px;
  }

  .playbook-cta {
    bottom: 8px;
  }

  .playbook-cta__content {
    padding: 18px;
  }
}
</style>
