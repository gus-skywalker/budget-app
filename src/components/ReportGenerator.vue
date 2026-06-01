<template>
    <div class="report-generator-wrapper">
        <v-container class="cb-container">
            <div class="cb-card">
                <div class="cb-card__header">
                    <h2 class="cb-card__title">
                        <v-icon color="var(--cb-primary)" class="mr-2">mdi-file-chart</v-icon>
                        {{ $t('reportGenerator.title') }}
                    </h2>
                </div>
                <div class="cb-card__body">
                    <v-row class="mb-4">
                        <v-col cols="12">
                            <div class="report-scope-row">
                                <v-chip size="small" color="var(--cb-primary)" variant="outlined">
                                    <v-icon start size="14">mdi-account-group-outline</v-icon>
                                    {{ $t('transactionVisibility.reportFilter') }}
                                </v-chip>
                            </div>
                        </v-col>
                        <!-- Tipo de Relatório -->
                        <v-col cols="12" md="4">
                            <v-select 
                                v-model="reportType" 
                                :items="reportTypes" 
                                item-title="text" 
                                item-value="value"
                                :label="$t('reportGenerator.report_type')" 
                                variant="outlined"
                                density="comfortable"
                                color="var(--cb-primary)"
                                class="modern-input"
                            />
                        </v-col>

                        <!-- Tipo de Visualização -->
                        <v-col cols="12" md="4">
                            <v-select 
                                v-model="viewType" 
                                :items="viewTypes" 
                                item-title="text" 
                                item-value="value"
                                :label="$t('reportGenerator.view_type')" 
                                variant="outlined"
                                density="comfortable"
                                color="var(--cb-primary)"
                                class="modern-input"
                            />
                        </v-col>

                        <!-- Seleção de categorias -->
                        <v-col cols="12" md="4" v-if="reportType === 'expenses'">
                            <v-select 
                                :label="$t('reportGenerator.category_filter')" 
                                v-model="selectedCategories" 
                                :items="availableCategories"
                                item-title="name" 
                                item-value="id" 
                                multiple 
                                chips 
                                variant="outlined"
                                density="comfortable"
                                color="var(--cb-primary)"
                                class="modern-input"
                                :placeholder="$t('reportGenerator.all_categories_hint')"
                                :hint="selectedCategories.length ? $t('reportGenerator.selected_categories_count', { count: selectedCategories.length }) : $t('reportGenerator.all_categories_hint')"
                                persistent-hint
                                :no-data-text="$t('reportGenerator.no_categories')"
                            >
                                <template #item="{ item, props }">
                                    <v-list-item v-bind="props">
                                        <template #prepend>
                                            <v-icon :icon="categoryIcons[item.raw.code] || 'mdi-shape-outline'" class="mr-2"></v-icon>
                                        </template>
                                    </v-list-item>
                                </template>

                                <template #selection="{ item, props }">
                                    <v-chip v-bind="props" class="ma-1" small>
                                        <v-icon left :icon="categoryIcons[item.raw.code] || 'mdi-shape-outline'"></v-icon>
                                        {{ item.raw.name }}
                                    </v-chip>
                                </template>
                            </v-select>
                        </v-col>
                    </v-row>

                    <v-row class="mb-4">
                        <!-- Data Inicial -->
                        <v-col cols="12" md="4">
                            <v-menu 
                                v-model="startDateMenu" 
                                :close-on-content-click="false" 
                                transition="scale-transition" 
                                offset-y
                            >
                                <template v-slot:activator="{ props }">
                                    <v-text-field 
                                        v-model="formattedStartDate" 
                                        :label="$t('reportGenerator.start_date')" 
                                        prepend-inner-icon="mdi-calendar"
                                        readonly 
                                        v-bind="props" 
                                        variant="outlined"
                                        density="comfortable"
                                        color="var(--cb-primary)"
                                        class="modern-input"
                                    />
                                </template>
                                <v-date-picker v-model="startDate" />
                            </v-menu>
                        </v-col>

                        <!-- Data Final -->
                        <v-col cols="12" md="4">
                            <v-menu 
                                v-model="endDateMenu" 
                                :close-on-content-click="false" 
                                transition="scale-transition" 
                                offset-y
                            >
                                <template v-slot:activator="{ props }">
                                    <v-text-field 
                                        v-model="formattedEndDate" 
                                        :label="$t('reportGenerator.end_date')" 
                                        prepend-inner-icon="mdi-calendar" 
                                        readonly
                                        v-bind="props" 
                                        variant="outlined"
                                        density="comfortable"
                                        color="var(--cb-primary)"
                                        class="modern-input"
                                    />
                                </template>
                                <v-date-picker v-model="endDate" />
                            </v-menu>
                        </v-col>

                        <!-- Incluir proporções -->
                        <v-col cols="12" md="4" class="d-flex align-center">
                            <v-checkbox 
                                v-model="includeProportions" 
                                :label="$t('reportGenerator.include_proportions')" 
                                density="comfortable"
                                color="var(--cb-primary)"
                                hide-details 
                            />
                        </v-col>
                    </v-row>

                    <!-- Botões -->
                    <v-row>
                        <v-col cols="12" class="d-flex justify-end gap-2">
                            <v-btn 
                                @click="generateReport('pdf')" 
                                color="primary" 
                                :disabled="loading" 
                               
                                size="large"
                            >
                                <v-icon left>mdi-file-pdf-box</v-icon>
                                {{ $t('reportGenerator.generate_pdf') }}
                            </v-btn>
                            <v-btn 
                                @click="generateReport('xlsx')" 
                                color="success" 
                                :disabled="loading"
                               
                                size="large"
                            >
                                <v-icon left>mdi-file-excel-box</v-icon>
                                {{ $t('reportGenerator.generate_xlsx') }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
            </div>

            <!-- Snackbar para feedback -->
            <v-snackbar 
                v-model="snackbar.show" 
                :color="snackbar.color" 
                :timeout="3000" 
                top
                class="modern-snackbar"
            >
                {{ snackbar.text }}
            </v-snackbar>
        </v-container>
    </div>
</template>

<script>
import ReportService from '@/services/ReportService';
import DataService from "@/services/DataService"

export default {
    props: {
        initialReportType: {
            type: String,
            default: 'expenses',
        },
        initialStartDate: {
            type: String,
            default: null,
        },
        initialEndDate: {
            type: String,
            default: null,
        },
        initialCategoryFilter: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            reportType: this.initialReportType || 'expenses',
            viewType: 'grouped',
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
            selectedCategories: [],
            availableCategories: [],
            startDate: this.initialStartDate ? new Date(`${this.initialStartDate}T00:00:00`) : null,
            endDate: this.initialEndDate ? new Date(`${this.initialEndDate}T00:00:00`) : null,
            formattedStartDate: '',
            formattedEndDate: '',
            startDateMenu: false,
            endDateMenu: false,
            includeProportions: false,
            loading: false,
            snackbar: {
                show: false,
                color: "",
                text: "",
            },
            reportService: new ReportService(),
            selectedLanguage: this.$i18n?.locale || 'pt',
        };
    },
    created() {
        this.formattedStartDate = this.formatDate(this.startDate);
        this.formattedEndDate = this.formatDate(this.endDate);
        this.fetchCategories();
    },
    computed: {
        reportTypes() {
            return [
                { text: this.$t('reportGenerator.report_types.expenses'), value: 'expenses' },
                { text: this.$t('reportGenerator.report_types.incomes'), value: 'incomes' },
            ];
        },
        viewTypes() {
            return [
                { text: this.$t('reportGenerator.view_types.normal'), value: 'normal' },
                { text: this.$t('reportGenerator.view_types.grouped'), value: 'grouped' },
                { text: this.$t('reportGenerator.view_types.detailed'), value: 'detailed' },
            ];
        },
    },
    methods: {
        formatDate(date) {
            if (!date) return '';
            return new Intl.DateTimeFormat(this.$i18n?.locale || 'pt-BR').format(new Date(date));
        },
        normalizeTranslatedCollection(payload) {
            if (Array.isArray(payload)) return payload;
            if (!payload || typeof payload !== 'object') return [];

            const candidates = [payload.data, payload.items, payload.content, payload.results, payload.list];
            for (const candidate of candidates) {
                if (Array.isArray(candidate)) return candidate;
            }

            return [];
        },
        async fetchCategories() {
            if (this.reportType === 'expenses') {
                try {
                    const [listResponse, translatedResponse] = await Promise.all([
                        DataService.listCategories(),
                        DataService.fetchCategories(this.selectedLanguage),
                    ]);
                    const categories = this.normalizeTranslatedCollection(listResponse?.data);
                    const translatedCategories = this.normalizeTranslatedCollection(translatedResponse?.data);
                    const translatedNamesByCode = translatedCategories.reduce((accumulator, category) => {
                        const code = String(category?.code || '').trim();
                        if (code) {
                            accumulator[code] = category?.name || code;
                        }
                        return accumulator;
                    }, {});

                    this.availableCategories = categories
                        .map((category) => {
                            const code = String(category?.code || '').trim();
                            const id = category?.id ?? null;
                            const isActive = category?.active !== false;
                            const isSystemDefined = category?.systemDefined !== false;
                            if (!code || id === null || id === undefined) {
                                return null;
                            }
                            if (!isActive) {
                                return null;
                            }
                            const translationKey = `categories.${code}`;
                            const translatedName = this.$t(translationKey);
                            const isTranslated = translatedName !== translationKey;
                            return {
                                id,
                                code,
                                name: translatedNamesByCode[code]
                                    || (isSystemDefined && isTranslated ? translatedName : null)
                                    || (category?.name || code)
                            };
                        })
                        .filter((category) => Boolean(category))
                        .sort((left, right) => left.name.localeCompare(right.name, this.selectedLanguage));

                    this.applyInitialCategoryFilter();

                } catch (error) {
                    console.error('Erro ao buscar categorias:', error);
                }
            } else {
                this.availableCategories = [];
                this.selectedCategories = [];
            }
        },
        async generateReport(format) {
            if (!this.validateInputs()) return;

            const reportRequest = {
                categoryIds: this.reportType === 'expenses' ? this.selectedCategories : [],
                startDate: this.startDate.toISOString().split('T')[0],
                endDate: this.endDate.toISOString().split('T')[0],
                includeProportions: this.includeProportions,
                viewType: this.viewType,
            };

            try {
                this.loading = true;
                const response = await this.reportService.generate(this.reportType, format, reportRequest);
                const mimeType = format === 'pdf'
                    ? 'application/pdf'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

                const fileName = `relatorio_${this.reportType}_${this.viewType}.${format}`;
                this.downloadFile(response.data, mimeType, fileName);

            } catch (error) {
                console.error('Erro ao gerar relatório:', error);
                this.showSnackbar(this.$t('reportGenerator.error_generate'), 'error');
            } finally {
                this.loading = false;
            }
        },
        downloadFile(data, mimeType, fileName) {
            const blob = new Blob([data], { type: mimeType });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        },
        showSnackbar(message, color = "success") {
            this.snackbar.show = true;
            this.snackbar.color = color;
            this.snackbar.text = message;
        },
        validateInputs() {
            if (!this.startDate || !this.endDate) {
                this.showSnackbar(this.$t('reportGenerator.select_date_range'), "warning");
                return false;
            }
            if (this.startDate > this.endDate) {
                this.showSnackbar(this.$t('reportGenerator.start_after_end'), "warning");
                return false;
            }
            return true;
        },
        applyInitialCategoryFilter() {
            if (!this.initialCategoryFilter || this.reportType !== 'expenses') {
                return;
            }

            const match = this.availableCategories.find((category) =>
                category?.code === this.initialCategoryFilter || category?.name === this.initialCategoryFilter
            );

            if (match) {
                this.selectedCategories = [match.id];
            }
        },
    },
    watch: {
        startDate(value) {
            this.formattedStartDate = this.formatDate(value);
            this.startDateMenu = false;
        },
        endDate(value) {
            this.formattedEndDate = this.formatDate(value);
            this.endDateMenu = false;
        },
        reportType() {
            this.fetchCategories();
        },
        '$i18n.locale'(newLocale) {
            if (newLocale && newLocale !== this.selectedLanguage) {
                this.selectedLanguage = newLocale;
                this.fetchCategories();
            }
        }
    },

};
</script>

<style scoped>
.report-scope-row {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 8px;
}
</style>

<style scoped>
.report-generator-wrapper {
  min-height: 100vh;
  background: var(--cb-page-bg);
  padding: 32px 0;
}

/* Input focus ring */
.modern-input :deep(.v-field) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modern-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cb-primary) 10%, transparent);
}

.gap-2 { gap: 12px; }
.modern-snackbar { border-radius: 8px; }

/* Responsive */
@media (max-width: 960px) {
  .cb-card__header { padding: 20px; }
  .cb-card__body   { padding: 20px; }
}

@media (max-width: 600px) {
  .report-generator-wrapper { padding: 20px 0; }
  .cb-card__header { padding: 16px 20px; }
  .cb-card__title  { font-size: 1.2rem; }
  .cb-card__body   { padding: 16px; }
  .d-flex.justify-end { flex-direction: column; }
}
</style>
