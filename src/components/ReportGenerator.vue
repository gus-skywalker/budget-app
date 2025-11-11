<template>
    <div class="report-generator-wrapper">
        <v-container class="modern-container">
            <div class="modern-card">
                <div class="card-header">
                    <h2 class="card-title">
                        <v-icon color="#667eea" class="mr-2">mdi-file-chart</v-icon>
                        Gerar Relatórios
                    </h2>
                </div>
                <div class="card-content">
                    <v-row class="mb-4">
                        <!-- Tipo de Relatório -->
                        <v-col cols="12" md="4">
                            <v-select 
                                v-model="reportType" 
                                :items="reportTypes" 
                                item-title="text" 
                                item-value="value"
                                label="Tipo de Relatório" 
                                variant="outlined"
                                density="comfortable"
                                color="#667eea"
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
                                label="Visualização" 
                                variant="outlined"
                                density="comfortable"
                                color="#667eea"
                                class="modern-input"
                            />
                        </v-col>

                        <!-- Seleção de categorias -->
                        <v-col cols="12" md="4" v-if="reportType === 'expenses'">
                            <v-select 
                                :label="$t('common.category')" 
                                v-model="selectedCategories" 
                                :items="availableCategories"
                                item-title="name" 
                                item-value="id" 
                                multiple 
                                chips 
                                variant="outlined"
                                density="comfortable"
                                color="#667eea"
                                class="modern-input"
                            >
                                <template #item="{ item, props }">
                                    <v-list-item v-bind="props">
                                        <template #prepend>
                                            <v-icon :icon="categoryIcons[item.raw.code]" class="mr-2"></v-icon>
                                        </template>
                                    </v-list-item>
                                </template>

                                <template #selection="{ item, props }">
                                    <v-chip v-bind="props" class="ma-1" small>
                                        <v-icon left :icon="categoryIcons[item.raw.code]"></v-icon>
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
                                        label="Data Inicial" 
                                        prepend-inner-icon="mdi-calendar"
                                        readonly 
                                        v-bind="props" 
                                        variant="outlined"
                                        density="comfortable"
                                        color="#667eea"
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
                                        label="Data Final" 
                                        prepend-inner-icon="mdi-calendar" 
                                        readonly
                                        v-bind="props" 
                                        variant="outlined"
                                        density="comfortable"
                                        color="#667eea"
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
                                label="Incluir proporções (%)" 
                                density="comfortable"
                                color="#667eea"
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
                                class="modern-btn gradient-btn"
                                size="large"
                            >
                                <v-icon left>mdi-file-pdf-box</v-icon>
                                Gerar PDF
                            </v-btn>
                            <v-btn 
                                @click="generateReport('xlsx')" 
                                color="success" 
                                :disabled="loading"
                                class="modern-btn"
                                size="large"
                            >
                                <v-icon left>mdi-file-excel-box</v-icon>
                                Gerar XLSX
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
    data() {
        return {
            reportType: 'expenses',
            viewType: 'grouped',
            reportTypes: [
                { text: 'Despesas', value: 'expenses' },
                { text: 'Entradas', value: 'incomes' },
            ],
            viewTypes: [
                { text: 'Normal (linha a linha)', value: 'normal' },
                { text: 'Agrupado por mês', value: 'grouped' },
                { text: 'Detalhado por mês', value: 'detailed' },
            ],
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
            startDate: null,
            endDate: null,
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
        this.fetchCategories();
    },
    methods: {
        formatDate(date) {
            if (!date) return '';
            return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
        },
        async fetchCategories() {
            if (this.reportType === 'expenses') {
                try {
                    const language = this.$i18n?.locale || this.selectedLanguage || 'pt';
                    this.selectedLanguage = language;
                    const response = await DataService.fetchCategories(language);
                    this.availableCategories = response.data.map((category) => ({
                        id: category.id,
                        code: category.code,
                        name: this.$t(`categories.${category.code}`) || category.name
                    }));

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
                this.showSnackbar('Erro ao gerar relatório.', 'error');
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
                this.showSnackbar("Selecione o intervalo de datas.", "warning");
                return false;
            }
            if (this.startDate > this.endDate) {
                this.showSnackbar("A data inicial não pode ser maior que a data final.", "warning");
                return false;
            }
            return true;
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
            } else {
                this.availableCategories = this.availableCategories.map((cat) => ({
                    ...cat,
                    name: this.$t(`categories.${cat.code}`) || cat.name
                }));
            }
        }
    },

};
</script>

<style scoped>
.report-generator-wrapper {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf0 100%);
    padding: 32px 0;
}

.v-theme--dark .report-generator-wrapper {
    background: linear-gradient(135deg, #1e1e1e 0%, #141414 100%);
}

.modern-container {
    max-width: 1200px;
    padding-left: 16px;
    padding-right: 16px;
}

@media (min-width: 600px) {
    .modern-container {
        padding-left: 24px;
        padding-right: 24px;
    }
}

/* Modern Card */
.modern-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.v-theme--dark .modern-card {
    background: #2a2a2a;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modern-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.v-theme--dark .modern-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.card-header {
    padding: 24px 28px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(102, 126, 234, 0.03);
}

.v-theme--dark .card-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(102, 126, 234, 0.08);
}

.card-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    margin: 0;
}

.v-theme--dark .card-title {
    color: #ffffff;
}

.card-content {
    padding: 28px;
}

/* Inputs Modernos */
.modern-input :deep(.v-field) {
    border-radius: 8px;
    transition: all 0.3s ease;
}

.modern-input :deep(.v-field--focused) {
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Buttons */
.modern-btn {
    border-radius: 8px;
    text-transform: none;
    font-weight: 600;
    letter-spacing: 0.3px;
    transition: all 0.3s ease;
    padding: 12px 24px;
}

.gradient-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.gradient-btn:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
}

.gradient-btn:disabled {
    opacity: 0.6;
}

.gap-2 {
    gap: 12px;
}

/* Snackbar */
.modern-snackbar {
    border-radius: 8px;
}

/* Responsive */
@media (max-width: 960px) {
    .card-header {
        padding: 20px;
    }

    .card-content {
        padding: 20px;
    }
}

@media (max-width: 600px) {
    .report-generator-wrapper {
        padding: 20px 0;
    }

    .card-header {
        padding: 16px 20px;
    }

    .card-title {
        font-size: 1.2rem;
    }

    .card-content {
        padding: 16px;
    }

    .modern-btn {
        width: 100%;
        margin-bottom: 8px;
    }
    
    .d-flex.justify-end {
        flex-direction: column;
    }
}
</style>
