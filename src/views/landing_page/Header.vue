<template>
    <header class="header">
        <div class="logo" @click="scrollToTop">L</div>
        <h1>Les Monades</h1>
        <div class="mobile-menu-icon" @click="toggleMobileMenu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
    </header>
</template>

<script>
export default {
    methods: {
        toggleMobileMenu() {
            this.$emit('toggleMobileMenu');
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
}
</script>

<style scoped>
.header {
    background-color: var(--light-gray);
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    max-width: 1200px;
    /* Ajuste conforme necessário */
    margin: 0 auto;
    /* Centraliza o header */
    box-sizing: border-box;
    /* Garante que padding seja incluído na largura */
    z-index: 10;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, padding 0.3s;
}

.header.scrolled {
    background-color: var(--dark-gray);
    padding: 5px 20px;
}

.logo {
    cursor: pointer;
}

.mobile-menu-icon {
    display: none;
    cursor: pointer;
}

.bar {
    width: 25px;
    height: 3px;
    background-color: var(--dark-gray);
    margin: 5px 0;
}

/* Adapte para dispositivos móveis se necessário */
@media (max-width: 768px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
    }

    .mobile-menu-icon {
        display: block;
    }

    h1 {
        font-size: 20px;
    }
}
</style>