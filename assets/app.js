/* ============================================================
   CREATV MYNDZ — LÓGICA DE LA PÁGINA
   ============================================================ */

/* ------------------------------------------------------------
   TRADUCCIONES DE LA INTERFAZ
   ------------------------------------------------------------ */
const I18N = {
  es: {
    menu: "MENÚ",
    m_projects: "CRTV", m_about: "CREATIVE DEALERS", m_wakeup: "WAKE UP",
    crtv_cta: "VER TODOS LOS CRTV →",
    tag_done: "HECHO", tag_soon: "PRÓXIMO",
    ab_title: "CREATIVIDAD INFINITA",
    ab_p1: "Creemos en la creatividad como propósito de vida y razón de nuestra existencia. Todos somos creativos, y tenemos ese don.",
    ab_c1t: "CREER", ab_c1d: "Cree en ti, cree en tus ideas.",
    ab_c2t: "CREAR", ab_c2d: "Nunca pares de crear. Materializa esas ideas: son un regalo.",
    ab_c3t: "CRECER", ab_c3d: "Cuando cumples la 1 y la 2, es inevitable.",
    wu_kicker: "PROGRAMA",
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
    m_projects: "CRTV", m_about: "CREATIVE DEALERS", m_wakeup: "WAKE UP",
    crtv_cta: "SEE ALL CRTV →",
    tag_done: "DONE", tag_soon: "UPCOMING",
    ab_title: "INFINITE CREATIVITY",
    ab_p1: "We believe creativity is a life purpose and the reason we exist. We are all creative — that gift is already in you.",
    ab_c1t: "BELIEVE", ab_c1d: "Believe in yourself, believe in your ideas.",
    ab_c2t: "CREATE", ab_c2d: "Never stop creating. Materialize those ideas: they are a gift.",
    ab_c3t: "GROW", ab_c3d: "Once you do the first two, it is inevitable.",
    wu_kicker: "PROGRAM",
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
  item:  { scaleIn: 0.82, scaleOut: 1.12, blur: 6 }
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
      cfg: el.classList.contains("depth-item") ? DEPTH.item : DEPTH.scene,
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

    // Redondeamos: así el navegador no vuelve a dibujar por cambios que
    // el ojo no alcanza a ver. Es lo que mantiene el scroll fluido.
    const t = "scale(" + scale.toFixed(3) + ")";
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
    renderProjectList();   // las etiquetas HECHO/PRÓXIMO también cambian de idioma
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
   Cada CRTV es una sección principal más: llega, se ancla al centro y
   se despide, con la misma mecánica .scene/.pin/.depth que "Dreams",
   "Creatividad infinita" o "Wake up".
   ------------------------------------------------------------ */
const listEl = document.getElementById("project-list");

/* Cada CRTV aterriza en un punto distinto de la colina: izquierda,
   centro, derecha, y vuelve a empezar — así no se sienten en fila. */
const DIRS = ["dir-left", "dir-center", "dir-right"];

function renderProjectList() {
  listEl.innerHTML = "";
  PROJECTS.forEach((p, i) => {
    const section = document.createElement("section");
    section.className = "project-scene scene " + p.status;
    section.dataset.blur = "close";
    // El último se queda quieto hasta el final (como wake up), en vez
    // de desvanecerse antes de llegar al fondo de la página.
    if (i === PROJECTS.length - 1) section.dataset.exit = "no";

    const pin = document.createElement("div");
    pin.className = "pin " + DIRS[i % DIRS.length];

    const a = document.createElement("a");
    a.className = "project-inner depth";
    a.href = "#" + p.id;

    const num = document.createElement("span");
    num.className = "p-num";
    num.textContent = code(p.num);

    const title = document.createElement("span");
    title.className = "p-title";
    title.textContent = p.title;

    const tag = document.createElement("span");
    tag.className = "p-tag " + p.status;
    tag.textContent = t("tag_" + p.status);

    a.append(num, title, tag);
    pin.appendChild(a);
    section.appendChild(pin);
    listEl.appendChild(section);
  });
}

const PREFIX = "CRTV";
const code = n => (n === null || n === undefined)
  ? PREFIX
  : PREFIX + " " + String(n).padStart(2, "0");


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

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    sizeCanvas();
    initSky(pickSet());   // cambia horizontal/vertical si giras el teléfono
    updateClocks();       // nombres largos o cortos según el ancho
    schedule();
  }, 180);
});

/* Si llegan con un enlace directo (#wakeup, #nosotros, #crtv) los
   llevamos hasta allá. El navegador solo no siempre acierta porque
   el cielo y los logos cambian la altura mientras cargan. */
(function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;

  const section = document.getElementById(id);
  if (!section) return;
  // "instant" evita heredar el scroll suave del CSS: aterrizas de una.
  const jump = () => {
    section.scrollIntoView({ behavior: "instant", block: "start" });
    schedule();
  };
  jump();
  window.addEventListener("load", jump, { once: true });
})();
