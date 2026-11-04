/* =====================================================================
   vsMOON · gafete colgado (física de cuerda)
   - Arrástralo: la cuerda se estira como elástico y NUNCA se rompe.
   - Suéltalo: vuelve a su sitio balanceándose y da la vuelta a la otra cara.
   - Un clic (sin arrastrar) también lo gira.
   Cara 1: Mr. Pixel · Cara 2: tu avatar.
   ===================================================================== */
(() => {
  const raiz = document.getElementById("gafete");
  if (!raiz) return;

  const lienzo = document.getElementById("gafeteCuerda");
  const tarjeta = document.getElementById("gafeteTarjeta");
  const giro = document.getElementById("gafeteGiro");
  const pista = document.getElementById("gafetePista");
  const ctx = lienzo.getContext("2d");

  /* ---------- ajustes (tócalos si quieres otra sensación) ---------- */
  const PUNTOS = 9;            // nodos de la cuerda
  const GRAVEDAD = 0.5;        // caída de la cuerda
  const PESO_TARJETA = 1.5;    // el gafete pesa más que la cuerda
  const ROZAMIENTO = 0.984;    // 1 = nunca se frena
  const RIGIDEZ_REPOSO = 0.5;  // cuerda "firme" al colgar
  const RIGIDEZ_ARRASTRE = 0.1;// cuerda "elástica" mientras la estiras
  const ESTIRA_MAX = 2.7;      // hasta cuántas veces su largo se puede estirar (nunca se rompe)
  const MEDIA_ANCHO = 75;      // mitad del ancho de la tarjeta en CSS (150px)
  const COLOR_CUERDA = "#8d9dca";
  const COLOR_BORDE = "#0f1012";

  const mini = matchMedia("(max-width: 899px)");
  const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");

  let W = 0, H = 0, dpr = 1, esc = 1, anclaX = 0, largo = 190, seg = 0;
  let pts = [];
  let ang = 0, angV = 0, k = RIGIDEZ_REPOSO;
  let arr = null;              // estado del arrastre
  let vueltas = 0;
  let corriendo = false, quieto = 0, ultimo = 0, acumulado = 0;

  /* ---------- medidas ---------- */
  function medir() {
    W = document.documentElement.clientWidth;
    H = innerHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    lienzo.width = Math.round(W * dpr);
    lienzo.height = Math.round(H * dpr);
    lienzo.style.width = W + "px";
    lienzo.style.height = H + "px";
    esc = mini.matches ? 0.56 : Math.max(0.68, Math.min(1, H / 820));
    anclaX = W - 22 - MEDIA_ANCHO * esc;
    largo = 190 * esc;
    seg = largo / (PUNTOS - 1);
  }

  function colgar(desdeArriba) {
    pts = [];
    for (let i = 0; i < PUNTOS; i++) {
      const y = desdeArriba ? -12 : i * seg;
      const x = anclaX + (desdeArriba ? i * 0.6 : 0);
      pts.push({ x, y, px: x - (desdeArriba ? 0.8 : 0), py: y });
    }
    ang = angV = 0;
  }

  /* ---------- física (Verlet con restricciones blandas) ---------- */
  function paso() {
    const ultimoPt = PUNTOS - 1;
    k += ((arr ? RIGIDEZ_ARRASTRE : RIGIDEZ_REPOSO) - k) * (arr ? 0.12 : 0.05);   // al soltar, la cuerda recupera su firmeza poco a poco

    for (let i = 1; i < PUNTOS; i++) {
      const p = pts[i];
      let vx = (p.x - p.px) * ROZAMIENTO;
      let vy = (p.y - p.py) * ROZAMIENTO;
      const v = Math.hypot(vx, vy);
      if (v > 30) { vx *= 30 / v; vy *= 30 / v; }
      p.px = p.x; p.py = p.y;
      p.x += vx;
      p.y += vy + (i === ultimoPt ? GRAVEDAD * PESO_TARJETA : GRAVEDAD) * esc;
    }

    if (!arr) {                         // sin dedo: la tarjeta rebota suave en los bordes de la pantalla
      const p = pts[ultimoPt], mx = MEDIA_ANCHO * esc + 6;
      if (p.x < mx) { p.x = mx; p.px = p.x + (p.x - p.px) * 0.4 + (mx - p.px) * 0; }
      if (p.x > W - mx) { p.x = W - mx; p.px = p.x + (p.x - p.px) * 0.4; }
      if (p.y < 14) { p.y = 14; p.py = p.y + (p.y - p.py) * 0.4; }
      if (p.y > H - 230 * esc) { p.y = H - 230 * esc; p.py = p.y + (p.y - p.py) * 0.4; }
    }
    if (arr) {                          // el dedo/ratón sujeta la tarjeta
      const p = pts[ultimoPt];
      p.x = arr.x; p.y = arr.y;
    }

    for (let it = 0; it < 4; it++) {
      for (let i = 0; i < PUNTOS - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const f = ((d - seg) / d) * k;
        const ma = i === 0 ? 0 : 1;                                         // ancla fija
        const mb = (i + 1 === ultimoPt) ? (arr ? 0 : 1 / PESO_TARJETA) : 1;  // la tarjeta pesa más
        const tot = ma + mb;
        if (!tot) continue;
        a.x += dx * f * (ma / tot); a.y += dy * f * (ma / tot);
        b.x -= dx * f * (mb / tot); b.y -= dy * f * (mb / tot);
      }
      pts[0].x = anclaX; pts[0].y = 0;
    }

    // la tarjeta cuelga siguiendo la dirección del último tramo (con un poco de retraso: se siente pesada)
    const a = pts[ultimoPt - 1], b = pts[ultimoPt];
    const objetivo = Math.atan2(b.x - a.x, b.y - a.y) * -1;
    let dif = objetivo - ang;
    dif = Math.atan2(Math.sin(dif), Math.cos(dif));
    angV += dif * 0.1;
    angV *= 0.86;
    ang += angV;
  }

  function energia() {
    let e = Math.abs(angV) * 40;
    for (let i = 1; i < PUNTOS; i++) e += Math.abs(pts[i].x - pts[i].px) + Math.abs(pts[i].y - pts[i].py);
    return e;
  }

  /* ---------- dibujo ---------- */
  function dibujar() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    let total = 0;
    for (let i = 0; i < PUNTOS - 1; i++) total += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    const estiro = Math.max(0, Math.min(1.5, total / largo - 1));
    const ancho = 13 * esc * (1 - 0.32 * Math.min(1, estiro));   // se adelgaza al estirarse, como un elástico

    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < PUNTOS - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[PUNTOS - 1].x, pts[PUNTOS - 1].y);

    ctx.strokeStyle = COLOR_BORDE;
    ctx.lineWidth = ancho + 4;
    ctx.stroke();
    ctx.strokeStyle = COLOR_CUERDA;
    ctx.lineWidth = ancho;
    ctx.stroke();
    ctx.strokeStyle = "rgba(21,22,26,.4)";      // costura
    ctx.lineWidth = Math.max(1, 1.5 * esc);
    ctx.setLineDash([7 * esc, 6 * esc]);
    ctx.stroke();
    ctx.setLineDash([]);

    const p = pts[PUNTOS - 1];
    tarjeta.style.transform =
      `translate3d(${(p.x - MEDIA_ANCHO).toFixed(2)}px, ${p.y.toFixed(2)}px, 0) rotate(${ang.toFixed(4)}rad) scale(${esc})`;
  }

  /* ---------- bucle (se duerme cuando todo está quieto) ---------- */
  function bucle(t) {
    if (!corriendo) return;
    if (!ultimo) ultimo = t;
    acumulado += Math.min(64, t - ultimo);
    ultimo = t;
    while (acumulado >= 16.667) { paso(); acumulado -= 16.667; }
    dibujar();

    if (!arr && energia() < 0.15) quieto++; else quieto = 0;
    if (quieto > 40) { corriendo = false; return; }
    requestAnimationFrame(bucle);
  }
  function despertar() {
    if (corriendo || document.hidden) return;
    corriendo = true; quieto = 0; ultimo = 0; acumulado = 0;
    requestAnimationFrame(bucle);
  }

  /* ---------- girar ---------- */
  function girar(impulso = 0) {
    vueltas++;
    giro.style.transform = `rotateY(${vueltas * 180}deg)`;
    angV += impulso;
    despertar();
  }

  /* ---------- arrastrar ---------- */
  function limitar(x, y) {
    // goma elástica: cuanto más tiras, más cuesta; nunca pasa de ESTIRA_MAX veces su largo
    const dx = x - anclaX, dy = y;
    const d = Math.hypot(dx, dy) || 1;
    if (d <= largo) return { x, y };
    const max = largo * ESTIRA_MAX, m = max - largo;
    const eff = largo + m * (1 - Math.exp(-(d - largo) / m));
    return { x: anclaX + (dx / d) * eff, y: (dy / d) * eff };
  }

  tarjeta.addEventListener("pointerdown", e => {
    if (e.button > 0) return;
    tarjeta.setPointerCapture(e.pointerId);
    const p = pts[PUNTOS - 1];
    arr = { id: e.pointerId, ox: e.clientX - p.x, oy: e.clientY - p.y, x: p.x, y: p.y,
            x0: e.clientX, y0: e.clientY, t0: performance.now(), movio: false, maxEstiro: 0 };
    tarjeta.classList.add("arrastrando");
    raiz.classList.add("usado");
    despertar();
  });

  tarjeta.addEventListener("pointermove", e => {
    if (!arr || e.pointerId !== arr.id) return;
    if (Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) > 5) arr.movio = true;
    const q = limitar(e.clientX - arr.ox, e.clientY - arr.oy);
    arr.x = q.x; arr.y = q.y;
    arr.maxEstiro = Math.max(arr.maxEstiro, Math.hypot(q.x - anclaX, q.y) / largo - 1);
    despertar();
  });

  function soltar(e) {
    if (!arr || (e && e.pointerId !== arr.id)) return;
    const fueClic = !arr.movio && performance.now() - arr.t0 < 450;
    const estiro = arr.maxEstiro;
    arr = null;
    tarjeta.classList.remove("arrastrando");
    if (fueClic) girar(0.25);
    else if (estiro > 0.25) girar(Math.min(0.5, estiro * 0.3));   // al soltar el tirón, da la vuelta
    despertar();
  }
  tarjeta.addEventListener("pointerup", soltar);
  tarjeta.addEventListener("pointercancel", soltar);
  tarjeta.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); raiz.classList.add("usado"); girar(0.3); }
  });

  /* ---------- arranque ---------- */
  function iniciar() {
    medir();
    colgar(!sinMovimiento.matches);        // cae desde arriba al cargar
    dibujar();
    raiz.classList.add("listo");
    despertar();
  }
  addEventListener("resize", () => {
    arr = null;
    medir();
    colgar(false);
    dibujar();
    despertar();
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) despertar(); });

  if (document.readyState === "complete") setTimeout(iniciar, 500);
  else addEventListener("load", () => setTimeout(iniciar, 500));

  // para pruebas
  window.__gafete = { puntos: () => pts, vueltas: () => vueltas, dormido: () => !corriendo, largo: () => largo };
})();
