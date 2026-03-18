<template>
    <div class="report-view-container">
        <v-container>
            <v-row>
                <v-col cols="12">
                    <h1>Gerar Relatórios</h1>
                    <report-generator
                      :initial-report-type="initialReportType"
                      :initial-start-date="initialStartDate"
                      :initial-end-date="initialEndDate"
                      :initial-category-filter="initialCategoryFilter"
                    />
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import ReportGenerator from "@/components/ReportGenerator.vue";

export default {
    components: {
        ReportGenerator,
    },
    computed: {
        initialReportType() {
            return typeof this.$route?.query?.reportType === 'string' ? this.$route.query.reportType : 'expenses'
        },
        initialStartDate() {
            return typeof this.$route?.query?.startDate === 'string' ? this.$route.query.startDate : null
        },
        initialEndDate() {
            return typeof this.$route?.query?.endDate === 'string' ? this.$route.query.endDate : null
        },
        initialCategoryFilter() {
            return typeof this.$route?.query?.category === 'string' ? this.$route.query.category : null
        },
    },
};
</script>

<style scoped>
.report-view-container {
    padding: 20px;
}
</style>
