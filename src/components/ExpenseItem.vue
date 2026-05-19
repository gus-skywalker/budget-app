<template>
  <v-list-item class="expense-item" @click="handleSelect">
    <div class="expense-item-layout">
      <div class="expense-content">
        <v-list-item-title>
          {{ expense.description }}
        </v-list-item-title>
        <div class="expense-meta-line">
          <span class="expense-date-text">{{ expense.date }}</span>
          <span v-if="expense.category" class="expense-meta-tag">· {{ translatedCategoryName }}</span>
          <span v-else class="expense-meta-tag expense-meta-tag--warn">· {{ $t('expenseItem.uncategorized') }}</span>
          <span v-if="expense.openFinance" class="expense-meta-tag">· {{ $t('expenseItem.openFinance') }}</span>
          <span v-if="expense.openFinanceDocumentType" class="expense-meta-tag">· {{ expense.openFinanceDocumentType }}</span>
          <span v-if="expense.excludedFromPlanning" class="expense-meta-tag expense-meta-tag--warn">· {{ $t('expenseItem.excludedFromPlanning') }}</span>
          <span v-if="expense.visibilityScope === 'PRIVATE'" class="expense-meta-tag">· {{ visibilityScopeLabel }}</span>
          <v-chip v-if="expense.reconciliationStatus" :color="reconciliationColor" size="x-small" variant="tonal" class="ml-1">{{ reconciliationLabel }}</v-chip>
        </div>
        <div v-if="expense.openFinance && expense.openFinanceSharingLabel" class="of-sharing-row">
          <v-chip size="x-small" variant="tonal" :color="openFinanceSharingColor">
            {{ expense.openFinanceSharingLabel }}
          </v-chip>
          <span v-if="expense.openFinanceSharingNote" class="of-sharing-note">{{ expense.openFinanceSharingNote }}</span>
        </div>
        <div v-if="!expense.category" class="uncategorized-row">
          <v-chip
            v-if="hasSuggestionReady"
            size="x-small"
            color="#667eea"
            variant="tonal"
          >
            {{ $t('expenseItem.suggestionReady') }}
          </v-chip>
          <v-btn
            size="x-small"
            variant="text"
            color="#667eea"
            :loading="aiSuggesting"
            :disabled="aiSuggesting"
            @click.stop="$emit('suggestCategory', expense)"
          >
            <v-icon start size="14">mdi-brain</v-icon>
            {{ $t('expenseItem.suggestCategory') }}
          </v-btn>
          <v-btn
            v-if="hasSuggestionReady"
            size="x-small"
            variant="text"
            color="#667eea"
            @click.stop="handleSelect"
          >
            <v-icon start size="14">mdi-check-decagram</v-icon>
            {{ $t('expenseItem.reviewSuggestion') }}
          </v-btn>
        </div>
        <div v-if="suggestionDetails" class="suggestion-details">
          <v-chip size="small" color="#667eea" variant="outlined">
            <v-icon start size="14">mdi-shape-outline</v-icon>
            {{ $t('expenseItem.suggestedCategoryLabel') }}: {{ suggestionDetails.categoryName }}
          </v-chip>
          <v-chip size="small" variant="text">
            <v-icon start size="14">mdi-source-branch</v-icon>
            {{ suggestionDetails.sourceLabel }}
          </v-chip>
          <v-chip v-if="suggestionDetails.confidenceLabel" size="small" variant="text">
            <v-icon start size="14">mdi-speedometer-medium</v-icon>
            {{ suggestionDetails.confidenceLabel }}
          </v-chip>
          <div v-if="suggestionDetails.reasoningLabel" class="suggestion-details__reasoning">
            <v-icon size="14">mdi-information-outline</v-icon>
            {{ suggestionDetails.reasoningLabel }}
          </div>
          <v-btn
            size="x-small"
            color="#667eea"
            variant="tonal"
            :loading="isApplyingSuggestion"
            :disabled="isApplyingSuggestion"
            @click.stop="$emit('applySuggestion', expense)"
          >
            <v-icon start size="14">mdi-check</v-icon>
            {{ $t('expenseItem.applySuggestion') }}
          </v-btn>
        </div>
        <v-list-item-subtitle v-if="expense.reconciliationConflictReason">
          {{ expense.reconciliationConflictReason }}
        </v-list-item-subtitle>
        <div v-if="expense.reconciliationConflictId" class="conflict-resolution-row">
          <v-btn
            size="x-small"
            variant="outlined"
            color="#667eea"
            :loading="resolvingAction === 'keep-existing'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { expense, action: 'keep-existing' })"
          >
            {{ $t('expenseItem.keepExisting') }}
          </v-btn>
          <v-btn
            size="x-small"
            variant="tonal"
            color="#667eea"
            :loading="resolvingAction === 'create-new'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { expense, action: 'create-new' })"
          >
            {{ $t('expenseItem.createNew') }}
          </v-btn>
        </div>
        <v-list-item-subtitle v-if="expense.users && expense.users.length">
          {{ $t('expenseItem.sharedWith') }}
          <v-chip
            v-for="user in expense.users"
            :key="user.userId ?? user.id ?? user.email ?? user.name"
            class="mr-2"
          >
            {{ user.name }}
          </v-chip>
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="hasAlerts">
          <v-chip color="orange" dark class="ma-2">
            {{ $t('expenseItem.alertConfigured') }}
          </v-chip>
        </v-list-item-subtitle>
      </div>
      <div class="expense-amount-col">
        <span class="expense-amount-text">{{ expense.amount }}</span>
      </div>
      <div class="expense-actions">
        <v-btn
          v-if="expense.visibilityScope === 'WORKSPACE'"
          icon
          size="x-small"
          variant="text"
          @click.stop="$emit('openComments', expense)"
          class="expense-action-btn expense-action-btn--share"
        >
          <v-icon size="15">mdi-comment-text-outline</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          @click.stop="isDialogOpen = true"
          class="expense-action-btn expense-action-btn--share"
        >
          <v-icon size="15">mdi-share-variant</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          @click.stop="openAlertDialog"
          class="expense-action-btn expense-action-btn--timer"
        >
          <v-icon size="15">mdi-alarm</v-icon>
        </v-btn>
        <v-btn
          v-if="expense.openFinance"
          icon
          size="x-small"
          variant="text"
          :title="expense.excludedFromPlanning ? $t('expenseItem.restorePlanning') : $t('expenseItem.excludeFromPlanning')"
          @click.stop="$emit('togglePlanningExclusion', expense)"
          class="expense-action-btn expense-action-btn--planning"
        >
          <v-icon size="15">{{ expense.excludedFromPlanning ? 'mdi-plus-circle-outline' : 'mdi-minus-circle-outline' }}</v-icon>
        </v-btn>
        <v-btn
          v-else
          icon
          size="x-small"
          variant="text"
          @click.stop="$emit('deleteExpense', expense)"
          class="expense-action-btn expense-action-btn--delete"
        >
          <v-icon size="15">mdi-delete</v-icon>
        </v-btn>
      </div>
    </div>

    <v-dialog v-model="isDialogOpen" max-width="600px">
      <v-card>
        <v-card-title>{{ $t('expenseItem.manageAttachments') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="email"
            :label="$t('expenseItem.email')"
            type="email"
            :rules="emailRules"
            required
          ></v-text-field>
          <v-list dense>
            <v-list-item v-for="file in attachedFiles" :key="file.id">
              <v-list-item-title>
                {{ file.fileName }}
              </v-list-item-title>
              <v-list-item-action>
                <v-btn icon size="x-small" @click.stop="downloadFile(file)">
                  <v-icon size="18">mdi-download</v-icon>
                </v-btn>
                <v-btn icon size="x-small" color="red" @click.stop="removeAttachedFile(file)">
                  <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-file-input
            ref="fileInput"
            :label="$t('expenseItem.addAttachments')"
            accept="image/*,.pdf"
            multiple
            @update:model-value="onNewFilesChange"
          ></v-file-input>
          <v-list dense>
            <v-list-item v-for="(file, index) in newFiles" :key="index">
              {{ file.name }}
              <v-btn icon size="x-small" @click="removeFile(index)">
                <v-icon size="18">mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green" text @click="attachFiles">{{ $t('expenseItem.attach') }}</v-btn>
          <v-btn color="blue darken-1" text @click="isDialogOpen = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="shareExpense" :disabled="!email">{{ $t('expenseItem.share') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">
          {{ $t('expenseItem.confirmDeleteTitle') }}
        </v-card-title>
        <v-card-text>
          {{ $t('expenseItem.confirmDeleteText', { file: fileToDelete?.fileName }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="confirmDeleteDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="red" text @click="confirmDeleteAttachment">{{ $t('expenseItem.delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isAlertDialogOpen" max-width="600px">
      <v-card>
        <v-card-title>{{ $t('expenseItem.configureAlert') }}</v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <v-list-subheader>{{ $t('expenseItem.configuredAlerts') }}</v-list-subheader>
          <v-list dense v-if="expense.alerts && expense.alerts.length">
            <v-list-item v-for="(alert, index) in expense.alerts" :key="index">
              <v-list-item-title>
                  <v-chip color="blue" dark>
                    {{ $t('expenseItem.alertDate') }}: {{ formatAlertDate(alert.alertDate) }}
                  </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                  <v-chip color="green" dark>
                    {{ $t('expenseItem.status') }}: {{ alert.status }}
                  </v-chip>
              </v-list-item-subtitle>
              <v-list-item-subtitle>
                <strong>{{ $t('expenseItem.methods') }}:</strong> {{ formatMethods(alert.methods) }}
              </v-list-item-subtitle>
              <v-list-item-subtitle>
                <strong>{{ $t('expenseItem.recurrence') }}:</strong>
                <span v-if="alert.recurrenceInterval">{{ formatRecurrence(alert.recurrenceInterval) }}</span>
                <span v-else>{{ $t('expenseItem.notRecurring') }}</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <v-list-item>
              <v-list-item-title>{{ $t('expenseItem.noAlerts') }}</v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider class="my-4"></v-divider>
          <v-list-subheader>{{ $t('expenseItem.configureNewAlert') }}</v-list-subheader>
          <v-radio-group v-model="useDefaultAlertDays" row>
            <v-radio :label="$t('expenseItem.useDefaultAlertDays', { days: defaultAlertDays })" :value="true"></v-radio>
            <v-radio :label="$t('expenseItem.customAlertDays')" :value="false"></v-radio>
          </v-radio-group>

          <v-text-field
            v-if="!useDefaultAlertDays"
            v-model="customAlertDays"
            type="number"
            min="1"
            max="30"
            :label="$t('expenseItem.daysBeforeAlert')"
            :placeholder="$t('expenseItem.daysBeforeAlertPlaceholder')"
            :rules="customAlertDaysRules"
            dense
            outlined
          >
            <template #prepend>
              <v-icon>mdi-calendar</v-icon>
            </template>
          </v-text-field>

          <v-switch v-model="isRecurring" :label="$t('expenseItem.setAsRecurring')">
            <template #prepend>
              <v-icon>mdi-repeat</v-icon>
            </template>
          </v-switch>

          <v-select
            v-if="isRecurring"
            v-model="recurrenceInterval"
            :items="['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']"
            :label="$t('expenseItem.recurrenceInterval')"
            :placeholder="$t('expenseItem.selectFrequency')"
            dense
            outlined
          >
            <template #prepend>
              <v-icon>mdi-timer</v-icon>
            </template>
          </v-select>

          <v-text-field
            v-if="isRecurring"
            v-model="recurrenceEndDate"
            type="date"
            :label="$t('expenseItem.recurrenceEndDate')"
            dense
            outlined
          >
            <template #prepend>
              <v-icon>mdi-calendar-end</v-icon>
            </template>
          </v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="isAlertDialogOpen = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="red" text @click="resetAlertForm">{{ $t('expenseItem.reset') }}</v-btn>
          <v-btn color="green" dark text @click="saveAlert">{{ $t('expenseItem.save') }}</v-btn>
        </v-card-actions>
      </v-card>

      <v-snackbar v-model="snackbar" color="green" top>
        {{ snackbarMessage }}
        <template #action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false">{{ $t('expenseItem.close') }}</v-btn>
        </template>
      </v-snackbar>
    </v-dialog>
</v-list-item>
</template>

<script>
export default {
  name: 'ExpenseItem',
  props: {
    expense: {
      type: Object,
      required: true,
    },
    alertSettings: {
      type: Object,
      default: () => null,
    },
    resolvingAction: {
      type: String,
      default: null,
    },
    aiSuggesting: {
      type: Boolean,
      default: false,
    },
    hasSuggestionReady: {
      type: Boolean,
      default: false,
    },
    suggestionDetails: {
      type: Object,
      default: null,
    },
    isApplyingSuggestion: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['deleteExpense', 'togglePlanningExclusion', 'removeAttachment', 'attachFiles', 'shareExpense', 'sendReminder', 'select', 'downloadAttachment', 'resolveConflict', 'suggestCategory', 'applySuggestion', 'openComments'],
  computed: {
    visibilityScopeLabel() {
      const scope = this.expense?.visibilityScope === 'PRIVATE' ? 'private' : 'workspace'
      return this.$t(`transactionVisibility.${scope}`)
    },
    reconciliationLabel() {
      const status = this.expense?.reconciliationStatus;
      if (!status) return '';
      const key = `expenseItem.reconciliation.${status}`;
      const translated = this.$t(key);
      return translated !== key ? translated : status;
    },
    reconciliationColor() {
      const status = this.expense?.reconciliationStatus;
      if (status === 'CONFLICT_DUPLICATE') return 'warning';
      if (status === 'MATCHED_AND_CANCELLED') return 'error';
      return '#667eea';
    },
    openFinanceSharingColor() {
      const tone = this.expense?.openFinanceSharingTone;
      if (tone === 'shared') return 'success';
      if (tone === 'admin-shared') return 'info';
      if (tone === 'planning-only') return 'warning';
      if (tone === 'private') return 'grey';
      return '#667eea';
    },
    hasAlerts() {
      return Array.isArray(this.expense.alerts) && this.expense.alerts.length > 0;
    },
    translatedCategoryName() {
      const category = this.expense?.category;
      if (!category) return '';
      const code = String(category.code || '').trim();
      if (!code) {
        return category.name || '';
      }
      const key = `categories.${code}`;
      const translated = this.$t(key);
      return translated !== key ? translated : (category.name || code);
    },
  },
  data() {
    const defaultAlertDays = Number(this.alertSettings?.alertDaysBefore) || 3;

    return {
      categoryIcons: {
        groceries: 'mdi-cart',
        utilities: 'mdi-lightbulb',
        transportation: 'mdi-bus',
        entertainment: 'mdi-movie',
        healthcare: 'mdi-heart-pulse',
        education: 'mdi-school',
        dining_out: 'mdi-silverware',
        travel: 'mdi-airplane',
        clothing: 'mdi-tshirt-crew',
        home_maintenance: 'mdi-home',
        gifts: 'mdi-gift',
        charity: 'mdi-hand-heart',
        subscriptions: 'mdi-receipt',
        miscellaneous: 'mdi-dots-horizontal',
      },
      isDialogOpen: false,
      email: '',
      emailRules: [
        (value) => !!value || 'Email é obrigatório',
        (value) => /.+@.+\..+/.test(value) || 'E-mail deve ser válido',
      ],
      attachedFiles: [],
      newFiles: [],
      confirmDeleteDialog: false,
      fileToDelete: null,
      isAlertDialogOpen: false,
      useDefaultAlertDays: true,
      defaultAlertDays,
      customAlertDays: defaultAlertDays,
      isRecurring: false,
      recurrenceInterval: null,
      recurrenceEndDate: null,
      customAlertDaysRules: [
        (value) => !!value || 'O valor é obrigatório',
        (value) => value > 0 || 'O valor deve ser maior que zero',
        (value) => value <= 30 || 'O valor deve ser menor ou igual a 30',
      ],
      snackbar: false,
      snackbarMessage: '',
    };
  },
  mounted() {
    this.attachedFiles = this.expense.attachments || [];
    this.initializeAlertState();
  },
  watch: {
    alertSettings: {
      handler(newSettings) {
        const resolved = Number(newSettings?.alertDaysBefore) || 3;
        this.defaultAlertDays = resolved;
        if (this.useDefaultAlertDays) {
          this.customAlertDays = resolved;
        }
      },
      immediate: true,
      deep: true,
    },
    expense: {
      handler() {
        this.attachedFiles = this.expense.attachments || [];
        this.initializeAlertState();
      },
      immediate: true,
      deep: true,
    },
    isRecurring(newValue) {
      if (!newValue) {
        this.recurrenceInterval = null;
        this.recurrenceEndDate = null;
      } else {
        this.recurrenceInterval = 'MONTHLY';
        this.recurrenceEndDate = this.recurrenceEndDate || new Date().toISOString().split('T')[0];
      }
    },
  },
  methods: {
    handleSelect(event) {
      if (event?.defaultPrevented) {
        return;
      }
      this.$emit('select', this.expense);
    },
    initializeAlertState() {
      const alerts = Array.isArray(this.expense?.alerts) ? this.expense.alerts : [];
      const existingAlert = alerts.length ? alerts[0] : null;

      if (existingAlert) {
        const fallbackDays = this.defaultAlertDays;
        const extractedDays = Number(
          existingAlert.daysBefore ?? existingAlert.alertDaysBefore ?? existingAlert.daysBeforeAlert,
        );

        this.useDefaultAlertDays = !Number.isFinite(extractedDays);
        this.customAlertDays = Number.isFinite(extractedDays) ? extractedDays : fallbackDays;
        this.isRecurring = Boolean(existingAlert.recurrenceInterval);
        this.recurrenceInterval = existingAlert.recurrenceInterval ?? null;
        this.recurrenceEndDate = existingAlert.recurrenceEndDate ?? existingAlert.endDate ?? null;
      } else {
        this.useDefaultAlertDays = true;
        this.customAlertDays = this.defaultAlertDays;
        this.isRecurring = false;
        this.recurrenceInterval = null;
        this.recurrenceEndDate = null;
      }
    },
    onNewFilesChange(value) {
      const rawFiles = Array.isArray(value)
        ? value
        : value instanceof File
          ? [value]
          : value && typeof value === 'object' && 'length' in value && typeof value.length === 'number'
            ? Array.from(value)
            : value?.target?.files
              ? Array.from(value.target.files)
              : []

      if (!rawFiles.length) {
        return
      }

      const existingNames = new Set([
        ...this.attachedFiles.map((file) => file.fileName || file.name),
        ...this.newFiles.map((file) => file.name),
      ])

      const uniqueFiles = rawFiles.filter((newFile) => {
        const isDuplicate = existingNames.has(newFile.name)
        if (isDuplicate) {
          console.warn(`O arquivo "${newFile.name}" ja foi adicionado.`)
          return false
        }
        existingNames.add(newFile.name)
        return true
      })

      this.newFiles = [...this.newFiles, ...uniqueFiles]
    },
    removeFile(index) {
      this.newFiles.splice(index, 1);
    },
    removeAttachedFile(file) {
      this.fileToDelete = file;
      this.confirmDeleteDialog = true;
    },
    confirmDeleteAttachment() {
      if (!this.fileToDelete) {
        return;
      }

      this.attachedFiles = this.attachedFiles.filter((existing) => existing.id !== this.fileToDelete.id);
      this.$emit('removeAttachment', {
        expenseId: this.expense.id,
        attachmentId: this.fileToDelete.id,
      });
      this.fileToDelete = null;
      this.confirmDeleteDialog = false;
    },
    downloadFile(file) {
      this.$emit('downloadAttachment', {
        expenseId: this.expense.id,
        attachmentId: file.id,
        fileName: file.fileName || file.name || 'attachment',
      })
    },
    attachFiles() {
      if (!this.newFiles.length) {
        console.warn('Nenhum arquivo novo para anexar.');
        return;
      }

      const formData = new FormData();
      formData.append('expenseId', this.expense.id);
      this.newFiles.forEach((file) => {
        formData.append('files', file);
      });

      this.$emit('attachFiles', { expense: this.expense, files: formData });
      this.newFiles = [];
    },
    shareExpense() {
      if (!this.email) {
        console.warn('Email não informado');
        return;
      }

      const combinedFiles = [...this.attachedFiles, ...this.newFiles];
      this.$emit('shareExpense', { expense: this.expense, email: this.email, files: combinedFiles });
      this.isDialogOpen = false;
    },
    openAlertDialog() {
      this.isAlertDialogOpen = true;
    },
    formatAlertDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('pt-BR', options);
    },
    formatMethods(methods) {
      return Array.isArray(methods) ? methods.join(', ') : '';
    },
    formatRecurrence(recurrenceInterval) {
      const map = {
        DAILY: 'Diário',
        WEEKLY: 'Semanal',
        MONTHLY: 'Mensal',
        YEARLY: 'Anual',
      };
      return map[recurrenceInterval] || 'Desconhecido';
    },
    saveAlert() {
      const daysBefore = this.useDefaultAlertDays ? this.defaultAlertDays : this.customAlertDays;

      const alertData = {
        expense: this.expense,
        daysBefore,
        isRecurring: this.isRecurring,
        recurrenceInterval: this.isRecurring ? this.recurrenceInterval : null,
        recurrenceEndDate: this.isRecurring ? this.recurrenceEndDate : null,
      };

      this.$emit('sendReminder', alertData);
      this.snackbarMessage = 'Alerta configurado com sucesso!';
      this.snackbar = true;
      this.isAlertDialogOpen = false;
    },
    resetAlertForm() {
      this.useDefaultAlertDays = true;
      this.customAlertDays = this.defaultAlertDays;
      this.isRecurring = false;
      this.recurrenceInterval = null;
      this.recurrenceEndDate = null;
    },
  },
};
</script>

<style scoped>
.expense-item {
  cursor: pointer;
}

.expense-item-layout {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}


.expense-content {
  flex: 1 1 auto;
  min-width: 0;
}

.expense-actions {
  display: flex;
  gap: 2px;
  align-items: center;
  opacity: 0.38;
  transition: opacity 0.2s ease;
}

.expense-item:hover .expense-actions,
.expense-item:focus-within .expense-actions {
  opacity: 0.85;
}

.expense-action-btn {
  min-width: 26px !important;
  width: 26px !important;
  height: 26px !important;
  padding: 0 !important;
  border-radius: 5px !important;
  color: rgba(15, 23, 42, 0.46) !important;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    opacity 0.18s ease;
}

.expense-action-btn .v-icon {
  line-height: 26px;
  font-size: 14px !important;
  transition: color 0.18s ease;
}

.expense-action-btn--share .v-icon {
  color: rgba(59, 130, 246, 0.74) !important;
}

.expense-action-btn--timer .v-icon {
  color: rgba(249, 115, 22, 0.74) !important;
}

.expense-action-btn--planning .v-icon {
  color: rgba(139, 92, 246, 0.74) !important;
}

.expense-action-btn--delete .v-icon {
  color: rgba(239, 68, 68, 0.74) !important;
}

.expense-action-btn:hover {
  color: rgba(15, 23, 42, 0.66) !important;
  background-color: rgba(15, 23, 42, 0.04) !important;
}

.expense-action-btn:hover .v-icon {
  opacity: 1;
}

.expense-action-btn--share:hover .v-icon {
  color: rgba(59, 130, 246, 0.92) !important;
}

.expense-action-btn--timer:hover .v-icon {
  color: rgba(249, 115, 22, 0.92) !important;
}

.expense-action-btn--planning:hover .v-icon {
  color: rgba(139, 92, 246, 0.92) !important;
}

.expense-action-btn--delete:hover {
  background-color: rgba(198, 40, 40, 0.08) !important;
}

.expense-action-btn--delete:hover .v-icon {
  color: rgba(239, 68, 68, 0.95) !important;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 2px 0;
}

.conflict-resolution-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 4px;
}

.uncategorized-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin: 2px 0;
}

.expense-meta-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.of-sharing-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.of-sharing-note {
  font-size: 0.76rem;
  color: rgba(0, 0, 0, 0.52);
  line-height: 1.4;
}

.expense-date-text {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
}

.expense-meta-tag {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.45);
}

.expense-meta-tag--warn {
  color: #e65100;
}

.expense-amount-col {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 2px;
  min-width: 80px;
  flex-shrink: 0;
  margin-left: auto;
}

.expense-amount-text {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  text-align: right;
}

.v-theme--dark .expense-date-text,
.v-theme--dark .expense-meta-tag {
  color: rgba(255, 255, 255, 0.5);
}

.v-theme--dark .of-sharing-note {
  color: rgba(255, 255, 255, 0.64);
}

.v-theme--dark .expense-meta-tag--warn {
  color: #ffb74d;
}

.suggestion-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 6px 0;
}

.suggestion-details__reasoning {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #667085;
  font-size: 0.85rem;
}

.v-theme--dark .suggestion-details__reasoning {
  color: #d0d5dd;
}

@media (max-width: 420px) {
  .expense-item-layout {
    flex-wrap: wrap;
    gap: 8px;
  }

  .expense-amount-col {
    margin-left: auto;
  }

  .expense-actions {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 4px;
    opacity: 1;
  }
}
</style>
