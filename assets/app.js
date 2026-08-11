/* ============================================================
   CREATV MYNDZ — LÓGICA DE LA PÁGINA
   ============================================================ */

/* Prefijo de los proyectos: CRTV 01, CRTV 02, ...
   Si algún día quieres otra palabra, cámbiala aquí. */
const PREFIX = "CRTV";
const code = n => PREFIX + " " + String(n).padStart(2, "0");


/* ------------------------------------------------------------
   TRADUCCIONES DE LA INTERFAZ
   ------------------------------------------------------------ */
const I18N = {
  es: {
    menu: "MENÚ",
    m_projects: "CRTV", m_wakeup: "WAKE UP", m_about: "QUIÉNES SOMOS", m_contact: "CONTACTO",
    tagline: "CREATIVIDAD INFINITA",
    hero_cta: "↓ NAVEGAR",
    manifesto: "SOMOS UN COLECTIVO CREATIVO SIN LÍMITES. HACEMOS MÚSICA, MODA, ARTE Y PROYECTOS SOCIALES. NO CABEMOS EN UNA CAJA. DESCARGAMOS IDEAS DE LAS NUBES Y LAS ATERRIZAMOS EN EL MUNDO REAL. TÚ TAMBIÉN PUEDES.",
    drops_title: "CRTV",
    f_all: "TODOS", f_done: "HECHOS", f_soon: "PRÓXIMOS",
    tag_done: "HECHO", tag_soon: "PRÓXIMO",
    wu_kicker: "EL PROGRAMA",
    wu_sub: "Todo lo que ves arriba nace de la creatividad — y la creatividad se entrena. WAKE UP es nuestro programa para despertar la tuya.",
    wu_f1: "Videos personalizados para desbloquear tu proceso creativo",
    wu_f2: "Serie de audios tipo hipnosis para reprogramar tu mente",
    wu_f3: "Acceso al Discord y a la comunidad CREATV MYNDZ",
    wu_label: "DÉJANOS TU CORREO Y SÉ DE LOS PRIMEROS EN ENTRAR:",
    wu_btn: "DESPERTAR →",
    wu_note: "Pronto podrás comprar el programa directamente aquí.",
    ab_title: "QUIÉNES SOMOS",
    ab_p1: "CREATV MYNDZ es un colectivo creativo. No somos una agencia dentro de una caja: somos un grupo de mentes que produce música, moda, arte y proyectos sociales, y que colabora con marcas cuando la idea lo merece.",
    ab_p2: "Creemos que las ideas ya están en el aire. Nuestro trabajo es subir por ellas, descargarlas y aterrizarlas en algo que la gente pueda ver, usar y sentir.",
    ab_c1t: "COLECTIVO", ab_c1d: "Artistas, músicos, diseñadores y productores trabajando juntos.",
    ab_c2t: "MARCA", ab_c2d: "Creamos nuestros propios productos y colecciones.",
    ab_c3t: "COLABORACIONES", ab_c3d: "Trabajamos con marcas que quieren salirse del molde.",
    ct_title: "CONTACTA A LOS CREATIVE DEALERS",
    ct_sub: "Contáctanos para más creatividad.",
    footer_line: "CREATIVE DEALERS",
    modal_cta: "¿QUIERES CREAR ASÍ? → WAKE UP",
    view_project: "VER PROYECTO ↗"
  },
  en: {
    menu: "MENU",
    m_projects: "CRTV", m_wakeup: "WAKE UP", m_about: "ABOUT US", m_contact: "CONTACT",
    tagline: "INFINITE CREATIVITY",
    hero_cta: "↓ EXPLORE",
    manifesto: "WE ARE A LIMITLESS CREATIVE COLLECTIVE. WE MAKE MUSIC, FASHION, ART AND SOCIAL PROJECTS. WE DON'T FIT IN A BOX. WE DOWNLOAD IDEAS FROM THE CLOUDS AND LAND THEM IN THE REAL WORLD. YOU CAN TOO.",
    drops_title: "CRTV",
    f_all: "ALL", f_done: "DONE", f_soon: "UPCOMING",
    tag_done: "DONE", tag_soon: "UPCOMING",
    wu_kicker: "THE PROGRAM",
    wu_sub: "Everything you see above is born from creativity — and creativity can be trained. WAKE UP is our program to awaken yours.",
    wu_f1: "Personalized videos to unlock your creative process",
    wu_f2: "A series of hypnosis-style audios to reprogram your mind",
    wu_f3: "Access to the Discord and the CREATV MYNDZ community",
    wu_label: "LEAVE YOUR EMAIL AND BE AMONG THE FIRST TO GET IN:",
    wu_btn: "WAKE UP →",
    wu_note: "Soon you'll be able to buy the program right here.",
    ab_title: "ABOUT US",
    ab_p1: "CREATV MYNDZ is a creative collective. We are not an agency inside a box: we are a group of minds making music, fashion, art and social projects, collaborating with brands when the idea deserves it.",
    ab_p2: "We believe ideas are already in the air. Our job is to fly up for them, download them and land them into something people can see, use and feel.",
    ab_c1t: "COLLECTIVE", ab_c1d: "Artists, musicians, designers and producers working together.",
    ab_c2t: "BRAND", ab_c2d: "We create our own products and collections.",
    ab_c3t: "COLLABORATIONS", ab_c3d: "We work with brands that want to break the mold.",
    ct_title: "CONTACT THE CREATIVE DEALERS",
    ct_sub: "Contact us for more creativity.",
    footer_line: "CREATIVE DEALERS",
    modal_cta: "WANT TO CREATE LIKE THIS? → WAKE UP",
    view_project: "VIEW PROJECT ↗"
  }
};

