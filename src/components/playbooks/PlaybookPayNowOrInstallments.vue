<template>
  <div class="playbook-payment">
    <v-container class="playbook-shell">
      <section class="playbook-hero">
        <div class="playbook-hero__copy">
          <v-chip size="small" color="warning" variant="tonal" class="playbook-badge">
            Decisao sensivel
          </v-chip>
          <h1 class="playbook-title">Vale parcelar ou pagar agora?</h1>
          <p class="playbook-subtitle">
            Compare custo, previsibilidade e impacto no caixa antes de decidir como quitar.
          </p>
        </div>

        <v-card class="playbook-summary" rounded="xl" elevation="0">
          <v-card-text>
            <span class="playbook-summary__eyebrow">Trade-off real</span>
            <strong>Pagar barato agora nem sempre e melhor se isso estrangula o caixa.</strong>
          </v-card-text>
        </v-card>
      </section>

      <section class="playbook-section">
        <div class="section-heading">
          <span class="section-kicker">Contexto</span>
          <h2>Quando essa decisao aparece</h2>
        </div>
        <p class="section-copy">
          Esse tipo de decisao surge quando existe uma conta relevante, uma fatura, uma compra maior
          ou uma renegociacao e voce precisa escolher entre sair do caixa agora ou ganhar prazo.
        </p>
      </section>

      <section class="playbook-section">
        <div class="section-heading">
          <span class="section-kicker">Enquadramento</span>
          <h2>A pergunta certa e sobre custo total com seguranca de caixa.</h2>
        </div>
        <p class="section-copy">
          Parcelar pode proteger liquidez, mas adiciona juros e alonga compromisso. Pagar agora pode
          ser mais barato, mas reduzir demais sua margem operacional nas proximas semanas.
        </p>
      </section>

      <section class="playbook-section">
        <div class="section-heading">
          <span class="section-kicker">Impacto financeiro</span>
          <h2>O que voce precisa comparar</h2>
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
              <span class="section-kicker">Faz sentido parcelar quando</span>
              <h2>Preservar liquidez vale mais do que o desconto imediato.</h2>
              <ul class="decision-list">
                <li v-for="item in makesSenseItems" :key="item">{{ item }}</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="decision-card decision-card--warning" rounded="xl" elevation="0">
            <v-card-text>
              <span class="section-kicker">Nao faz sentido parcelar quando</span>
              <h2>O prazo so mascara um custo ruim ou uma decisao precipitada.</h2>
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
          <h2>Nao escolha so pelo valor da parcela</h2>
        </div>
        <p class="section-copy">
          Simule pagar agora, parcelar e outras alternativas. O melhor caminho combina custo total,
          previsibilidade e capacidade real de manter o caixa saudavel.
        </p>
      </section>

      <div class="playbook-cta">
        <v-card class="playbook-cta__card" rounded="xl" elevation="0">
          <v-card-text class="playbook-cta__content">
            <div>
              <span class="section-kicker">Proximo passo</span>
              <h2>Compare as opcoes antes de assumir um custo que parece pequeno.</h2>
            </div>
            <v-btn color="primary" size="large" class="playbook-cta__button" @click="goToScenario">
              Criar cenario de pagamento
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
    icon: '💰',
    title: 'Custo total muda',
    description:
      'Parcelar pode aumentar bastante o valor final pago por causa de juros, taxas e prazo.'
  },
  {
    icon: '🧯',
    title: 'Caixa ganha ou perde folga',
    description:
      'Pagar agora reduz o saldo imediatamente; parcelar preserva caixa no curto prazo, mas cria pressao recorrente.'
  },
  {
    icon: '📊',
    title: 'Previsibilidade importa',
    description:
      'A decisao boa nao e so a mais barata: e a que combina melhor com a estabilidade da sua receita.'
  }
]

const makesSenseItems = [
  'Voce precisa preservar liquidez para operacao, folha ou compromissos mais urgentes.',
  'O parcelamento mantem previsibilidade sem comprometer demais os proximos meses.',
  'Existe incerteza de receita e segurar caixa reduz risco operacional.',
  'Mesmo parcelando, o custo extra ainda fica dentro de uma faixa aceitavel.'
]

const doesNotMakeSenseItems = [
  'Os juros tornam o parcelamento claramente pior sem oferecer alivio real no caixa.',
  'Voce consegue pagar agora e ainda manter uma boa margem de seguranca.',
  'A parcela parece pequena, mas se soma a outros compromissos fixos ja pesados.',
  'A decisao esta sendo tomada por impulso, sem comparar alternativas com clareza.'
]

function goToScenario() {
  void router.push('/planning/scenarios/debt/new?template=pay-now-or-installments')
}
</script>

<style scoped>
.playbook-payment {
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
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.08), rgba(255, 255, 255, 0.96));
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
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
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
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.92), rgba(255, 255, 255, 1));
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
