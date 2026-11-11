<template>
    <div class="privacy-policy-container">
        <h1>Política de Privacidade</h1>
        <div class="privacy-summary">
            <p>
                O CoBudget trata dados financeiros importados por Open Finance em modo somente leitura. Não coletamos a
                senha bancária do usuário e não movimentamos recursos em nome do usuário, do workspace ou de terceiros.
            </p>
            <p>
                Fontes empresariais vinculadas a CNPJ podem ser compartilhadas com o workspace para operação e
                planejamento. Fontes pessoais vinculadas a CPF começam privadas por padrão e só passam a ter outro nível
                de compartilhamento quando o titular da conexão escolhe isso explicitamente.
            </p>
            <p>
                Para fontes CPF, o titular pode manter a conexão <strong>privada</strong>, permitir apenas
                <strong>impacto agregado no planejamento</strong> ou compartilhar a visibilidade operacional com
                <strong>owners e admins</strong>. Essa escolha não transforma dados pessoais em dados públicos do
                workspace.
            </p>
            <p>
                Revogar o consentimento ou desligar o compartilhamento impede novas utilizações futuras da fonte
                conforme a política escolhida, mas artefatos já materializados, como budgets e cenários salvos, podem
                permanecer como snapshots para rastreabilidade e auditoria.
            </p>
            <p>
                Transações Open Finance espelhadas não são excluídas fisicamente como ação de produto. Em vez disso, o
                CoBudget pode aplicar controles internos, como exclusão do planejamento, para preservar trilha de
                auditoria, reconciliação e ressincronização.
            </p>
            <p>
                Quando a plataforma é utilizada em contexto colaborativo, o tratamento de dados respeita as permissões
                do workspace, os papéis dos usuários e as políticas de compartilhamento aplicáveis a cada fonte
                financeira, sem ampliar automaticamente a visibilidade de dados pessoais.
            </p>
        </div>
        <p>
            Sua privacidade é importante para nós. Para saber mais sobre como protegemos suas informações, você pode ler
            nossa
            <a href="https://www.iubenda.com/privacy-policy/82185492"
                class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe" title="Política de Privacidade">
                Política de Privacidade
            </a>.
        </p>
    </div>
</template>

<script lang="js">
import { onMounted } from 'vue'

const IUBENDA_SCRIPT_ID = 'iubenda-embed-script'

function loadIubendaEmbed() {
    if (document.getElementById(IUBENDA_SCRIPT_ID)) {
        if (window.iubenda?.embed) {
            window.iubenda.embed()
        }
        return
    }

    const script = document.createElement('script')
    script.id = IUBENDA_SCRIPT_ID
    script.src = 'https://cdn.iubenda.com/iubenda.js'
    script.async = true
    document.head.appendChild(script)
}

export default {
    name: 'PrivacyPolicy',
    setup() {
        onMounted(loadIubendaEmbed)
    }
}
</script>

<style scoped>
.privacy-policy-container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
    text-align: center;
}

.privacy-policy-container h1 {
    margin-bottom: 20px;
}

.privacy-policy-container p {
    line-height: 1.6;
}

.privacy-summary {
    margin: 0 auto 24px;
    max-width: 860px;
    text-align: left;
    display: grid;
    gap: 12px;
}
</style>
