<template>
    <div class="report-generator-container">
        <v-row class="d-flex align-center mb-2">
            <!-- Tipo de Relatório -->
            <v-col cols="12" md="3">
                <v-select v-model="reportType" :items="reportTypes" item-title="text" item-value="value"
                    label="Tipo de Relatório" dense />
            </v-col>

            <!-- Tipo de Visualização -->
            <v-col cols="12" md="3">
                <v-select v-model="viewType" :items="viewTypes" item-title="text" item-value="value"
                    label="Visualização" dense />
            </v-col>

            <!-- Seleção de categorias -->
            <v-col cols="12" md="4">
                <v-select :label="$t('common.category')" v-model="selectedCategories" :items="availableCategories"
                    item-title="name" item-value="id" multiple chips dense>
                    <template #item="{ item, props }">
                        <v-list-item v-bind="props">
                            <template #prepend>
                                <v-icon :icon="categoryIcons[item.raw.code]" class="mr-2"></v-icon>
                            </template>
                        </v-list-item>
                    </template>

                    <!-- Slot para personalizar o item selecionado -->
                    <template #selection="{ item, props }">
                        <v-chip v-bind="props" class="ma-1" small>
                            <v-icon left :icon="categoryIcons[item.raw.code]"></v-icon>
                            {{ item.raw.name }}
                        </v-chip>
                    </template>

                </v-select>
            </v-col>
        </v-row>

        <v-row class="d-flex align-center mb-2">
            <!-- Data Inicial -->
            <v-col cols="12" md="3">
                <v-menu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                    min-width="auto">
                    <template v-slot:activator="{ props }">
                        <v-text-field v-model="formattedStartDate" label="Data Inicial" prepend-icon="mdi-calendar"
                            readonly dense v-bind="props" />
                    </template>
                    <v-date-picker v-model="startDate" no-title />
                </v-menu>
            </v-col>

            <!-- Data Final -->
            <v-col cols="12" md="3">
                <v-menu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
                    min-width="auto">
                    <template v-slot:activator="{ props }">
                        <v-text-field v-model="formattedEndDate" label="Data Final" prepend-icon="mdi-calendar" readonly
                            dense v-bind="props" />
                    </template>
                    <v-date-picker v-model="endDate" no-title />
                </v-menu>
            </v-col>

            <!-- Incluir proporções -->
            <v-col cols="12" md="2">
                <v-checkbox v-model="includeProportions" label="Incluir proporções (%)" dense hide-details />
            </v-col>

            <!-- Botões -->
            <v-col cols="12" md="4" class="text-right">
                <v-btn @click="generateReport('pdf')" color="primary" :disabled="loading" class="mr-2">
                    <v-icon left>mdi-file-pdf-box</v-icon>PDF
                </v-btn>
                <v-btn @click="generateReport('xlsx')" color="primary" :disabled="loading">
                    <v-icon left>mdi-file-excel-box</v-icon>XLSX
                </v-btn>
            </v-col>
        </v-row>
        <!-- Snackbar para feedback -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" top>
            {{ snackbar.text }}
        </v-snackbar>
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
            DataService.fetchCategories(this.selectedLanguage)
                .then((response) => {
                    this.availableCategories = response.data.map((category) => ({
                        id: category.id,
                        code: category.code,
                        name: category.name
                    }))
                })
                .catch((error) => {
                    console.error('Error fetching categories:', error)
                });
        },
        async generateReport(format) {
            if (!this.validateInputs()) return;

            const reportRequest = {
                categoryIds: this.selectedCategories,
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
            } finally {
                this.loading = false;
            }
        },
        downloadFile(data, mimeType, fileName) {
            const blob = new Blob([data], { type: mimeType });
            if (navigator.msSaveBlob) {
                // Para IE e Edge
                navigator.msSaveBlob(blob, fileName);
            } else {
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute("download", fileName);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                URL.revokeObjectURL(url);
            }
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
        reportType(newType) {
            // Recarrega as categorias disponíveis quando o tipo de relatório muda
            this.fetchCategories();
        },
    },
};
</script>

<style scoped>
.report-generator-container {
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 8px;
}
</style>