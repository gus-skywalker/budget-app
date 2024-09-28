<template>
    <v-container id="reset-password-page">
        <!-- Header Simples -->
        <header class="header">
            <div class="logo">
                <img src="/logo.jpg" alt="Logo" />
            </div>
        </header>

        <!-- Formulário de Redefinição de Senha -->
        <section class="reset-password-section">
            <div class="reset-password-container">
                <h1>Redefinir sua senha</h1>
                <p>Insira sua nova senha abaixo para redefinir a senha da sua conta.</p>

                <form @submit.prevent="handleResetPassword">
                    <div class="form-group">
                        <label for="password">Nova Senha:</label>
                        <input type="password" id="password" v-model="password" required
                            placeholder="Digite sua nova senha" class="form-input" />
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirmar Senha:</label>
                        <input type="password" id="confirmPassword" v-model="confirmPassword" required
                            placeholder="Confirme sua nova senha" class="form-input" />
                    </div>
                    <button type="submit" class="btn btn-primary">
                        Redefinir Senha
                    </button>
                </form>

                <!-- Exibe a mensagem de sucesso ou erro -->
                <p v-if="message" class="message">{{ message }}</p>
            </div>
        </section>

        <!-- Footer Simples -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-info">
                    <p>&copy; 2024 Wallet Connect. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    </v-container>
</template>

<script>
export default {
    name: 'ResetPasswordPage',
    data() {
        return {
            token: '', // Armazena o token da URL
            password: '',
            confirmPassword: '',
            message: '',
        };
    },
    mounted() {
        // Captura o token da URL
        this.token = this.$route.query.token;
    },
    methods: {
        handleResetPassword() {
            // Verifica se as senhas coincidem
            if (this.password !== this.confirmPassword) {
                this.message = 'As senhas não coincidem.';
                return;
            }

            // Chamada à API para redefinir a senha
            this.$http
                .post('/auth/reset-password', {
                    token: this.token,        // Token capturado da URL
                    newPassword: this.password,
                })
                .then((response) => {
                    this.message = 'Sua senha foi redefinida com sucesso. Você já pode fazer login.';
                })
                .catch((error) => {
                    console.error(error);
                    this.message = 'Ocorreu um erro ao redefinir sua senha. Tente novamente mais tarde.';
                });
        },
    },
};
</script>

<style scoped>
/* Cores e layout */
#reset-password-page {
    --orange: #f39c12;
    --dark-orange: #e67e22;
    --white: #ffffff;
    --light-gray: #f8f9f9;
    --dark-gray: #2c3e50;
}

/* Estilos gerais */
.reset-password-section {
    padding: 80px 20px;
    text-align: center;
}

.reset-password-container {
    max-width: 400px;
    margin: 0 auto;
    background-color: var(--light-gray);
    padding: 40px;
    border-radius: 10px;
}

.reset-password-container h1 {
    font-size: 24px;
    color: var(--dark-gray);
    margin-bottom: 20px;
}

.reset-password-container p {
    font-size: 16px;
    color: var(--dark-gray);
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-size: 14px;
    color: var(--dark-gray);
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 12px;
    font-size: 14px;
    border: 1px solid var(--dark-gray);
    border-radius: 5px;
}

.btn-primary {
    background-color: var(--orange);
    color: var(--white);
    padding: 12px 24px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.btn-primary:hover {
    background-color: var(--dark-orange);
}

.message {
    margin-top: 20px;
    font-size: 14px;
    color: var(--dark-gray);
}

/* Logo reduzida */
.logo img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

/* Footer */
.footer {
    background-color: var(--dark-gray);
    padding: 20px;
    color: var(--white);
    text-align: center;
}

.footer-info {
    margin-top: 10px;
}
</style>