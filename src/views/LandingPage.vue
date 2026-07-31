<template>
  <v-container id="landing-page" fluid class="landing-page">
    <header class="landing-header">
      <div class="shell header-shell">
        <button class="brand" type="button" @click="scrollToSection('top')">
          <img src="/logo.jpg" alt="CoBudget" class="brand-logo" />
          <span class="brand-copy">
            <strong>CoBudget</strong>
            <small>{{ $t('landingPage.hero.micro') }}</small>
          </span>
        </button>

        <nav class="desktop-nav" aria-label="Primary">
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            class="nav-link"
            @click="handleNavClick(item.id)"
          >
            {{ $t(item.labelKey) }}
          </button>
        </nav>

        <div class="header-actions">
          <button class="btn btn-ghost" type="button" @click="navigateTo('blog')">
            {{ $t('contentExperience.common.blog') }}
          </button>
          <button class="btn btn-ghost" type="button" @click="navigateTo('login')">
            {{ $t('landingPage.auth.login') }}
          </button>
          <button class="btn btn-primary" type="button" @click="navigateTo('choose-plan')">
            {{ $t('landingPage.auth.signupNow') }}
          </button>
          <button
            class="menu-toggle"
            type="button"
            :aria-expanded="isMenuOpen ? 'true' : 'false'"
            :aria-label="$t('landingPage.auth.login')"
            @click="toggleMenu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div class="mobile-menu" :class="{ open: isMenuOpen }">
        <button
          v-for="item in navItems"
          :key="`mobile-${item.id}`"
          type="button"
          class="mobile-link"
          @click="handleNavClick(item.id)"
        >
          {{ $t(item.labelKey) }}
        </button>
        <div class="mobile-actions">
          <button class="btn btn-ghost" type="button" @click="navigateTo('blog')">
            {{ $t('contentExperience.common.blog') }}
          </button>
          <button class="btn btn-ghost" type="button" @click="navigateTo('login')">
            {{ $t('landingPage.auth.login') }}
          </button>
          <button class="btn btn-primary" type="button" @click="navigateTo('choose-plan')">
            {{ $t('landingPage.auth.signupNow') }}
          </button>
        </div>
      </div>
    </header>

    <main>
      <section id="top" class="hero-section-test section-offset">
        <div class="shell hero-container-test">
          <div class="hero-content-test">
            <span class="eyebrow">{{ $t('landingPage.hero.micro') }}</span>
            <h1 class="hero-headline-test">{{ $t('landingPage.hero.title') }}</h1>
            <p class="hero-subheadline-test">{{ $t('landingPage.hero.subtitle') }}</p>

            <div class="hero-points">
              <div v-for="item in solutionCards" :key="item.titleKey" class="hero-point">
                <div class="icon-chip icon-chip-small">
                  <v-icon size="18">{{ item.icon }}</v-icon>
                </div>
                <span>{{ $t(item.titleKey) }}</span>
              </div>
            </div>

            <div class="cta-row">
              <button
                class="btn btn-primary btn-large"
                type="button"
                @click="navigateTo('choose-plan')"
              >
                {{ $t('landingPage.hero.cta') }}
              </button>
              <button
                class="btn btn-secondary btn-large"
                type="button"
                @click="scrollToSection('plans')"
              >
                {{ $t('landingPage.plans.title') }}
              </button>
            </div>

            <p class="proof-copy">{{ $t('landingPage.hero.proof') }}</p>
          </div>

          <div class="hero-image-wrapper-test">
            <img
              src="/landing-assets/hero-decision-impact.png"
              :alt="$t('landingPage.hero.imageAlt')"
              class="hero-image-test"
            />
            <div class="hero-overlay-card-test">
              <div class="overlay-label-test">{{ $t('landingPage.hero.micro') }}</div>
              <div class="overlay-value-test">+R$8,000</div>
              <div class="overlay-details-test">
                <div>
                  {{ $t('contentExperience.landing.projectedBalance') }}:
                  <span class="overlay-detail-value-test">R$59,639</span>
                </div>
                <div>
                  {{ $t('contentExperience.landing.status') }}:
                  <span class="overlay-detail-status-test">{{
                    $t('contentExperience.landing.stable')
                  }}</span>
                </div>
                <div>
                  {{ $t('contentExperience.landing.available') }}:
                  <span class="overlay-detail-value-test">R$8,969</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-offset section-block product-moments-section">
        <div class="shell">
          <div class="section-heading centered-heading">
            <span class="section-kicker">{{ $t('landingPage.productMoments.kicker') }}</span>
            <h2>{{ $t('landingPage.productMoments.title') }}</h2>
            <p class="section-intro narrow">{{ $t('landingPage.productMoments.subtitle') }}</p>
          </div>

          <div class="product-moments-grid">
            <article
              v-for="item in productMoments"
              :key="item.titleKey"
              class="product-moment"
            >
              <div class="product-moment__media">
                <video
                  :src="item.videoSrc"
                  :poster="item.posterSrc"
                  muted
                  autoplay
                  playsinline
                  loop
                  preload="metadata"
                  class="product-moment__video"
                ></video>
              </div>
              <div class="product-moment__copy">
                <span>{{ item.label }}</span>
                <strong>{{ $t(item.titleKey) }}</strong>
                <p>{{ $t(item.descKey) }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="about" class="section-offset section-block section-light">
        <div class="shell section-media-grid">
          <div class="section-media-copy">
            <span class="section-kicker">{{ $t('landingPage.nav.about') }}</span>
            <h2>{{ $t('landingPage.pain.title') }}</h2>
            <p class="section-intro">{{ $t('landingPage.pain.subtitle') }}</p>

            <div class="card-grid card-grid-compact">
              <article
                v-for="item in painCards.slice(0, 2)"
                :key="item.titleKey"
                class="feature-card feature-card-pain"
              >
                <div class="icon-chip icon-chip-contrast">
                  <v-icon size="22">{{ item.icon }}</v-icon>
                </div>
                <strong>{{ $t(item.titleKey) }}</strong>
              </article>
            </div>
          </div>

          <div class="section-media-visual">
            <img
              src="/landing-assets/problem-financial-doubt.png"
              :alt="$t('landingPage.pain.title')"
              class="section-media-image"
            />
          </div>
        </div>
      </section>

      <section id="benefits" class="section-offset section-block">
        <div class="shell">
          <div class="section-heading centered-heading">
            <span class="section-kicker">{{ $t('landingPage.nav.benefits') }}</span>
            <h2>{{ $t('landingPage.solution.title') }}</h2>
            <p class="section-intro narrow">{{ $t('landingPage.diff.subtitle') }}</p>
          </div>

          <div class="card-grid card-grid-four">
            <article v-for="item in solutionCards" :key="item.titleKey" class="feature-card">
              <div class="icon-chip">
                <v-icon size="22">{{ item.icon }}</v-icon>
              </div>
              <strong>{{ $t(item.titleKey) }}</strong>
            </article>
          </div>
        </div>
      </section>

      <section class="section-offset section-block section-soft-accent">
        <div class="shell">
          <div class="section-heading centered-heading">
            <span class="section-kicker">{{ $t('landingPage.how.title') }}</span>
            <h2>{{ $t('landingPage.finalCta.title') }}</h2>
          </div>

          <div class="timeline-grid">
            <article v-for="(item, index) in howSteps" :key="item.titleKey" class="timeline-card">
              <div class="timeline-step">0{{ index + 1 }}</div>
              <div class="icon-chip icon-chip-small">
                <v-icon size="18">{{ item.icon }}</v-icon>
              </div>
              <strong>{{ $t(item.titleKey) }}</strong>
              <p>{{ $t(item.descKey) }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="ai" class="section-offset section-block section-airy">
        <div class="shell section-media-grid">
          <div class="section-media-copy">
            <span class="section-kicker">{{ $t('landingPage.ai.title') }}</span>
            <h2>{{ $t('landingPage.ai.title') }}</h2>
            <p class="section-intro">{{ $t('landingPage.ai.subtitle') }}</p>

            <ul class="bullet-list">
              <li v-for="item in aiBullets" :key="item.labelKey">
                <v-icon size="18">{{ item.icon }}</v-icon>
                <span>{{ $t(item.labelKey) }}</span>
              </li>
            </ul>

            <div class="cta-row">
              <button
                class="btn btn-primary btn-large"
                type="button"
                @click="scrollToSection('plans')"
              >
                {{ $t('landingPage.ai.ctaSecondary') }}
              </button>
              <button
                class="btn btn-secondary btn-large"
                type="button"
                @click="navigateTo('login')"
              >
                {{ $t('landingPage.ai.ctaPrimary') }}
              </button>
            </div>
          </div>

          <div class="section-media-visual">
            <img
              src="/landing-assets/insight-moment.png"
              :alt="$t('landingPage.ai.title')"
              class="section-media-image"
            />
          </div>
        </div>
      </section>

      <section class="section-offset section-block section-light">
        <div class="shell section-media-grid">
          <div class="section-media-copy">
            <span class="section-kicker">{{ $t('landingPage.family.title') }}</span>
            <h2>{{ $t('landingPage.family.subtitle') }}</h2>

            <div class="card-grid card-grid-compact">
              <article
                v-for="item in familyCards.slice(0, 2)"
                :key="item.titleKey"
                class="feature-card"
              >
                <div class="icon-chip icon-chip-warm">
                  <v-icon size="22">{{ item.icon }}</v-icon>
                </div>
                <strong>{{ $t(item.titleKey) }}</strong>
              </article>
            </div>
          </div>

          <div class="section-media-visual">
            <img
              src="/landing-assets/financial-relief.png"
              :alt="$t('landingPage.family.subtitle')"
              class="section-media-image"
            />
          </div>
        </div>
      </section>

      <section id="testimonials" class="section-offset section-block">
        <div class="shell">
          <div class="section-heading centered-heading">
            <span class="section-kicker">{{ $t('landingPage.nav.testimonials') }}</span>
            <h2>{{ $t('landingPage.testimonials.title') }}</h2>
            <p class="section-intro narrow">{{ $t('landingPage.diff.title') }}</p>
          </div>

          <div class="testimonial-grid">
            <article v-for="item in testimonials" :key="item.quoteKey" class="testimonial-card">
              <div class="testimonial-topline">
                <div class="avatar-badge">{{ authorInitials($t(item.authorKey)) }}</div>
                <div class="testimonial-rating">
                  <v-icon v-for="star in 5" :key="star" size="16">mdi-star</v-icon>
                </div>
              </div>
              <v-icon class="quote-icon" size="28">mdi-format-quote-open</v-icon>
              <p>{{ $t(item.quoteKey) }}</p>
              <strong>{{ $t(item.authorKey) }}</strong>
            </article>
          </div>
        </div>
      </section>

      <section id="security" class="section-offset section-block section-soft-accent">
        <div class="shell">
          <div class="section-heading centered-heading">
            <span class="section-kicker">{{ $t('landingPage.nav.security') }}</span>
            <h2>{{ $t('landingPage.security.title') }}</h2>
          </div>

          <div class="card-grid card-grid-four">
            <article v-for="item in securityItems" :key="item.labelKey" class="security-card">
              <div class="icon-chip icon-chip-contrast">
                <v-icon size="22">{{ item.icon }}</v-icon>
              </div>
              <span>{{ $t(item.labelKey) }}</span>
            </article>
          </div>
        </div>
      </section>

      <section id="plans" class="section-offset section-block plans-section">
        <div class="shell">
          <div class="section-heading centered-heading">
            <span class="section-kicker">{{ $t('landingPage.auth.signupNow') }}</span>
            <h2>{{ $t('landingPage.plans.title') }}</h2>
            <p class="section-intro narrow">{{ $t('landingPage.plans.subtitle') }}</p>
          </div>

          <div class="value-banner">
            <div class="icon-chip icon-chip-dark">
              <v-icon size="22">mdi-brain</v-icon>
            </div>
            <div>
              <strong>{{ $t('landingPage.plans.aiValueTitle') }}</strong>
              <p>{{ $t('landingPage.plans.aiValueSubtitle') }}</p>
            </div>
          </div>

          <div class="plans-grid">
            <article class="plan-card plan-card-starter">
              <div class="plan-tag">{{ $t('landingPage.plans.starterTag') }}</div>
              <h3>{{ $t('landingPage.plans.starterName') }}</h3>
              <p class="plan-subtitle">{{ $t('landingPage.plans.starterSubtitle') }}</p>
              <div class="price-stack">
                <strong>{{ formatPlanDisplay(planDetails.MONTHLY) }}</strong>
                <span>{{ formatPlanDisplay(planDetails.ANNUAL) }}</span>
              </div>
              <ul class="plan-benefits">
                <li v-for="item in starterFeatures" :key="item">
                  <v-icon size="18">mdi-check-circle</v-icon>
                  <span>{{ $t(item) }}</span>
                </li>
              </ul>
              <div class="plan-actions">
                <button
                  class="btn btn-primary"
                  type="button"
                  @click="redirectToCheckout('MONTHLY')"
                >
                  {{ $t('landingPage.plans.starterMonthly') }}
                </button>
                <button
                  class="btn btn-secondary"
                  type="button"
                  @click="redirectToCheckout('ANNUAL')"
                >
                  {{ $t('landingPage.plans.starterAnnual') }}
                </button>
              </div>
            </article>

            <article class="plan-card plan-card-team">
              <div class="plan-pill">{{ $t('landingPage.plans.teamPopular') }}</div>
              <div class="plan-tag plan-tag-team">{{ $t('landingPage.plans.teamTag') }}</div>
              <h3>{{ $t('landingPage.plans.teamName') }}</h3>
              <p class="plan-subtitle">{{ $t('landingPage.plans.teamSubtitle') }}</p>
              <div class="price-stack">
                <strong>{{ formatPlanDisplay(planDetails.BUSINESS_MONTHLY) }}</strong>
                <span>{{ formatPlanDisplay(planDetails.BUSINESS_ANNUAL) }}</span>
              </div>
              <ul class="plan-benefits">
                <li v-for="item in teamFeatures" :key="item">
                  <v-icon size="18">mdi-check-circle</v-icon>
                  <span>{{ $t(item) }}</span>
                </li>
              </ul>
              <div class="plan-actions">
                <button
                  class="btn btn-primary"
                  type="button"
                  @click="redirectToCheckout('BUSINESS_MONTHLY')"
                >
                  {{ $t('landingPage.plans.teamMonthly') }}
                </button>
                <button
                  class="btn btn-dark-outline"
                  type="button"
                  @click="redirectToCheckout('BUSINESS_ANNUAL')"
                >
                  {{ $t('landingPage.plans.teamAnnual') }}
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="contact" class="section-offset section-block section-light">
        <div class="shell contact-grid">
          <div>
            <span class="section-kicker">{{ $t('landingPage.nav.contact') }}</span>
            <h2>{{ $t('landingPage.contact.title') }}</h2>
            <p class="section-intro">{{ $t('landingPage.footer.subtitle') }}</p>
            <a class="contact-mail" href="mailto:contact@cobudget.app">contact@cobudget.app</a>
          </div>

          <form class="contact-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">{{ $t('landingPage.contact.nameLabel') }}</label>
              <input id="name" v-model="contactForm.name" type="text" required />
            </div>
            <div class="form-group">
              <label for="email">{{ $t('landingPage.contact.emailLabel') }}</label>
              <input id="email" v-model="contactForm.email" type="email" required />
            </div>
            <div class="form-group">
              <label for="message">{{ $t('landingPage.contact.messageLabel') }}</label>
              <textarea id="message" v-model="contactForm.message" rows="5" required></textarea>
            </div>
            <button class="btn btn-primary btn-large" type="submit" :disabled="isSubmitting">
              {{
                isSubmitting ? $t('landingPage.contact.sending') : $t('landingPage.contact.send')
              }}
            </button>
            <p
              v-if="contactFeedback.message"
              class="contact-feedback"
              :class="`contact-feedback--${contactFeedback.type}`"
            >
              {{ contactFeedback.message }}
            </p>
          </form>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="shell footer-grid">
        <div>
          <h2>{{ $t('landingPage.footer.title') }}</h2>
          <p>{{ $t('landingPage.footer.subtitle') }}</p>
        </div>

        <div class="footer-links">
          <button
            v-for="item in navItems"
            :key="`footer-${item.id}`"
            type="button"
            class="footer-link"
            @click="handleNavClick(item.id)"
          >
            {{ $t(item.labelKey) }}
          </button>
        </div>

        <div class="footer-actions">
          <button class="btn btn-ghost" type="button" @click="navigateTo('blog')">
            {{ $t('contentExperience.common.blog') }}
          </button>
          <button class="btn btn-primary" type="button" @click="navigateToPath('/login')">
            {{ $t('landingPage.footer.cta') }}
          </button>
          <div class="footer-policy-links">
            <button type="button" class="footer-link" @click="navigateToPath('/privacy-policy')">
              {{ $t('footer.privacy_policy') }}
            </button>
            <button type="button" class="footer-link" @click="navigateToPath('/terms-of-use')">
              {{ $t('footer.terms_of_use') }}
            </button>
            <button type="button" class="footer-link" @click="navigateToPath('/cookie-policy')">
              {{ $t('footer.cookie_policy') }}
            </button>
          </div>
          <p class="footer-copy">{{ $t('landingPage.footer.copyright') }}</p>
        </div>
      </div>
    </footer>

  </v-container>
</template>

<script>
import { PLAN_DETAILS } from '@/constants/plans'
import { useUserStore } from '@/plugins/userStore'
import NotificationService from '@/services/NotificationService'
import OnboardingOrchestrator from '@/services/OnboardingOrchestrator'
import { parseApiError } from '@/utils/errorHandler'
import { formatConvertedPriceFromBRL, resolvePricingCurrency } from '@/utils/pricing'

export default {
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
      contactFeedback: {
        type: 'info',
        message: ''
      },
      isSubmitting: false,
      navItems: [
        { id: 'about', labelKey: 'landingPage.nav.about' },
        { id: 'benefits', labelKey: 'landingPage.nav.benefits' },
        { id: 'testimonials', labelKey: 'landingPage.nav.testimonials' },
        { id: 'security', labelKey: 'landingPage.nav.security' },
        { id: 'contact', labelKey: 'landingPage.nav.contact' }
      ],
      painCards: [
        { icon: 'mdi-file-cancel-outline', titleKey: 'landingPage.pain.card1' },
        { icon: 'mdi-eye-off-outline', titleKey: 'landingPage.pain.card2' },
        { icon: 'mdi-chart-timeline-variant', titleKey: 'landingPage.pain.card3' },
        { icon: 'mdi-calendar-remove-outline', titleKey: 'landingPage.pain.card4' },
        { icon: 'mdi-account-question-outline', titleKey: 'landingPage.pain.card5' }
      ],
      solutionCards: [
        { icon: 'mdi-account-group-outline', titleKey: 'landingPage.solution.card1' },
        { icon: 'mdi-chart-areaspline', titleKey: 'landingPage.solution.card2' },
        { icon: 'mdi-finance', titleKey: 'landingPage.solution.card3' },
        { icon: 'mdi-handshake-outline', titleKey: 'landingPage.solution.card4' }
      ],
      productMoments: [
        {
          label: '01',
          videoSrc: '/landing-assets/marketing/create-scenario.mp4',
          posterSrc: '/landing-assets/marketing/create-scenario-poster.png',
          titleKey: 'landingPage.productMoments.card1Title',
          descKey: 'landingPage.productMoments.card1Desc'
        },
        {
          label: '02',
          videoSrc: '/landing-assets/marketing/collaborative-decision.mp4',
          posterSrc: '/landing-assets/marketing/collaborative-decision-poster.png',
          titleKey: 'landingPage.productMoments.card2Title',
          descKey: 'landingPage.productMoments.card2Desc'
        },
        {
          label: '03',
          videoSrc: '/landing-assets/marketing/future-impact.mp4',
          posterSrc: '/landing-assets/marketing/future-impact-poster.png',
          titleKey: 'landingPage.productMoments.card3Title',
          descKey: 'landingPage.productMoments.card3Desc'
        }
      ],
      howSteps: [
        {
          icon: 'mdi-database-outline',
          titleKey: 'landingPage.how.step1Title',
          descKey: 'landingPage.how.step1Desc'
        },
        {
          icon: 'mdi-share-variant-outline',
          titleKey: 'landingPage.how.step2Title',
          descKey: 'landingPage.how.step2Desc'
        },
        {
          icon: 'mdi-brain',
          titleKey: 'landingPage.how.step3Title',
          descKey: 'landingPage.how.step3Desc'
        }
      ],
      aiBullets: [
        { icon: 'mdi-chart-bell-curve-cumulative', labelKey: 'landingPage.ai.bullet1' },
        { icon: 'mdi-radar', labelKey: 'landingPage.ai.bullet2' },
        { icon: 'mdi-tag-multiple-outline', labelKey: 'landingPage.ai.bullet3' },
        { icon: 'mdi-lightbulb-on-outline', labelKey: 'landingPage.ai.bullet4' }
      ],
      aiCards: [
        {
          icon: 'mdi-chart-box-outline',
          titleKey: 'landingPage.ai.card1Title',
          descKey: 'landingPage.ai.card1Desc',
          tagKey: 'landingPage.ai.card1Tag'
        },
        {
          icon: 'mdi-bell-alert-outline',
          titleKey: 'landingPage.ai.card2Title',
          descKey: 'landingPage.ai.card2Desc',
          tagKey: 'landingPage.ai.card2Tag'
        },
        {
          icon: 'mdi-robot-outline',
          titleKey: 'landingPage.ai.card3Title',
          descKey: 'landingPage.ai.card3Desc',
          tagKey: 'landingPage.ai.card3Tag'
        }
      ],
      familyCards: [
        { icon: 'mdi-receipt-text-outline', titleKey: 'landingPage.family.card1' },
        { icon: 'mdi-home-heart', titleKey: 'landingPage.family.card2' },
        { icon: 'mdi-airplane', titleKey: 'landingPage.family.card3' },
        { icon: 'mdi-account-supervisor-circle-outline', titleKey: 'landingPage.family.card4' }
      ],
      testimonials: [
        {
          quoteKey: 'landingPage.testimonials.quote1',
          authorKey: 'landingPage.testimonials.author1'
        },
        {
          quoteKey: 'landingPage.testimonials.quote2',
          authorKey: 'landingPage.testimonials.author2'
        }
      ],
      securityItems: [
        { icon: 'mdi-lock-check-outline', labelKey: 'landingPage.security.item1' },
        { icon: 'mdi-two-factor-authentication', labelKey: 'landingPage.security.item2' },
        { icon: 'mdi-server-security', labelKey: 'landingPage.security.item3' },
        { icon: 'mdi-account-key-outline', labelKey: 'landingPage.security.item4' }
      ],
      starterFeatures: [
        'landingPage.plans.starterFeature1',
        'landingPage.plans.starterFeature2',
        'landingPage.plans.starterFeature3',
        'landingPage.plans.starterFeature4',
        'landingPage.plans.starterFeature5'
      ],
      teamFeatures: [
        'landingPage.plans.teamFeature1',
        'landingPage.plans.teamFeature2',
        'landingPage.plans.teamFeature3',
        'landingPage.plans.teamFeature4',
        'landingPage.plans.teamFeature5',
        'landingPage.plans.teamFeature6'
      ]
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    handleResize() {
      if (window.innerWidth > 1024) {
        this.closeMenu()
      }
    },
    handleNavClick(sectionId) {
      this.scrollToSection(sectionId)
      this.closeMenu()
    },
    scrollToSection(sectionId) {
      const target = document.getElementById(sectionId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    navigateTo(name, query) {
      this.closeMenu()
      this.$router.push(query ? { name, query } : { name })
    },
    navigateToPath(path) {
      this.closeMenu()
      this.$router.push(path)
    },
    authorInitials(author) {
      return author
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    },
    async handleSubmit() {
      this.contactFeedback = { type: 'info', message: '' }
      if (!this.contactForm.email.includes('@')) {
        this.contactFeedback = {
          type: 'error',
          message: this.$t('landingPage.contact.invalidEmail')
        }
        return
      }

      if (this.isSubmitting) return

      this.isSubmitting = true

      try {
        await NotificationService.sendContactForm(this.contactForm)
        this.contactFeedback = {
          type: 'success',
          message: this.$t('landingPage.contact.success')
        }
        this.contactForm = { name: '', email: '', message: '' }
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error)
        this.contactFeedback = {
          type: 'error',
          message: parseApiError(error, this.$t('landingPage.contact.errorDefault'))
        }
      } finally {
        this.isSubmitting = false
      }
    },
    getFormattingLocale() {
      const uiLocale = this.$i18n?.locale || 'pt'
      const localeMap = {
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR'
      }
      return localeMap[uiLocale] || 'pt-BR'
    },
    formatPlanDisplay(plan) {
      const amount = Number(plan?.amount || 0)
      const browserLocale = typeof navigator !== 'undefined' ? navigator.language : null
      const currency = resolvePricingCurrency({
        locale: this.$i18n?.locale,
        browserLocale
      })
      const periodKey =
        plan?.billingPeriod === 'year' ? 'landingPage.plans.perYear' : 'landingPage.plans.perMonth'
      const formattedAmount = formatConvertedPriceFromBRL({
        amountInBRL: amount,
        targetCurrency: currency,
        uiLocale: this.getFormattingLocale()
      })
      return `${formattedAmount} / ${this.$t(periodKey)}`
    },
    async redirectToCheckout(plan) {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) {
        localStorage.setItem('selectedPlan', plan)
        const redirect = OnboardingOrchestrator.buildRedirectPath('/choose-plan', { plan })
        this.$router.push({ name: 'login', query: { redirect } })
        return
      }

      this.$router.push({ name: 'choose-plan', query: { plan } })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');

.hero-section-test {
  padding: 56px 0 88px;
}

.hero-container-test {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  align-items: center;
  gap: 34px;
}

.hero-content-test {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hero-headline-test {
  margin-top: 14px;
}

.hero-subheadline-test {
  margin-bottom: 4px;
}

.hero-image-wrapper-test {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image-test {
  width: 100%;
  border-radius: 28px;
  display: block;
  box-shadow: var(--shadow);
  object-fit: cover;
  min-height: 440px;
}

.hero-overlay-card-test {
  position: absolute;
  bottom: 28px;
  right: 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  min-width: 240px;
  max-width: min(90%, 320px);
  opacity: 0;
  animation: fadeInCardTest 0.28s ease 0.1s forwards;
  z-index: 2;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

.hero-overlay-card-test::before {
  content: '';
  display: block;
  position: absolute;
  left: 50%;
  bottom: -18px;
  width: 32px;
  height: 1px;
  background: rgba(31, 41, 55, 0.1);
  transform: translateX(-50%);
  border-radius: 1px;
  pointer-events: none;
}

@keyframes fadeInCardTest {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overlay-label-test {
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 700;
  margin-bottom: 10px;
}

.overlay-value-test {
  font-size: 2rem;
  font-weight: 800;
  color: #1f7a45;
  margin-bottom: 18px;
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.overlay-details-test {
  font-size: 0.98rem;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.5;
}

.overlay-detail-value-test {
  color: #18181b;
  font-weight: 700;
}

.overlay-detail-status-test {
  color: #1f7a45;
  font-weight: 700;
}

@media (max-width: 900px) {
  .hero-container-test {
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: stretch;
  }

  .hero-image-test {
    min-height: 380px;
  }
}

@media (max-width: 600px) {
  .hero-section-test {
    padding: 44px 0 74px;
  }

  .hero-content-test {
    max-width: 100%;
  }

  .hero-overlay-card-test {
    bottom: 10px;
    right: 10px;
    padding: 14px 12px;
    min-width: 0;
    font-size: 0.98rem;
  }
  .hero-overlay-card-test::before {
    width: 18px;
    bottom: -10px;
  }

  .hero-headline-test {
    margin-top: 12px;
  }
}
#landing-page {
  --page-bg: #f5f1e8;
  --surface: rgba(255, 255, 255, 0.82);
  --surface-strong: #ffffff;
  --surface-soft: #fcf8f1;
  --surface-accent: #f2ece3;
  --ink: #172033;
  --ink-soft: #4c576d;
  --line: rgba(23, 32, 51, 0.12);
  --brand: #b6551f;
  --brand-strong: #8e4318;
  --accent: #205f63;
  --accent-strong: #173f4b;
  --plum: #69495f;
  --shadow: 0 18px 38px rgba(23, 32, 51, 0.08);
  --shadow-soft: 0 10px 22px rgba(23, 32, 51, 0.05);
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.08), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.08), transparent 22%),
    linear-gradient(180deg, #fbf8f2 0%, #f8f4ed 52%, #fdfaf5 100%);
  color: var(--ink);
  font-family: 'Source Sans 3', sans-serif;
  max-width: none !important;
  padding: 0 !important;
}

#landing-page :deep(*) {
  box-sizing: border-box;
}

#landing-page :deep(.v-icon) {
  color: inherit;
}

.landing-page {
  overflow-x: hidden;
}

.shell {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
}

.landing-header {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(14px);
  background: rgba(251, 248, 242, 0.82);
  border-bottom: 1px solid rgba(23, 32, 51, 0.08);
}

.header-shell {
  min-height: 88px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  background: transparent;
  border: 0;
  padding: 0;
  color: inherit;
  cursor: pointer;
}

.brand-logo {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  object-fit: cover;
  box-shadow: var(--shadow-soft);
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
  font-family: 'Manrope', sans-serif;
}

.brand-copy strong {
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.brand-copy small {
  font-size: 0.9rem;
  color: var(--ink-soft);
}

.desktop-nav {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.nav-link,
.footer-link,
.mobile-link {
  border: 0;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font: inherit;
}

.nav-link {
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.nav-link:hover,
.footer-link:hover,
.mobile-link:hover {
  color: var(--brand-strong);
}

.nav-link:hover {
  background: rgba(182, 85, 31, 0.08);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  min-height: 46px;
  border-radius: 999px;
  padding: 0 22px;
  border: 1px solid transparent;
  font-family: 'Manrope', sans-serif;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, var(--brand) 0%, #d16b31 100%);
  color: #fff;
  box-shadow: 0 10px 18px rgba(182, 85, 31, 0.16);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--brand-strong) 0%, var(--brand) 100%);
}

.btn-secondary {
  background: transparent;
  border-color: rgba(32, 95, 99, 0.22);
  color: var(--accent-strong);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(23, 32, 51, 0.08);
  color: var(--ink);
}

.btn-dark-outline {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.btn-large {
  min-height: 54px;
  padding: 0 26px;
}

.menu-toggle {
  width: 46px;
  height: 46px;
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  border-radius: 14px;
  border: 1px solid rgba(23, 32, 51, 0.08);
  background: rgba(255, 255, 255, 0.82);
}

.menu-toggle span {
  width: 18px;
  height: 2px;
  background: var(--ink);
  margin: 0 auto;
  border-radius: 999px;
}

.mobile-menu {
  display: none;
}

.section-offset {
  scroll-margin-top: 106px;
}

.section-block {
  padding: 96px 0;
}

.section-light {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0.12));
}

.section-soft-accent {
  background: linear-gradient(180deg, rgba(245, 239, 231, 0.76), rgba(255, 255, 255, 0.1));
}

.section-airy {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.48), rgba(242, 236, 227, 0.5));
}

.hero-section {
  padding: 56px 0 88px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.95fr);
  gap: 36px;
  align-items: center;
}

.eyebrow,
.section-kicker,
.panel-label {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 14px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.eyebrow,
.section-kicker {
  background: rgba(32, 95, 99, 0.1);
  color: var(--accent-strong);
}

.section-kicker-dark,
.panel-label {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.82);
}

h1 {
  margin: 18px 0 16px;
  font-size: clamp(2.7rem, 5vw, 4.8rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

h2 {
  margin: 16px 0 14px;
  font-size: clamp(2rem, 3.5vw, 3.2rem);
  line-height: 1.02;
  letter-spacing: -0.045em;
}

h3 {
  margin: 0;
  font-size: 1.18rem;
  line-height: 1.15;
}

p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 1.06rem;
  line-height: 1.65;
}

.hero-lead,
.section-intro {
  max-width: 62ch;
  font-size: 1.16rem;
}

.narrow {
  margin-inline: auto;
  max-width: 54ch;
}

.centered-heading {
  text-align: center;
  margin-bottom: 36px;
}

.hero-points {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 28px 0 30px;
}

.hero-point {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(23, 32, 51, 0.08);
  box-shadow: var(--shadow-soft);
  color: var(--ink);
  font-weight: 600;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 28px;
}

.proof-copy {
  margin-top: 16px;
  font-size: 0.95rem;
}

.hero-visual {
  display: grid;
  gap: 18px;
}

.hero-panel {
  border-radius: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(23, 32, 51, 0.08);
  box-shadow: var(--shadow);
}

.hero-panel-main {
  position: relative;
  overflow: hidden;
}

.hero-panel-main::after {
  content: '';
  position: absolute;
  inset: auto -80px -80px auto;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(32, 95, 99, 0.1), transparent 72%);
}

.hero-panel-head {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.hero-insights {
  display: grid;
  gap: 14px;
}

.insight-card,
.ai-showcase-card,
.feature-card,
.testimonial-card,
.security-card,
.timeline-card,
.plan-card,
.contact-form {
  background: var(--surface-strong);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-soft);
}

.insight-card {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
}

.insight-card span {
  display: inline-flex;
  margin-top: 8px;
  color: var(--brand-strong);
  font-size: 0.9rem;
  font-weight: 700;
}

.hero-panel-image {
  padding: 12px;
}

.hero-panel-image img {
  display: block;
  width: 100%;
  min-height: 280px;
  border-radius: 22px;
  object-fit: cover;
}

.narrative-grid,
.contact-grid,
.ai-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px;
  align-items: start;
}

