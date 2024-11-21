<template>
    <div class="report-view-container">
        <v-container>
            <v-row>
                <v-col cols="12">
                    <h1>Gerar Relatórios</h1>
                    <report-generator />
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
};
</script>

<style scoped>
.report-view-container {
    padding: 20px;
}
</style>