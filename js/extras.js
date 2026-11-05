/* =====================================================================
   vsMOON · extras: requisitos, fecha del registro de cambios y hoja de ruta
   ► Lo único que normalmente tienes que editar está en EXTRAS.
   ===================================================================== */
const EXTRAS = {
  // Requisitos del sistema (la tarjeta junto al botón de descarga).
  // Si dejas un valor vacío "", esa casilla se oculta.
  requisitos: {
    sistema: "Windows 10 u 11",
    tamano: "89,6 MB",       // ← pon aquí lo que pesa tu instalador, ej: "48 MB"
    espacio: "212,3 MB"       // ← y el espacio que ocupa ya instalado, ej: "120 MB"
  },

  // Fecha de lanzamiento de esta versión (se muestra bajo "Registro de cambios"). Vacío = no se muestra.
  fechaVersion: ""         // ej: "2 de noviembre de 2026"
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* requisitos */
  $$("[data-req]").forEach(el => {
    const v = EXTRAS.requisitos[el.dataset.req];
    if (v) el.textContent = v;
    else el.closest("li").hidden = true;
  });

  /* fecha */
  const f = $("[data-fecha-version]");
  if (f && EXTRAS.fechaVersion) { f.textContent = "Publicada el " + EXTRAS.fechaVersion; f.hidden = false; }

  /* hoja de ruta: cuenta lo terminado y llena la barra al verla */
  const items = $$(".ruta__lista li"), hechos = items.filter(li => li.classList.contains("hecho")).length;
  const cuenta = $("#rutaCuenta"), barra = $("#rutaBarra");
  if (cuenta && items.length) {
    cuenta.textContent = `${hechos} / ${items.length} LISTO`;
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      ob.disconnect();
      barra.style.width = Math.round((hechos / items.length) * 100) + "%";
    }, { threshold: .4 });
    ob.observe(barra);
  }
})();
