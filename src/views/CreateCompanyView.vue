<template>
  <div class="create-company-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card class="elevation-12 pa-6">
            <v-card-title class="headline text-center mb-6">
              <v-icon large color="primary" class="mr-2">mdi-office-building</v-icon>
              Criar sua Empresa
            </v-card-title>
            
            <v-card-text>
              <p class="text-body-1 mb-6 text-center">
                Para começar a usar o CoBudget, você precisa criar uma empresa. 
                Como administrador, você poderá convidar outros usuários para colaborar.
              </p>
              
              <v-form ref="form" v-model="valid" @submit.prevent="createCompany">
                <v-text-field
                  v-model="companyName"
                  :rules="companyNameRules"
                  label="Nome da Empresa"
                  placeholder="Ex: Minha Empresa Ltda"
                  outlined
                  required
                  :loading="loading"
                  prepend-inner-icon="mdi-domain"
                />
                
                <v-textarea
                  v-model="description"
                  label="Descrição (Opcional)"
                  placeholder="Descreva brevemente sua empresa..."
                  outlined
                  rows="3"
                  counter="200"
                  :rules="descriptionRules"
                />
              </v-form>
            </v-card-text>
            
            <v-card-actions class="justify-center">
              <v-btn
                color="primary"
                size="large"
                :disabled="!valid"
                :loading="loading"
                @click="createCompany"
                class="px-8"
              >
                <v-icon left>mdi-plus</v-icon>
                Criar Empresa
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="4000"
      location="top"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/plugins/userStore'
import CompanyService from '@/services/CompanyService'
import { parseApiError } from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

const form = ref<any>(null)
const valid = ref(false)
const loading = ref(false)
const companyName = ref('')
const description = ref('')

// Snackbar state
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Validation rules
const companyNameRules = [
  (v: string) => !!v || 'Nome da empresa é obrigatório',
  (v: string) => (v && v.length >= 2) || 'Nome deve ter pelo menos 2 caracteres',
  (v: string) => (v && v.length <= 100) || 'Nome deve ter no máximo 100 caracteres'
]

const descriptionRules = [
  (v: string) => !v || v.length <= 200 || 'Descrição deve ter no máximo 200 caracteres'
]

const showSnackbar = (message: string, color: string = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

const createCompany = async () => {
  if (!form.value?.validate()) return
  
  try {
    loading.value = true
    
    // Create company
    const response = await CompanyService.create(companyName.value, description.value)
    const newCompany = response.data
    
    showSnackbar('Empresa criada com sucesso!', 'success')
    
    // Call createCompanyAfterLogin to handle token scoping
    await userStore.createCompanyAfterLogin(newCompany.companyId || newCompany.id)
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
    
  } catch (error) {
    console.error('Error creating company:', error)
    const errorMessage = parseApiError(error)
    showSnackbar(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-company-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.v-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.headline {
  color: #2c3e50;
  font-weight: 600;
}
</style>