<template>
  <v-dialog v-model="internalVisible" max-width="640">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t('transactionComments.title') }}</span>
        <v-chip v-if="transactionDescription" size="small" variant="tonal" color="#667eea">
          {{ transactionDescription }}
        </v-chip>
      </v-card-title>
      <v-card-text>
        <p class="comments-subtitle">{{ $t('transactionComments.subtitle') }}</p>

        <div v-if="loading" class="comments-empty">
          <v-progress-circular indeterminate color="#667eea" size="24" />
          <span>{{ $t('transactionComments.loading') }}</span>
        </div>

        <div v-else-if="comments.length" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-card">
            <div class="comment-card__header">
              <strong>{{ comment.authorUserId }}</strong>
              <span>{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p>{{ comment.body }}</p>
          </div>
        </div>

        <div v-else class="comments-empty">
          <v-icon size="24" color="#94a3b8">mdi-comment-outline</v-icon>
          <span>{{ $t('transactionComments.empty') }}</span>
        </div>

        <v-textarea
          v-model="draftComment"
          class="mt-4"
          :label="$t('transactionComments.field')"
          auto-grow
          rows="3"
          variant="outlined"
          :disabled="submitting"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="internalVisible = false">{{ $t('common.cancel') }}</v-btn>
        <v-btn color="#667eea" :loading="submitting" :disabled="!draftComment.trim()" @click="submit">
          {{ $t('transactionComments.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TransactionCommentView } from '@/types/financialRead'

const props = defineProps<{
  visible: boolean
  loading: boolean
  submitting: boolean
  comments: TransactionCommentView[]
  transactionDescription?: string
}>()

const emit = defineEmits(['update:visible', 'submit'])
const { locale } = useI18n()

const internalVisible = ref(props.visible)
const draftComment = ref('')

watch(() => props.visible, (value) => {
  internalVisible.value = value
  if (!value) {
    draftComment.value = ''
  }
})

watch(() => internalVisible.value, (value) => emit('update:visible', value))

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const localeCode = locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR'
  return new Intl.DateTimeFormat(localeCode, { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

const submit = () => {
  const body = draftComment.value.trim()
  if (!body) return
  emit('submit', body)
  draftComment.value = ''
}
</script>

<style scoped>
.comments-subtitle {
  color: #64748b;
  margin-bottom: 16px;
}

.comments-list {
  display: grid;
  gap: 12px;
}

.comment-card {
  border: 1px solid rgba(102, 126, 234, 0.12);
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 12px 14px;
}

.comment-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #64748b;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.comment-card p {
  margin: 0;
  color: #1f2937;
}

.comments-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  padding: 8px 0;
}

.v-theme--dark .comments-subtitle,
.v-theme--dark .comment-card__header,
.v-theme--dark .comments-empty {
  color: #cbd5e1;
}

.v-theme--dark .comment-card p {
  color: #ffffff;
}
</style>
