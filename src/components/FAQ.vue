<template>
    <section class="faq-section">
        <h2>Perguntas Frequentes</h2>
        <div v-for="(faq, index) in faqs" :key="index" class="faq-item" @click="toggleAnswer(index)">
            <h3 :class="{ active: isAnswerVisible(index) }">{{ faq.question }}</h3>
            <p v-if="isAnswerVisible(index)">{{ faq.answer }}</p>
        </div>
    </section>
</template>

<script>
export default {
    name: "FAQ",
    props: {
        faqs: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            // Rastreamento do índice da pergunta cuja resposta está visível
            visibleAnswerIndex: null,
        };
    },
    methods: {
        toggleAnswer(index) {
            // Alterna a visibilidade da resposta da pergunta clicada
            this.visibleAnswerIndex = this.visibleAnswerIndex === index ? null : index;
        },
        isAnswerVisible(index) {
            return this.visibleAnswerIndex === index;
        },
    },
};
</script>

<style scoped>
.faq-section {
    padding: 40px 20px;
    background-color: var(--white);
    text-align: center;
}

.faq-section h2 {
    color: var(--dark-gray);
    font-size: 28px;
    margin-bottom: 20px;
}

.faq-item {
    cursor: pointer;
    margin-bottom: 15px;
    text-align: left;
    max-width: 800px;
    margin: 0 auto;
    padding: 10px;
    border: 1px solid var(--light-gray);
    border-radius: 8px;
    transition: background-color 0.3s ease;
}

.faq-item h3 {
    color: var(--dark-gray);
    font-size: 20px;
    margin: 0;
}

.faq-item h3.active {
    font-weight: bold;
}

.faq-item p {
    font-size: 16px;
    color: var(--dark-gray);
    margin-top: 10px;
}

/* Hover para indicar que a pergunta é clicável */
.faq-item:hover {
    background-color: var(--light-gray);
}
</style>