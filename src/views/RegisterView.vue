<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card class="elevation-12">
                    <v-card-title class="headline">
                        Criar Conta
                        <div v-if="selectedPlan" class="subtitle-1">
                            Plano selecionado: {{ planDisplay }}
                        </div>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
                            <v-text-field
                                v-model="formData.name"
                                :rules="nameRules"
                                label="Nome completo"
                                required
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.email"
                                :rules="emailRules"
                                label="E-mail"
                                required
                                type="email"
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.password"
                                :rules="passwordRules"
                                label="Senha"
                                required
                                type="password"
                            ></v-text-field>

                            <v-text-field
                                v-model="formData.confirmPassword"
                                :rules="confirmPasswordRules"
                                label="Confirmar senha"
                                required
                                type="password"
                            ></v-text-field>

                            <v-checkbox
                                v-model="formData.terms"
                                :rules="termsRules"
                                required
                            >
                                <template v-slot:label>
                                    Eu concordo com os <a href="#" @click.prevent="showTerms">termos de uso</a>
                                </template>
                            </v-checkbox>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            :disabled="!valid"
                            @click="handleSubmit"
                            :loading="loading"
                        >
                            Criar conta
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <!-- Modal dos Termos -->
        <v-dialog v-model="showTermsDialog" max-width="700">
            <v-card>
                <v-card-title>Termos de Uso</v-card-title>
                <v-card-text>
                    <!-- Adicione seus termos de uso aqui -->
                    <p>Termos de uso do serviço...</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="showTermsDialog = false">
                        Fechar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default {
    name: 'RegisterView',
    setup() {
        const router = useRouter();
        const route = useRoute();
        const store = useStore();
        
        const form = ref(null);
        const valid = ref(false);
        const loading = ref(false);
        const showTermsDialog = ref(false);
        
        const formData = ref({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: false
        });

        const selectedPlan = computed(() => route.query.plan);
        
        const planDisplay = computed(() => {
            switch(selectedPlan.value) {
                case 'MONTHLY':
                    return 'Mensal - R$ 29,00/mês';
                case 'ANNUAL':
                    return 'Anual - R$ 299,00/ano';
                default:
                    return '';
            }
        });

        const nameRules = [
            v => !!v || 'Nome é obrigatório',
            v => v.length >= 3 || 'Nome deve ter pelo menos 3 caracteres'
        ];

        const emailRules = [
            v => !!v || 'E-mail é obrigatório',
            v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido'
        ];

        const passwordRules = [
            v => !!v || 'Senha é obrigatória',
            v => v.length >= 8 || 'Senha deve ter pelo menos 8 caracteres'
        ];

        const confirmPasswordRules = [
            v => !!v || 'Confirme sua senha',
            v => v === formData.value.password || 'As senhas não coincidem'
        ];

        const termsRules = [
            v => !!v || 'Você deve aceitar os termos para continuar'
        ];

        const showTerms = () => {
            showTermsDialog.value = true;
        };

        const handleSubmit = async () => {
            if (!form.value.validate()) return;
            
            try {
                loading.value = true;
                
                // Registra o usuário
                await store.dispatch('auth/register', {
                    name: formData.value.name,
                    email: formData.value.email,
                    password: formData.value.password
                });

                // Se tem plano selecionado, redireciona para checkout
                if (selectedPlan.value) {
                    router.push({
                        name: 'checkout',
                        query: { plan: selectedPlan.value }
                    });
                } else {
                    router.push({ name: 'home' });
                }
            } catch (error) {
                console.error('Erro no registro:', error);
                // Implementar notificação de erro
            } finally {
                loading.value = false;
            }
        };

        return {
            form,
            valid,
            loading,
            formData,
            showTermsDialog,
            nameRules,
            emailRules,
            passwordRules,
            confirmPasswordRules,
            termsRules,
            selectedPlan,
            planDisplay,
            showTerms,
            handleSubmit
        };
    }
};
</script>