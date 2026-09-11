/* ============================================================
   WAKE UP — EL PROGRAMA
   ------------------------------------------------------------
   Página aparte, autónoma (no usa el motor del cielo de app.js).
   El progreso vive en una hoja de Sheets, por correo — así la
   persona lo ve igual desde cualquier dispositivo. Todo en un IIFE,
   como mask3d.js, para no chocar nombres con las otras páginas.
   ============================================================ */
(function () {
  // Por ahora dejamos pasar directo, sin pedir correo ni contraseña —
  // pon esto en true cuando quieras que el portón vuelva a pedirlos.
  const GATE_ENABLED = false;

  const PASSWORD = "creatvmyndz";

  // OJO: esto es solo una traba simple, no seguridad real — cualquiera
  // que mire el código fuente puede ver la contraseña. Sirve para no
  // dejar el programa abierto a cualquiera que llegue al link, nada más.
  const PROGRESS_URL = "PEGA_AQUI_LA_URL_DEL_APPS_SCRIPT_DE_WAKEUP";

  const EMAIL_KEY = "wakeup-email";
  const DONE_KEY = "wakeup-done";

  // Mientras PROGRESS_URL siga en placeholder, el progreso se guarda solo
  // en este navegador (nada de disparar peticiones que van a fallar).
  // Apenas pegues la URL real del Apps Script, la hoja manda.
  const BACKEND_READY = !/PEGA_AQUI/.test(PROGRESS_URL);

  // localStorage puede lanzar (Safari en modo privado, cuota llena):
  // nunca dejamos que eso tumbe la página.
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const localDone = () => { try { const v = JSON.parse(store.get(DONE_KEY) || "[]"); return Array.isArray(v) ? v.map(Number) : []; } catch (e) { return []; } };
  const timeoutSignal = ms => (window.AbortSignal && AbortSignal.timeout) ? AbortSignal.timeout(ms) : undefined;

  const gate = document.getElementById("wakeup-gate");
  const gateForm = document.getElementById("gate-form");
  const gateEmail = document.getElementById("gate-email");
  const gatePassword = document.getElementById("gate-password");
  const gateError = document.getElementById("gate-error");
  const hub = document.getElementById("wakeup-hub");
  const hubSub = document.getElementById("wakeup-hub-sub");
  const pathEl = document.getElementById("wakeup-path");

  const modal = document.getElementById("module-modal");
  const modalClose = document.getElementById("module-modal-close");
  const modalKicker = document.getElementById("module-kicker");
  const modalTitle = document.getElementById("module-title");
  const modalLesson = document.getElementById("module-lesson");
  const modalTask = document.getElementById("module-task");
  const modalDeliverable = document.getElementById("module-deliverable");
  const completeBtn = document.getElementById("module-complete-btn");
  const doneNote = document.getElementById("module-done-note");

  let email = store.get(EMAIL_KEY) || "";
  let completed = [];   // números de módulo ya completados
  let activeNum = null;  // el módulo abierto ahora mismo en el modal

  // Si viene del formulario del index (?correo=...), ya le dejamos el
  // correo puesto — así en el portón solo le falta la contraseña.
  const fromUrl = new URLSearchParams(location.search).get("correo");
  if (fromUrl) gateEmail.value = fromUrl;

  function openHub() {
    gate.hidden = true;
    hub.hidden = false;
    loadProgress();
  }

  gateForm.addEventListener("submit", e => {
    e.preventDefault();
    if (gatePassword.value !== PASSWORD) {
      gateError.hidden = false;
      return;
    }
    gateError.hidden = true;
    email = gateEmail.value.trim().toLowerCase();
    store.set(EMAIL_KEY, email);
    openHub();
  });

  if (!GATE_ENABLED) {
    // Portón apagado: directo al programa, sin pedir nada.
    openHub();
  } else if (email) {
    // Si ya entró antes en este navegador, se salta el portón.
    openHub();
  }

  function loadProgress() {
    if (!BACKEND_READY || !email) {
      completed = localDone();
      hubSub.textContent = "Completa cada módulo para desbloquear el siguiente. Tu progreso se guarda en este navegador.";
      renderPath();
      return;
    }
    hubSub.textContent = "Cargando tu progreso…";
    fetch(PROGRESS_URL + "?correo=" + encodeURIComponent(email), { signal: timeoutSignal(8000) })
      .then(r => r.json())
      .then(nums => {
        completed = Array.isArray(nums) ? nums.map(Number) : [];
        store.set(DONE_KEY, JSON.stringify(completed));
        hubSub.textContent = "Completa cada módulo para desbloquear el siguiente.";
        renderPath();
      })
      .catch(() => {
        // Sin conexión a la hoja (o tardó más de 8 s): seguimos con lo
        // último guardado acá — mejor eso que dejar a la persona sin
        // poder ver el programa.
        completed = localDone();
        hubSub.textContent = "Completa cada módulo para desbloquear el siguiente.";
        renderPath();
      });
  }

  function nextAvailable() {
    const max = completed.length ? Math.max(...completed) : 0;
    return max + 1;
  }

  function renderPath() {
    pathEl.innerHTML = "";
    const unlocked = nextAvailable();

    MODULES.forEach(m => {
      const isDone = completed.indexOf(m.num) !== -1;
      const isCurrent = !isDone && m.num === unlocked;
      const isLocked = !isDone && m.num > unlocked;

      const node = document.createElement("button");
      node.type = "button";
      node.className = "wakeup-node" + (isDone ? " done" : isCurrent ? " current" : " locked");
      node.disabled = isLocked;

      const dot = document.createElement("span");
      dot.className = "wakeup-node-dot";
      dot.textContent = isDone ? "✓" : isLocked ? "🔒" : String(m.num);

      const info = document.createElement("span");
      info.className = "wakeup-node-info";
      const kicker = document.createElement("span");
      kicker.className = "wakeup-node-kicker";
      kicker.textContent = m.kicker;
      const title = document.createElement("span");
      title.className = "wakeup-node-title";
      title.textContent = m.title;
      info.append(kicker, title);

      node.append(dot, info);
      if (!isLocked) node.addEventListener("click", () => openModule(m.num));
      pathEl.appendChild(node);
    });
  }

  function openModule(num) {
    const m = MODULES.find(x => x.num === num);
    if (!m) return;
    activeNum = num;
    modalKicker.textContent = "MÓDULO " + String(num).padStart(2, "0") + " · " + m.kicker;
    modalTitle.textContent = m.title;
    modalLesson.textContent = m.lesson;
    modalTask.textContent = m.task;
    modalDeliverable.textContent = m.deliverable;

    const isDone = completed.indexOf(num) !== -1;
    completeBtn.hidden = isDone;
    doneNote.hidden = !isDone;

    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeModule() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  modalClose.addEventListener("click", closeModule);
  modal.addEventListener("click", e => { if (e.target === modal) closeModule(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.hidden) closeModule();
  });

  completeBtn.addEventListener("click", () => {
    if (!activeNum) return;
    completeBtn.disabled = true;
    completeBtn.textContent = "Guardando…";
    const data = new URLSearchParams({ Correo: email, Modulo: String(activeNum) });
    const save = (BACKEND_READY && email)
      ? fetch(PROGRESS_URL, { method: "POST", mode: "no-cors", body: data, signal: timeoutSignal(8000) }).catch(() => {})
      : Promise.resolve();
    save
      .then(() => {
        if (completed.indexOf(activeNum) === -1) completed.push(activeNum);
        store.set(DONE_KEY, JSON.stringify(completed));
        completeBtn.disabled = false;
        completeBtn.textContent = "Ya completé este módulo →";
        closeModule();
        renderPath();
      });
  });
})();
