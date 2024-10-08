<template>
    <v-container id="forgot-password-page">
        <!-- Header Simples -->
        <header class="header">
            <div class="logo">
                <img src="/logo.jpg" alt="Logo" />
            </div>
        </header>

        <!-- Formulário de Recuperação de Senha -->
        <section class="forgot-password-section">
            <div class="forgot-password-container">
                <h1>Esqueceu sua senha?</h1>
                <p>Insira seu e-mail abaixo. Vamos enviar um link para que você possa redefinir sua senha.</p>

                <form @submit.prevent="handleForgotPassword">
                    <div class="form-group">
                        <label for="email">E-mail:</label>
                        <input type="email" id="email" v-model="email" required placeholder="Digite seu e-mail"
                            class="form-input" />
                    </div>
                    <button type="submit" class="btn btn-primary">
                        Enviar Link de Redefinição
                    </button>
                </form>

                <!-- Exibe a mensagem de sucesso ou erro -->
                <p v-if="message" class="message">{{ message }}</p>
            </div>
        </section>

        <!-- Footer Simples -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-links">
                    <a href="#" @click.prevent="$router.push({ name: 'login' })">Voltar para o login</a>
                </div>
                <div class="footer-info">
                    <p>&copy; 2024 Wallet Connect. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    </v-container>
</template>

<script>
export default {
    name: 'ForgotPasswordPage',
    data() {
        return {
            email: '',
            message: ''
        };
    },
    methods: {
        handleForgotPassword() {
            if (!this.email.includes('@')) {
                this.message = 'Por favor, insira um e-mail válido.';
                return;
            }

            // Chamada à API de recuperação de senha
            this.$http
                .post('/auth/forgot-password', { email: this.email })
                .then((response) => {
                    this.message = 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.';
                })
                .catch((error) => {
                    console.error(error);
                    this.message = 'Ocorreu um erro. Tente novamente mais tarde.';
                });
        },
    },
};
</script>

<style scoped>
/* Cores e layout */
#forgot-password-page {
    --orange: #f39c12;
    --dark-orange: #e67e22;
    --white: #ffffff;
    --light-gray: #f8f9f9;
    --dark-gray: #2c3e50;
}

/* Estilos gerais */
.forgot-password-section {
    padding: 80px 20px;
    text-align: center;
}

.forgot-password-container {
    max-width: 400px;
    margin: 0 auto;
    background-color: var(--light-gray);
    padding: 40px;
    border-radius: 10px;
}

.forgot-password-container h1 {
    font-size: 24px;
    color: var(--dark-gray);
    margin-bottom: 20px;
}

.forgot-password-container p {
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

.footer-links a {
    color: var(--white);
    margin-right: 20px;
    text-decoration: none;
}

.footer-info {
    margin-top: 10px;
}
</style>
