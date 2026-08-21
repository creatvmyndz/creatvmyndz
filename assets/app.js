/* ============================================================
   CREATV MYNDZ — LÓGICA DE LA PÁGINA
   ============================================================ */

/* ------------------------------------------------------------
   TRADUCCIONES DE LA INTERFAZ
   ------------------------------------------------------------ */
const I18N = {
  es: {
    menu: "MENÚ",
    m_projects: "CRTV", m_about: "PLAYGROUND", m_wakeup: "WAKE UP",
    crtv_cta: "EXPLORAR GARDEN",
    mask_cta: "VER PROYECTO",
    ab_title: "CREATIVIDAD INFINITA",
    ab_p1: "Creemos en la creatividad como propósito de vida y razón de nuestra existencia. Todos somos creativos, y tenemos ese don.",
    ab_c1t: "CREER", ab_c1d: "Cree en ti, cree en tus ideas.",
    ab_c2t: "CREAR", ab_c2d: "Nunca pares de crear. Materializa esas ideas: son un regalo.",
    ab_c3t: "CRECER", ab_c3d: "Cuando cumples la 1 y la 2, es inevitable.",
    ab_cta: "COMENZAR A CREAR →",
    wu_kicker: "DESPERTAR CREATIVO",
    wu_sub: "La creatividad no es algo que se entrena: se recuerda. Es algo que durmieron dentro de ti, y puedes despertarla. Despierta tu potencial, despierta tu propósito, despierta la forma más pura de crear que hay en ti.",
    wu_f1: "Programa despertar.",
    wu_f2: "Serie de audios e hipnosis para despertar tu CREATV.",
    wu_f3: "Acceso al Discord y a la comunidad CREATV MYNDZ.",
    wu_label: "DÉJANOS TU CORREO Y SÉ DE LOS PRIMEROS EN ENTRAR:",
    wu_btn: "DESPERTAR →",
    footer_line: "CREATIVE DEALERS"
  },
  en: {
    menu: "MENU",
    m_projects: "CRTV", m_about: "PLAYGROUND", m_wakeup: "WAKE UP",
    crtv_cta: "EXPLORE GARDEN",
    mask_cta: "SEE PROJECT",
    ab_title: "INFINITE CREATIVITY",
    ab_p1: "We believe creativity is a life purpose and the reason we exist. We are all creative — that gift is already in you.",
    ab_c1t: "BELIEVE", ab_c1d: "Believe in yourself, believe in your ideas.",
    ab_c2t: "CREATE", ab_c2d: "Never stop creating. Materialize those ideas: they are a gift.",
    ab_c3t: "GROW", ab_c3d: "Once you do the first two, it is inevitable.",
    ab_cta: "START CREATING →",
    wu_kicker: "CREATIVE AWAKENING",
    wu_sub: "Creativity is not something you train: it is something you remember. It was put to sleep inside you, and you can wake it up. Wake up your potential, your purpose, the purest way of creating that lives in you.",
    wu_f1: "Wake-up program.",
    wu_f2: "A series of audios and hypnosis to wake up your CREATV.",
    wu_f3: "Access to the Discord and the CREATV MYNDZ community.",
    wu_label: "LEAVE YOUR EMAIL AND BE AMONG THE FIRST TO GET IN:",
    wu_btn: "WAKE UP →",
    footer_line: "CREATIVE DEALERS"
  }
};

let lang = localStorage.getItem("cm-lang") || "es";
const t = key => (I18N[lang] && I18N[lang][key]) || I18N.es[key] || "";


/* ============================================================
   EL CIELO: el video de fondo avanza y retrocede con el scroll
   ------------------------------------------------------------
   En vez de un <video> (que se traba al rebobinar en celulares),
   usamos la secuencia de imágenes del video dibujada en un canvas.
   Es la misma técnica que usa Apple y va fluida en iPhone/Android.
   ============================================================ */
const SKY_TOTAL = 121;               // frames disponibles por carpeta
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d", { alpha: false });
const scrim = document.getElementById("scrim");
// index.html usa el cielo (assets/sky); playground.html marca en el HTML
// data-frames="assets/floor" para usar el pasto en su lugar — mismo motor.
const FRAMES_DIR = canvas.dataset.frames || "assets/sky";

