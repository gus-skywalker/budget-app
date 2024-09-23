<template>
    <div class="privacy-policy-container">
        <h1>Política de Privacidade</h1>
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

<script type="text/javascript">
(function (w, d) {
    var loader = function () {
        var s = d.createElement("script"),
            tag = d.getElementsByTagName("script")[0];
        s.src = "https://cdn.iubenda.com/iubenda.js";
        tag.parentNode.insertBefore(s, tag);
    };
    if (w.addEventListener) {
        w.addEventListener("load", loader, false);
    } else if (w.attachEvent) {
        w.attachEvent("onload", loader);
    } else {
        w.onload = loader;
    }
})(window, document);
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
</style>