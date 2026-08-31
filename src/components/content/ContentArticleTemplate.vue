<template>
  <v-container
    fluid
    :class="[
      'content-template',
      variant === 'public' ? 'content-template--public' : 'content-template--app'
    ]"
  >
    <div class="content-template__shell">
      <section class="content-template__hero">
        <div class="content-template__hero-copy">
          <v-chip size="small" color="primary" variant="tonal">{{ entry.category }}</v-chip>
          <h1>{{ entry.title }}</h1>
          <p class="content-template__excerpt">{{ entry.excerpt }}</p>

          <div class="content-template__meta">
            <span>{{ entry.readTime }}</span>
            <span>{{ entry.stage }}</span>
            <span>{{ entry.audience }}</span>
          </div>

          <a
            v-if="entry.downloadUrl"
            class="content-template__download"
            :href="entry.downloadUrl"
            download
          >
            <v-icon size="18">mdi-download</v-icon>
            {{ entry.downloadLabel || t('contentExperience.common.download') }}
          </a>
        </div>

        <v-card class="content-template__prompt-card" rounded="xl" elevation="0">
          <v-card-text>
            <span class="content-template__eyebrow">{{
              isGuide ? guideLabels.quickGuide : t('contentExperience.blog.template.heroPrompt')
            }}</span>
            <p>{{ entry.heroPrompt }}</p>
          </v-card-text>
        </v-card>
      </section>

      <section v-if="entry.videoSrc" class="content-template__section">
        <video
          class="content-template__video"
          :src="entry.videoSrc"
          :poster="entry.videoPoster"
          controls
          playsinline
          preload="metadata"
        />
      </section>

      <section class="content-template__section">
        <div class="content-template__heading">
          <span class="content-template__eyebrow">{{
            isGuide ? guideLabels.summary : t('contentExperience.blog.template.editorialSummary')
          }}</span>
          <h2>
            {{ isGuide ? guideLabels.beforeStart : t('contentExperience.blog.template.openingBlock') }}
          </h2>
        </div>
        <v-card class="content-template__block" rounded="xl" elevation="0">
          <v-card-text>
            <p>{{ entry.summaryPrompt }}</p>
          </v-card-text>
        </v-card>
      </section>

      <section class="content-template__section">
        <div class="content-template__heading">
          <span class="content-template__eyebrow">{{
            t('contentExperience.blog.template.takeaways')
          }}</span>
          <h2>{{ t('contentExperience.blog.template.takeawaysTitle') }}</h2>
        </div>

        <v-row dense>
          <v-col v-for="item in entry.takeaways" :key="item" cols="12" md="4">
            <v-card class="content-template__takeaway" rounded="xl" elevation="0" height="100%">
              <v-card-text>{{ item }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section class="content-template__section">
        <div class="content-template__heading">
          <span class="content-template__eyebrow">{{
            isGuide ? guideLabels.steps : t('contentExperience.blog.template.structure')
          }}</span>
          <h2>
            {{ isGuide ? guideLabels.stepByStep : t('contentExperience.blog.template.articleTemplate') }}
          </h2>
        </div>

        <div class="content-template__blocks">
          <v-card
            v-for="section in entry.sections"
            :key="section.title"
            class="content-template__block"
            rounded="xl"
            elevation="0"
          >
            <v-card-text>
              <h3>{{ section.title }}</h3>
              <p>{{ section.prompt }}</p>
              <ul v-if="section.bullets?.length" class="content-template__list">
                <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
              </ul>
              <div v-if="section.media?.length" class="content-template__media-grid">
                <figure
                  v-for="media in section.media"
                  :key="media.src"
                  class="content-template__media"
                >
                  <img :src="media.src" :alt="media.alt" loading="lazy" />
                  <figcaption v-if="media.caption">{{ media.caption }}</figcaption>
                </figure>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>

      <section class="content-template__section">
        <v-card class="content-template__cta" rounded="xl" elevation="0">
          <v-card-text class="content-template__cta-content">
            <div>
              <span class="content-template__eyebrow">{{
                t('contentExperience.blog.template.articleCta')
              }}</span>
              <h2>{{ t('contentExperience.blog.template.articleCtaTitle') }}</h2>
            </div>
            <v-btn color="primary" size="large" @click="goToCta">
              {{ entry.ctaLabel }}
            </v-btn>
          </v-card-text>
        </v-card>
      </section>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { BlogTemplateEntry } from '@/content/blogTemplates'

const props = defineProps<{
  entry: BlogTemplateEntry
  variant?: 'public' | 'app'
}>()

const router = useRouter()
const { locale, t } = useI18n()

const isGuide = computed(() => props.entry.kind === 'guide')
const guideLabels = computed(() => {
  const isEnglish = locale.value.toLowerCase().startsWith('en')

  return isEnglish
    ? {
        beforeStart: 'Before you start',
        quickGuide: 'Quick guide',
        stepByStep: 'Step by step',
        steps: 'Steps',
        summary: 'Summary'
      }
    : {
        beforeStart: 'Antes de começar',
        quickGuide: 'Guia rápido',
        stepByStep: 'Passo a passo',
        steps: 'Etapas',
        summary: 'Resumo'
      }
})

function goToCta() {
  void router.push(props.entry.ctaPath)
}
</script>

<style scoped>
.content-template {
  padding: 0;
}

.content-template--public {
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.1), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.08), transparent 22%),
    linear-gradient(180deg, #f9f4eb 0%, #f6efe5 52%, #fbf7ef 100%);
}

