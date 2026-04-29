<template>
  <v-container
    id="blog-page"
    fluid
    :class="['blog-page', isInAppShell ? 'blog-page--app' : 'blog-page--public']"
  >
    <header v-if="!isInAppShell" class="blog-header">
      <div class="shell blog-header__shell">
        <button class="brand" type="button" @click="navigateToPath('/')">
          <img src="/logo.jpg" alt="CoBudget" class="brand-logo" />
          <span class="brand-copy">
            <strong>CoBudget</strong>
            <small>Blog</small>
          </span>
        </button>

        <nav class="blog-nav" aria-label="Blog">
          <button
            v-for="item in headerLinks"
            :key="item.id"
            type="button"
            class="blog-nav__link"
            @click="scrollToSection(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="blog-header__actions">
          <button class="btn btn-ghost" type="button" @click="navigateToPath('/login')">
            Entrar
          </button>
          <button class="btn btn-primary" type="button" @click="navigateToPath('/choose-plan')">
            Comecar
          </button>
        </div>
      </div>
    </header>

    <main>
      <section
        v-if="isInAppShell"
        id="playbooks"
        class="section-spacing section-soft section-soft--top"
      >
        <div class="shell">
          <div class="section-heading section-heading--split">
            <div>
              <span class="section-kicker">Playbooks</span>
              <h2>Fluxos guiados para decisoes importantes</h2>
            </div>
            <p>
              Nao e um blog tradicional. Aqui o conteudo existe para ajudar voce a sair da leitura e
              entrar numa simulacao ou numa decisao real.
            </p>
          </div>

          <div class="playbook-grid">
            <article v-for="item in playbookEntries" :key="item.title" class="playbook-card">
              <span class="post-card__category">{{ item.category }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div class="playbook-card__actions">
                <button class="btn btn-primary" type="button" @click="navigateToPath(item.path)">
                  Abrir playbook
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section :class="['hero', 'section-spacing', { 'hero--in-app': isInAppShell }]">
        <div class="shell hero__grid">
          <div class="hero__copy">
            <span class="eyebrow">{{
              isInAppShell ? 'Biblioteca CoBudget' : 'Inbound em construcao'
            }}</span>
            <h1>
              {{
                isInAppShell
                  ? 'Aprenda dentro do produto e avance com mais clareza nas proximas decisoes.'
                  : 'Conteudo para quem precisa tomar decisoes financeiras melhores, com menos ruído.'
              }}
            </h1>
            <p class="hero__lead">
              {{
                isInAppShell
                  ? 'Aqui o blog funciona como centro de conteudo do CoBudget: artigos, guias e playbooks para usar melhor cenarios, decisoes e rituais financeiros no dia a dia.'
                  : 'O blog do CoBudget nasce para educar, gerar demanda e mostrar como planejamento, cenarios e decisoes podem virar uma rotina mais clara para times e familias.'
              }}
            </p>

            <div class="hero__actions">
              <button
                class="btn btn-primary btn-large"
                type="button"
                @click="
                  isInAppShell ? navigateToPath('/planning/scenarios') : scrollToSection('featured')
                "
              >
                {{ isInAppShell ? 'Ir para cenarios' : 'Ler destaque' }}
              </button>
              <button
                class="btn btn-secondary btn-large"
                type="button"
                @click="isInAppShell ? navigateToPath('/decisions') : scrollToSection('posts')"
              >
                {{ isInAppShell ? 'Abrir decisoes' : 'Ver artigos' }}
              </button>
            </div>

            <div class="hero__chips">
              <span v-for="item in topicChips" :key="item" class="topic-chip">{{ item }}</span>
            </div>
          </div>

          <div class="hero__panel">
            <div class="hero__panel-card hero__panel-card--accent">
              <span class="panel-label">{{
                isInAppShell ? 'Agora no produto' : 'Serie editorial'
              }}</span>
              <strong>{{
                isInAppShell
                  ? 'Conteudo conectado ao uso do app'
                  : 'Decisoes melhores em 10 minutos'
              }}</strong>
              <p>
                {{
                  isInAppShell
                    ? 'Recomendacoes objetivas para sair da leitura e aplicar no fluxo de cenarios, decisoes e planejamento.'
                    : 'Guias praticos para transformar duvidas financeiras em proximos passos claros.'
                }}
              </p>
            </div>
            <div class="hero__panel-card">
              <span class="panel-label">Formato</span>
              <strong>{{
                isInAppShell ? 'Guias aplicados ao produto' : 'Guias, comparativos e playbooks'
              }}</strong>
              <p>
                {{
                  isInAppShell
                    ? 'Leituras curtas para orientar a proxima acao dentro da conta.'
                    : 'Conteudo curto, visual e com linguagem de produto.'
                }}
              </p>
            </div>
            <div class="hero__panel-metrics">
              <article v-for="metric in metrics" :key="metric.label" class="metric-card">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}</strong>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" class="section-spacing">
        <div class="shell">
          <div class="section-heading">
            <span class="section-kicker">{{ isInAppShell ? 'Guia recomendado' : 'Destaque' }}</span>
            <h2>
              {{
                isInAppShell
                  ? 'Um ponto de partida para usar cenarios e decisoes com mais confianca'
                  : 'O primeiro grande bloco editorial do CoBudget'
              }}
            </h2>
          </div>

          <article class="featured-story">
            <div class="featured-story__content">
              <span class="story-tag">{{ featuredPost.category }}</span>
              <h3>{{ featuredPost.title }}</h3>
              <p>{{ featuredPost.excerpt }}</p>

              <div class="featured-story__meta">
                <span>{{ featuredPost.readTime }}</span>
                <span>{{ featuredPost.audience }}</span>
              </div>

              <button class="btn btn-primary" type="button" @click="openArticle(featuredPost.slug)">
                Abrir template
              </button>
            </div>

            <div class="featured-story__rail">
              <div class="quote-card">
                <span class="quote-card__label">Angulo editorial</span>
                <p>
                  “Em vez de falar apenas sobre controle financeiro, vamos mostrar como decidir com
                  mais contexto, mais colaboracao e menos impulso.”
                </p>
              </div>

              <div class="mini-stack">
                <article v-for="item in featuredSupporting" :key="item.title" class="mini-card">
                  <span>{{ item.category }}</span>
                  <strong>{{ item.title }}</strong>
                </article>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="posts" class="section-spacing section-soft">
        <div class="shell">
          <div class="section-heading section-heading--split">
            <div>
              <span class="section-kicker">{{
                isInAppShell ? 'Leituras praticas' : 'Biblioteca inicial'
              }}</span>
              <h2>
                {{
                  isInAppShell
                    ? 'Artigos para aprofundar o uso do produto'
                    : 'Uma grade de conteudo pronta para crescer'
                }}
              </h2>
            </div>
            <p>
              {{
                isInAppShell
                  ? 'Conteudo pensado para onboarding continuo, educacao de funcionalidades e melhor tomada de decisao.'
                  : 'Pensada para SEO, educacao de produto e captacao de pessoas que ainda estao entendendo o problema.'
              }}
            </p>
          </div>

          <div class="post-grid">
            <article v-for="post in posts" :key="post.slug" class="post-card">
              <span class="post-card__category">{{ post.category }}</span>
              <h3>{{ post.title }}</h3>
              <p>{{ post.excerpt }}</p>
              <div class="post-card__meta">
                <span>{{ post.readTime }}</span>
                <span>{{ post.stage }}</span>
              </div>
              <button class="post-card__link" type="button" @click="openArticle(post.slug)">
                Abrir template
              </button>
            </article>
          </div>
        </div>
      </section>

      <section id="pillars" class="section-spacing">
        <div class="shell">
          <div class="section-heading">
            <span class="section-kicker">{{
              isInAppShell ? 'O que voce vai aprender aqui' : 'Pilares de conteudo'
            }}</span>
            <h2>
              {{
                isInAppShell
                  ? 'Os temas que mais ajudam a transformar uso em clareza'
                  : 'O que esse blog vai ensinar com consistencia'
              }}
            </h2>
          </div>

          <div class="pillar-grid">
            <article v-for="pillar in pillars" :key="pillar.title" class="pillar-card">
              <div class="pillar-card__icon">
                <v-icon size="22">{{ pillar.icon }}</v-icon>
              </div>
              <h3>{{ pillar.title }}</h3>
              <p>{{ pillar.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="newsletter" class="section-spacing">
        <div class="shell">
          <div class="newsletter-card">
            <div>
              <span class="section-kicker">{{
                isInAppShell ? 'Aprendizado continuo' : 'Captura de demanda'
              }}</span>
              <h2>
                {{
                  isInAppShell
                    ? 'Salve seu interesse para os proximos guias e novidades do produto'
                    : 'Receba os proximos artigos e playbooks do CoBudget'
                }}
              </h2>
              <p>
                {{
                  isInAppShell
                    ? 'No app, essa area pode evoluir para recomendacoes, novidades e conteudo orientado ao que a pessoa ainda nao explorou.'
                    : 'A ideia aqui e transformar a pagina de blog numa maquina simples de descoberta, recorrencia e confianca.'
                }}
              </p>
            </div>

            <form class="newsletter-form" @submit.prevent="handleNewsletterSubmit">
              <label class="sr-only" for="newsletter-email">Seu melhor e-mail</label>
              <input
                id="newsletter-email"
                v-model="newsletterEmail"
                type="email"
                placeholder="Seu melhor e-mail"
                required
              />
              <button class="btn btn-primary" type="submit" :disabled="isSubmittingNewsletter">
                {{ isSubmittingNewsletter ? 'Enviando...' : 'Quero acompanhar' }}
              </button>
              <div
                v-if="newsletterConfirmation"
                class="newsletter-confirmation"
                role="status"
                aria-live="polite"
              >
                <strong>Inscricao registrada com sucesso.</strong>
                <p>{{ newsletterSuccessMessage }}</p>
                <div class="newsletter-confirmation__meta">
                  <span><strong>E-mail:</strong> {{ newsletterConfirmation.email }}</span>
                  <span><strong>Protocolo:</strong> #{{ newsletterConfirmation.submissionId }}</span>
                  <span><strong>Origem:</strong> {{ newsletterConfirmation.originLabel }}</span>
                  <span><strong>Status:</strong> {{ newsletterConfirmation.emailDeliveryStatus }}</span>
                  <span>
                    <strong>Recebido em:</strong>
                    {{ formatSubmissionDate(newsletterConfirmation.submittedAt) }}
                  </span>
                </div>
              </div>
              <p
                v-if="newsletterErrorMessage"
                class="newsletter-feedback newsletter-feedback--error"
              >
                {{ newsletterErrorMessage }}
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  blogTemplateEntries,
  featuredBlogTemplateSlug,
  getBlogTemplateEntry
} from '@/content/blogTemplates'
import NotificationService, { type ContactSubmissionResponse } from '@/services/NotificationService'

const router = useRouter()
const route = useRoute()
const newsletterEmail = ref('')
const isSubmittingNewsletter = ref(false)
const newsletterSuccessMessage = ref('')
const newsletterErrorMessage = ref('')
const newsletterConfirmation = ref<ContactSubmissionResponse | null>(null)
const isInAppShell = computed(() => Boolean(route.meta?.requiresAuth))

const headerLinks = [
  { id: 'featured', label: 'Destaque' },
  { id: 'posts', label: 'Artigos' },
  { id: 'pillars', label: 'Pilares' },
  { id: 'newsletter', label: 'Newsletter' }
]

const topicChips = ['Planejamento', 'Cenarios', 'Decisoes', 'Fluxo de caixa', 'Familias', 'Times']

const metrics = computed(() => [
  { label: 'Temas centrais', value: '6' },
  { label: 'Artigos iniciais', value: '8' },
  {
    label: 'Objetivo',
    value: isInAppShell.value ? 'Ativacao + educacao' : 'Descoberta + confianca'
  }
])

const featuredPost = computed(
  () =>
    getBlogTemplateEntry(featuredBlogTemplateSlug) || {
      slug: 'template',
      category: 'Template',
      title: 'Template de destaque',
      excerpt: 'Defina aqui o template editorial que deve aparecer em destaque.',
      readTime: '0 min',
      stage: 'Planejamento',
      audience: 'Equipe de conteudo',
      ctaLabel: 'Abrir template',
      ctaPath: '/blog',
      heroPrompt: '',
      summaryPrompt: '',
      takeaways: [],
      sections: []
    }
)

const featuredSupporting = [
  { category: 'Cenario', title: 'Quando simular antes de decidir muda completamente o resultado' },
  {
    category: 'Metodo',
    title: 'O erro de comparar opcao barata com opcao segura como se fossem iguais'
  },
  {
    category: 'Colaboracao',
    title: 'Como alinhar uma decisao financeira sem virar reuniao infinita'
  }
]

const posts = computed(() => blogTemplateEntries)

const pillars = [
  {
    icon: 'mdi-lightbulb-on-outline',
    title: 'Decisoes antes de automacao',
    description:
      'Explicacoes praticas para quem precisa decidir melhor antes de sofisticar ferramentas.'
  },
  {
    icon: 'mdi-chart-timeline-variant',
    title: 'Cenarios que ajudam a enxergar risco',
    description: 'Conteudo que ensina a comparar caminhos e a antecipar impacto mensal com clareza.'
  },
  {
    icon: 'mdi-account-group-outline',
    title: 'Colaboracao financeira sem caos',
    description:
      'Materiais sobre alinhamento entre socios, equipes e familias ao redor da mesma decisao.'
  }
]

const playbookEntries = [
  {
    category: 'Contratacao',
    title: 'Posso contratar agora?',
    description: 'Veja se seu caixa suporta uma nova contratacao antes de decidir.',
    path: '/app/blog/playbooks/hire'
  },
  {
    category: 'Parcelamento',
    title: 'Vale parcelar ou pagar agora?',
    description: 'Compare custo, liquidez e previsibilidade antes de escolher como quitar.',
    path: '/app/blog/playbooks/pay-now-or-installments'
  }
]

function navigateToPath(path: string) {
  void router.push(path)
}

function openArticle(slug: string) {
  void router.push(isInAppShell.value ? `/app/blog/articles/${slug}` : `/blog/articles/${slug}`)
}

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

async function handleNewsletterSubmit() {
  newsletterSuccessMessage.value = ''
  newsletterErrorMessage.value = ''
  newsletterConfirmation.value = null

  if (!newsletterEmail.value.includes('@')) {
    newsletterErrorMessage.value = 'Informe um e-mail valido para acompanhar os proximos conteudos.'
    return
  }

  if (isSubmittingNewsletter.value) return

  isSubmittingNewsletter.value = true

  try {
    const response = await NotificationService.sendContactForm({
      name: 'Newsletter Blog',
      email: newsletterEmail.value.trim(),
      message: isInAppShell.value
        ? 'Inscricao solicitada a partir do Content Center interno do CoBudget.'
        : 'Inscricao solicitada a partir do blog publico do CoBudget.',
      source: isInAppShell.value ? 'BLOG_APP' : 'BLOG_PUBLIC',
      originLabel: isInAppShell.value ? 'Content Center interno' : 'Blog publico',
      contextPath: route.fullPath
    })
    newsletterConfirmation.value = response.data
    newsletterSuccessMessage.value = `Obrigado! Vamos avisar em ${newsletterEmail.value.trim()} quando os proximos conteudos sairem.`
    newsletterEmail.value = ''
  } catch (error: any) {
    console.error('Erro ao enviar inscricao do blog:', error)
    newsletterErrorMessage.value =
      error?.response?.data?.error || 'Nao foi possivel registrar seu interesse agora.'
  } finally {
    isSubmittingNewsletter.value = false
  }
}

function formatSubmissionDate(value?: string | null): string {
  if (!value) return 'agora'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'agora'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(parsed)
}
</script>

<style scoped>
#blog-page {
  --page-bg: #f8fafc;
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --ink: #0f172a;
  --ink-soft: #475569;
  --line: rgba(15, 23, 42, 0.08);
  --brand: #667eea;
  --brand-strong: #4f46e5;
  --accent-soft: rgba(79, 70, 229, 0.08);
  --shadow-soft: 0 12px 24px rgba(15, 23, 42, 0.06);
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  color: var(--ink);
  max-width: none !important;
  padding: 0 !important;
}

