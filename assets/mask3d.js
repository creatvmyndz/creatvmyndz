/* ============================================================
   CREATV MASK — PEDIDO (Bold) Y MURO DE DONANTES
   ------------------------------------------------------------
   Página aparte, autónoma (no usa el motor del cielo de app.js). El
   giro en 3D que vivía acá se quitó de pantalla; sus frames siguen en
   assets/mask/mask3d/ (fuera del deploy) por si vuelve. Todo en un
   IIFE, como wakeup.js y lab.js, para no chocar nombres.
   ============================================================ */
(function () {
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
      const showError = msg => {
        let el = document.getElementById("order-error");
        if (!el) {
          el = document.createElement("p");
          el.id = "order-error";
          el.className = "order-error";
          el.setAttribute("role", "alert");
          orderReviewConfirm.insertAdjacentElement("beforebegin", el);
        }
        el.textContent = msg;
      };
      const timeoutSignal = ms => (window.AbortSignal && AbortSignal.timeout) ? AbortSignal.timeout(ms) : undefined;

      orderReviewConfirm.addEventListener("click", () => {
        orderReviewConfirm.disabled = true;
        orderReviewConfirm.textContent = "Procesando…";
        const old = document.getElementById("order-error"); if (old) old.remove();

        const data = new URLSearchParams(new FormData(orderForm));
        fetch(SHEET_URL, { method: "POST", body: data, signal: timeoutSignal(12000) })
          .then(r => r.json())
          .then(order => {
            if (!order || !order.signature) throw new Error("sin firma");
            if (typeof BoldCheckout === "undefined") throw new Error("sin bold");
            // El aviso por correo sale solo cuando ya hay firma: si el pago
            // no se pudo abrir, no llega un pedido fantasma a la bandeja.
            fetch(orderForm.action, { method: "POST", mode: "no-cors", body: new FormData(orderForm) }).catch(() => {});
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
            showError("No pudimos conectar con el pago. Revisa tu conexión e intenta de nuevo en un momento.");
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
    const b = document.createElement("div");
    b.className = "mask-thanks";
    b.setAttribute("role", "status");
    b.textContent = "¡Gracias por tu donación! En un momento te llega la confirmación por correo.";
    document.body.prepend(b);
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
    const donorTimeout = (window.AbortSignal && AbortSignal.timeout) ? AbortSignal.timeout(12000) : undefined;
    fetch(SHEET_URL, { signal: donorTimeout })
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
        // Falló o tardó demasiado: no decimos "sé el primero" (puede que
        // ya haya héroes), solo que no cargó.
        donorNames.innerHTML = "";
        const span = document.createElement("span");
        span.className = "donor-empty";
        span.textContent = "El muro no cargó — intenta de nuevo en un momento";
        donorNames.appendChild(span);
      });
  }
})();
