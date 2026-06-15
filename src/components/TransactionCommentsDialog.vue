<template>
  <v-dialog v-model="internalVisible" max-width="640">
    <v-card>
      <v-card-title class="comments-header">
        <span>{{ $t('transactionComments.title') }}</span>
        <small v-if="transactionDescription">{{ transactionDescription }}</small>
      </v-card-title>
      <v-card-text>
        <p class="comments-subtitle">{{ $t('transactionComments.subtitle') }}</p>

        <div v-if="loading" class="comments-empty">
          <v-progress-circular indeterminate color="var(--cb-primary)" size="24" />
          <span>{{ $t('transactionComments.loading') }}</span>
        </div>

        <div v-else-if="comments.length" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-card">
            <div class="comment-card__header">
              <strong>{{ commentAuthorLabel(comment) }}</strong>
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
        <v-btn color="var(--cb-primary)" :loading="submitting" :disabled="!draftComment.trim()" @click="submit">
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

type CommentAuthorDirectoryItem = {
  id?: string | number | null
  name?: string | null
  displayName?: string | null
  username?: string | null
}

const props = defineProps<{
  visible: boolean
  loading: boolean
  submitting: boolean
  comments: TransactionCommentView[]
  transactionDescription?: string
  currentUserId?: string | number | null
  authorDirectory?: CommentAuthorDirectoryItem[]
}>()

const emit = defineEmits(['update:visible', 'submit'])
const { locale, t } = useI18n()

const internalVisible = ref(props.visible)
const draftComment = ref('')
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeIdentity = (value?: string | number | null) => String(value ?? '').trim().toLowerCase()

const safeDisplayName = (value?: string | null) => {
  const normalized = String(value || '').trim()
  if (!normalized) return ''
  if (uuidPattern.test(normalized)) return ''
  if (emailPattern.test(normalized)) return ''
  return normalized
}

const commentAuthorDirectory = computed(() => Array.isArray(props.authorDirectory) ? props.authorDirectory : [])

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

const findAuthorInDirectory = (authorUserId?: string | null) => {
  const normalizedAuthorId = normalizeIdentity(authorUserId)
  if (!normalizedAuthorId) return null
  return commentAuthorDirectory.value.find((author) => normalizeIdentity(author.id) === normalizedAuthorId) || null
}

const commentAuthorLabel = (comment: TransactionCommentView) => {
  const authorUserId = String(comment.authorUserId || '')
  const currentUserId = normalizeIdentity(props.currentUserId)
  if (authorUserId && currentUserId && normalizeIdentity(authorUserId) === currentUserId) {
    return t('transactionComments.you')
  }

  const commentWithOptionalIdentity = comment as TransactionCommentView & {
    authorName?: string | null
    authorDisplayName?: string | null
    displayName?: string | null
    username?: string | null
    name?: string | null
  }
  const commentName = safeDisplayName(
    commentWithOptionalIdentity.authorDisplayName
      || commentWithOptionalIdentity.authorName
      || commentWithOptionalIdentity.displayName
      || commentWithOptionalIdentity.username
      || commentWithOptionalIdentity.name
  )
  if (commentName) return commentName

  const directoryAuthor = findAuthorInDirectory(authorUserId)
  const directoryName = safeDisplayName(directoryAuthor?.displayName || directoryAuthor?.name || directoryAuthor?.username || null)
  if (directoryName) return directoryName

  return t('transactionComments.spaceMember')
}

const submit = () => {
  const body = draftComment.value.trim()
  if (!body) return
  emit('submit', body)
  draftComment.value = ''
}
</script>

<style scoped>
.comments-header {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comments-header span {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
}

.comments-header small {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

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

.comment-card__header strong {
  color: #334155;
  min-width: 0;
  overflow-wrap: anywhere;
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
.v-theme--dark .comments-header small,
.v-theme--dark .comment-card__header,
.v-theme--dark .comments-empty {
  color: #cbd5e1;
}

.v-theme--dark .comment-card__header strong {
  color: #ffffff;
}

.v-theme--dark .comment-card p {
  color: #ffffff;
}
</style>