const conn = navigator.connection || {};
const saveData = !!conn.saveData;
const lowMemory = (navigator.deviceMemory || 8) <= 4;

// En conexiones lentas o equipos modestos usamos menos frames.
const stride = saveData ? 4 : (lowMemory ? 2 : 1);

let skySet = null;      // "d" (horizontal) o "m" (vertical)
let frames = [];        // { img, ready }
let frameIds = [];      // números de archivo correspondientes
let targetIndex = 0;
let drawnIndex = -1;
let needsDraw = true;

function pickSet() {
  return window.innerWidth >= window.innerHeight ? "d" : "m";
}

function initSky(set) {
  if (set === skySet) return;
  skySet = set;

  frameIds = [];
  for (let i = 1; i <= SKY_TOTAL; i += stride) frameIds.push(i);
  if (frameIds[frameIds.length - 1] !== SKY_TOTAL) frameIds.push(SKY_TOTAL);

  frames = frameIds.map(() => ({ img: null, ready: false }));
  drawnIndex = -1;
  needsDraw = true;

  // El primer frame primero, para pintar algo de inmediato.
  loadFrame(0, () => queue());
}

function src(i) {
  return FRAMES_DIR + "/" + skySet + "/" + String(frameIds[i]).padStart(4, "0") + ".webp";
}

function loadFrame(i, done) {
  const slot = frames[i];
  if (!slot || slot.img) { if (done) done(); return; }
  const img = new Image();
  slot.img = img;
  img.decoding = "async";
  img.onload = () => { slot.ready = true; needsDraw = true; schedule(); if (done) done(); };
  img.onerror = () => { if (done) done(); };
  img.src = src(i);
}

/* Carga el resto de frames con un máximo de descargas simultáneas,
   priorizando siempre los cercanos a donde está mirando el usuario. */
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
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  needsDraw = true;
  drawnIndex = -1;
}

let skyZoom = 1;   // el cielo se va acercando a medida que bajas

