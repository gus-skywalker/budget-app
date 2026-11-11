<template>
  <main class="visual-foundation" :class="{ 'visual-foundation--light': !theme.global.current.value.dark }">
    <div class="visual-foundation__container">
      <header class="visual-foundation__header">
        <div>
          <span class="visual-foundation__eyebrow">EV-01 · Prévia técnica</span>
          <h1>Uma decisão clara começa pelo mês</h1>
          <p>Exemplos estáticos de superfície, hierarquia, ações e estados. Nenhum valor vem de dados financeiros.</p>
        </div>
        <button type="button" class="visual-foundation__theme" @click="toggleTheme">
          {{ theme.global.current.value.dark ? 'Ver tema claro' : 'Ver tema escuro' }}
        </button>
      </header>

      <section class="visual-foundation__hero" aria-labelledby="visual-foundation-month">
        <div>
          <p class="visual-foundation__kicker">Visão do mês · exemplo</p>
          <h2 id="visual-foundation-month">Seu mês, em poucas palavras</h2>
          <p>Primeiro o significado; depois, os detalhes e as ações.</p>
        </div>
        <div class="visual-foundation__number">
          <span>Disponível planejado</span>
          <strong>R$ 1.000,00</strong>
          <small>Exemplo fictício · outubro de 2026</small>
        </div>
      </section>

      <section class="visual-foundation__section" aria-labelledby="visual-foundation-actions">
        <div class="visual-foundation__section-heading">
          <div>
            <span class="visual-foundation__eyebrow">Ações</span>
            <h2 id="visual-foundation-actions">Um próximo passo evidente</h2>
          </div>
          <span class="visual-foundation__chip">Acompanhar o mês</span>
        </div>
        <div class="visual-foundation__actions">
          <button type="button" class="visual-foundation__button visual-foundation__button--primary">Começar uma decisão</button>
          <button type="button" class="visual-foundation__button visual-foundation__button--secondary">Ver detalhes do mês</button>
          <button type="button" class="visual-foundation__text-action">Como chegamos a esse número?</button>
        </div>
      </section>

      <section class="visual-foundation__grid" aria-label="Exemplos de estados">
        <article class="visual-foundation__card">
          <span class="visual-foundation__eyebrow">Informação essencial</span>
          <h3>O que aconteceu</h3>
          <p>Conteúdo curto, com período e fonte próximos do valor apresentado.</p>
          <span class="visual-foundation__chip">Fonte: plano manual</span>
        </article>
        <article class="visual-foundation__card">
          <span class="visual-foundation__eyebrow">Detalhe sob demanda</span>
          <h3>Por que isso importa</h3>
          <p>A análise complementar continua acessível sem competir com a tarefa principal.</p>
          <button type="button" class="visual-foundation__text-action">Explorar análise</button>
        </article>
      </section>

      <section class="visual-foundation__section" aria-labelledby="visual-foundation-states">
        <h2 id="visual-foundation-states">Estados com texto, não só cor</h2>
        <div class="visual-foundation__states">
          <p class="visual-foundation__state visual-foundation__state--empty"><strong>Sem dados:</strong> ainda não há lançamentos para este mês.</p>
          <p class="visual-foundation__state visual-foundation__state--warning"><strong>Atenção:</strong> confirme a origem antes de decidir.</p>
          <p class="visual-foundation__state visual-foundation__state--error"><strong>Não foi possível carregar:</strong> tente novamente.</p>
          <p class="visual-foundation__state visual-foundation__state--success"><strong>Pronto:</strong> seu plano está ativo.</p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import './visualFoundation.css'

const theme = useTheme()

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>