.content-template__shell {
  max-width: 1040px;
  margin: 0 auto;
  padding: 20px 16px 64px;
}

.content-template__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 16px;
  align-items: start;
  margin-bottom: 24px;
}

.content-template__hero-copy,
.content-template__prompt-card,
.content-template__block,
.content-template__takeaway,
.content-template__cta {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.content-template__hero-copy {
  border-radius: 20px;
  padding: 24px;
  background: linear-gradient(145deg, rgba(182, 85, 31, 0.06), rgba(255, 255, 255, 0.98));
}

.content-template--public .content-template__hero-copy {
  border-radius: 28px;
  padding: 28px;
  background:
    linear-gradient(145deg, rgba(182, 85, 31, 0.1), rgba(255, 255, 255, 0.98)),
    #ffffff;
}

.content-template__hero-copy h1 {
  margin: 14px 0 10px;
  font-size: clamp(1.85rem, 4vw, 2.8rem);
  line-height: 1.04;
  letter-spacing: 0;
  color: #0f172a;
}

.content-template--public .content-template__hero-copy h1 {
  font-size: clamp(2.2rem, 4vw, 3.2rem);
}

.content-template__excerpt,
.content-template__prompt-card p,
.content-template__block p {
  color: #334155;
  line-height: 1.7;
}

.content-template__prompt-card p,
.content-template__block p {
  font-size: 1.02rem;
}

.content-template__meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
  color: #334155;
  font-size: 0.92rem;
}

.content-template__meta span {
  padding: 8px 12px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.12);
}

.content-template__download {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-top: 18px;
  padding: 11px 15px;
  border-radius: 12px;
  color: #9f4918;
  font-weight: 700;
  text-decoration: none;
  background: #fff;
  border: 1px solid rgba(182, 85, 31, 0.28);
}

.content-template__download:hover {
  background: rgba(182, 85, 31, 0.08);
}

.content-template__prompt-card,
.content-template__block,
.content-template__takeaway,
.content-template__cta {
  border-radius: 18px;
}

.content-template--public .content-template__prompt-card,
.content-template--public .content-template__block,
.content-template--public .content-template__takeaway,
.content-template--public .content-template__cta {
  border-radius: 24px;
}