function paint(i) {
  const img = frames[i] && frames[i].img;
  if (!img || !img.naturalWidth) return;
  const cw = canvas.width, ch = canvas.height;
  const ir = img.naturalWidth / img.naturalHeight;
  let dw, dh;
  if (ir > cw / ch) { dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
  dw *= skyZoom; dh *= skyZoom;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

/* Solo dibujamos cuando hace falta (al hacer scroll o cuando llega un
   frame nuevo), no en un bucle permanente: así no gasta batería. */
let rafPending = false;
function schedule() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(step);
}

function step() {
  rafPending = false;
  const p = scrollProgress();
  const idx = Math.round(p * (frames.length - 1));

  if (idx !== targetIndex) {
    targetIndex = idx;
    needsDraw = true;
    queue();                       // prioriza los frames de esta zona
  }

  const zoom = 1 + 0.14 * p;
  if (Math.abs(zoom - skyZoom) > 0.0015) { skyZoom = zoom; needsDraw = true; drawnIndex = -1; }

  flyingEl.textContent = "FLYING " + Math.round(p * 100) + "%";
  document.body.classList.toggle("scrolled", window.scrollY > 40);
  depthUpdate();
  // El velo tapa más en el día (cielo claro) y menos en la noche.
  scrim.style.opacity = (1 - 0.6 * p).toFixed(3);

  if (needsDraw) {
    const use = nearestReady(targetIndex);
    if (use !== -1 && use !== drawnIndex) { paint(use); drawnIndex = use; }
    if (use === targetIndex) needsDraw = false;
  }
}


/* ============================================================
   PROFUNDIDAD: cada bloque llega desde el fondo, se enfoca y
   sale hacia el frente, como si volaras a través de él.
   ------------------------------------------------------------
   `p` es dónde está el bloque respecto al centro de la pantalla,
   medido en pantallas:  +1 = una pantalla más abajo (lejos, atrás)
                          0 = justo en el centro (enfocado)
                         -1 = una pantalla más arriba (ya te pasó)
   ============================================================ */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Cada bloque nace lejos: pequeño y borroso. Al acercarse crece y se
   aclara hasta quedar nítido y legible. Luego sigue de largo hacia ti
   mientras el siguiente ya viene llegando desde el fondo. */
const DEPTH = {
  scene: { scaleIn: 0.25, scaleOut: 1.15, blur: 14 },
  item:  { scaleIn: 0.82, scaleOut: 1.12, blur: 6 },
  row:   { scaleIn: 0.90, scaleOut: 1.05, blur: 8 }   // cada burbuja de la lista: sube más de lo que crece
};

/* El tamaño tarda todo el acercamiento en crecer, pero el enfoque (nitidez
   y opacidad) llega antes: a la mitad del camino ya se lee claro, y de ahí
   en adelante solo sigue creciendo — nunca se ve grande Y borroso a la vez. */
const FOCO = 0.5;

/* El desenfoque es lo más caro de dibujar. En el celular lo bajamos a la
   mitad: la sensación de profundidad la sostienen el tamaño y la opacidad. */
const BLUR_SCALE = window.matchMedia("(max-width: 680px)").matches ? 0.5 : 1;

let depthEls = [];

function collectDepth() {
  depthEls = [...document.querySelectorAll(".depth, .depth-item")].map(el => {
    const pin = el.closest(".pin");
    const scene = pin ? pin.closest(".scene") : null;
    return {
      el,
      scene,                                   // si está anclado, manda la sección
      noEnter: scene ? scene.dataset.enter === "no" : false,
      noExit:  scene ? scene.dataset.exit  === "no" : false,   // la última no se va
      // "close": se ve definida aunque venga chiquita de lejos — el
      // desenfoque solo aparece cuando ya casi te pasa por al lado.
      blurClose: scene ? scene.dataset.blur === "close" : false,
      isRow: el.classList.contains("project-row"),
      cfg: el.classList.contains("project-row") ? DEPTH.row
         : el.classList.contains("depth-item") ? DEPTH.item
         : DEPTH.scene,
      pT: "", pO: "", pF: "", pP: ""
    };
  });
}

/* Mientras la sección está anclada (pegada arriba con position:sticky), se
   ve llegar (primer tramo), se queda quieta y nítida, y luego se va hacia
   ti (último tramo) — todo SIN moverse de sitio, solo creciendo y
   disolviéndose. Solo cuando ya es invisible se despega y el scroll
   normal se la lleva, así nunca se ve "subir" con la página. */
const LLEGADA = 0.44;   // parte del tramo anclado que dura el acercamiento
const SALIDA  = 0.44;   // parte del tramo anclado que dura la despedida

function depthUpdate() {
  if (reduceMotion || !depthEls.length) return;

  const vh = window.innerHeight;
  const y = window.scrollY;

  for (const d of depthEls) {
    const c = d.cfg;
    let e, x;   // e: cuánto se ha acercado (0..1) · x: cuánto se ha ido (0..1)

    if (d.scene) {
      const top = d.scene.getBoundingClientRect().top + y;
      const anclado = Math.max(1, d.scene.offsetHeight - vh);
      e = d.noEnter ? 1 : clamp01((y - top) / (anclado * LLEGADA));
      x = d.noExit ? 0 : clamp01((y - top - anclado * (1 - SALIDA)) / (anclado * SALIDA));
    } else {
      // Las filas de los CRTV viajan con la página.
      const r = d.el.getBoundingClientRect();
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      e = clamp01((0.80 - p) / 0.60);
      x = clamp01((-0.18 - p) / 0.55);
    }

    const scale = e < 1
      ? c.scaleIn + (1 - c.scaleIn) * e
      : 1 + (c.scaleOut - 1) * x;

    let opacity, blur;
    if (d.blurClose) {
      // e=0 significa que la sección todavía NO quedó anclada (.pin
      // sigue subiendo con el scroll normal, como cualquier otro
      // contenido). Si se viera ahí, parecería que "sube desde abajo".
      // Por eso arranca invisible y aparece de golpe (ya nítida y
      // chiquita) apenas queda anclada — nunca antes.
      const pop = Math.min(1, e / 0.08);
      opacity = e < 1 ? pop : Math.pow(1 - x, 1.6);
      blur = c.blur * BLUR_SCALE * x;
    } else {
      const focus = Math.min(1, e / FOCO);
      opacity = (focus * focus) * Math.pow(1 - x, 1.6);
      blur = c.blur * BLUR_SCALE * Math.max(1 - focus, x);
    }

    // Las burbujas de la lista además suben: llegan desde abajo y, ya
    // enfocadas, siguen subiendo despacio hasta desvanecerse arriba.
    const rise = d.isRow ? ((1 - Math.min(e, 1)) * 46 - x * 26) : 0;

    // Redondeamos: así el navegador no vuelve a dibujar por cambios que
    // el ojo no alcanza a ver. Es lo que mantiene el scroll fluido.
    const t = (rise ? "translateY(" + rise.toFixed(1) + "px) " : "") + "scale(" + scale.toFixed(3) + ")";
    const o = opacity.toFixed(2);
    const f = blur > 0.35 ? "blur(" + (Math.round(blur * 2) / 2) + "px)" : "";

    if (t !== d.pT) { d.el.style.transform = t; d.pT = t; }
    if (o !== d.pO) { d.el.style.opacity = o; d.pO = o; }
    if (f !== d.pF) { d.el.style.filter = f; d.pF = f; }
    if (d.scene) {
      const pe = opacity < 0.1 ? "none" : "auto";
      if (pe !== d.pP) { d.el.style.pointerEvents = pe; d.pP = pe; }
    }
  }
}

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }


