/* ============================================================
   CREATV MYNDZ — DATA DE PROYECTOS
   ------------------------------------------------------------
   Para agregar un proyecto nuevo, copia un bloque {...} y edítalo.
   El orden de esta lista es el orden en pantalla (el más nuevo arriba).

   Campos:
   - id:      identificador único en minúsculas, sin espacios (se usa en la URL #proyecto)
   - num:     número del proyecto (como MSCHF: #1, #2, ...)
   - title:   nombre del proyecto (se muestra en MAYÚSCULAS)
   - status:  "done" (hecho) | "now" (en curso) | "soon" (próximo)
   - area:    música | moda | arte | social | marca ... (libre)
   - year:    año o "2026 →"
   - desc:    { es: "...", en: "..." }
   - link:    URL externa del proyecto (Instagram, YouTube, tienda...) o "" si no hay
   - image:   ruta a una imagen en /assets/img/ o "" si no hay todavía
   ============================================================ */

const PROJECTS = [
  {
    id: "wake-up",
    num: 7,
    title: "WAKE UP",
    status: "now",
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
    status: "now",
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
    id: "colab-marca-x",
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