let lang = localStorage.getItem("cm-lang") || "es";
let activeFilter = "all";
const t = key => (I18N[lang] && I18N[lang][key]) || I18N.es[key] || "";


/* ============================================================
   EL CIELO: el video de fondo avanza y retrocede con el scroll
   ------------------------------------------------------------
   En vez de un <video> (que se traba al rebobinar en celulares),
   usamos la secuencia de imágenes del video dibujada en un canvas.
   Es la misma técnica que usa Apple y va fluida en iPhone/Android.
   ============================================================ */
const SKY_TOTAL = 121;               // frames disponibles en assets/sky/
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d", { alpha: false });
const scrim = document.getElementById("scrim");

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
  return "assets/sky/" + skySet + "/" + String(frameIds[i]).padStart(4, "0") + ".webp";
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

function paint(i) {
  const img = frames[i] && frames[i].img;
  if (!img || !img.naturalWidth) return;
  const cw = canvas.width, ch = canvas.height;
  const ir = img.naturalWidth / img.naturalHeight;
  let dw, dh;
  if (ir > cw / ch) { dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
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

  flyingEl.textContent = "FLYING " + Math.round(p * 100) + "%";
  // El velo tapa más en el día (cielo claro) y menos en la noche.
  scrim.style.opacity = (1 - 0.6 * p).toFixed(3);

  if (needsDraw) {
    const use = nearestReady(targetIndex);
    if (use !== -1 && use !== drawnIndex) { paint(use); drawnIndex = use; }
    if (use === targetIndex) needsDraw = false;
  }
}


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
  renderList();
}

document.getElementById("lang-es").addEventListener("click", () => setLang("es"));
document.getElementById("lang-en").addEventListener("click", () => setLang("en"));
function setLang(l) { lang = l; localStorage.setItem("cm-lang", l); applyLang(); }


/* ------------------------------------------------------------
   LISTA DE PROYECTOS
   ------------------------------------------------------------ */
const listEl = document.getElementById("project-list");

function renderList() {
  const items = PROJECTS.filter(p => activeFilter === "all" || p.status === activeFilter);
  listEl.innerHTML = "";
  items.forEach(p => {
    const li = document.createElement("li");
    li.className = "project-item " + p.status;   // "soon" sale con las letras borrosas

    const a = document.createElement("a");
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
    a.addEventListener("click", e => {
      if (p.link === "#wakeup") return;   // WAKE UP baja directo a su sección
      e.preventDefault();
      openModal(p);
    });

    li.appendChild(a);
    listEl.appendChild(li);
  });
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === btn));
    renderList();
  });
});


/* ------------------------------------------------------------
   MODAL DE PROYECTO
   ------------------------------------------------------------ */
const modal = document.getElementById("modal");

function openModal(p) {
  document.getElementById("modal-num").textContent = code(p.num);
  document.getElementById("modal-title").textContent = p.title;
  document.getElementById("modal-meta").textContent =
    p.area + " · " + p.year + " · " + t("tag_" + p.status);
  document.getElementById("modal-desc").textContent = p.desc[lang] || p.desc.es;

  const img = document.getElementById("modal-img");
  img.hidden = !p.image;
  if (p.image) { img.src = p.image; img.alt = p.title; }

  const link = document.getElementById("modal-link");
  const external = p.link && p.link !== "#wakeup";
  link.hidden = !external;
  if (external) { link.href = p.link; link.textContent = t("view_project"); }

  modal.hidden = false;
  lockScroll(true);
  history.replaceState(null, "", "#" + p.id);
}

function closeModal() {
  modal.hidden = true;
  lockScroll(false);
  history.replaceState(null, "", location.pathname);
}

modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));


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
  if (!modal.hidden) closeModal();
  else if (!menu.hidden) closeMenu();
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
  document.getElementById("clocks").textContent =
    `BOGOTÁ ${fmt("America/Bogota")} · MIAMI ${fmt("America/New_York")} · MADRID ${fmt("Europe/Madrid")}`;
}

function fillContact() {
  const mail = document.getElementById("contact-mail");
  mail.href = "mailto:" + SITE.contactEmail;
  mail.textContent = SITE.contactEmail;

  const ul = document.getElementById("contact-social");
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

  document.getElementById("lead-form").action = "https://formsubmit.co/" + SITE.leadEmail;
}


/* ------------------------------------------------------------
   ARRANQUE
   ------------------------------------------------------------ */
document.getElementById("year").textContent = new Date().getFullYear();
applyLang();
fillContact();
updateClocks();
setInterval(updateClocks, 30000);

sizeCanvas();
initSky(pickSet());
schedule();

window.addEventListener("scroll", schedule, { passive: true });
document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    sizeCanvas();
    initSky(pickSet());   // cambia horizontal/vertical si giras el teléfono
    schedule();
  }, 180);
});

/* Si llegan con un enlace directo (#wakeup, #contacto, #un-proyecto)
   los llevamos hasta allá. El navegador solo no siempre acierta porque
   el cielo y los logos cambian la altura mientras cargan. */
(function openFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;

  const p = PROJECTS.find(x => x.id === id);
  if (p && p.link !== "#wakeup") { openModal(p); return; }

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