#blog-page.blog-page--public {
  --page-bg: #f5f1e8;
  --surface: rgba(255, 255, 255, 0.82);
  --surface-soft: #fcf8f1;
  --ink: #172033;
  --ink-soft: #4c576d;
  --line: rgba(23, 32, 51, 0.1);
  --brand: #b6551f;
  --brand-strong: #8e4318;
  --accent-soft: rgba(32, 95, 99, 0.1);
  --shadow-soft: 0 16px 34px rgba(23, 32, 51, 0.08);
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.08), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.08), transparent 22%),
    linear-gradient(180deg, #fbf8f2 0%, #f8f4ed 52%, #fdfaf5 100%);
}

#blog-page :deep(*) {
  box-sizing: border-box;
}

#blog-page :deep(.v-icon) {
  color: inherit;
}

.blog-page {
  min-height: 100vh;
  overflow-x: hidden;
}

.shell {
  width: min(1120px, calc(100vw - 32px));
  margin: 0 auto;
}

.section-spacing {
  padding: 28px 0 48px;
}

.section-soft {
  background: transparent;
}

.blog-page--public .section-soft {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.12));
  border-top: 1px solid rgba(23, 32, 51, 0.05);
  border-bottom: 1px solid rgba(23, 32, 51, 0.05);
}

