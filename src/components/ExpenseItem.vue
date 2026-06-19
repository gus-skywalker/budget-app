<template>
  <v-list-item class="expense-item" @click="handleSelect">
    <div class="expense-item-layout">
      <div class="expense-content">
        <div class="expense-primary-row">
          <v-list-item-title class="expense-description">
            {{ expense.description }}
          </v-list-item-title>
          <span class="expense-amount-text">{{ expense.amount }}</span>
        </div>

        <div class="expense-status-row">
          <v-chip
            v-if="expense.category"
            size="small"
            :color="categoryColor"
            variant="tonal"
            class="expense-category-chip"
          >
            <v-icon start size="14">{{ categoryIcon }}</v-icon>
            {{ translatedCategoryName }}
          </v-chip>
          <v-chip
            v-else
            size="small"
            color="warning"
            variant="tonal"
            class="expense-category-chip"
          >
            {{ $t('expenseItem.uncategorized') }}
          </v-chip>
          <v-chip
            v-if="hasSuggestionReady"
            size="small"
            color="var(--cb-primary)"
            variant="tonal"
          >
            {{ $t('expenseItem.reviewSuggestion') }}
          </v-chip>
          <v-chip
            v-if="expense.reconciliationStatus"
            :color="reconciliationColor"
            size="small"
            variant="tonal"
          >
            {{ reconciliationLabel }}
          </v-chip>
          <v-chip
            v-if="expense.excludedFromPlanning"
            size="small"
            color="warning"
            variant="tonal"
          >
            {{ $t('expenseItem.excludedFromPlanning') }}
          </v-chip>
        </div>

        <div class="expense-meta-line">
          <span class="expense-date-text">{{ expense.date }}</span>
          <span v-if="expense.openFinance" class="expense-meta-tag expense-meta-tag--origin">{{ $t('expenseItem.openFinance') }}</span>
          <span v-if="expense.visibilityScope === 'PRIVATE'" class="expense-meta-tag">{{ visibilityScopeLabel }}</span>
          <span v-if="paymentMethodLabel" class="expense-meta-tag">{{ paymentMethodLabel }}</span>
        </div>

        <div v-if="expense.openFinance && expense.openFinanceSharingLabel" class="of-sharing-row expense-detail-row">
          <v-chip size="x-small" variant="tonal" :color="openFinanceSharingColor">
            {{ expense.openFinanceSharingLabel }}
          </v-chip>
        </div>
        <div v-if="!expense.category" class="uncategorized-row expense-detail-row">
          <v-chip
            v-if="hasSuggestionReady"
            size="x-small"
            color="var(--cb-primary)"
            variant="tonal"
          >
            {{ $t('expenseItem.suggestionReady') }}
          </v-chip>
          <v-btn
            size="x-small"
            variant="text"
            color="var(--cb-primary)"
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
            color="var(--cb-primary)"
            @click.stop="handleSelect"
          >
            <v-icon start size="14">mdi-check-decagram</v-icon>
            {{ $t('expenseItem.reviewSuggestion') }}
          </v-btn>
        </div>
        <div v-if="suggestionDetails" class="suggestion-details expense-detail-row">
          <v-chip size="small" :color="suggestionDetails.categoryColor || 'var(--cb-primary)'" variant="outlined">
            <v-icon start size="14">{{ suggestionDetails.categoryIcon || 'mdi-shape-outline' }}</v-icon>
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
            color="var(--cb-primary)"
            variant="tonal"
            :loading="isApplyingSuggestion"
            :disabled="isApplyingSuggestion"
            @click.stop="$emit('applySuggestion', expense)"
          >
            <v-icon start size="14">mdi-check</v-icon>
            {{ $t('expenseItem.applySuggestion') }}
          </v-btn>
        </div>
        <v-list-item-subtitle v-if="expense.reconciliationConflictReason" class="expense-detail-note">
          {{ expense.reconciliationConflictReason }}
        </v-list-item-subtitle>
        <div v-if="expense.reconciliationConflictId" class="conflict-resolution-row expense-detail-row">
          <v-btn
            size="x-small"
            variant="outlined"
            color="var(--cb-primary)"
            :loading="resolvingAction === 'keep-existing'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { expense, action: 'keep-existing' })"
          >
            {{ $t('expenseItem.keepExisting') }}
          </v-btn>
          <v-btn
            size="x-small"
            variant="tonal"
            color="var(--cb-primary)"
            :loading="resolvingAction === 'create-new'"
            :disabled="Boolean(resolvingAction)"
            @click.stop="$emit('resolveConflict', { expense, action: 'create-new' })"
          >
            {{ $t('expenseItem.createNew') }}
          </v-btn>
        </div>
        <v-list-item-subtitle v-if="expense.users && expense.users.length" class="expense-detail-note">
          {{ $t('expenseItem.sharedWith') }}
          <v-chip
            v-for="user in expense.users"
            :key="user.userId ?? user.id ?? user.email ?? user.name"
            class="mr-2"
          >
            {{ user.name }}
          </v-chip>
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="hasReminder" class="expense-detail-note">
          <v-chip color="orange" dark size="x-small">
            {{ $t('expenseItem.reminderConfigured') }}
          </v-chip>
        </v-list-item-subtitle>
        <div v-if="sharedAgreements.length" class="agreement-summary-row expense-detail-row">
          <v-chip
            v-for="agreement in sharedAgreements"
            :key="agreement.id"
            size="x-small"
            color="var(--cb-accent)"
            variant="tonal"
            @click.stop="toggleAgreementVisibility"
          >
            <v-icon start size="14">mdi-handshake-outline</v-icon>
            {{ agreementSummary(agreement) }}
          </v-chip>
          <v-btn
            icon
            size="x-small"
            variant="text"
            class="agreement-toggle-btn"
            :title="$t('sharedExpenseAgreement.visibility.toggle')"
            @click.stop="toggleAgreementVisibility"
          >
            <v-icon size="15">{{ isAgreementVisibilityOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </div>
        <shared-expense-agreement-visibility
          v-if="isAgreementVisibilityOpen"
          :agreements="sharedAgreements"
        />
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
          @click.stop="$emit('openAttachments', expense)"
          class="expense-action-btn expense-action-btn--share"
        >
          <v-icon size="15">mdi-share-variant</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          title="Criar combinado de divisão"
          @click.stop="openAgreementDialog"
          class="expense-action-btn expense-action-btn--agreement"
        >
          <v-icon size="15">mdi-handshake-outline</v-icon>
        </v-btn>
        <v-btn
          icon
          size="x-small"
          variant="text"
          :title="$t('transactionReminder.title')"
          @click.stop="$emit('openReminder', expense)"
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
    <shared-expense-agreement-dialog
      v-model="isAgreementDialogOpen"
      :expense="expense"
      :agreement="editingAgreement"
      @created="handleAgreementCreated"
      @updated="handleAgreementUpdated"
      @error="handleAgreementError"
    />
</v-list-item>
</template>

<script>
import SharedExpenseAgreementDialog from '@/components/SharedExpenseAgreementDialog.vue'
import SharedExpenseAgreementVisibility from '@/components/SharedExpenseAgreementVisibility.vue'

export default {
  name: 'ExpenseItem',
  components: {
    SharedExpenseAgreementDialog,
    SharedExpenseAgreementVisibility,
  },
  props: {
    expense: {
      type: Object,
      required: true,
    },
    reminderState: {
      type: Object,
      default: () => ({ status: 'notLoaded', reminder: null }),
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
  emits: ['deleteExpense', 'togglePlanningExclusion', 'select', 'resolveConflict', 'suggestCategory', 'applySuggestion', 'openComments', 'openAttachments', 'openReminder', 'agreementCreated', 'agreementUpdated', 'agreementError'],
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
      return 'var(--cb-primary)';
    },
    openFinanceSharingColor() {
      const tone = this.expense?.openFinanceSharingTone;
      if (tone === 'shared') return 'success';
      if (tone === 'admin-shared') return 'info';
      if (tone === 'planning-only') return 'warning';
      if (tone === 'private') return 'grey';
      return 'var(--cb-primary)';
    },
    hasReminder() {
      return this.reminderState?.status === 'loaded' && Boolean(this.reminderState?.reminder);
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
    categoryIcon() {
      const category = this.expense?.category;
      return category?.displayIcon || this.categoryIcons?.[category?.code] || 'mdi-shape-outline';
    },
    categoryColor() {
      return this.expense?.category?.displayColor || 'var(--cb-primary)';
    },
    paymentMethodLabel() {
      if (this.expense?.paymentMethodName) {
        return this.expense.paymentMethodName;
      }
      const paymentMethod = this.expense?.paymentMethod;
      if (paymentMethod && typeof paymentMethod === 'object') {
        return paymentMethod.name || '';
      }
      if (paymentMethod && typeof paymentMethod === 'string' && Number.isNaN(Number(paymentMethod))) {
        return paymentMethod;
      }
      if (this.expense?.openFinance && !this.expense?.paymentMethodId) {
        return this.$t('transactions.payment_method_not_informed_open_finance');
      }
      return '';
    },
  },
  data() {
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
      isAgreementDialogOpen: false,
      editingAgreement: null,
      isAgreementVisibilityOpen: false,
      sharedAgreements: [],
    };
  },
  mounted() {
    this.sharedAgreements = this.expense.sharedAgreements || [];
  },
  watch: {
    expense: {
      handler() {
        this.sharedAgreements = this.expense.sharedAgreements || [];
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    handleSelect(event) {
      if (event?.defaultPrevented) {
        return;
      }
      this.$emit('select', this.expense);
    },
    openAgreementDialog() {
      this.editingAgreement = this.sharedAgreements.length ? this.sharedAgreements[0] : null;
      this.isAgreementDialogOpen = true;
    },
    handleAgreementCreated(agreement) {
      const exists = this.sharedAgreements.some((item) => item.id === agreement.id);
      this.sharedAgreements = exists
        ? this.sharedAgreements.map((item) => (item.id === agreement.id ? agreement : item))
        : [agreement, ...this.sharedAgreements];
      this.isAgreementVisibilityOpen = true;
      this.$emit('agreementCreated', { expense: this.expense, agreement });
    },
    handleAgreementUpdated(agreement) {
      const previousAgreement = this.sharedAgreements.find((item) => item.id === agreement.id);
      const updatedAgreement = this.preserveAgreementDeliveryState(previousAgreement, agreement);
      this.sharedAgreements = this.sharedAgreements.map((item) => (item.id === updatedAgreement.id ? updatedAgreement : item));
      this.isAgreementVisibilityOpen = true;
      this.editingAgreement = updatedAgreement;
      this.$emit('agreementUpdated', { expense: this.expense, agreement: updatedAgreement });
    },
    preserveAgreementDeliveryState(previousAgreement, nextAgreement) {
      if (!previousAgreement || nextAgreement.emailDeliveryStatus !== 'NOT_ATTEMPTED') {
        return nextAgreement;
      }
      return {
        ...nextAgreement,
        emailDeliveryStatus: previousAgreement.emailDeliveryStatus,
        emailDeliveryCount: previousAgreement.emailDeliveryCount,
        emailDeliveryErrors: previousAgreement.emailDeliveryErrors,
      };
    },
    handleAgreementError(error) {
      this.$emit('agreementError', { expense: this.expense, error });
    },
    agreementSummary(agreement) {
      const amount = this.formatCurrency(agreement.sharedAmount);
      const participants = Array.isArray(agreement.participants) ? agreement.participants : [];
      const participantCount = participants.length;
      const email = participantCount > 1
        ? `${participantCount} participantes`
        : (participants[0]?.email || agreement.counterpartyEmail || 'participante');
      const installments = Number(agreement.installmentCount || 1);
      const suffix = installments > 1 ? ` em ${installments}x` : '';
      return `${email}: ${amount}${suffix}`;
    },
    toggleAgreementVisibility() {
      this.isAgreementVisibilityOpen = !this.isAgreementVisibilityOpen;
    },
    formatCurrency(value) {
      const number = Number(value || 0);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number.isFinite(number) ? number : 0);
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

.expense-primary-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.expense-description {
  min-width: 0;
  color: var(--cb-ink);
  font-family: var(--cb-font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  white-space: normal;
}

.expense-status-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.expense-category-chip {
  font-weight: 700;
}

.expense-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-end;
  opacity: 0.38;
  transition: opacity 0.2s ease;
  flex: 0 0 auto;
  max-width: 166px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.expense-item:hover .expense-actions,
.expense-item:focus-within .expense-actions {
  opacity: 0.95;
}

.expense-action-btn {
  min-width: 30px !important;
  width: 30px !important;
  height: 30px !important;
  padding: 0 !important;
  border-radius: 8px !important;
  color: rgba(15, 23, 42, 0.46) !important;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    opacity 0.18s ease;
}

.expense-action-btn .v-icon {
  line-height: 30px;
  font-size: 16px !important;
  transition: color 0.18s ease;
}

.expense-action-btn--share .v-icon {
  color: rgba(59, 130, 246, 0.74) !important;
}

.expense-action-btn--timer .v-icon {
  color: rgba(249, 115, 22, 0.74) !important;
}

.expense-action-btn--agreement .v-icon {
  color: rgba(15, 118, 110, 0.78) !important;
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

.expense-action-btn--agreement:hover .v-icon {
  color: rgba(15, 118, 110, 0.95) !important;
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
  margin: 0;
}

.uncategorized-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin: 0;
}

.agreement-summary-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 0;
}

.agreement-summary-row .v-chip {
  cursor: pointer;
}

.agreement-toggle-btn {
  min-width: 24px !important;
  width: 24px !important;
  height: 24px !important;
  color: rgba(15, 118, 110, 0.78) !important;
}

.expense-meta-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.of-sharing-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 0;
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

.expense-meta-tag--origin {
  color: rgba(0, 0, 0, 0.36);
  font-weight: 500;
}

.expense-meta-tag::before {
  content: '·';
  margin-right: 6px;
  color: rgba(0, 0, 0, 0.32);
}

.expense-meta-tag--warn {
  color: #e65100;
}

.expense-amount-text {
  color: var(--cb-ink);
  flex: 0 0 auto;
  font-family: var(--cb-font-heading);
  font-weight: 800;
  font-size: 0.98rem;
  line-height: 1.35;
  white-space: nowrap;
  text-align: right;
}

.expense-detail-row,
.expense-detail-note {
  margin-top: 8px;
}

.expense-detail-note {
  color: rgba(0, 0, 0, 0.52);
  font-size: 0.78rem;
  line-height: 1.45;
}

.v-theme--dark .expense-date-text,
.v-theme--dark .expense-meta-tag {
  color: rgba(255, 255, 255, 0.5);
}

.v-theme--dark .expense-meta-tag::before {
  color: rgba(255, 255, 255, 0.32);
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
  margin-bottom: 0;
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

  .expense-primary-row {
    align-items: flex-start;
    gap: 10px;
  }

  .expense-actions {
    width: 100%;
    max-width: none;
    justify-content: flex-start;
    margin-left: 0;
    margin-top: 4px;
    opacity: 0.72;
  }
}
</style>
