/* ============================================================
   DROP #10 — LA MÁSCARA GIRA EN 3D
   ------------------------------------------------------------
   Misma técnica que el cielo/el prado (assets/app.js): la vuelta de
   la máscara es una secuencia de 121 fotos dibujadas en un canvas,
   no un video. Acá el frame lo decide el scroll DENTRO de esta
   sección (mientras está anclada), o el cliente arrastrando la
   barra de abajo. Todo en un IIFE para no chocar con los nombres
   (schedule, step, paint...) que ya usa app.js en otras páginas.
   ============================================================ */
(function () {
  const section = document.getElementById("mask3d");
  const canvas = document.getElementById("mask3d-canvas");
  if (!section || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const scrub = document.getElementById("mask3d-scrub");
  const row = section.querySelector(".mask3d-row");

  const TOTAL = 121;
  const frames = Array.from({ length: TOTAL }, () => ({ img: null, ready: false }));

  function src(i) {
    return "assets/mask3d/" + String(i + 1).padStart(4, "0") + ".webp";
  }

  let targetIndex = 0;
  let drawnIndex = -1;
  let userScrubbing = false;
  let releaseTimer = null;

  function loadFrame(i, done) {
    const slot = frames[i];
    if (!slot || slot.img) { if (done) done(); return; }
    const img = new Image();
    slot.img = img;
    img.decoding = "async";
    img.onload = () => { slot.ready = true; schedule(); if (done) done(); };
    img.onerror = () => { if (done) done(); };
    img.src = src(i);
  }

  /* Igual que el cielo: carga unas cuantas a la vez, priorizando las
     más cercanas a donde estás mirando ahora mismo. */
  let inFlight = 0;
  const MAX_PARALLEL = 6;
  function queue() {
    while (inFlight < MAX_PARALLEL) {
      const next = nextPending();
      if (next === -1) return;
      inFlight++;
      loadFrame(next, () => { inFlight--; queue(); });
    }
  }
  function nextPending() {
    for (let d = 0; d < frames.length; d++) {
      const a = targetIndex + d, b = targetIndex - d;
      if (a < frames.length && !frames[a].img) return a;
      if (b >= 0 && !frames[b].img) return b;
    }
    return -1;
  }
  function nearestReady(i) {
    if (frames[i] && frames[i].ready) return i;
    for (let d = 1; d < frames.length; d++) {
      if (frames[i - d] && frames[i - d].ready) return i - d;
      if (frames[i + d] && frames[i + d].ready) return i + d;
    }
    return -1;
  }

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    drawnIndex = -1;
  }

  function paint(i) {
    const img = frames[i] && frames[i].img;
    if (!img || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    const ir = img.naturalWidth / img.naturalHeight;
    let dw, dh;
    if (ir > cw / ch) { dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let rafPending = false;
  function schedule() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(step);
  }

  function step() {
    rafPending = false;
    const vh = window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const anclado = Math.max(1, section.offsetHeight - vh);
    const p = Math.min(1, Math.max(0, (window.scrollY - top) / anclado));

    // La fila se ve solo mientras la sección está anclada (o si el
    // sistema pide menos movimiento, siempre visible sin animar).
    if (row) row.classList.toggle("visible", reduceMotion || p < 0.98 || section.getBoundingClientRect().top < vh * 0.5);

    if (!userScrubbing) {
      const idx = Math.round(p * (TOTAL - 1));
      if (idx !== targetIndex) {
        targetIndex = idx;
        if (scrub) scrub.value = String(idx);
        queue();
      }
    }

    const use = nearestReady(targetIndex);
    if (use !== -1 && use !== drawnIndex) { paint(use); drawnIndex = use; }
  }

  if (scrub) {
    scrub.addEventListener("input", () => {
      userScrubbing = true;
      clearTimeout(releaseTimer);
      targetIndex = Number(scrub.value);
      queue();
      schedule();
    });
    // Un rato después de soltar la barra, el scroll vuelve a mandar.
    const release = () => { releaseTimer = setTimeout(() => { userScrubbing = false; }, 1200); };
    scrub.addEventListener("change", release);
    scrub.addEventListener("pointerup", release);
  }

  sizeCanvas();
  loadFrame(0, () => { queue(); schedule(); });

  window.addEventListener("scroll", schedule, { passive: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { sizeCanvas(); schedule(); }, 180);
  });
})();
