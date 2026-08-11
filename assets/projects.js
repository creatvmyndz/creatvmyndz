/* ============================================================
   CREATV MYNDZ — CONTENIDO EDITABLE
   ------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para el día a día.
   Guarda, haz push a main y la web se actualiza sola.
   ============================================================ */


/* ------------------------------------------------------------
   1) DATOS DEL COLECTIVO
   ------------------------------------------------------------ */
const SITE = {
  // A dónde llegan los correos del formulario de WAKE UP.
  // OJO: la primera vez que alguien lo use, FormSubmit te manda un
  // correo de activación. Confírmalo y desde ahí llegan todos los leads.
  leadEmail: "camiloveggaart@gmail.com",

  // Correo público que aparece en la sección CONTACTO.
  contactEmail: "camiloveggaart@gmail.com",

  // Redes: borra las que no uses o cambia la URL.
  social: [
    { label: "INSTAGRAM", url: "https://instagram.com/creatvmyndz" },
    { label: "YOUTUBE",   url: "" },
    { label: "TIKTOK",    url: "" },
    { label: "DISCORD",   url: "" }
  ]
};


/* ------------------------------------------------------------
   2) PROYECTOS
   ------------------------------------------------------------
   Para agregar uno nuevo: copia un bloque { ... } completo,
   pégalo arriba del todo y edítalo. El orden de la lista es el
   orden en pantalla (lo más nuevo arriba).

   CÓMO SE EDITA EL "CRTV 01":
   Lo controla el campo `num`. Escribes solo el número (1, 2, 15...)
   y la web lo muestra como CRTV 01, CRTV 02, CRTV 15.
   El "CRTV" es fijo; si algún día quieres otra palabra, se cambia
   en assets/app.js buscando la línea que dice PREFIX = "CRTV".

   Campos:
   - id:      identificador único, minúsculas y sin espacios (se usa en la URL)
   - num:     número del proyecto → se muestra como CRTV 01
   - title:   nombre del proyecto (sale en MAYÚSCULAS)
   - status:  "done" (hecho) | "soon" (próximo)
              Los "soon" salen con el título borroso, para generar expectativa.
   - area:    música | moda | arte | social | marca ... (texto libre)
   - year:    año, o algo como "2026 →"
   - desc:    { es: "...", en: "..." }
   - link:    URL del proyecto (Instagram, YouTube, tienda...) o "" si no hay
   - image:   sube la foto a assets/img/ y pon "assets/img/tu-foto.jpg", o ""
   ------------------------------------------------------------ */

const PROJECTS = [
  {
    id: "wake-up",
    num: 7,
    title: "WAKE UP",
    status: "soon",
    area: "programa",
    year: "2026 →",
    desc: {
      es: "El programa de CREATV MYNDZ para despertar tu creatividad: videos personalizados, audios tipo hipnosis y acceso a la comunidad en Discord. Es el corazón de todo lo que hacemos.",
      en: "The CREATV MYNDZ program to wake up your creativity: personalized videos, hypnosis-style audios and access to the Discord community. It is the heart of everything we do."
    },
    link: "#wakeup",
    image: ""
  },
  {
    id: "coleccion-nubes",
    num: 6,
    title: "COLECCIÓN NUBES",
    status: "soon",
    area: "moda",
    year: "2026 →",
    desc: {
      es: "Primera colección de ropa propia del colectivo. Piezas inspiradas en volar sobre las nubes. [Proyecto de ejemplo: edita este texto en assets/projects.js]",
      en: "The collective's first in-house clothing collection. Pieces inspired by flying above the clouds. [Sample project: edit this text in assets/projects.js]"
    },
    link: "",
    image: ""
  },
  {
    id: "sesiones-en-el-cielo",
    num: 5,
    title: "SESIONES EN EL CIELO",
    status: "soon",
    area: "música",
    year: "2026",
    desc: {
      es: "Serie de sesiones musicales en vivo grabadas en azoteas y lugares altos de la ciudad. [Proyecto de ejemplo: edita este texto en assets/projects.js]",
      en: "A series of live music sessions recorded on rooftops and high places around the city. [Sample project: edit this text in assets/projects.js]"
    },
    link: "",
    image: ""
  },
  {
    id: "galeria-flotante",
    num: 4,
    title: "GALERÍA FLOTANTE",
    status: "done",
    area: "arte",
    year: "2025",
    desc: {
      es: "Exposición itinerante de artistas emergentes montada en espacios no convencionales. [Proyecto de ejemplo: edita este texto en assets/projects.js]",
      en: "A traveling exhibition of emerging artists set up in unconventional spaces. [Sample project: edit this text in assets/projects.js]"
    },
    link: "",
    image: ""
  },
  {
    id: "mentes-al-barrio",
    num: 3,
    title: "MENTES AL BARRIO",
    status: "done",
    area: "social",
    year: "2025",
    desc: {
      es: "Talleres creativos gratuitos para jóvenes: música, diseño y arte como herramientas de cambio. [Proyecto de ejemplo: edita este texto en assets/projects.js]",
      en: "Free creative workshops for young people: music, design and art as tools for change. [Sample project: edit this text in assets/projects.js]"
    },
    link: "",
    image: ""
  },
  {
    id: "colab-marca",
    num: 2,
    title: "COLAB × MARCA",
    status: "done",
    area: "marca",
    year: "2024",
    desc: {
      es: "Colaboración creativa con una marca aliada: concepto, dirección de arte y campaña. [Proyecto de ejemplo: edita este texto en assets/projects.js]",
      en: "Creative collaboration with a partner brand: concept, art direction and campaign. [Sample project: edit this text in assets/projects.js]"
    },
    link: "",
    image: ""
  },
  {
    id: "el-despegue",
    num: 1,
    title: "EL DESPEGUE",
    status: "done",
    area: "colectivo",
    year: "2024",
    desc: {
      es: "El nacimiento de CREATV MYNDZ: un colectivo sin límites que descarga ideas de las nubes. [Proyecto de ejemplo: edita este texto en assets/projects.js]",
      en: "The birth of CREATV MYNDZ: a limitless collective downloading ideas from the clouds. [Sample project: edit this text in assets/projects.js]"
    },
    link: "",
    image: ""
  }
];