.section-soft--top {
  padding-top: 20px;
}

.blog-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(248, 250, 252, 0.92);
  border-bottom: 1px solid var(--line);
  backdrop-filter: blur(10px);
}

.blog-page--public .blog-header {
  background: rgba(251, 248, 242, 0.84);
  backdrop-filter: blur(14px);
}

.blog-header__shell {
  min-height: 76px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: 0;
  padding: 0;
  color: inherit;
  cursor: pointer;
}

.brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.brand-copy strong,
h1,
h2,
h3 {
  font-family: inherit;
}

.brand-copy strong {
  font-size: 1rem;
  font-weight: 800;
}

.brand-copy small {
  font-size: 0.82rem;
  color: var(--ink-soft);
}

.blog-nav,
.blog-header__actions,
.hero__actions,
.featured-story__meta,
.post-card__meta,
.playbook-card__actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.blog-nav {
  justify-content: center;
}

.blog-nav__link,
.post-card__link {
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  padding: 8px 12px;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.blog-nav__link:hover,
.post-card__link:hover {
  background: rgba(15, 23, 42, 0.05);
  color: var(--brand-strong);
}

.btn {
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 11px 16px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.blog-page--public .btn {
  border-radius: 999px;
}

.btn-primary {
  background: var(--brand);
  color: #fff;
}

.btn-primary:hover {
  background: var(--brand-strong);
}

.btn-secondary,
.btn-ghost {
  background: #fff;
  color: var(--ink);
  border-color: var(--line);
}

.btn-large {
  padding: 13px 18px;
}

.eyebrow,
.section-kicker,
.panel-label,
.story-tag,
.post-card__category {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 5px 10px;
  background: var(--accent-soft);
  color: var(--brand-strong);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero {
  padding-top: 24px;
}

.hero--in-app {
  padding-top: 8px;
}

.blog-page--public .hero {
  padding-top: 56px;
}

.hero__grid,
.featured-story,
.section-heading--split,
.newsletter-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.9fr);
  gap: 16px;
}

.hero__copy,
.hero__panel-card,
.metric-card,
.featured-story,
.post-card,
.pillar-card,
.playbook-card,
.newsletter-card,
.quote-card,
.mini-card {
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-soft);
}