.content-template__eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 6px 12px;
  background: color-mix(in srgb, var(--cb-primary) 12%, #ffffff);
  color: color-mix(in srgb, var(--cb-primary) 82%, #0f172a);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.content-template__section {
  margin-bottom: 24px;
}

.content-template__heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.content-template__heading h2,
.content-template__cta-content h2,
.content-template__block h3 {
  margin: 0;
  color: #0f172a;
}

.content-template__heading h2,
.content-template__cta-content h2 {
  font-size: clamp(1.35rem, 3vw, 2rem);
  line-height: 1.1;
}

.content-template__block :deep(.v-card-text),
.content-template__prompt-card :deep(.v-card-text),
.content-template__takeaway :deep(.v-card-text) {
  padding: 22px;
}

.content-template__blocks {
  display: grid;
  gap: 12px;
}

.content-template__list {
  margin: 14px 0 0;
  padding-left: 18px;
  color: #1f2937;
  line-height: 1.6;
}

.content-template__list li {
  margin-bottom: 8px;
}

.content-template__takeaway {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfa 100%);
}

.content-template__takeaway :deep(.v-card-text) {
  color: #1f2937;
  font-weight: 650;
  line-height: 1.5;
}

.content-template__video {
  display: block;
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 24px;
  background: #0f172a;
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
}

.content-template__media-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.content-template__media {
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  background: #ffffff;
}

.content-template__media img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: left top;
}

.content-template__media figcaption {
  padding: 10px 12px;
  color: #334155;
  font-size: 0.85rem;
  line-height: 1.45;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  background: #f8fafc;
}

.content-template__cta-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
}

:global(.v-theme--dark) .content-template--app .content-template__hero-copy,
:global(.v-theme--dark) .content-template--app .content-template__prompt-card,
:global(.v-theme--dark) .content-template--app .content-template__block,
:global(.v-theme--dark) .content-template--app .content-template__takeaway,
:global(.v-theme--dark) .content-template--app .content-template__cta {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(148, 163, 184, 0.14);
}

:global(.v-theme--dark) .content-template--app .content-template__hero-copy h1,
:global(.v-theme--dark) .content-template--app .content-template__heading h2,
:global(.v-theme--dark) .content-template--app .content-template__cta-content h2,
:global(.v-theme--dark) .content-template--app .content-template__block h3 {
  color: #f8fafc;
}

:global(.v-theme--dark) .content-template--app .content-template__excerpt,
:global(.v-theme--dark) .content-template--app .content-template__prompt-card p,
:global(.v-theme--dark) .content-template--app .content-template__block p,
:global(.v-theme--dark) .content-template--app .content-template__list,
:global(.v-theme--dark) .content-template--app .content-template__meta,
:global(.v-theme--dark) .content-template--app .content-template__media figcaption {
  color: #cbd5e1;
}

:global(.v-theme--dark) .content-template--app .content-template__meta span,
:global(.v-theme--dark) .content-template--app .content-template__media figcaption {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(148, 163, 184, 0.16);
}

:global(.v-theme--dark) .content-template--app .content-template__takeaway :deep(.v-card-text) {
  color: #e2e8f0;
}

:global(.v-theme--dark) .content-template--app .content-template__media {
  background: rgba(30, 41, 59, 0.92);
  border-color: rgba(148, 163, 184, 0.14);
}

.content-template--public .content-template__heading h2,
.content-template--public .content-template__cta-content h2,
.content-template--public .content-template__block h3 {
  color: #111827;
}

@media (max-width: 900px) {
  .content-template__hero,
  .content-template__cta-content {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 600px) {
  .content-template__shell {
    padding: 12px 12px 40px;
  }

  .content-template__hero-copy,
  .content-template__prompt-card :deep(.v-card-text),
  .content-template__block :deep(.v-card-text),
  .content-template__takeaway :deep(.v-card-text) {
    padding: 18px;
  }

  .content-template__media-grid {
    grid-template-columns: 1fr;
  }
}
</style>
