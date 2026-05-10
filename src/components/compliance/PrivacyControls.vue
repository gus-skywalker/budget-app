<script lang="js">
import { onMounted } from 'vue';

const AUTOBLOCKING_SCRIPT_ID = 'iubenda-autoblocking-script';
const COOKIE_SOLUTION_SCRIPT_ID = 'iubenda-cookie-solution-script';

export default {
    name: 'PrivacyControls',
    setup() {
        onMounted(() => {
            window._iub = window._iub || {};
            window._iub.csConfiguration = {
                siteId: 3765662,
                cookiePolicyId: 82185492,
                lang: 'pt-BR',
            };

            if (!document.getElementById(AUTOBLOCKING_SCRIPT_ID)) {
                const script1 = document.createElement('script');
                script1.id = AUTOBLOCKING_SCRIPT_ID;
                script1.src = 'https://cs.iubenda.com/autoblocking/3765662.js';
                script1.onerror = () => {
                    console.error('Erro ao carregar o script de autoblocking');
                };
                document.head.appendChild(script1);
            }

            if (!document.getElementById(COOKIE_SOLUTION_SCRIPT_ID)) {
                const script2 = document.createElement('script');
                script2.id = COOKIE_SOLUTION_SCRIPT_ID;
                script2.src = 'https://cdn.iubenda.com/cookie_solution/iubenda_cs/1.66.1/core-pt-BR.js';
                script2.charset = 'UTF-8';
                script2.async = true;
                script2.onerror = () => {
                    console.error('Erro ao carregar o script do Iubenda');
                };
                document.head.appendChild(script2);
            }
        });
    },
};
</script>

<style scoped>
/* Adicione estilos conforme necessário */
</style>
