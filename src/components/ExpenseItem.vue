<template>
  <v-list-item class="expense-item" @click="handleSelect">
    <div class="expense-item-layout">
      <div class="expense-content">
        <v-list-item-title>
          {{ expense.description }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ $t('expenseItem.amount') }} {{ expense.amount }} - {{ $t('expenseItem.date') }}: {{ expense.date }}
        </v-list-item-subtitle>
        <div v-if="expense.openFinance || expense.reconciliationStatus" class="status-row">
          <v-chip
            v-if="expense.openFinance"
            color="#667eea"
            size="small"
            variant="tonal"
          >
            Open Finance
          </v-chip>
          <v-chip
            v-if="expense.reconciliationStatus"
            :color="reconciliationColor"
            size="small"
            variant="tonal"
          >
            {{ reconciliationLabel }}
          </v-chip>
        </div>
        <v-list-item-subtitle v-if="expense.category">
          {{ $t('expenseItem.category') }}: {{ expense.category.name }}
          <v-icon :icon="categoryIcons[expense.category.code]" class="mr-2"></v-icon>
        </v-list-item-subtitle>
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
            Manter existente
          </v-btn>
          <v-btn
            size="x-small"
            variant="tonal"
            color="#667eea"
            :loading="resolvingAction === 'create-new'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { expense, action: 'create-new' })"
          >
            Criar nova
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
      <div class="expense-actions">
        <v-btn
          icon
          size="x-small"
          density="comfortable"
          @click.stop="isDialogOpen = true"
          color="primary"
          class="expense-action-btn"
        >
          <v-icon size="16">mdi-share-variant</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          density="comfortable"
          color="orange"
          @click.stop="openAlertDialog"
          class="expense-action-btn"
        >
          <v-icon size="16">mdi-alarm</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          density="comfortable"
          color="red"
          @click.stop="$emit('deleteExpense', expense)"
          class="expense-action-btn"
        >
          <v-icon size="16">mdi-delete</v-icon>
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
  },
  emits: ['deleteExpense', 'removeAttachment', 'attachFiles', 'shareExpense', 'sendReminder', 'select', 'downloadAttachment', 'resolveConflict'],
  computed: {
    reconciliationLabel() {
      const status = this.expense?.reconciliationStatus;
      if (!status) return '';
      const labels = {
        IMPORTED: 'Importada',
        PROMOTED_FROM_PENDING: 'Pendente → confirmada',
        MATCHED_AND_CANCELLED: 'Cancelada pelo banco',
        CONFLICT_DUPLICATE: 'Conflito de duplicidade',
        RESOLVED_CREATE_NEW: 'Conflito resolvido',
      };
      return labels[status] || status;
    },
    reconciliationColor() {
      const status = this.expense?.reconciliationStatus;
      if (status === 'CONFLICT_DUPLICATE') return 'warning';
      if (status === 'MATCHED_AND_CANCELLED') return 'error';
      return '#667eea';
    },
    hasAlerts() {
      return Array.isArray(this.expense.alerts) && this.expense.alerts.length > 0;
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
  gap: 12px;
  width: 100%;
}


.expense-content {
  flex: 1 1 auto;
  min-width: 0;
}

.expense-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
  align-items: center;
}

.expense-action-btn {
  min-width: 32px;
  width: 32px;
  height: 32px;
  padding: 0;
}

.expense-action-btn .v-icon {
  line-height: 32px;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0;
}

.conflict-resolution-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 4px;
}

@media (max-width: 420px) {
  .expense-item-layout {
    flex-wrap: wrap;
    gap: 8px;
  }

  .expense-actions {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 4px;
  }
}
</style>
