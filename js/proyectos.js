/* =====================================================================
   vsMOON · página de proyectos
   - Frases de Mr. Pixel para esta página
   - Visor de capturas (clic en una captura para verla grande, ← → y Esc)
   ===================================================================== */

/* main.js lee esta lista para el globo del inicio */
window.FRASES_PIXEL_PAGINA = [
  "¡Bienvenido al taller! 🛠️",
  "Dungeon Night ya huele a aventura ⚔️",
  "Studio Sun: dibuja y edita en un solo lugar 🎨",
  "vsMOON en tu bolsillo: beta de Android 📱",
  "En My Pixel Web podremos conversar 💬",
  "Todo esto nace bajo PixelBlade ✨"
];

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* marca como "con imagen" solo las capturas que cargaron de verdad (los recuadros vacíos no abren el visor) */
  function revisar() {
    $$(".cap").forEach(cap => cap.classList.toggle("tiene", !!$("img", cap)));
  }
  addEventListener("load", () => setTimeout(revisar, 100));
  setTimeout(revisar, 800);
  setTimeout(revisar, 2500);

  /* ---------- visor ---------- */
  const lb = $("#lb"), img = $("#lbImg"), pie = $("#lbPie");
  let lista = [], actual = 0, ultimoFoco = null;

  function mostrar(i) {
    actual = (i + lista.length) % lista.length;
    const el = lista[actual];
    img.src = el.src;
    img.alt = el.alt;
    pie.textContent = `${el.alt} · ${actual + 1} / ${lista.length}`;
  }
  function abrir(cap) {
    const galeria = cap.closest(".galeria5");
    lista = $$(".cap img", galeria);
    const i = lista.indexOf($("img", cap));
    if (i < 0) return;
    ultimoFoco = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    mostrar(i);
    $("#lbCerrar").focus();
  }
  function cerrar() {
    lb.hidden = true;
    img.removeAttribute("src");
    document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  document.addEventListener("click", e => {
    const cap = e.target.closest(".cap");
    if (cap && cap.classList.contains("tiene")) return abrir(cap);
    if (e.target === lb || e.target.closest("#lbCerrar")) cerrar();
  });
  $("#lbPrev").addEventListener("click", () => mostrar(actual - 1));
  $("#lbNext").addEventListener("click", () => mostrar(actual + 1));
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowRight") mostrar(actual + 1);
    if (e.key === "ArrowLeft") mostrar(actual - 1);
  });
})();
