/* =====================================================================
   vsMOON · web de descarga
   ► Lo único que normalmente tienes que editar está en CONFIG.
   ===================================================================== */
const CONFIG = {
  version: "1.9.1",
  canal: "beta educativa",

  // Ruta (o URL) del instalador de Windows. Pon el archivo en la carpeta /downloads
  descargaWindows: "downloads/vsMOON-1.9.1-beta.exe",

  // Tus datos (déjalos vacíos "" para ocultar el botón)
  dev: {
    nombre: "Jhos Amador",
    bio: "Soy estudiante con la pasión de mejorar y crecer como desarrollador.",
    github: "https://github.com/css40",
    correo: "pixelgaamess@gmail.com",
    redes: "https://www.tiktok.com/@sr_pix3l",
    ideas: ""          // enlace a formulario / issues para ideas y bugs
  }
};

/* Frases reales de Mr. Pixel que rotan en el globo del inicio */
const FRASES_PIXEL = [
  "¡Hola! Soy Mr. Pixel 👋",
  "¡Compiló sin errores! 🎉",
  "Tranquilo, los errores son parte de aprender. ¡Tú puedes!",
  "¡A concentrarse! Un pomodoro a la vez 💪",
  "Descansa, te lo ganaste. Estira y toma agua ☕",
  "Llevas 4 días seguidos. ¡No rompas la racha! 🔥",
  "Cada error corregido te hace mejor programador.",
  "¡Subiste de nivel! Ya eres Artesano ⭐"
];

/* ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

/* ---------- datos de configuración en la página ---------- */
function aplicarConfig() {
  $$("[data-version]").forEach(e => (e.textContent = CONFIG.version));
  $$("[data-canal]").forEach(e => (e.textContent = CONFIG.canal));
  $$("[data-descarga-windows]").forEach(a => a.setAttribute("href", CONFIG.descargaWindows));
  $("#anio").textContent = new Date().getFullYear();

  const d = CONFIG.dev;
  const nombre = $("[data-dev-nombre]"); if (nombre) nombre.textContent = d.nombre;
  const bio = $("[data-dev-bio]"); if (bio) bio.textContent = d.bio;
  const enlaces = { github: d.github, redes: d.redes, ideas: d.ideas, correo: d.correo ? "mailto:" + d.correo : "" };
  $$("[data-enlace]").forEach(a => {
    const url = enlaces[a.dataset.enlace];
    if (url) a.href = url; else a.hidden = true;
  });
}

/* ---------- espacios de imagen: si falta el archivo, muestra qué crear ---------- */
function vaciarSlot(img) {
  if (img.dataset.vacio) return;
  img.dataset.vacio = "1";
  if (img.hasAttribute("data-opcional")) { img.style.display = "none"; return; }
  const ruta = img.getAttribute("src");
  const caja = document.createElement("div");
  caja.className = "slot__vacio";
  caja.innerHTML = `<b>${ruta}</b><span>${img.dataset.pose || img.alt || ""}</span>`;
  img.replaceWith(caja);
}
function vigilarImagenes() {
  $$("img[data-pose], img[data-opcional]").forEach(img => {
    const alFallar = () => {
      const respaldo = img.dataset.respaldo;
      if (respaldo) {
        delete img.dataset.respaldo;
        img.src = respaldo;
        if (img.complete && img.naturalWidth === 0) vaciarSlot(img);
        return;
      }
      vaciarSlot(img);
    };
    img.addEventListener("error", alFallar);
    if (img.complete && img.naturalWidth === 0) alFallar();
  });
}

/* ---------- menú móvil ---------- */
function menuMovil() {
  const btn = $("#navToggle"), links = $("#navLinks");
  btn.addEventListener("click", () => {
    const abierto = links.classList.toggle("abierto");
    btn.setAttribute("aria-expanded", abierto);
  });
  links.addEventListener("click", e => { if (e.target.tagName === "A") { links.classList.remove("abierto"); btn.setAttribute("aria-expanded", false); } });
}

/* ---------- globo de Mr. Pixel ---------- */
function globoPixel() {
  const globo = $("#globoPixel"), texto = $("#globoTexto");
  let i = 0;
  const siguiente = () => {
    i = (i + 1) % FRASES_PIXEL.length;
    globo.classList.add("cambia");
    setTimeout(() => { texto.textContent = FRASES_PIXEL[i]; globo.classList.remove("cambia"); }, 250);
  };
  setInterval(siguiente, 4200);
  $(".hero__mascota").addEventListener("click", siguiente);
}

/* ---------- racha de demostración ---------- */
function racha() {
  const dias = $$("#rachaDias .dia"), num = $("#rachaNum");
  const pintar = () => (num.textContent = dias.filter(d => d.classList.contains("on")).length);
  dias.forEach(d => d.addEventListener("click", () => { d.classList.toggle("on"); pintar(); }));
  // al verla por primera vez, se enciende sola con un efecto
  const caja = $("#rachaDias");
  const ob = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    ob.disconnect();
    dias.slice(0, 4).forEach((d, k) => setTimeout(() => { d.classList.add("on"); pintar(); }, 350 + k * 260));
  }, { threshold: .6 });
  ob.observe(caja);
}

/* ---------- pasos de instalación ---------- */
function pasos() {
  const items = $$(".paso"), lista = $("#pasosLista"), cont = $("#pasoCont");
  const prev = $("#pasoPrev"), next = $("#pasoNext");
  let actual = 0;

  items.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<button type="button"><span>${p.dataset.titulo}</span></button>`;
    li.firstChild.setAttribute("aria-label", `Paso ${i + 1}: ${p.dataset.titulo}`);
    li.firstChild.addEventListener("click", () => ir(i));
    lista.appendChild(li);
  });

  function ir(n) {
    actual = Math.max(0, Math.min(items.length - 1, n));
    items.forEach((p, i) => p.classList.toggle("activo", i === actual));
    $$("li", lista).forEach((li, i) => {
      li.classList.toggle("activo", i === actual);
      li.classList.toggle("hecho", i < actual);
    });
    cont.textContent = `${actual + 1} / ${items.length}`;
    prev.disabled = actual === 0;
    next.textContent = actual === items.length - 1 ? "¡Listo! ✓" : "Siguiente →";
    prev.style.opacity = actual === 0 ? .4 : 1;
  }
  prev.addEventListener("click", () => ir(actual - 1));
  next.addEventListener("click", () => ir(actual + 1));
  document.addEventListener("keydown", e => {
    if (!$("#pasos").matches(":hover")) return;
    if (e.key === "ArrowRight") ir(actual + 1);
    if (e.key === "ArrowLeft") ir(actual - 1);
  });
  ir(0);
}

/* ---------- aparecer al hacer scroll ---------- */
function reveal() {
  const els = $$(".reveal");
  // retraso escalonado dentro de cada grupo
  els.forEach(el => {
    const hermanos = [...el.parentElement.children].filter(c => c.classList.contains("reveal"));
    el.style.setProperty("--delay", (hermanos.indexOf(el) * 0.08) + "s");
  });
  const ob = new IntersectionObserver(entradas => {
    entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); ob.unobserve(e.target); } });
  }, { threshold: .12 });
  els.forEach(el => ob.observe(el));
}

/* ---------- aviso corto ---------- */
function aviso(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(aviso.id);
  aviso.id = setTimeout(() => t.classList.remove("on"), 2600);
}

/* ---------- arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  aplicarConfig();
  vigilarImagenes();
  menuMovil();
  globoPixel();
  racha();
  pasos();
  reveal();
  $("#btnLinux").addEventListener("click", () => aviso("🐧 Linux: próximamente"));
});
