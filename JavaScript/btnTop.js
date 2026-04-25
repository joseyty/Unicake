<script>
  const btn = document.getElementById("btnTop");

  // Mostrar botão quando rolar
  window.onscroll = function () {
    if (document.documentElement.scrollTop > 200) {
      btn.style.display = "block";
    } else {
      btn.style.display = "none";
    }
  };

  // Voltar ao topo
  btn.onclick = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
</script>