<template>
  <v-container
    fluid
    :class="[
      'blog-article-view',
      isInAppShell ? 'blog-article-view--app' : 'blog-article-view--public'
    ]"
  >
    <div class="blog-article-view__shell">
      <div class="blog-article-view__topbar">
        <v-btn variant="text" color="primary" @click="goBack">
          <v-icon start>mdi-arrow-left</v-icon>
          {{ isInAppShell ? 'Voltar ao Content Center' : 'Voltar ao blog' }}
        </v-btn>
      </div>

      <ContentArticleTemplate
        v-if="entry"
        :entry="entry"
        :variant="isInAppShell ? 'app' : 'public'"
      />

      <v-card v-else class="blog-article-view__empty" rounded="xl" elevation="0">
        <v-card-text>
          <h1>Template nao encontrado</h1>
          <p>Esse slug ainda nao foi configurado no catalogo editorial.</p>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentArticleTemplate from '@/components/content/ContentArticleTemplate.vue'
import { getBlogTemplateEntry } from '@/content/blogTemplates'

const route = useRoute()
const router = useRouter()

const entry = computed(() => getBlogTemplateEntry(String(route.params.slug || '')))
const isInAppShell = computed(() => Boolean(route.meta?.requiresAuth))

function goBack() {
  void router.push(isInAppShell.value ? '/app/blog' : '/blog')
}
</script>

<style scoped>
.blog-article-view {
  padding: 0;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.blog-article-view--public {
  background:
    radial-gradient(circle at top left, rgba(32, 95, 99, 0.08), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(182, 85, 31, 0.08), transparent 22%),
    linear-gradient(180deg, #fbf8f2 0%, #f8f4ed 52%, #fdfaf5 100%);
}

.blog-article-view__shell {
  min-height: 100vh;
}

.blog-article-view__topbar {
  max-width: 1040px;
  margin: 0 auto;
  padding: 24px 16px 0;
}

.blog-article-view__empty {
  max-width: 1040px;
  margin: 24px auto 0;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.blog-article-view__empty h1 {
  margin: 0 0 10px;
}

.blog-article-view__empty p {
  margin: 0;
  color: #475569;
}
</style>