/* ------------------------------------------------------------
   IDIOMA
   ------------------------------------------------------------ */
function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang][key]) el.textContent = I18N[lang][key];
  });
  document.getElementById("lang-es").classList.toggle("active", lang === "es");
  document.getElementById("lang-en").classList.toggle("active", lang === "en");

  if (listEl) {
    renderProjectList();
    layoutMasonry();
    collectDepth();
    depthUpdate();
  }
}

document.getElementById("lang-es").addEventListener("click", () => setLang("es"));
document.getElementById("lang-en").addEventListener("click", () => setLang("en"));
function setLang(l) { lang = l; localStorage.setItem("cm-lang", l); applyLang(); }


/* ------------------------------------------------------------
   MENÚ
   ------------------------------------------------------------ */
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menu-btn");

function openMenu() {
  menu.hidden = false;
  menuBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
  lockScroll(true);
}
function closeMenu() {
  menu.hidden = true;
  menuBtn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  lockScroll(false);
}

menuBtn.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));
document.getElementById("menu-close").addEventListener("click", closeMenu);
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!menu.hidden) closeMenu();
});

/* Bloquea el scroll de fondo sin perder la posición (importante en iOS). */
let scrollLockY = 0;
function lockScroll(on) {
  if (on) {
    scrollLockY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = -scrollLockY + "px";
    document.body.style.width = "100%";
  } else {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollLockY);
  }
}


/* ------------------------------------------------------------
   RELOJES / FLYING / DATOS DE CONTACTO
   ------------------------------------------------------------ */
const flyingEl = document.getElementById("flying");

function updateClocks() {
  const fmt = tz => new Intl.DateTimeFormat("es-CO", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz
  }).format(new Date()).toLowerCase().replace(/\s/g, "");

  // En pantallas angostas los nombres completos empujan el menú fuera de la
  // pantalla, así que ahí van abreviados.
  const corto = window.innerWidth < 700;
  const c = corto ? ["BOG", "MIA", "MAD"] : ["BOGOTÁ", "MIAMI", "MADRID"];

  document.getElementById("clocks").textContent =
    `${c[0]} ${fmt("America/Bogota")} · ${c[1]} ${fmt("America/New_York")} · ${c[2]} ${fmt("Europe/Madrid")}`;
}

/* No todas las páginas tienen pie de página con contacto (playground.html
   no lo tiene), así que cada pieza se llena solo si existe. */
