<template>
  <v-container>
    <!-- Header -->
    <header class="header">
      <img src="/logo.jpg" alt="Logo" class="logo" />
  <h1>CoBudget by Les Monades</h1>
    </header>

    <div class="container">

      <!-- Seção 1: Planejamento Financeiro -->
      <section class="section">
        <div class="section-image">
          <img src="/actress.jpg" alt="Planejamento Financeiro" />
        </div>
        <div class="section-content">
          <h2>Planejamento Financeiro</h2>
          <p>
            Nossa aplicação financeira ajuda você a planejar seu futuro financeiro com confiança.
          </p>
          <p>
            Com nossa ferramenta, você pode criar um plano personalizado para alcançar seus
            objetivos financeiros.
          </p>
        </div>
      </section>

            <section class="ai-highlight">
        <p class="tag">IA Financial Copilot</p>
        <h2>Inteligência que trabalha pelos seus objetivos</h2>
        <p>
          O Budget AI Service analisa seu histórico em segundos para entregar previsões confiáveis, alertas proativos e planos de economia mensuráveis. Veja como essa automação reduz o esforço manual e aumenta o controle:
        </p>
        <div class="ai-grid">
          <article>
            <h3>Previsão de Despesas</h3>
            <p>Projete meses futuros com faixa de confiança e entenda se o ritmo de gastos está subindo, caindo ou estável.</p>
          </article>
          <article>
            <h3>Detecção de Anomalias</h3>
            <p>O motor de IA monitora todos os lançamentos e destaca despesas fora do padrão antes que virem um problema.</p>
          </article>
          <article>
            <h3>Planos de Economia</h3>
            <p>Receba um plano claro com valor mensal recomendado, probabilidade de sucesso e ações sugeridas.</p>
          </article>
          <article>
            <h3>Auto Categorize</h3>
            <p>Descrições em PT/EN são interpretadas automaticamente, reduzindo até 80% do trabalho de classificação manual.</p>
          </article>
        </div>
      </section>

      <!-- Seção 2: Controle e Gestão -->
      <section class="section">
        <div class="section-image">
          <img src="/controle_gestao.jpg" alt="Controle e Gestão" />
        </div>
        <div class="section-content">
          <h2>Controle e Gestão</h2>
          <p>
            Nossa aplicação financeira oferece recursos avançados de controle e gestão para ajudá-lo
            a gerenciar suas finanças de forma eficaz.
          </p>
          <p>Você pode acompanhar suas despesas, receitas e investimentos em um só lugar.</p>
        </div>
      </section>

      <!-- Seção 3: Segurança e Proteção -->
      <section class="section">
        <div class="section-image">
          <img src="/seguranca.jpg" alt="Segurança e Proteção" />
        </div>
        <div class="section-content">
          <h2>Segurança e Proteção</h2>
          <p>Nossa aplicação financeira é projetada com segurança em mente.</p>
          <p>
            Nós usamos tecnologias de ponta para proteger suas informações financeiras e garantir
            que seus dados sejam seguros.
          </p>
        </div>
      </section>

      <!-- Seção 4: Vantagens -->
      <section class="section">
        <div class="section-image">
          <img src="/vantagens.jpg" alt="Vantagens" />
        </div>
        <div class="section-content">
          <h2>Vantagens</h2>
          <p>
            Nossa aplicação financeira oferece uma série de vantagens, incluindo relatórios
            personalizados, alertas de gastos e recomendações de investimento.
          </p>
          <p>Você pode aproveitar ao máximo suas finanças com nossa ferramenta.</p>
        </div>
      </section>

      <!-- Seção 5: Suporte e Ajuda -->
      <section class="section">
        <div class="section-image">
          <img src="/suporte.jpg" alt="Suporte e Ajuda" />
        </div>
        <div class="section-content">
          <h2>Suporte e Ajuda</h2>
          <p>
            Nossa equipe de suporte está sempre pronta para ajudá-lo com qualquer dúvida ou problema
            que você possa ter.
          </p>
          <p>Você pode contar conosco para obter ajuda em qualquer momento.</p>
        </div>
      </section>
    </div>
  </v-container>
</template>

<style>
.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

.header {
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.logo {
  width: 130px;
  height: 130px;
  margin-right: 10px;
}

.ai-highlight {
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 50px;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.08);
}

.ai-highlight .tag {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.85rem;
  font-weight: 600;
  color: #7c3aed;
}

.ai-highlight h2 {
  font-size: 2.2rem;
  margin: 10px 0 15px;
  color: #0f172a;
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.ai-grid article {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid rgba(124, 58, 237, 0.15);
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.05);
}

.ai-grid h3 {
  margin-bottom: 8px;
  color: #1e1b4b;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
}

.section-image {
  flex: 1 1 320px;
  margin: 10px;
  display: flex;
  justify-content: center;
}

.section-image img {
  width: 100%;
  max-width: 520px;
  height: auto;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.15);
}

.section-content {
  flex: 1 1 360px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  text-align: left;
  gap: 10px;
}

.section-content h2 {
  margin-top: 0;
}

.section-content p {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .section {
    flex-direction: column;
    text-align: center;
  }

  .ai-highlight {
    padding: 30px 20px;
  }

  .ai-grid {
    grid-template-columns: 1fr;
  }

  .section-image,
  .section-content {
    width: 100%;
    align-items: center;
  }

  .section-content {
    text-align: center;
  }

  .section-image img {
    max-width: 90vw;
  }
}
</style>