.section-media-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr);
  gap: 34px;
  align-items: center;
}

.section-media-copy {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.section-media-copy .card-grid {
  margin-top: 24px;
}

.section-media-visual {
  width: 100%;
}

.section-media-image {
  width: 100%;
  display: block;
  border-radius: 28px;
  object-fit: cover;
  box-shadow: var(--shadow);
  min-height: 360px;
}

.product-moments-section {
  padding-top: 88px;
  background: linear-gradient(180deg, rgba(23, 32, 51, 0.02), rgba(255, 255, 255, 0.34));
}

.product-moments-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.product-moment {
  overflow: hidden;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(23, 32, 51, 0.1);
  box-shadow: var(--shadow-soft);
}

.product-moment__media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #08101d;
}

.product-moment__media::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 -42px 64px rgba(0, 0, 0, 0.18);
}

.product-moment__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-moment__copy {
  display: grid;
  gap: 10px;
  padding: 22px;
}

.product-moment__copy span {
  color: var(--accent-strong);
  font-family: 'Manrope', sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.product-moment__copy strong {
  color: var(--ink);
  font-family: 'Manrope', sans-serif;
  font-size: 1.22rem;
  line-height: 1.15;
}

.product-moment__copy p {
  font-size: 0.98rem;
  line-height: 1.5;
}

.card-grid {
  display: grid;
  gap: 18px;
}

.card-grid-tight {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.card-grid-compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.card-grid-four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.feature-card,
.security-card,
.timeline-card,
.testimonial-card,
.ai-showcase-card {
  border-radius: 26px;
  padding: 24px;
}

.feature-card,
.security-card {
  min-height: 168px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-card strong,
.timeline-card strong,
.testimonial-card strong,
.security-card span,
.value-banner strong,
.plan-card h3 {
  font-family: 'Manrope', sans-serif;
  font-size: 1.18rem;
  line-height: 1.18;
}

.feature-card-pain {
  background: linear-gradient(180deg, #fff 0%, #faf3ee 100%);
}

.timeline-grid,
.plans-grid,
.testimonial-grid {
  display: grid;
  gap: 20px;
}

.timeline-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.timeline-card {
  display: grid;
  gap: 16px;
  align-content: start;
}

.timeline-step {
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--brand);
}

.bullet-list,
.plan-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
}

.bullet-list {
  display: grid;
  gap: 12px;
  margin: 28px 0 0;
}

.bullet-list li,
.plan-benefits li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.ai-card-stack {
  display: grid;
  gap: 18px;
}

.ai-showcase-card {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(23, 32, 51, 0.08);
}

.ai-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.ai-card-head span {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--accent-strong);
}

.testimonial-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.testimonial-card {
  position: relative;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.78);
}

