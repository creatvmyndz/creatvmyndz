/* ============================================================
   DROP #10 — LA MÁSCARA GIRA EN 3D
   ------------------------------------------------------------
   Misma técnica que el cielo/el prado (assets/app.js): la vuelta de
   la máscara es una secuencia de 121 fotos dibujadas en un canvas,
   no un video. Por ahora esta sección está quitada de la pantalla
   (se guardan los assets/frames, solo no se muestra), así que todo
   este bloque queda condicionado a que exista #mask3d en el HTML —
   si no está, simplemente no hace nada, pero el resto del archivo
   (comprar, muro de donantes) sigue funcionando igual. Todo en un
   IIFE para no chocar con los nombres (schedule, step, paint...)
   que ya usa app.js en otras páginas.
   ============================================================ */
(function () {
  const row = document.getElementById("mask3d");
  const canvas = document.getElementById("mask3d-canvas");

  if (row && canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const scrub = document.getElementById("mask3d-scrub");

    const TOTAL = 121;
    const frames = Array.from({ length: TOTAL }, () => ({ img: null, ready: false }));

    const src = i => "assets/mask/mask3d/" + String(i + 1).padStart(4, "0") + ".webp";

    let targetIndex = 0;
    let drawnIndex = -1;

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

    let rafPending = false;
    function schedule() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(step);
    }

    function step() {
      rafPending = false;
      const use = nearestReady(targetIndex);
      if (use !== -1 && use !== drawnIndex) { paint(use); drawnIndex = use; }
    }

    if (scrub) {
      scrub.addEventListener("input", () => {
        targetIndex = Number(scrub.value);
        queue();
        schedule();
      });
    }

    sizeCanvas();
    loadFrame(0, () => { queue(); schedule(); });

    document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });

    /* Tocar la máscara abre la galería de fotos (mismas fotos del giro,
       en varios ángulos fijos). */
    const canvasBtn = document.getElementById("mask3d-canvas-btn");
    const gallery = document.getElementById("mask-gallery");
    const galleryClose = document.getElementById("mask-gallery-close");
    if (canvasBtn && gallery) {
      const openGallery = () => { gallery.hidden = false; document.body.classList.add("modal-open"); };
      const closeGallery = () => { gallery.hidden = true; document.body.classList.remove("modal-open"); };
      canvasBtn.addEventListener("click", openGallery);
      if (galleryClose) galleryClose.addEventListener("click", closeGallery);
      gallery.addEventListener("click", e => { if (e.target === gallery) closeGallery(); });
      document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !gallery.hidden) closeGallery();
      });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { sizeCanvas(); schedule(); }, 180);
    });
  }

  /* COMPRAR abre el formulario de envío. Al enviarlo:
     1) le pedimos a la hoja de Sheets (Apps Script) que calcule el total
        y firme el pedido — así el monto que ve Bold queda bloqueado, no
        se puede editar ni manipular desde el navegador;
     2) en paralelo, sin bloquear, mandamos el aviso por correo (FormSubmit);
     3) con la firma que responde Sheets, abrimos la pasarela de Bold ya
        con el monto exacto puesto, sin pasar por un link estático. */
  const buyBtn = document.getElementById("mask3d-buy");
  const orderModal = document.getElementById("order-modal");
  const orderClose = document.getElementById("order-modal-close");
  const orderForm = document.getElementById("order-form");
  const orderAmount = document.getElementById("order-amount");
  const orderTotal = document.getElementById("order-total-value");
  const orderEquiv = document.getElementById("order-equiv");
  const orderSubmitBtn = orderForm ? orderForm.querySelector(".order-submit") : null;
  const UNIT_PRICE = 50000;
  const SHEET_URL = "https://script.google.com/macros/s/AKfycbwOYJFm4aqF0UjzZLHzPsb29oJioWtpISKgdmXnFmaQ9MndZRMfyEo9MGlkd2qTrcpkHA/exec";
  if (buyBtn && orderModal) {
    const openOrder = () => { orderModal.hidden = false; document.body.classList.add("modal-open"); };
    const closeOrder = () => { orderModal.hidden = true; document.body.classList.remove("modal-open"); };
    buyBtn.addEventListener("click", openOrder);
    if (orderClose) orderClose.addEventListener("click", closeOrder);
    orderModal.addEventListener("click", e => { if (e.target === orderModal) closeOrder(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !orderModal.hidden) closeOrder();
    });
    if (orderAmount && orderTotal) {
      const updateEquiv = () => {
        const amount = Math.max(UNIT_PRICE, Number(orderAmount.value) || UNIT_PRICE);
        const qty = Math.floor(amount / UNIT_PRICE) || 1;
        const extra = amount - qty * UNIT_PRICE;
        orderTotal.textContent = "$" + amount.toLocaleString("es-CO") + " COP";
        if (orderEquiv) {
          let text = "Eso es " + qty + (qty === 1 ? " máscara" : " máscaras");
          if (extra > 0) text += " y $" + extra.toLocaleString("es-CO") + " de más para la causa";
          orderEquiv.textContent = text;
        }
      };
      orderAmount.addEventListener("input", updateEquiv);
      updateEquiv();
    }
    if (orderForm) {
      orderForm.addEventListener("submit", e => {
        e.preventDefault();
        if (orderSubmitBtn) { orderSubmitBtn.disabled = true; orderSubmitBtn.textContent = "Procesando…"; }

        // Aviso por correo — no necesitamos esperar la respuesta.
        fetch(orderForm.action, { method: "POST", mode: "no-cors", body: new FormData(orderForm) }).catch(() => {});

        const data = new URLSearchParams(new FormData(orderForm));
        fetch(SHEET_URL, { method: "POST", body: data })
          .then(r => r.json())
          .then(order => {
            if (!order || !order.signature) throw new Error("sin firma");
            closeOrder();
            const checkout = new BoldCheckout({
              orderId: order.orderId,
              currency: order.currency,
              amount: order.amount,
              apiKey: order.apiKey,
              integritySignature: order.signature,
              description: "CREATV MASK 1 — Hoy Soy: Spiderman",
              redirectionUrl: "https://creatvmyndz.com/creativmask.html?donacion=gracias",
            });
            checkout.open();
          })
          .catch(() => {
            alert("No pudimos conectar con el pago. Intenta de nuevo en un momento.");
          })
          .finally(() => {
            if (orderSubmitBtn) { orderSubmitBtn.disabled = false; orderSubmitBtn.textContent = "Donar y continuar →"; }
          });
      });
    }
  }

  /* Si Bold nos devuelve aquí después de un pago, mostramos un aviso. */
  if (new URLSearchParams(location.search).get("donacion") === "gracias") {
    window.addEventListener("DOMContentLoaded", () => {
      alert("¡Gracias por tu donación! En un momento vas a recibir la confirmación por correo.");
    });
  }

  /* MURO DE DONANTES: la misma hoja de Sheets, pero pidiéndole (GET, no
     POST) solo los nombres de quienes ya están marcados "Pagado" y
     quisieron aparecer — el filtro real lo hace el Apps Script del lado
     de la hoja, acá solo pintamos lo que llegue. Si no llega nada (o
     falla), la sección se queda oculta — nunca se ve un muro vacío. */
  const donorWall = document.getElementById("donor-wall");
  const donorNames = document.getElementById("donor-names");
  const donorCount = document.getElementById("donor-wall-count");
  if (donorWall && donorNames) {
    fetch(SHEET_URL)
      .then(r => r.json())
      .then(names => {
        if (!Array.isArray(names) || !names.length) return;
        names.forEach(name => {
          const span = document.createElement("span");
          span.className = "donor-name";
          span.textContent = name;
          span.style.setProperty("--r", (Math.random() * 6 - 3).toFixed(2) + "deg");
          span.style.setProperty("--s", (0.85 + Math.random() * 0.5).toFixed(2));
          donorNames.appendChild(span);
        });
        if (donorCount) donorCount.textContent = names.length + (names.length === 1 ? " héroe y contando" : " héroes y contando");
        donorWall.hidden = false;
      })
      .catch(() => {});
  }
})();
