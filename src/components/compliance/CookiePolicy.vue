<template>
  <div class="cookie-policy-container">
    <h1>Política de Cookies</h1>
    <p>
      Este site utiliza cookies para melhorar a sua experiência. Para saber mais sobre como utilizamos cookies,
      você pode ler nossa
      <a href="https://www.iubenda.com/privacy-policy/82185492/cookie-policy"
        class="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe" title="Política de Cookies">
        Política de Cookies
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
.cookie-policy-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

.cookie-policy-container h1 {
  margin-bottom: 20px;
}

.cookie-policy-container p {
  line-height: 1.6;
}
</style>