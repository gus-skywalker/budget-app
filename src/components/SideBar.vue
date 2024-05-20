<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify'

const theme = useTheme()

function toggleTheme(): void {
    const isLightTheme = computed(() => theme.global.name.value === 'light')
    theme.global.name.value = isLightTheme.value ? 'dark' : 'light'
}

</script>

<template>
    <v-navigation-drawer app expand-on-hover rail>

        <v-list>
            <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
                subtitle="sandra_a88@gmailcom" title="Sandra Adams"></v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-home" title="Home" :to="{ name: 'home' }"></v-list-item>
            <v-list-item prepend-icon="mdi-currency-usd" title="Budget" :to="{ name: 'budget' }"></v-list-item>
            <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" :to="{ name: 'dashboard' }"></v-list-item>
            <v-list-item prepend-icon="mdi-information" title="About" :to="{ name: 'about' }"></v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-switch @click="toggleTheme" label="Dark Mode">Toggle</v-switch>
    </v-navigation-drawer>
</template>