function fillContact() {
  const mail = document.getElementById("contact-mail");
  if (mail) {
    mail.href = "mailto:" + SITE.contactEmail;
    mail.textContent = SITE.contactEmail;
  }

  const ul = document.getElementById("contact-social");
  if (ul) {
    ul.innerHTML = "";
    SITE.social.filter(s => s.url).forEach(s => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = s.label;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  const form = document.getElementById("lead-form");
  if (form) form.action = "https://formsubmit.co/" + SITE.leadEmail;
}


/* ------------------------------------------------------------
   LISTA COMPLETA DE CRTV (solo en playground.html)
   ------------------------------------------------------------
   Casillas de a dos columnas — se recorre con el scroll normal, no una
   pantalla completa por CRTV (con 14 te perdías entre tantas). Cada
   una es su burbuja, y sube (además de crecer y enfocarse) al pasar
   por el centro — ver el tramo "isRow" en depthUpdate().
   ------------------------------------------------------------ */
const listEl = document.getElementById("project-list");

function renderProjectList() {
  listEl.innerHTML = "";
  PROJECTS.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "project-row depth-item " + p.status;

    const num = document.createElement("span");
    num.className = "p-num";
    num.textContent = code(p.num);

    const bubble = document.createElement("div");
    bubble.className = "project-bubble";

    const a = document.createElement("a");
    a.className = "project-inner";
    a.href = p.link || ("#" + p.id);

    const title = document.createElement("span");
    title.className = "p-title";
    title.textContent = p.title;

    a.appendChild(title);
    bubble.appendChild(a);
    li.append(num, bubble);
    listEl.appendChild(li);
  });
}

/* Un grid normal estira cada fila a la altura de la burbuja más alta
   de las dos — con títulos de largos tan distintos, eso dejaba mucho
   espacio vacío adentro de las burbujas cortas. Acomodamos las columnas
   a mano: cada CRTV entra en la que en ese momento está más corta, en
   el mismo orden de la lista, y así quedan bien empacadas.
   left/top en vez de transform: el motor de profundidad (depthUpdate)
   ya usa transform para el efecto de burbuja subiendo. */
function layoutMasonry() {
  if (!listEl) return;
  const items = [...listEl.children];
  if (!items.length) { listEl.style.height = ""; return; }
  // Si el contenedor todavía no tiene ancho real (p. ej. la primera
  // pasada, antes de que el layout termine), esperamos al siguiente
  // frame en vez de dejar las burbujas del ancho de una migaja.
  if (listEl.clientWidth < 100) { requestAnimationFrame(layoutMasonry); return; }

  const colGap = Math.min(22.4, Math.max(11.2, window.innerWidth * 0.03));
  const rowGap = Math.min(25.6, Math.max(12.8, window.innerWidth * 0.035));
  const colWidth = (listEl.clientWidth - colGap) / 2;
  const colHeights = [0, 0];

  items.forEach(item => {
    item.style.position = "absolute";
    item.style.width = colWidth + "px";
    const col = colHeights[0] <= colHeights[1] ? 0 : 1;
    item.style.left = col === 0 ? "0px" : (colWidth + colGap) + "px";
    item.style.top = colHeights[col] + "px";
    colHeights[col] += item.getBoundingClientRect().height + rowGap;
  });

  listEl.style.height = (Math.max(...colHeights) - rowGap) + "px";
}

const PREFIX = "CRTV";
const code = n => (n === null || n === undefined)
  ? PREFIX
  : PREFIX + " " + String(n).padStart(2, "0");


/* ------------------------------------------------------------
   RECORDAR POR DÓNDE IBA
   ------------------------------------------------------------
   Al salir hacia creativmask.html o playground.html desde una sección
   del index, guardamos cuál sigue. Así, al volver con "↑ CREATV MYNDZ",
   el index arranca ya en esa siguiente sección en vez de dejar que la
   persona vuelva a hacer scroll por lo que ya vio.
   ------------------------------------------------------------ */
const RESUME_KEY = "cm-resume";
const NEXT_SECTION = { manifiesto: "crtv", crtv: "nosotros" };