.testimonial-topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.avatar-badge {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(32, 95, 99, 0.12);
  color: var(--accent-strong);
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
}

.testimonial-rating {
  display: inline-flex;
  gap: 2px;
  color: #d98d2c;
}

.quote-icon {
  color: rgba(32, 95, 99, 0.22);
}

.security-card {
  justify-content: center;
}

.value-banner {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 26px;
  padding: 20px 22px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(32, 95, 99, 0.08) 0%, rgba(255, 255, 255, 0.92) 100%);
  color: var(--ink);
  border: 1px solid rgba(23, 32, 51, 0.08);
  box-shadow: var(--shadow-soft);
}

.value-banner p {
  color: var(--ink-soft);
}

.plans-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
}

.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px;
  border-radius: 28px;
}

.plan-card-starter {
  background: linear-gradient(180deg, #fff 0%, #fcf5ec 100%);
}

.plan-card-team {
  background: linear-gradient(180deg, #fbf7ef 0%, #f4ece2 100%);
  color: var(--ink);
  border-color: rgba(32, 95, 99, 0.14);
  box-shadow: 0 16px 34px rgba(32, 95, 99, 0.08);
}

.plan-card-team p,
.plan-card-team li,
.plan-card-team span,
.plan-card-team h3,
.plan-card-team strong {
  color: inherit;
}

.plan-pill,
.plan-tag {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  padding: 8px 12px;
  font-family: 'Manrope', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
}

.plan-tag {
  background: rgba(182, 85, 31, 0.12);
  color: var(--brand-strong);
}

.plan-tag-team {
  background: rgba(32, 95, 99, 0.12);
  color: var(--accent-strong);
}

.plan-pill {
  position: absolute;
  top: 18px;
  right: 18px;
  background: #f2c76d;
  color: #3d2a10;
}

.plan-subtitle {
  min-height: 52px;
}

.price-stack {
  display: grid;
  gap: 6px;
}

.price-stack strong {
  font-size: 1.7rem;
}

.price-stack span {
  font-size: 1rem;
  color: var(--ink-soft);
}

.plan-card-team .price-stack span {
  color: var(--ink-soft);
}

.plan-benefits {
  display: grid;
  gap: 12px;
  margin-top: 6px;
}

.plan-benefits .v-icon {
  margin-top: 2px;
  color: var(--brand);
}

.plan-card-team .plan-benefits .v-icon {
  color: var(--accent-strong);
}

.plan-actions {
  display: grid;
  gap: 12px;
  margin-top: auto;
}

.contact-mail {
  display: inline-flex;
  margin-top: 18px;
  color: var(--brand-strong);
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  text-decoration: none;
}

.contact-form {
  border-radius: 30px;
  padding: 28px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
}

.form-group input,
.form-group textarea {
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(23, 32, 51, 0.12);
  background: #fff;
  padding: 14px 16px;
  font: inherit;
  color: var(--ink);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(32, 95, 99, 0.45);
  box-shadow: 0 0 0 4px rgba(32, 95, 99, 0.1);
}

.contact-feedback {
  margin: 0;
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 700;
}

.contact-feedback--success {
  background: rgba(32, 95, 99, 0.1);
  color: #205f63;
}

.contact-feedback--error {
  background: rgba(192, 57, 43, 0.1);
  color: #a93226;
}

.landing-footer {
  padding: 52px 0;
  background: linear-gradient(135deg, #22313b 0%, #283541 100%);
  color: #f7efe7;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  gap: 26px;
  align-items: start;
}

.footer-grid p,
.footer-copy,
.footer-link {
  color: rgba(247, 239, 231, 0.76);
}

.footer-links,
.footer-policy-links,
.footer-actions {
  display: grid;
  gap: 12px;
}

.footer-link {
  width: fit-content;
  padding: 0;
  text-align: left;
}

.footer-copy {
  font-size: 0.92rem;
}

.icon-chip {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(182, 85, 31, 0.1);
  color: var(--brand-strong);
}

.icon-chip-small {
  width: 34px;
  height: 34px;
  border-radius: 12px;
}

.icon-chip-contrast {
  background: rgba(32, 95, 99, 0.12);
  color: var(--accent-strong);
}

.icon-chip-dark {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.icon-chip-warm {
  background: rgba(217, 141, 44, 0.14);
  color: #8c4f10;
}

@media (max-width: 1180px) {
  .product-moments-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-grid-four,
  .timeline-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }

  .footer-actions {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1024px) {
  .header-shell {
    grid-template-columns: auto auto;
    justify-content: space-between;
  }

  .desktop-nav,
  .header-actions .btn {
    display: none;
  }

  .menu-toggle,
  .mobile-menu.open {
    display: flex;
  }

  .mobile-menu {
    display: none;
    flex-direction: column;
    gap: 10px;
    width: min(1180px, calc(100vw - 32px));
    margin: 0 auto 18px;
    padding: 18px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(23, 32, 51, 0.08);
    box-shadow: var(--shadow-soft);
  }

  .mobile-link {
    width: 100%;
    text-align: left;
    padding: 10px 4px;
    font-weight: 700;
  }

  .mobile-actions {
    display: grid;
    gap: 10px;
    margin-top: 8px;
  }

  .mobile-actions .btn {
    display: inline-flex;
    justify-content: center;
  }

  .hero-grid,
  .hero-container-test,
  .narrative-grid,
  .section-media-grid,
  .contact-grid,
  .ai-grid,
  .plans-grid,
  .testimonial-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .shell {
    width: min(100vw - 24px, 100%);
  }

  .section-block,
  .hero-section {
    padding: 76px 0;
  }

  .header-shell {
    min-height: 76px;
  }

  .brand-copy small {
    display: none;
  }

  h1 {
    font-size: clamp(2.25rem, 12vw, 3.2rem);
  }

  h2 {
    font-size: clamp(1.8rem, 9vw, 2.5rem);
  }

  .card-grid-tight,
  .card-grid-compact,
  .card-grid-four,
  .product-moments-grid,
  .timeline-grid {
    grid-template-columns: 1fr;
  }

  .hero-point {
    width: 100%;
  }

  .hero-panel,
  .feature-card,
  .timeline-card,
  .testimonial-card,
  .plan-card,
  .contact-form,
  .ai-showcase-card {
    border-radius: 22px;
    padding: 20px;
  }

  .value-banner {
    grid-template-columns: 1fr;
  }

  .section-media-image,
  .hero-image-test {
    min-height: 300px;
  }

  .product-moment {
    border-radius: 22px;
  }

  .product-moment__copy {
    padding: 18px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .footer-link {
    width: 100%;
  }
}
</style>
