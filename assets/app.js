/* ============================================================
   CREATV MYNDZ — LÓGICA DE LA PÁGINA
   (lista de proyectos, modal, idioma ES/EN, relojes, scroll)
   ============================================================ */

/* ---------- Traducciones de la interfaz ---------- */
const I18N = {
  es: {
    nav_projects: "[ PROYECTOS ]",
    tagline: "EXPLORANDO Y ELEVANDO EL PODER DE LAS MENTES CREATIVAS.",
    hero_cta: "↓ NAVEGAR",
    manifesto: "SOMOS UN COLECTIVO CREATIVO SIN LÍMITES. HACEMOS MÚSICA, MODA, ARTE Y PROYECTOS SOCIALES. NO CABEMOS EN UNA CAJA. DESCARGAMOS IDEAS DE LAS NUBES Y LAS ATERRIZAMOS EN EL MUNDO REAL. TÚ TAMBIÉN PUEDES.",
    drops_title: "PROYECTOS",
    f_all: "TODOS", f_done: "HECHOS", f_now: "EN CURSO", f_soon: "PRÓXIMOS",
    tag_done: "HECHO", tag_now: "EN CURSO", tag_soon: "PRÓXIMO",
    wu_kicker: "EL PROGRAMA",
    wu_sub: "Todo lo que ves arriba nace de la creatividad — y la creatividad se entrena. WAKE UP es nuestro programa para despertar la tuya.",
    wu_f1: "Videos personalizados para desbloquear tu proceso creativo",
    wu_f2: "Serie de audios tipo hipnosis para reprogramar tu mente",
    wu_f3: "Acceso al Discord y a la comunidad CREATV MYNDZ",
    wu_label: "DÉJANOS TU CORREO Y SÉ DE LOS PRIMEROS EN ENTRAR:",
    wu_btn: "DESPERTAR →",
    wu_note: "Pronto podrás comprar el programa directamente aquí.",
    footer_line: "DESCARGANDO IDEAS DE LAS NUBES ☁",
    modal_cta: "¿QUIERES CREAR ASÍ? → WAKE UP"
  },
  en: {
    nav_projects: "[ PROJECTS ]",
    tagline: "EXPLORING AND ELEVATING THE POWER OF CREATIVE MINDS.",
    hero_cta: "↓ EXPLORE",
    manifesto: "WE ARE A LIMITLESS CREATIVE COLLECTIVE. WE MAKE MUSIC, FASHION, ART AND SOCIAL PROJECTS. WE DON'T FIT IN A BOX. WE DOWNLOAD IDEAS FROM THE CLOUDS AND LAND THEM IN THE REAL WORLD. YOU CAN TOO.",
    drops_title: "PROJECTS",
    f_all: "ALL", f_done: "DONE", f_now: "IN PROGRESS", f_soon: "UPCOMING",
    tag_done: "DONE", tag_now: "IN PROGRESS", tag_soon: "UPCOMING",
    wu_kicker: "THE PROGRAM",
    wu_sub: "Everything you see above is born from creativity — and creativity can be trained. WAKE UP is our program to awaken yours.",
    wu_f1: "Personalized videos to unlock your creative process",
    wu_f2: "A series of hypnosis-style audios to reprogram your mind",
    wu_f3: "Access to the Discord and the CREATV MYNDZ community",
    wu_label: "LEAVE YOUR EMAIL AND BE AMONG THE FIRST TO GET IN:",
    wu_btn: "WAKE UP →",
    wu_note: "Soon you'll be able to buy the program right here.",
    footer_line: "DOWNLOADING IDEAS FROM THE CLOUDS ☁",
    modal_cta: "WANT TO CREATE LIKE THIS? → WAKE UP"
  }
};

let lang = localStorage.getItem("cm-lang") || "es";
let activeFilter = "all";

/* ---------- Idioma ---------- */
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

document.getElementById("lang-es").addEventListener("click", () => { lang = "es"; localStorage.setItem("cm-lang", lang); applyLang(); });
document.getElementById("lang-en").addEventListener("click", () => { lang = "en"; localStorage.setItem("cm-lang", lang); applyLang(); });

/* ---------- Lista de proyectos ---------- */
const listEl = document.getElementById("project-list");

function renderList() {
  const items = PROJECTS.filter(p => activeFilter === "all" || p.status === activeFilter);
  listEl.innerHTML = "";
  items.forEach(p => {
    const li = document.createElement("li");
    li.className = "project-item";
    const a = document.createElement("a");
    a.href = "#" + p.id;
    a.innerHTML =
      `<span class="p-num">#<br>${p.num}</span>` +
      `<span class="p-title"></span>` +
      `<span class="p-tag ${p.status}">${I18N[lang]["tag_" + p.status]}</span>`;
    a.querySelector(".p-title").textContent = p.title;
    a.addEventListener("click", e => {
      // WAKE UP en la lista lleva directo a la sección del programa
      if (p.link === "#wakeup") return;
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

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");

function openModal(p) {
  document.getElementById("modal-num").textContent = "#" + p.num;
  document.getElementById("modal-title").textContent = p.title;
  document.getElementById("modal-meta").textContent =
    p.area + " · " + p.year + " · " + I18N[lang]["tag_" + p.status];
  document.getElementById("modal-desc").textContent = p.desc[lang] || p.desc.es;

  const img = document.getElementById("modal-img");
  img.hidden = !p.image;
  if (p.image) { img.src = p.image; img.alt = p.title; }

  const link = document.getElementById("modal-link");
  const external = p.link && p.link !== "#wakeup";
  link.hidden = !external;
  if (external) {
    link.href = p.link;
    link.textContent = lang === "es" ? "VER PROYECTO ↗" : "VIEW PROJECT ↗";
  }

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  history.replaceState(null, "", "#" + p.id);
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  history.replaceState(null, "", location.pathname);
}

modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

/* Abrir proyecto si la URL llega con #id (links compartibles) */
function openFromHash() {
  const id = location.hash.slice(1);
  const p = PROJECTS.find(x => x.id === id);
  if (p && p.link !== "#wakeup") openModal(p);
}

/* ---------- FLYING % (progreso de scroll) ---------- */
const flyingEl = document.getElementById("flying");
function updateFlying() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
  flyingEl.textContent = "FLYING " + pct + "%";
}
window.addEventListener("scroll", updateFlying, { passive: true });

/* ---------- Relojes ---------- */
function updateClocks() {
  const fmt = tz => new Intl.DateTimeFormat("es-CO", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz
  }).format(new Date()).toLowerCase().replace(/\.\s?/g, "").replace("m", "m");
  document.getElementById("clocks").textContent =
    `BOGOTÁ (${fmt("America/Bogota")}) MIAMI (${fmt("America/New_York")}) MADRID (${fmt("Europe/Madrid")})`;
}
setInterval(updateClocks, 30000);

/* ---------- Init ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
applyLang();
updateClocks();
updateFlying();
openFromHash();
