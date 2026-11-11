<template>
  <section class="faq-section">
    <div class="faq-inner">
      <div class="faq-heading">
        <span class="faq-kicker">{{ $t('faq.title') }}</span>
        <h2>{{ $t('faq.title') }}</h2>
      </div>

      <article v-for="(faq, index) in faqs" :key="index" class="faq-item">
        <button type="button" class="faq-question" @click="toggleAnswer(index)">
          <span>{{ $t(faq.question) }}</span>
          <v-icon size="18">{{ isAnswerVisible(index) ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
        </button>
        <p v-if="isAnswerVisible(index)" class="faq-answer">{{ $t(faq.answer) }}</p>
      </article>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FAQ',
  props: {
    faqs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      visibleAnswerIndex: 0,
    }
  },
  methods: {
    toggleAnswer(index) {
      this.visibleAnswerIndex = this.visibleAnswerIndex === index ? null : index
    },
    isAnswerVisible(index) {
      return this.visibleAnswerIndex === index
    },
  },
}
</script>

<style scoped>
.faq-section {
  padding: 0;
  background: transparent;
}

.faq-inner {
  padding: 32px;
}

.faq-heading {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
  margin-bottom: 26px;
}

.faq-kicker {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 14px;
  background: rgba(32, 95, 99, 0.1);
  color: var(--accent-strong, #173f4b);
  font-family: 'Manrope', sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.faq-heading h2 {
  margin: 0;
  color: var(--ink, #172033);
  font-family: 'Manrope', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.faq-item {
  border-top: 1px solid rgba(23, 32, 51, 0.08);
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  border: 0;
  background: transparent;
  color: var(--ink, #172033);
  cursor: pointer;
  text-align: left;
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
  font-weight: 700;
}

.faq-answer {
  margin: 0 0 18px;
  color: var(--ink-soft, #536177);
  font-size: 1rem;
  line-height: 1.65;
  padding-right: 28px;
}

@media (max-width: 760px) {
  .faq-inner {
    padding: 22px 20px;
  }

  .faq-answer {
    padding-right: 0;
  }
}
</style>