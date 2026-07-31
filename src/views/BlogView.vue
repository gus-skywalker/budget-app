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
            <small>{{ t('contentExperience.common.blog') }}</small>
          </span>
        </button>

        <nav class="blog-nav" :aria-label="t('contentExperience.common.blog')">
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
            {{ t('landingPage.auth.login') }}
          </button>
          <button class="btn btn-primary" type="button" @click="navigateToPath('/choose-plan')">
            {{ t('contentExperience.common.start') }}
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
              <span class="section-kicker">{{ t('contentExperience.blog.playbooks.kicker') }}</span>
              <h2>{{ t('contentExperience.blog.playbooks.title') }}</h2>
            </div>
            <p>{{ t('contentExperience.blog.playbooks.description') }}</p>
          </div>

          <div class="playbook-grid">
            <article v-for="item in playbookEntries" :key="item.title" class="playbook-card">
              <span class="post-card__category">{{ item.category }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div class="playbook-card__actions">
                <button class="btn btn-primary" type="button" @click="navigateToPath(item.path)">
                  {{ t('contentExperience.common.playbook') }}
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
              isInAppShell
                ? t('contentExperience.blog.hero.eyebrowApp')
                : t('contentExperience.blog.hero.eyebrowPublic')
            }}</span>
            <h1>
              {{
                isInAppShell
                  ? t('contentExperience.blog.hero.titleApp')
                  : t('contentExperience.blog.hero.titlePublic')
              }}
            </h1>
            <p class="hero__lead">
              {{
                isInAppShell
                  ? t('contentExperience.blog.hero.leadApp')
                  : t('contentExperience.blog.hero.leadPublic')
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
                {{
                  isInAppShell
                    ? t('contentExperience.blog.hero.ctaPrimaryApp')
                    : t('contentExperience.blog.hero.ctaPrimaryPublic')
                }}
              </button>
              <button
                class="btn btn-secondary btn-large"
                type="button"
                @click="isInAppShell ? navigateToPath('/decisions') : scrollToSection('posts')"
              >
                {{
                  isInAppShell
                    ? t('contentExperience.blog.hero.ctaSecondaryApp')
                    : t('contentExperience.blog.hero.ctaSecondaryPublic')
                }}
              </button>
            </div>

            <div class="hero__chips">
              <span v-for="item in topicChips" :key="item" class="topic-chip">{{ item }}</span>
            </div>
          </div>

          <div class="hero__panel">
            <div class="hero__panel-card hero__panel-card--accent">
              <span class="panel-label">{{
                isInAppShell
                  ? t('contentExperience.blog.panel.labelApp')
                  : t('contentExperience.blog.panel.labelPublic')
              }}</span>
              <strong>{{
                isInAppShell
                  ? t('contentExperience.blog.panel.titleApp')
                  : t('contentExperience.blog.panel.titlePublic')
              }}</strong>
              <p>
                {{
                  isInAppShell
                    ? t('contentExperience.blog.panel.bodyApp')
                    : t('contentExperience.blog.panel.bodyPublic')
                }}
              </p>
            </div>
            <div class="hero__panel-card">
              <span class="panel-label">{{ t('contentExperience.blog.panel.format') }}</span>
              <strong>{{
                isInAppShell
                  ? t('contentExperience.blog.panel.formatTitleApp')
                  : t('contentExperience.blog.panel.formatTitlePublic')
              }}</strong>
              <p>
                {{
                  isInAppShell
                    ? t('contentExperience.blog.panel.formatBodyApp')
                    : t('contentExperience.blog.panel.formatBodyPublic')
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
            <span class="section-kicker">{{
              isInAppShell
                ? t('contentExperience.blog.featured.kickerApp')
                : t('contentExperience.blog.featured.kickerPublic')
            }}</span>
            <h2>
              {{
                isInAppShell
                  ? t('contentExperience.blog.featured.titleApp')
                  : t('contentExperience.blog.featured.titlePublic')
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
                {{ t('contentExperience.common.contentTemplate') }}
              </button>
            </div>

            <div class="featured-story__rail">
              <div class="quote-card">
                <span class="quote-card__label">{{
                  t('contentExperience.blog.featured.quoteLabel')
                }}</span>
                <p>{{ t('contentExperience.blog.featured.quote') }}</p>
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
                isInAppShell
                  ? t('contentExperience.blog.posts.kickerApp')
                  : t('contentExperience.blog.posts.kickerPublic')
              }}</span>
              <h2>
                {{
                isInAppShell
                  ? t('contentExperience.blog.posts.titleApp')
                  : t('contentExperience.blog.posts.titlePublic')
              }}
              </h2>
            </div>
            <p>
              {{
                isInAppShell
                  ? t('contentExperience.blog.posts.descriptionApp')
                  : t('contentExperience.blog.posts.descriptionPublic')
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
                {{ t('contentExperience.common.contentTemplate') }}
              </button>
            </article>
          </div>
        </div>
      </section>

      <section id="pillars" class="section-spacing">
        <div class="shell">
          <div class="section-heading">
            <span class="section-kicker">{{
              isInAppShell
                ? t('contentExperience.blog.pillars.kickerApp')
                : t('contentExperience.blog.pillars.kickerPublic')
            }}</span>
            <h2>
              {{
                isInAppShell
                  ? t('contentExperience.blog.pillars.titleApp')
                  : t('contentExperience.blog.pillars.titlePublic')
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
                isInAppShell
                  ? t('contentExperience.blog.newsletter.kickerApp')
                  : t('contentExperience.blog.newsletter.kickerPublic')
              }}</span>
              <h2>
                {{
                isInAppShell
                    ? t('contentExperience.blog.newsletter.titleApp')
                    : t('contentExperience.blog.newsletter.titlePublic')
                }}
              </h2>
              <p>
                {{
                isInAppShell
                    ? t('contentExperience.blog.newsletter.descriptionApp')
                    : t('contentExperience.blog.newsletter.descriptionPublic')
                }}
              </p>
            </div>

            <form class="newsletter-form" @submit.prevent="handleNewsletterSubmit">
              <label class="sr-only" for="newsletter-email">{{
                t('contentExperience.blog.newsletter.emailLabel')
              }}</label>
              <input
                id="newsletter-email"
                v-model="newsletterEmail"
                type="email"
                :placeholder="t('contentExperience.blog.newsletter.emailPlaceholder')"
                required
              />
              <button class="btn btn-primary" type="submit" :disabled="isSubmittingNewsletter">
                {{
                  isSubmittingNewsletter
                    ? t('contentExperience.blog.newsletter.submitting')
                    : t('contentExperience.blog.newsletter.cta')
                }}
              </button>
              <div
                v-if="newsletterConfirmation"
                class="newsletter-confirmation"
                role="status"
                aria-live="polite"
              >
                <div class="newsletter-confirmation__pulse" aria-hidden="true">
                  <span class="newsletter-confirmation__icon">✓</span>
                </div>
                <div class="newsletter-confirmation__content">
                  <strong>{{ t('contentExperience.blog.newsletter.successTitle') }}</strong>
                  <p>{{ newsletterSuccessMessage }}</p>
                  <span class="newsletter-confirmation__hint">
                    {{ t('contentExperience.blog.newsletter.successHint') }}
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
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  featuredBlogTemplateSlug,
  getBlogTemplateEntries,
  getBlogTemplateEntry
} from '@/content/blogTemplates'
import NotificationService, { type ContactSubmissionResponse } from '@/services/NotificationService'
import { parseApiError } from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const newsletterEmail = ref('')
const isSubmittingNewsletter = ref(false)
const newsletterSuccessMessage = ref('')
const newsletterErrorMessage = ref('')
const newsletterConfirmation = ref<ContactSubmissionResponse | null>(null)
const isInAppShell = computed(() => Boolean(route.meta?.requiresAuth))

const headerLinks = computed(() => [
  { id: 'featured', label: t('contentExperience.blog.headerLinks.featured') },
  { id: 'posts', label: t('contentExperience.blog.headerLinks.posts') },
  { id: 'pillars', label: t('contentExperience.blog.headerLinks.pillars') },
  { id: 'newsletter', label: t('contentExperience.blog.headerLinks.newsletter') }
])

const topicChips = computed(() => [
  t('contentExperience.blog.topics.planning'),
  t('contentExperience.blog.topics.scenarios'),
  t('contentExperience.blog.topics.decisions'),
  t('contentExperience.blog.topics.cashflow'),
  t('contentExperience.blog.topics.families'),
  t('contentExperience.blog.topics.teams')
])

const metrics = computed(() => [
  { label: t('contentExperience.blog.metrics.themes'), value: '6' },
  { label: t('contentExperience.blog.metrics.articles'), value: '8' },
  {
    label: t('contentExperience.blog.metrics.goal'),
    value: isInAppShell.value
      ? t('contentExperience.blog.metrics.goalApp')
      : t('contentExperience.blog.metrics.goalPublic')
  }
])

const featuredPost = computed(
  () =>
    getBlogTemplateEntry(featuredBlogTemplateSlug, locale.value) || {
      slug: 'template',
      category: t('contentExperience.blog.fallback.category'),
      title: t('contentExperience.blog.fallback.title'),
      excerpt: t('contentExperience.blog.fallback.excerpt'),
      readTime: t('contentExperience.blog.fallback.readTime'),
      stage: t('contentExperience.blog.fallback.stage'),
      audience: t('contentExperience.blog.fallback.audience'),
      ctaLabel: t('contentExperience.common.contentTemplate'),
      ctaPath: '/blog',
      heroPrompt: '',
      summaryPrompt: '',
      takeaways: [],
      sections: []
    }
)

const featuredSupporting = computed(() => [
  {
    category: t('contentExperience.blog.supporting.firstCategory'),
    title: t('contentExperience.blog.supporting.firstTitle')
  },
  {
    category: t('contentExperience.blog.supporting.secondCategory'),
    title: t('contentExperience.blog.supporting.secondTitle')
  },
  {
    category: t('contentExperience.blog.supporting.thirdCategory'),
    title: t('contentExperience.blog.supporting.thirdTitle')
  }
])

const posts = computed(() => getBlogTemplateEntries(locale.value))

const pillars = computed(() => [
  {
    icon: 'mdi-lightbulb-on-outline',
    title: t('contentExperience.blog.pillarsCards.firstTitle'),
    description: t('contentExperience.blog.pillarsCards.firstDescription')
  },
  {
    icon: 'mdi-chart-timeline-variant',
    title: t('contentExperience.blog.pillarsCards.secondTitle'),
    description: t('contentExperience.blog.pillarsCards.secondDescription')
  },
  {
    icon: 'mdi-account-group-outline',
    title: t('contentExperience.blog.pillarsCards.thirdTitle'),
    description: t('contentExperience.blog.pillarsCards.thirdDescription')
  }
])

const playbookEntries = computed(() => [
  {
    category: t('contentExperience.blog.playbookCards.hireCategory'),
    title: t('contentExperience.blog.playbookCards.hireTitle'),
    description: t('contentExperience.blog.playbookCards.hireDescription'),
    path: '/app/blog/playbooks/hire'
  },
  {
    category: t('contentExperience.blog.playbookCards.payCategory'),
    title: t('contentExperience.blog.playbookCards.payTitle'),
    description: t('contentExperience.blog.playbookCards.payDescription'),
    path: '/app/blog/playbooks/pay-now-or-installments'
  }
])

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
    newsletterErrorMessage.value = t('contentExperience.blog.newsletter.invalidEmail')
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
    newsletterSuccessMessage.value = t('contentExperience.blog.newsletter.successMessage', {
      email: newsletterEmail.value.trim()
    })
    newsletterEmail.value = ''
  } catch (error: any) {
    console.error('Erro ao enviar inscricao do blog:', error)
    newsletterErrorMessage.value = parseApiError(error, t('contentExperience.blog.newsletter.error'))
  } finally {
    isSubmittingNewsletter.value = false
  }
}

</script>

<style scoped>
#blog-page {
  --page-bg: var(--cb-page-bg);
  --surface: var(--cb-surface);
  --surface-soft: var(--cb-surface-soft);
  --ink: var(--cb-ink);
  --ink-soft: var(--cb-ink-secondary);
  --line: rgba(15, 23, 42, 0.08);
  --brand: var(--cb-primary);
  --brand-strong: var(--cb-primary-hover);
  --accent-soft: var(--cb-primary-bg);
  --shadow-soft: var(--cb-shadow-card);
  background: var(--page-bg);
  color: var(--ink);
  max-width: none !important;
  padding: 0 !important;
}

#blog-page.blog-page--app {
  --line: var(--cb-border-card);
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

:global(.v-theme--dark) #blog-page.blog-page--app {
  --page-bg: var(--cb-page-bg);
  --surface: var(--cb-surface);
  --surface-soft: var(--cb-surface-soft);
  --ink: var(--cb-ink);
  --ink-soft: var(--cb-ink-secondary);
  --line: var(--cb-border-card);
  --accent-soft: var(--cb-primary-bg);
  --shadow-soft: var(--cb-shadow-card);
}

@media (prefers-color-scheme: dark) {
  #blog-page.blog-page--app {
    --page-bg: var(--cb-page-bg);
    --surface: var(--cb-surface);
    --surface-soft: var(--cb-surface-soft);
    --ink: var(--cb-ink);
    --ink-soft: var(--cb-ink-secondary);
    --line: var(--cb-border-card);
    --accent-soft: var(--cb-primary-bg);
    --shadow-soft: var(--cb-shadow-card);
  }
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
  background: color-mix(in srgb, var(--page-bg) 92%, transparent);
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
  background: color-mix(in srgb, var(--ink) 7%, transparent);
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
  background: var(--surface);
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
  background: var(--surface);
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
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  padding: 5px 10px;
  background: var(--accent-soft);
  color: var(--brand-strong);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.mini-card strong {
  display: block;
  margin-top: 10px;
  color: var(--ink);
  font-size: 1.02rem;
  line-height: 1.35;
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
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--cb-positive) 26%, transparent);
  background: color-mix(in srgb, var(--cb-positive) 12%, var(--surface));
  color: var(--ink);
  animation: newsletter-confirmation-enter 220ms ease-out;
}

.newsletter-confirmation p {
  margin: 0;
}

.newsletter-confirmation__pulse {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cb-positive) 14%, transparent);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--cb-positive) 22%, transparent);
  animation: newsletter-confirmation-pulse 1.8s ease-out 1;
}

.newsletter-confirmation__icon {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cb-accent);
}

.newsletter-confirmation__content {
  display: grid;
  gap: 6px;
}

.newsletter-confirmation__hint {
  font-size: 0.92rem;
  color: var(--ink-soft);
}

.newsletter-feedback--success {
  color: var(--cb-accent);
}

.newsletter-feedback--error {
  color: var(--cb-risk);
}

.newsletter-form input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--surface);
  padding: 14px 16px;
  font: inherit;
  color: var(--ink);
}

.newsletter-form input:focus {
  outline: 2px solid color-mix(in srgb, var(--cb-primary) 12%, transparent);
  border-color: var(--brand);
}

@keyframes newsletter-confirmation-enter {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes newsletter-confirmation-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--cb-positive) 22%, transparent);
    transform: scale(0.94);
  }
  45% {
    box-shadow: 0 0 0 12px color-mix(in srgb, var(--cb-positive) 0%, transparent);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--cb-positive) 0%, transparent);
  }
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