.hero__copy {
  border-radius: 20px;
  padding: 24px;
}

.blog-page--public .hero__copy {
  border-radius: 28px;
  padding: 28px;
}

.hero__copy h1 {
  margin: 14px 0 12px;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.02;
  letter-spacing: -0.03em;
}

.blog-page--public .hero__copy h1 {
  font-size: clamp(2.6rem, 6vw, 4.7rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.hero__lead,
.section-heading p,
.featured-story p,
.post-card p,
.pillar-card p,
.newsletter-card p,
.hero__panel-card p,
.quote-card p {
  color: var(--ink-soft);
  font-size: 1rem;
  line-height: 1.65;
}

.hero__chips {
  margin-top: 18px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.topic-chip {
  border-radius: 999px;
  padding: 7px 10px;
  background: #fff;
  border: 1px solid var(--line);
  color: var(--ink-soft);
  font-size: 0.9rem;
}

.blog-page--public .topic-chip {
  background: rgba(255, 255, 255, 0.62);
}

.hero__panel {
  display: grid;
  gap: 12px;
}

.hero__panel-card,
.metric-card,
.post-card,
.pillar-card,
.playbook-card,
.quote-card,
.mini-card {
  border-radius: 18px;
  padding: 20px;
}

.blog-page--public .hero__panel-card,
.blog-page--public .metric-card,
.blog-page--public .post-card,
.blog-page--public .pillar-card,
.blog-page--public .playbook-card,
.blog-page--public .quote-card,
.blog-page--public .mini-card {
  border-radius: 22px;
}

.hero__panel-card strong,
.metric-card strong {
  display: block;
  margin-top: 10px;
  font-size: 1.05rem;
  line-height: 1.4;
}

.blog-page--public .hero__panel-card strong {
  font-size: 1.4rem;
}

.hero__panel-metrics,
.post-grid,
.pillar-grid,
.playbook-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.metric-card span {
  color: var(--ink-soft);
  font-size: 0.88rem;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.featured-story {
  border-radius: 20px;
  padding: 22px;
}

.blog-page--public .featured-story {
  border-radius: 32px;
  padding: 28px;
}

.featured-story h3,
.post-card h3,
.pillar-card h3,
.playbook-card h3 {
  margin: 12px 0 10px;
  font-size: 1.35rem;
  line-height: 1.15;
}

.blog-page--public .featured-story h3,
.blog-page--public .post-card h3,
.blog-page--public .pillar-card h3,
.blog-page--public .playbook-card h3 {
  font-size: 1.7rem;
}

.featured-story__rail,
.mini-stack {
  display: grid;
  gap: 12px;
}

.quote-card__label,
.mini-card span {
  color: var(--brand-strong);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.post-card__link {
  padding: 0;
  border-radius: 0;
}

.pillar-card__icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--accent-soft);
  margin-bottom: 12px;
}

.newsletter-card {
  border-radius: 20px;
  padding: 22px;
  align-items: center;
}

.blog-page--public .newsletter-card {
  border-radius: 32px;
  padding: 28px;
}

.newsletter-form {
  display: grid;
  gap: 12px;
}

.newsletter-feedback {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.5;
}

.newsletter-confirmation {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(15, 118, 110, 0.22);
  background: rgba(240, 253, 250, 0.9);
  color: #134e4a;
}

.newsletter-confirmation p {
  margin: 0;
}

.newsletter-confirmation__meta {
  display: grid;
  gap: 6px;
  font-size: 0.92rem;
}

.newsletter-feedback--success {
  color: #0f766e;
}

.newsletter-feedback--error {
  color: #b91c1c;
}

.newsletter-form input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #fff;
  padding: 14px 16px;
  font: inherit;
  color: var(--ink);
}

.newsletter-form input:focus {
  outline: 2px solid rgba(79, 70, 229, 0.12);
  border-color: var(--brand);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1100px) {
  .hero__grid,
  .featured-story,
  .section-heading--split,
  .newsletter-card {
    grid-template-columns: 1fr;
  }

  .post-grid,
  .pillar-grid,
  .playbook-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .blog-header__shell {
    grid-template-columns: 1fr;
    padding: 16px 0;
  }

  .blog-nav,
  .blog-header__actions {
    justify-content: flex-start;
  }

  .hero__panel-metrics,
  .post-grid,
  .pillar-grid,
  .playbook-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .section-spacing {
    padding: 22px 0 36px;
  }

  .shell {
    width: min(1120px, calc(100vw - 24px));
  }

  .btn,
  .hero__actions,
  .blog-header__actions,
  .playbook-card__actions {
    width: 100%;
  }

  .hero__actions,
  .blog-header__actions,
  .playbook-card__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero__copy,
  .hero__panel-card,
  .metric-card,
  .featured-story,
  .post-card,
  .pillar-card,
  .playbook-card,
  .newsletter-card,
  .quote-card,
  .mini-card {
    padding: 18px;
  }
}
</style>
