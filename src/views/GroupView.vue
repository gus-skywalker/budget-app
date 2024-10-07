<template>
    <v-container>
        <h1>Gerenciamento de Grupos</h1>
        <GroupManagement />
    </v-container>
</template>

<script>
import GroupManagement from '@/components/GroupManagement.vue'

export default {
    name: 'GroupView',
    components: {
        GroupManagement
    },
    data() {
        return {

        }
    }
};
</script>

<style scoped>
.section {
    margin-bottom: 20px;
}
</style>