/* ------------------------------------------------------------
   CREATV MASK: al hacer clic, el logo se agiganta y se encoge antes
   de navegar — para cuando ya está chiquito, entra la pantalla roja.
   ------------------------------------------------------------ */
const maskLink = document.querySelector(".mask-link");
if (maskLink) {
  maskLink.addEventListener("click", e => {
    // Clic derecho, con modificadores, o el sistema pidiendo menos
    // movimiento: se navega normal, sin la animación.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || reduceMotion) return;
    e.preventDefault();
    sessionStorage.setItem(RESUME_KEY, NEXT_SECTION.manifiesto);
    maskLink.classList.add("zooming");
    setTimeout(() => { window.location.href = maskLink.href; }, 500);
  });

  // Si vuelves con "atrás" del navegador, a veces restaura la página tal
  // como quedó (con la animación ya terminada y el logo chiquito) en vez
  // de recargarla de cero. Se lo quitamos para que vuelva a su tamaño.
  window.addEventListener("pageshow", e => {
    if (e.persisted) maskLink.classList.remove("zooming");
  });
}

const crtvLink = document.querySelector(".crtv .project-inner");
if (crtvLink) {
  crtvLink.addEventListener("click", () => {
    sessionStorage.setItem(RESUME_KEY, NEXT_SECTION.crtv);
  });
}


/* ------------------------------------------------------------
   ARRANQUE
   ------------------------------------------------------------ */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

applyLang();
fillContact();
updateClocks();
setInterval(updateClocks, 30000);

sizeCanvas();
initSky(pickSet());
// applyLang() ya renderizó la lista (si existe) y llamó a collectDepth();
// esto cubre lo que falta: hero/manifiesto/about/wakeup en la portada.
collectDepth();
schedule();

window.addEventListener("scroll", schedule, { passive: true });
document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });

/* Aviso de "hay que hacer scroll" en la portada — se apaga solo apenas
   la persona hace el primer scroll. */
const scrollHint = document.getElementById("scroll-hint");
if (scrollHint) {
  const hideScrollHint = () => {
    if (window.scrollY > 40) {
      scrollHint.classList.add("hidden");
      window.removeEventListener("scroll", hideScrollHint);
    }
  };
  window.addEventListener("scroll", hideScrollHint, { passive: true });
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    sizeCanvas();
    initSky(pickSet());   // cambia horizontal/vertical si giras el teléfono
    updateClocks();       // nombres largos o cortos según el ancho
    if (listEl) layoutMasonry();   // el ancho de columna cambió
    schedule();
  }, 180);
});

/* Si llegan con un enlace directo (#wakeup, #nosotros, #crtv), o
   vuelven de creativmask.html/playground.html (ver RESUME_KEY más
   arriba), los llevamos hasta esa sección. El navegador solo no
   siempre acierta porque el cielo y los logos cambian la altura
   mientras cargan. */
(function openFromHash() {
  const resumeId = sessionStorage.getItem(RESUME_KEY);
  if (resumeId) sessionStorage.removeItem(RESUME_KEY);

  const id = resumeId || decodeURIComponent(location.hash.slice(1));
  if (!id) return;

  const section = document.getElementById(id);
  if (!section) return;
  // "instant" evita heredar el scroll suave del CSS: aterrizas de una.
  const jump = () => {
    section.scrollIntoView({ behavior: "instant", block: "start" });
    schedule();
  };
  // Un solo intento no basta: mientras algo todavía no terminó de
  // acomodarse (una fuente que entra tarde, una imagen que reserva su
  // espacio), la posición calculada queda corta o se pasa. Insistimos
  // cada poco hasta que la sección realmente quede arriba del todo (o
  // hasta un segundo, para no insistir para siempre). setTimeout en vez
  // de requestAnimationFrame: sigue corriendo aunque la pestaña no esté
  // pintando activamente en este momento.
  let tries = 0;
  const settle = () => {
    jump();
    if (++tries < 20 && Math.abs(section.getBoundingClientRect().top) > 2) {
      setTimeout(settle, 50);
    }
  };
  settle();
  window.addEventListener("load", jump, { once: true });
})();
