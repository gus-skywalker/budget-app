<template>
  <v-dialog v-model="internalVisible" max-width="640px">
    <v-card>
      <v-card-title class="attachments-dialog__header">
        <span>{{ $t('transactionAttachments.title') }}</span>
        <small v-if="transaction?.description">{{ transaction.description }}</small>
      </v-card-title>

      <v-card-text>
        <p class="attachments-dialog__subtitle">{{ $t('transactionAttachments.subtitle') }}</p>

        <div v-if="status === 'loading'" class="attachments-dialog__state">
          <v-progress-circular indeterminate color="var(--cb-primary)" size="24" />
          <span>{{ $t('transactionAttachments.loading') }}</span>
        </div>

        <div v-else-if="status === 'error'" class="attachments-dialog__state attachments-dialog__state--error">
          <v-icon size="24" color="warning">mdi-alert-circle-outline</v-icon>
          <span>{{ $t('transactionAttachments.load_error') }}</span>
          <v-btn size="x-small" variant="tonal" color="var(--cb-primary)" @click="$emit('retry')">
            {{ $t('transactionAttachments.retry') }}
          </v-btn>
        </div>

        <div v-else>
          <v-list v-if="attachments.length" density="compact" class="attachments-dialog__list">
            <v-list-item v-for="file in attachments" :key="attachmentKey(file)">
              <template #prepend>
                <v-icon size="20">mdi-paperclip</v-icon>
              </template>
              <v-list-item-title :title="attachmentName(file)">
                {{ attachmentName(file) }}
              </v-list-item-title>
              <v-list-item-subtitle v-if="attachmentMeta(file)">
                {{ attachmentMeta(file) }}
              </v-list-item-subtitle>
              <template #append>
                <div class="attachments-dialog__actions">
                  <v-btn icon size="x-small" variant="text" :title="$t('transactionAttachments.download')" @click.stop="downloadFile(file)">
                    <v-icon size="18">mdi-download</v-icon>
                  </v-btn>
                  <v-btn icon size="x-small" variant="text" color="error" :title="$t('transactionAttachments.remove')" @click.stop="removeAttachedFile(file)">
                    <v-icon size="18">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <div v-else class="attachments-dialog__state">
            <v-icon size="24" color="#94a3b8">mdi-paperclip-off</v-icon>
            <span>{{ $t('transactionAttachments.empty') }}</span>
          </div>
        </div>

        <v-divider class="my-4" />

        <v-file-input
          :label="$t('transactionAttachments.add_files')"
          accept="image/*,.pdf"
          multiple
          variant="outlined"
          density="comfortable"
          :disabled="status === 'loading'"
          @update:model-value="onNewFilesChange"
        />

        <v-list v-if="newFiles.length" density="compact" class="attachments-dialog__list">
          <v-list-item v-for="(file, index) in newFiles" :key="`${file.name}:${index}`">
            <template #prepend>
              <v-icon size="20">mdi-file-plus-outline</v-icon>
            </template>
            <v-list-item-title :title="file.name">{{ file.name }}</v-list-item-title>
            <template #append>
              <v-btn icon size="x-small" variant="text" @click="removeFile(index)">
                <v-icon size="18">mdi-close</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-divider class="my-4" />

        <p class="attachments-dialog__section-label">{{ $t('transactionAttachments.share_title') }}</p>
        <p class="attachments-dialog__hint">{{ $t('transactionAttachments.share_hint') }}</p>
        <v-text-field
          v-model="email"
          :label="$t('transactionAttachments.email')"
          type="email"
          :rules="emailRules"
          variant="outlined"
          density="comfortable"
        />
      </v-card-text>

      <v-card-actions class="attachments-dialog__footer">
        <v-btn variant="text" @click="internalVisible = false">{{ $t('common.cancel') }}</v-btn>
        <v-spacer />
        <v-btn variant="tonal" color="var(--cb-primary)" :disabled="!newFiles.length || status === 'loading'" @click="attachFiles">
          {{ $t('transactionAttachments.attach') }}
        </v-btn>
        <v-btn color="var(--cb-primary)" :disabled="!email" @click="shareTransaction">
          {{ $t('transactionAttachments.share_transaction') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="confirmDeleteDialog" max-width="500">
      <v-card>
        <v-card-title>{{ $t('transactionAttachments.confirm_delete_title') }}</v-card-title>
        <v-card-text>
          {{ $t('transactionAttachments.confirm_delete_text', { file: attachmentName(fileToDelete) }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDeleteDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="tonal" @click="confirmDeleteAttachment">{{ $t('transactionAttachments.remove') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type AttachmentStatus = 'notLoaded' | 'loading' | 'loaded' | 'error'

type AttachmentItem = {
  id?: string | number | null
  fileName?: string | null
  name?: string | null
  sizeBytes?: number | null
  createdAt?: string | null
}

const props = defineProps<{
  modelValue: boolean
  transaction?: Record<string, any> | null
  attachments?: AttachmentItem[]
  status?: AttachmentStatus
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  upload: [payload: { expense: Record<string, any>, files: FormData }]
  download: [payload: { expenseId: string, attachmentId: string | number, fileName: string }]
  remove: [payload: { expenseId: string, attachmentId: string | number }]
  share: [payload: { expense: Record<string, any>, email: string, files: File[] }]
  retry: []
}>()

const { t, locale } = useI18n()

const internalVisible = ref(props.modelValue)
const email = ref('')
const newFiles = ref<File[]>([])
const confirmDeleteDialog = ref(false)
const fileToDelete = ref<AttachmentItem | null>(null)

const attachments = computed(() => Array.isArray(props.attachments) ? props.attachments : [])
const status = computed<AttachmentStatus>(() => props.status || 'notLoaded')
const emailRules = computed(() => [
  (value: string) => !!value || t('transactionAttachments.email_required'),
  (value: string) => /.+@.+\..+/.test(value) || t('transactionAttachments.email_invalid'),
])

watch(() => props.modelValue, (value) => {
  internalVisible.value = value
  if (!value) {
    newFiles.value = []
    email.value = ''
    fileToDelete.value = null
    confirmDeleteDialog.value = false
  }
})

watch(() => internalVisible.value, (value) => emit('update:modelValue', value))

const attachmentName = (file?: AttachmentItem | null) => {
  const name = String(file?.fileName || file?.name || '').trim()
  return name || t('transactionAttachments.unnamed_file')
}

const attachmentMeta = (file: AttachmentItem) => {
  const parts = [formatFileSize(file.sizeBytes), formatDate(file.createdAt)].filter(Boolean)
  return parts.join(' • ')
}

const attachmentKey = (file: AttachmentItem) => String(file.id ?? file.fileName ?? file.name ?? 'attachment')

const formatFileSize = (value?: number | null) => {
  const size = Number(value)
  if (!Number.isFinite(size) || size <= 0) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const localeCode = locale.value === 'en' ? 'en-US' : locale.value === 'fr' ? 'fr-FR' : locale.value === 'es' ? 'es-ES' : 'pt-BR'
  return new Intl.DateTimeFormat(localeCode, { dateStyle: 'short' }).format(date)
}

const onNewFilesChange = (value: unknown) => {
  const rawFiles = Array.isArray(value)
    ? value
    : value instanceof File
      ? [value]
      : value && typeof value === 'object' && 'length' in value && typeof (value as { length: unknown }).length === 'number'
        ? Array.from(value as ArrayLike<File>)
        : (value as { target?: { files?: FileList } })?.target?.files
          ? Array.from((value as { target: { files: FileList } }).target.files)
          : []

  const files = rawFiles.filter((file): file is File => file instanceof File)
  if (!files.length) return

  const existingNames = new Set([
    ...attachments.value.map((file) => attachmentName(file)),
    ...newFiles.value.map((file) => file.name),
  ])

  const uniqueFiles = files.filter((newFile) => {
    const isDuplicate = existingNames.has(newFile.name)
    if (!isDuplicate) existingNames.add(newFile.name)
    return !isDuplicate
  })

  newFiles.value = [...newFiles.value, ...uniqueFiles]
}

const removeFile = (index: number) => {
  newFiles.value.splice(index, 1)
}

const removeAttachedFile = (file: AttachmentItem) => {
  fileToDelete.value = file
  confirmDeleteDialog.value = true
}

const confirmDeleteAttachment = () => {
  const expenseId = props.transaction?.id
  const attachmentId = fileToDelete.value?.id
  if (!expenseId || attachmentId === null || attachmentId === undefined) return

  emit('remove', { expenseId: String(expenseId), attachmentId })
  fileToDelete.value = null
  confirmDeleteDialog.value = false
}

const downloadFile = (file: AttachmentItem) => {
  const expenseId = props.transaction?.id
  const attachmentId = file.id
  if (!expenseId || attachmentId === null || attachmentId === undefined) return
  emit('download', {
    expenseId: String(expenseId),
    attachmentId,
    fileName: attachmentName(file),
  })
}

const attachFiles = () => {
  if (!props.transaction?.id || !newFiles.value.length) return
  const formData = new FormData()
  formData.append('expenseId', props.transaction.id)
  newFiles.value.forEach((file) => formData.append('files', file))
  emit('upload', { expense: props.transaction, files: formData })
  newFiles.value = []
}

const shareTransaction = () => {
  if (!props.transaction || !email.value) return
  emit('share', {
    expense: props.transaction,
    email: email.value,
    files: [...newFiles.value],
  })
  newFiles.value = []
  internalVisible.value = false
}
</script>

<style scoped>
.attachments-dialog__header {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachments-dialog__header span {
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 1rem;
  font-weight: 800;
}

.attachments-dialog__header small,
.attachments-dialog__subtitle,
.attachments-dialog__hint {
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.4;
}

.attachments-dialog__header small {
  overflow-wrap: anywhere;
}

.attachments-dialog__subtitle {
  margin-bottom: 14px;
}

.attachments-dialog__state {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 44px;
}

.attachments-dialog__state--error {
  color: #92400e;
}

.attachments-dialog__list {
  border: 1px solid rgba(23, 32, 51, 0.08);
  border-radius: 8px;
}

.attachments-dialog__actions {
  display: flex;
  gap: 2px;
}

.attachments-dialog__section-label {
  color: var(--cb-ink);
  font-weight: 750;
  margin: 0 0 4px;
}

.attachments-dialog__hint {
  margin: 0 0 12px;
}

.attachments-dialog__footer {
  flex-wrap: wrap;
}

@media (max-width: 560px) {
  .attachments-dialog__footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .attachments-dialog__footer .v-btn {
    width: 100%;
  }
}
</style>
