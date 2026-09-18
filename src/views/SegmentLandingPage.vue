<template>
  <v-container fluid class="segment-page" :class="`segment-page--${segment}`">
    <header class="segment-header">
      <div class="segment-shell segment-header__inner">
        <button class="segment-brand" type="button" @click="goHome">
          <img src="/logo.jpg" alt="CoBudget" />
          <span>CoBudget</span>
        </button>

        <div class="segment-header__actions">
          <button class="segment-link" type="button" @click="goHome">Conhecer o CoBudget</button>
          <button class="segment-login" type="button" @click="$router.push({ name: 'login' })">Entrar</button>
        </div>
      </div>
    </header>

    <main>
      <section class="segment-hero">
        <div class="segment-shell segment-hero__grid">
          <div class="segment-hero__copy">
            <span class="segment-eyebrow"><v-icon size="16">{{ content.icon }}</v-icon>{{ content.eyebrow }}</span>
            <h1>{{ content.title }}</h1>
            <p class="segment-hero__subtitle">{{ content.subtitle }}</p>

            <div class="segment-hero__actions">
              <button class="segment-button segment-button--primary" type="button" @click="goToPlans">
                {{ content.primaryCta }}
                <v-icon size="18">mdi-arrow-right</v-icon>
              </button>
              <button class="segment-button segment-button--quiet" type="button" @click="scrollTo('how-it-works')">
                Como funciona
              </button>
            </div>

            <p class="segment-hero__note">{{ content.note }}</p>
          </div>

          <div class="decision-window" aria-hidden="true">
            <div class="decision-window__top">
              <div class="decision-window__people">
                <span v-for="initial in content.initials" :key="initial">{{ initial }}</span>
              </div>
              <span class="decision-window__status">Impacto visível</span>
            </div>
            <div class="decision-window__question">{{ content.previewQuestion }}</div>
            <div class="decision-window__answer">
              <v-icon size="22">{{ content.previewIcon }}</v-icon>
              <div>
                <strong>{{ content.previewAnswer }}</strong>
                <span>{{ content.previewDetail }}</span>
              </div>
            </div>
            <div class="decision-window__line"></div>
            <div class="decision-window__footer">
              <span>Antes da decisão</span>
              <strong>{{ content.previewFooter }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="segment-tension">
        <div class="segment-shell">
          <div class="segment-section-heading">
            <span>{{ content.tensionEyebrow }}</span>
            <h2>{{ content.tensionTitle }}</h2>
          </div>
          <div class="tension-grid">
            <article v-for="item in content.tensions" :key="item.title" class="tension-card">
              <v-icon size="22">{{ item.icon }}</v-icon>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="how-it-works" class="segment-method">
        <div class="segment-shell segment-method__grid">
          <div>
            <span class="segment-eyebrow"><v-icon size="16">mdi-compass-outline</v-icon>Decidir com contexto</span>
            <h2>{{ content.methodTitle }}</h2>
            <p>{{ content.methodSubtitle }}</p>
          </div>
          <ol class="method-list">
            <li v-for="(step, index) in content.steps" :key="step.title">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section class="segment-outcomes">
        <div class="segment-shell">
          <div class="segment-section-heading segment-section-heading--center">
            <span>{{ content.outcomesEyebrow }}</span>
            <h2>{{ content.outcomesTitle }}</h2>
          </div>
          <div class="outcome-grid">
            <article v-for="item in content.outcomes" :key="item.title" class="outcome-card">
              <div class="outcome-card__icon"><v-icon size="22">{{ item.icon }}</v-icon></div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="segment-close">
        <div class="segment-shell segment-close__inner">
          <span>{{ content.closeEyebrow }}</span>
          <h2>{{ content.closeTitle }}</h2>
          <p>{{ content.closeDescription }}</p>
          <button class="segment-button segment-button--primary" type="button" @click="goToPlans">
            {{ content.closeCta }}
            <v-icon size="18">mdi-arrow-right</v-icon>
          </button>
          <small>{{ content.closeNote }}</small>
        </div>
      </section>
    </main>
  </v-container>
</template>

<script>
const SEGMENT_CONTENT = {
  casa: {
    icon: 'mdi-home-heart',
    eyebrow: 'CoBudget Casa',
    title: 'Planejem a vida juntos sem perder autonomia.',
    subtitle: 'Contas, metas e próximos passos ficam visíveis para quem divide a vida — antes que uma conversa sobre dinheiro vire tensão ou improviso.',
    primaryCta: 'Conhecer o Starter Casa',
    note: 'Para parceiros, famílias e pessoas que querem decidir em conjunto sem abrir mão do próprio contexto.',
    initials: ['M', 'L', '+'],
    previewQuestion: '“A mudança ainda cabe no nosso plano?”',
    previewIcon: 'mdi-check-circle-outline',
    previewAnswer: 'Cabe — com ajuste de R$ 420/mês.',
    previewDetail: 'Vocês veem o impacto antes de assinar.',
    previewFooter: 'Decisão compartilhada',
    tensionEyebrow: 'Dinheiro não deveria ser um ponto cego',
    tensionTitle: 'Quando a vida é compartilhada, a decisão também precisa ser.',
    tensions: [
      { icon: 'mdi-eye-off-outline', title: 'Cada pessoa vê só uma parte', description: 'Contas, planos e compromissos se espalham; a conversa começa sem o cenário inteiro.' },
      { icon: 'mdi-message-alert-outline', title: 'A conversa chega tarde demais', description: 'A compra, a viagem ou a mudança viram discussão quando o impacto já está contratado.' },
      { icon: 'mdi-chart-timeline-variant-shimmer', title: 'O futuro vira chute', description: 'Sem testar cenários, é difícil saber o que cabe hoje e o que compromete os próximos meses.' }
    ],
    methodTitle: 'Transforme “será que dá?” em uma decisão que os dois entendem.',
    methodSubtitle: 'O CoBudget não toma o lugar da conversa. Ele dá contexto para ela ser mais justa, mais calma e mais objetiva.',
    steps: [
      { title: 'Reúnam a realidade', description: 'Contas, despesas, metas e compromissos em um espaço compartilhado.' },
      { title: 'Testem o próximo passo', description: 'Simulem uma mudança, uma viagem, um filho ou uma nova meta antes de assumir o impacto.' },
      { title: 'Decidam com clareza', description: 'Registrem a escolha com o contexto que levou até ela — sem depender da memória de ninguém.' }
    ],
    outcomesEyebrow: 'Para a vida que vocês querem construir',
    outcomesTitle: 'Mais autonomia individual. Mais clareza em conjunto.',
    outcomes: [
      { icon: 'mdi-account-heart-outline', title: 'Cada pessoa mantém seu contexto', description: 'Compartilhem o que é da vida em comum sem apagar a autonomia de cada um.' },
      { icon: 'mdi-target-arrow', title: 'Metas deixam de ser desejo', description: 'Enxerguem o que muda no caminho até a casa, a viagem ou a tranquilidade que querem ter.' },
      { icon: 'mdi-weather-sunset-up', title: 'O próximo passo não pega ninguém de surpresa', description: 'Cenários transformam ansiedade sobre dinheiro em uma escolha visível.' }
    ],
    closeEyebrow: 'Starter Casa · R$ 39,90 por mês',
    closeTitle: 'Construam o próximo capítulo com o mesmo contexto.',
    closeDescription: 'Escolham o Starter Casa para trazer contas, metas e decisões para o mesmo lugar.',
    closeCta: 'Ver o Starter Casa',
    closeNote: 'Você será levado aos planos com Casa em destaque.'
  },
  negocio: {
    icon: 'mdi-chart-timeline-variant',
    eyebrow: 'CoBudget Team',
    title: 'Não decida o futuro da empresa pelo saldo de hoje.',
    subtitle: 'Dê a sócios e líderes clareza sobre caixa, margem e impacto antes de cada contratação, investimento ou compromisso que muda o rumo do negócio.',
    primaryCta: 'Conhecer o Team',
    note: 'Para sócios, founders e times que precisam proteger caixa e transformar informação financeira em decisão.',
    initials: ['A', 'R', 'C'],
    previewQuestion: '“Se contratarmos agora, onde o caixa aperta?”',
    previewIcon: 'mdi-alert-circle-outline',
    previewAnswer: 'Risco de caixa em novembro.',
    previewDetail: 'O cenário aparece antes do compromisso.',
    previewFooter: 'Decisão com responsabilidade',
    tensionEyebrow: 'O saldo de hoje não conta a história inteira',
    tensionTitle: 'Crescer sem contexto é trocar velocidade por risco.',
    tensions: [
      { icon: 'mdi-bank-transfer-out', title: 'Caixa parece bem até não parecer', description: 'O saldo atual não mostra o efeito acumulado de compromissos, prazo e crescimento.' },
      { icon: 'mdi-account-question-outline', title: 'Sócios decidem com versões diferentes', description: 'Sem uma visão comum, a reunião vira disputa de memória em vez de decisão de negócio.' },
      { icon: 'mdi-fire-alert', title: 'A urgência consome a margem', description: 'O problema fica visível tarde; então a empresa reage quando já perdeu opções.' }
    ],
    methodTitle: 'Troque a reação pela capacidade de ver o impacto antes.',
    methodSubtitle: 'O Team conecta a realidade financeira, as hipóteses e a decisão — para que quem assume o risco enxergue a mesma coisa.',
    steps: [
      { title: 'Apurem o que está acontecendo', description: 'Organizem caixa, resultados e contexto financeiro em uma leitura que o time compartilha.' },
      { title: 'Modelem a decisão', description: 'Testem contratação, investimento, preço ou prazo contra os cenários que a empresa pode viver.' },
      { title: 'Protejam a próxima escolha', description: 'Tomem a decisão com histórico, responsabilidades e impacto financeiro explícito.' }
    ],
    outcomesEyebrow: 'Para negócios que precisam durar',
    outcomesTitle: 'Mais contexto antes do risco. Mais margem para crescer.',
    outcomes: [
      { icon: 'mdi-cash-multiple', title: 'Caixa deixa de ser surpresa', description: 'Acompanhem o que o negócio pode sustentar, não apenas o que tem hoje na conta.' },
      { icon: 'mdi-scale-balance', title: 'Decisões ganham dono e fundamento', description: 'Sócios e líderes partem da mesma leitura antes de comprometer tempo, caixa ou margem.' },
      { icon: 'mdi-chart-line', title: 'Lucro vira uma escolha possível', description: 'Identifiquem risco e oportunidade cedo o bastante para ajustar a rota.' }
    ],
    closeEyebrow: 'Team · R$ 149,00 por mês',
    closeTitle: 'Não espere a urgência explicar o que o cenário já poderia mostrar.',
    closeDescription: 'Escolham o Team para conectar apuração, caixa, cenários e as decisões que definem o negócio.',
    closeCta: 'Ver o Team',
    closeNote: 'Você será levado aos planos com Team em destaque.'
  }
}

export default {
  name: 'SegmentLandingPage',
  props: {
    segment: {
      type: String,
      required: true,
      validator: value => ['casa', 'negocio'].includes(value)
    }
  },
  computed: {
    content() {
      return SEGMENT_CONTENT[this.segment]
    }
  },
  mounted() {
    document.title = `${this.content.eyebrow} | CoBudget`
  },
  methods: {
    scrollTo(id) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    goHome() {
      this.$router.push({ name: 'landing' })
    },
    goToPlans() {
      this.$router.push({
        name: 'choose-plan',
        query: {
          ...this.$route.query,
          segment: this.segment
        }
      })
    }
  }
}
</script>

<style scoped>
.segment-page {
  --segment-ink: #17243b;
  --segment-muted: #536078;
  --segment-paper: #fffdf9;
  --segment-line: rgba(23, 36, 59, 0.12);
  --segment-accent: #c95e22;
  --segment-accent-deep: #9b3e12;
  min-height: 100vh;
  color: var(--segment-ink);
  background: var(--segment-paper);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.segment-page--negocio {
  --segment-accent: #147d76;
  --segment-accent-deep: #075851;
}

.segment-shell { width: min(1160px, calc(100% - 48px)); margin: 0 auto; }

.segment-header { border-bottom: 1px solid var(--segment-line); background: rgba(255, 253, 249, 0.88); backdrop-filter: blur(14px); position: sticky; top: 0; z-index: 10; }
.segment-header__inner { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.segment-brand { align-items: center; background: transparent; border: 0; color: var(--segment-ink); cursor: pointer; display: flex; font-size: 1.06rem; font-weight: 800; gap: 10px; padding: 0; }
.segment-brand img { border-radius: 9px; height: 34px; object-fit: cover; width: 34px; }
.segment-header__actions { align-items: center; display: flex; gap: 18px; }
.segment-link, .segment-login { background: transparent; border: 0; color: var(--segment-muted); cursor: pointer; font-size: .9rem; font-weight: 650; padding: 8px 0; }
.segment-login { color: var(--segment-ink); }

.segment-hero { background: radial-gradient(circle at 90% 8%, color-mix(in srgb, var(--segment-accent) 16%, transparent), transparent 33%), linear-gradient(155deg, #fffdf9 0%, #fbf4ec 100%); overflow: hidden; padding: 92px 0 84px; }
.segment-page--negocio .segment-hero { background: radial-gradient(circle at 90% 8%, rgba(20, 125, 118, .18), transparent 33%), linear-gradient(155deg, #f9fdfc 0%, #eef8f6 100%); }
.segment-hero__grid { align-items: center; display: grid; gap: 68px; grid-template-columns: minmax(0, 1.07fr) minmax(360px, .93fr); }
.segment-eyebrow { align-items: center; color: var(--segment-accent-deep); display: inline-flex; font-size: .76rem; font-weight: 800; gap: 7px; letter-spacing: .12em; text-transform: uppercase; }
.segment-hero h1 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(3rem, 5.5vw, 5.5rem); letter-spacing: -.065em; line-height: .96; margin: 18px 0 24px; max-width: 720px; }
.segment-hero__subtitle { color: var(--segment-muted); font-size: clamp(1.08rem, 1.6vw, 1.3rem); line-height: 1.6; margin: 0; max-width: 665px; }
.segment-hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
.segment-button { align-items: center; border-radius: 999px; border: 1px solid transparent; cursor: pointer; display: inline-flex; font-size: .96rem; font-weight: 750; gap: 9px; justify-content: center; padding: 14px 21px; transition: transform .2s ease, box-shadow .2s ease; }
.segment-button:hover { transform: translateY(-2px); }
.segment-button--primary { background: var(--segment-accent); box-shadow: 0 12px 22px color-mix(in srgb, var(--segment-accent) 24%, transparent); color: white; }
.segment-button--quiet { background: transparent; border-color: var(--segment-line); color: var(--segment-ink); }
.segment-hero__note { color: var(--segment-muted); font-size: .82rem; line-height: 1.55; margin: 18px 0 0; max-width: 550px; }

.decision-window { background: #17243b; border: 1px solid rgba(255,255,255,.1); border-radius: 27px; box-shadow: 0 28px 68px rgba(23,36,59,.24); color: #f8fbff; padding: 25px; position: relative; transform: rotate(2deg); }
.segment-page--negocio .decision-window { background: #123d40; }
.decision-window::before { background: var(--segment-accent); border-radius: 999px; content: ''; filter: blur(35px); height: 130px; opacity: .33; position: absolute; right: -35px; top: -26px; width: 130px; }
.decision-window__top, .decision-window__footer { align-items: center; display: flex; justify-content: space-between; position: relative; }
.decision-window__people { display: flex; }
.decision-window__people span { align-items: center; background: #e8b184; border: 2px solid #17243b; border-radius: 50%; color: #42220d; display: inline-flex; font-size: .73rem; font-weight: 850; height: 31px; justify-content: center; margin-right: -7px; width: 31px; }
.segment-page--negocio .decision-window__people span { border-color: #123d40; }
.decision-window__people span:nth-child(2) { background: #b6d3ce; color: #164440; }
.decision-window__people span:nth-child(3) { background: #f7eadc; color: #59412e; }
.decision-window__status { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.12); border-radius: 999px; color: #e2ecee; font-size: .69rem; font-weight: 700; padding: 7px 9px; }
.decision-window__question { font-family: Georgia, "Times New Roman", serif; font-size: clamp(1.65rem, 2.3vw, 2.2rem); letter-spacing: -.035em; line-height: 1.1; margin: 58px 0 26px; max-width: 380px; position: relative; }
.decision-window__answer { align-items: flex-start; background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.12); border-radius: 17px; display: flex; gap: 13px; padding: 17px; position: relative; }
.decision-window__answer .v-icon { color: #f2bb5c; }
.decision-window__answer strong, .decision-window__answer span { display: block; }
.decision-window__answer strong { font-size: .98rem; }
.decision-window__answer span { color: #c5d0d8; font-size: .8rem; line-height: 1.45; margin-top: 5px; }
.decision-window__line { border-top: 1px solid rgba(255,255,255,.14); margin: 28px 0 15px; }
.decision-window__footer { color: #c5d0d8; font-size: .78rem; }
.decision-window__footer strong { color: #fff; font-size: .78rem; }

.segment-tension, .segment-outcomes { padding: 108px 0; }
.segment-section-heading { max-width: 700px; }
.segment-section-heading > span, .segment-close > span { color: var(--segment-accent-deep); font-size: .74rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.segment-section-heading h2, .segment-method h2, .segment-close h2 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(2.35rem, 4vw, 4rem); letter-spacing: -.055em; line-height: 1.03; margin: 14px 0 0; }
.tension-grid { display: grid; gap: 18px; grid-template-columns: repeat(3, 1fr); margin-top: 42px; }
.tension-card { border-top: 2px solid var(--segment-accent); padding: 23px 8px 8px 0; }
.tension-card .v-icon { color: var(--segment-accent-deep); }
.tension-card h3 { font-size: 1.08rem; letter-spacing: -.025em; margin: 18px 0 10px; }
.tension-card p, .segment-method p, .outcome-card p, .segment-close p { color: var(--segment-muted); font-size: .97rem; line-height: 1.62; margin: 0; }

.segment-method { background: #17243b; color: #fff; padding: 96px 0; }
.segment-page--negocio .segment-method { background: #123d40; }
.segment-method__grid { align-items: start; display: grid; gap: 70px; grid-template-columns: .88fr 1.12fr; }
.segment-method .segment-eyebrow { color: #f5c080; }
.segment-method p { color: #c2cbd7; margin-top: 20px; max-width: 460px; }
.method-list { border-top: 1px solid rgba(255,255,255,.2); list-style: none; margin: 0; padding: 0; }
.method-list li { border-bottom: 1px solid rgba(255,255,255,.2); display: grid; gap: 20px; grid-template-columns: 48px 1fr; padding: 23px 0; }
.method-list > li > span { color: #f5c080; font-size: .79rem; font-weight: 850; letter-spacing: .1em; padding-top: 4px; }
.method-list h3 { font-size: 1.13rem; letter-spacing: -.02em; margin: 0 0 7px; }
.method-list p { color: #c2cbd7; font-size: .9rem; margin: 0; }

.segment-outcomes { background: #f8f3ec; }
.segment-page--negocio .segment-outcomes { background: #eff8f6; }
.segment-section-heading--center { margin: 0 auto; text-align: center; }
.outcome-grid { display: grid; gap: 18px; grid-template-columns: repeat(3, 1fr); margin-top: 42px; }
.outcome-card { background: rgba(255,255,255,.76); border: 1px solid rgba(23,36,59,.08); border-radius: 18px; padding: 25px; }
.outcome-card__icon { align-items: center; background: color-mix(in srgb, var(--segment-accent) 13%, white); border-radius: 12px; color: var(--segment-accent-deep); display: flex; height: 43px; justify-content: center; width: 43px; }
.outcome-card h3 { font-size: 1.08rem; letter-spacing: -.025em; margin: 21px 0 9px; }

.segment-close { background: var(--segment-paper); padding: 112px 0; text-align: center; }
.segment-close__inner { align-items: center; display: flex; flex-direction: column; max-width: 760px; }
.segment-close h2 { margin-top: 14px; }
.segment-close p { margin: 20px auto 28px; max-width: 620px; }
.segment-close small { color: var(--segment-muted); font-size: .78rem; margin-top: 15px; }

@media (max-width: 860px) {
  .segment-hero { padding: 66px 0; }
  .segment-hero__grid, .segment-method__grid { grid-template-columns: 1fr; }
  .segment-hero__grid { gap: 48px; }
  .decision-window { margin: 0 auto; max-width: 530px; transform: none; width: 100%; }
  .segment-method__grid { gap: 42px; }
}
@media (max-width: 640px) {
  .segment-shell { width: min(100% - 32px, 1160px); }
  .segment-link { display: none; }
  .segment-header__inner { min-height: 65px; }
  .segment-hero h1 { font-size: 3rem; }
  .segment-tension, .segment-outcomes, .segment-close { padding: 74px 0; }
  .segment-method { padding: 72px 0; }
  .tension-grid, .outcome-grid { grid-template-columns: 1fr; }
  .tension-grid { gap: 9px; margin-top: 31px; }
  .outcome-grid { margin-top: 31px; }
  .segment-hero__actions .segment-button { width: 100%; }
  .decision-window__question { margin-top: 42px; }
}
</style>
