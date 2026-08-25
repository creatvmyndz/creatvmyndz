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

  /* COMPRAR abre el formulario de envío, en 3 pasos:
     1) la persona elige cantidad de máscaras + cuánto donar (nunca menos
        del mínimo para esa cantidad: $50.000 por máscara);
     2) antes de pagar, ve un resumen de todo lo que escribió y confirma;
     3) recién ahí le pedimos a Sheets (Apps Script) que calcule y firme
        el pedido — el monto que ve Bold queda bloqueado, no se puede
        editar ni manipular desde el navegador — y mandamos el aviso por
        correo (FormSubmit) en paralelo, sin bloquear. */
  const buyBtn = document.getElementById("mask3d-buy");
  const orderModal = document.getElementById("order-modal");
  const orderClose = document.getElementById("order-modal-close");
  const orderForm = document.getElementById("order-form");
  const orderQty = document.getElementById("order-qty");
  const orderAmount = document.getElementById("order-amount");
  const orderEquiv = document.getElementById("order-equiv");
  const orderReview = document.getElementById("order-review");
  const orderReviewList = document.getElementById("order-review-list");
  const orderReviewBack = document.getElementById("order-review-back");
  const orderReviewConfirm = document.getElementById("order-review-confirm");
  const UNIT_PRICE = 50000;
  const SHEET_URL = "https://script.google.com/macros/s/AKfycbwOYJFm4aqF0UjzZLHzPsb29oJioWtpISKgdmXnFmaQ9MndZRMfyEo9MGlkd2qTrcpkHA/exec";
  if (buyBtn && orderModal) {
    const openOrder = () => {
      orderModal.hidden = false;
      document.body.classList.add("modal-open");
      orderForm.hidden = false;
      orderReview.hidden = true;
    };
    const closeOrder = () => { orderModal.hidden = true; document.body.classList.remove("modal-open"); };
    buyBtn.addEventListener("click", openOrder);
    if (orderClose) orderClose.addEventListener("click", closeOrder);
    orderModal.addEventListener("click", e => { if (e.target === orderModal) closeOrder(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !orderModal.hidden) closeOrder();
    });

    if (orderQty && orderAmount && orderEquiv) {
      const minFor = qty => Math.max(1, Math.floor(qty) || 1) * UNIT_PRICE;
      const updateMin = () => {
        const min = minFor(Number(orderQty.value));
        orderAmount.min = String(min);
        if (Number(orderAmount.value) < min) orderAmount.value = String(min);
        updateEquiv();
      };
      const updateEquiv = () => {
        const qty = Math.max(1, Math.floor(Number(orderQty.value)) || 1);
        const min = qty * UNIT_PRICE;
        const amount = Math.max(min, Number(orderAmount.value) || min);
        const extra = amount - min;
        let text = "Mínimo para " + qty + (qty === 1 ? " máscara" : " máscaras") + ": $" + min.toLocaleString("es-CO") + " COP";
        if (extra > 0) text += " (donando $" + amount.toLocaleString("es-CO") + " — $" + extra.toLocaleString("es-CO") + " de más para la causa)";
        orderEquiv.textContent = text;
      };
      orderQty.addEventListener("input", updateMin);
      orderAmount.addEventListener("input", updateEquiv);
      updateMin();
    }

    /* Paso 1 → 2: valida el formulario y muestra el resumen. */
    if (orderForm) {
      orderForm.addEventListener("submit", e => {
        e.preventDefault();
        if (!orderForm.reportValidity()) return;

        const qty = Math.max(1, Math.floor(Number(orderQty.value)) || 1);
        const amount = Math.max(qty * UNIT_PRICE, Number(orderAmount.value) || qty * UNIT_PRICE);
        const rows = [
          ["Nombre", document.getElementById("order-nombre").value],
          ["Teléfono", document.getElementById("order-telefono").value],
          ["Correo", document.getElementById("order-correo").value],
          ["Dirección", document.getElementById("order-direccion").value],
          ["Ciudad", document.getElementById("order-ciudad").value],
          ["Cantidad", qty + (qty === 1 ? " máscara" : " máscaras")],
          ["Total a donar", "$" + amount.toLocaleString("es-CO") + " COP"],
          ["Muro de donantes", document.getElementById("order-muro").checked ? "Sí" : "No"],
        ];
        orderReviewList.innerHTML = rows.map(([k, v]) =>
          "<dt>" + k + "</dt><dd>" + String(v).replace(/</g, "&lt;") + "</dd>"
        ).join("");

        orderForm.hidden = true;
        orderReview.hidden = false;
      });
    }

    if (orderReviewBack) {
      orderReviewBack.addEventListener("click", () => {
        orderReview.hidden = true;
        orderForm.hidden = false;
      });
    }

    /* Paso 2 → 3: confirmado — recién ahí se manda todo y se abre Bold. */
    if (orderReviewConfirm) {
      orderReviewConfirm.addEventListener("click", () => {
        orderReviewConfirm.disabled = true;
        orderReviewConfirm.textContent = "Procesando…";

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
              description: "CREATV MASK Spider Man - Heroes Collection N1",
              redirectionUrl: "https://creatvmyndz.com/creativmask.html?donacion=gracias",
            });
            checkout.open();
          })
          .catch(() => {
            alert("No pudimos conectar con el pago. Intenta de nuevo en un momento.");
          })
          .finally(() => {
            orderReviewConfirm.disabled = false;
            orderReviewConfirm.textContent = "Confirmar y donar →";
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

  /* MURO DE DONANTES: la sección ya está visible desde que carga la
     página (así se puede seguir bajando sin esperar nada) — mientras
     responde la hoja de Sheets se ve "Cargando héroes…", y acá lo
     reemplazamos por los nombres (o, si todavía no hay ninguno, por una
     invitación a ser el primero). La misma petición (GET, no POST) solo
     trae quienes ya están marcados "Pagado" y quisieron aparecer — el
     filtro real lo hace el Apps Script del lado de la hoja. */
  const donorNames = document.getElementById("donor-names");
  const donorCount = document.getElementById("donor-wall-count");
  if (donorNames) {
    fetch(SHEET_URL)
      .then(r => r.json())
      .then(names => {
        donorNames.innerHTML = "";
        if (!Array.isArray(names) || !names.length) {
          const span = document.createElement("span");
          span.className = "donor-empty";
          span.textContent = "Sé el primer héroe en donar";
          donorNames.appendChild(span);
          return;
        }
        names.forEach(name => {
          const span = document.createElement("span");
          span.className = "donor-name";
          span.textContent = name;
          span.style.setProperty("--r", (Math.random() * 6 - 3).toFixed(2) + "deg");
          span.style.setProperty("--s", (0.85 + Math.random() * 0.5).toFixed(2));
          donorNames.appendChild(span);
        });
        if (donorCount) donorCount.textContent = names.length + (names.length === 1 ? " héroe y contando" : " héroes y contando");
      })
      .catch(() => {
        donorNames.innerHTML = "";
        const span = document.createElement("span");
        span.className = "donor-empty";
        span.textContent = "Sé el primer héroe en donar";
        donorNames.appendChild(span);
      });
  }
})();
