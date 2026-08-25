/* ============================================================
   WAKE UP — CONTENIDO EDITABLE DE LOS MÓDULOS
   ------------------------------------------------------------
   Igual que projects.js: este es el archivo que tocas para poner el
   contenido real de cada clase. Guarda, haz push a main y el programa
   se actualiza solo.

   Campos de cada módulo:
   - num:         número del módulo (1 a 10, define el orden y el
                  bloqueo — no se puede entrar al 4 sin completar el 3)
   - title:       nombre del módulo (sale en MAYÚSCULAS)
   - kicker:      la categoría corta que sale arriba del título
   - lesson:      el contenido de la clase (texto, o pega un link a tu
                  video/PDF)
   - task:        la tarea que debe hacer la persona
   - deliverable: qué tiene que entregar/mostrar para marcarlo listo
   ------------------------------------------------------------ */

const MODULES = [
  {
    num: 1,
    title: "DESPIERTA TU MIRADA",
    kicker: "Fundamentos",
    lesson: "La creatividad no es un talento que tienen unos pocos — es un músculo que se durmió. Todos los días tu cerebro filtra casi todo lo que ves para no saturarte: por eso dejaste de \"ver\" tu propia calle, tu rutina, tu ciudad. Despertar la mirada es entrenarte para notar lo que el piloto automático te esconde. No necesitas una idea genial hoy. Necesitas volver a mirar.",
    task: "Durante un día completo, cada vez que agarres el celular, antes de desbloquearlo, mira 5 segundos algo que tengas cerca — una textura, una sombra, un objeto — como si lo vieras por primera vez. Anota 5 cosas que \"viste\" hoy que normalmente ignoras.",
    deliverable: "Tu lista de 5 cosas. No tiene que ser bonita ni profunda — solo real."
  },
  {
    num: 2,
    title: "ROMPE EL BLOQUEO",
    kicker: "Desbloqueo creativo",
    lesson: "El bloqueo creativo casi nunca es falta de ideas — es miedo a que la idea sea mala. Tu cerebro te protege del ridículo bloqueando la salida antes de que algo \"malo\" pueda salir. La única forma de romper eso es sacar tantas ideas malas que dejen de darte miedo.",
    task: "Ponte un timer de 10 minutos y escribe 20 ideas para resolver un problema simple de tu día a día. No te detengas a evaluar ninguna mientras escribes. Cantidad, no calidad.",
    deliverable: "Tu lista de 20 ideas, completa — buenas, malas y ridículas."
  },
  {
    num: 3,
    title: "OBSERVA COMO CREATIVO",
    kicker: "Inspiración",
    lesson: "Inspirarse no es esperar un rayo — es exponerte a más ideas de las que tu cerebro puede combinar por accidente. Los creativos no tienen más ideas: tienen más materia prima cruzándose en la cabeza. Observar como creativo es coleccionar piezas sueltas a propósito, sin saber todavía para qué las vas a usar.",
    task: "Arma una carpeta (en el celular o donde sea) llamada \"Inspiración\". Durante 3 días, cada vez que algo te llame la atención — un color, una frase, un diseño, un empaque, un meme — captúralo ahí, sin filtrar si \"sirve\" o no.",
    deliverable: "Tu carpeta con mínimo 15 capturas."
  },
  {
    num: 4,
    title: "LA IDEA NO BASTA",
    kicker: "Ideación",
    lesson: "Tener una idea se siente como el logro. No lo es. La idea es el punto de partida más barato que existe — lo que la vuelve valiosa es lo que decides hacer con ella. Este módulo es sobre elegir: de todas las ideas que ya generaste, ¿cuál te da miedo bueno? Ese miedo, y no la comodidad, es la señal.",
    task: "Vuelve a tu lista del Módulo 2 (o genera 10 ideas nuevas). Elige UNA. Escribe en 3 frases: qué es, para quién es, y por qué tú eres la persona indicada para hacerla.",
    deliverable: "Tus 3 frases sobre la idea que elegiste."
  },
  {
    num: 5,
    title: "PROTOTIPA RÁPIDO",
    kicker: "Materialización",
    lesson: "Una idea que vive solo en tu cabeza no existe para nadie más. Prototipar no es \"hacerlo bien\" — es hacerlo visible, aunque sea feo, aunque sea con lo que tengas a mano. El primer prototipo siempre da vergüenza. Esa vergüenza es la prueba de que ya lo sacaste de tu cabeza.",
    task: "Convierte la idea del Módulo 4 en algo que se pueda tocar, ver o probar en menos de 2 horas — un dibujo, una maqueta con cartón, un mockup, una grabación de voz explicándola. No busques que quede perfecto.",
    deliverable: "Una foto o archivo de tu prototipo."
  },
  {
    num: 6,
    title: "CUENTA LA HISTORIA",
    kicker: "Storytelling",
    lesson: "Nadie se conecta con un producto — se conecta con la historia detrás. La gente no recuerda características, recuerda cómo algo la hizo sentir. Contar tu historia no es inventar un cuento: es encontrar el \"por qué\" real detrás de lo que hiciste y decirlo simple.",
    task: "Escribe la historia de tu idea en 4 frases: el problema que viste, por qué te importó, qué hiciste, y qué esperas que sienta quien la reciba.",
    deliverable: "Tus 4 frases."
  },
  {
    num: 7,
    title: "CRITICA Y MEJORA",
    kicker: "Feedback",
    lesson: "El feedback no es un ataque a lo que hiciste — es información gratis sobre cómo se ve desde afuera. Los creativos que más rápido mejoran son los que piden feedback antes de sentirse \"listos\", no después. Recibirlo bien es una habilidad que se entrena, igual que crear.",
    task: "Muéstrale tu prototipo (Módulo 5) a alguien fuera de tu cabeza — un amigo, familia, quien sea. Pídele que te diga qué no entendió y qué cambiaría. No lo defiendas, solo anótalo.",
    deliverable: "3 comentarios reales que recibiste, escritos tal cual te los dijeron."
  },
  {
    num: 8,
    title: "ENCUENTRA TU ESTILO",
    kicker: "Identidad",
    lesson: "Tu estilo no se inventa — se descubre revisando qué se repite en lo que ya hiciste, incluso sin querer. No es una decisión de un día, es un patrón que emerge con el tiempo. Dejar de copiar referencias y empezar a mezclar las tuyas propias es donde empieza a aparecer.",
    task: "Mira todo lo que has hecho en este programa hasta ahora (tus notas, tu prototipo, tu historia). Escribe 3 palabras que describan cómo haces las cosas cuando nadie te está corrigiendo.",
    deliverable: "Tus 3 palabras, más una frase explicando por qué las elegiste."
  },
  {
    num: 9,
    title: "COMPARTE TU TRABAJO",
    kicker: "Visibilidad",
    lesson: "Lo que no se comparte no existe para nadie más que para ti. Compartir da miedo porque expone el trabajo a juicio — pero también es la única forma de que alguien se conecte con lo que hiciste, te dé una oportunidad, o te ayude a mejorar. Publicar imperfecto vence a guardar perfecto.",
    task: "Comparte tu prototipo o tu historia (Módulos 5 y 6) en un lugar donde alguien más lo vea — redes, un grupo, el Discord de CREATV MYNDZ. No pidas permiso, solo publícalo.",
    deliverable: "El link o una captura de dónde lo compartiste."
  },
  {
    num: 10,
    title: "NUNCA PARES DE CREAR",
    kicker: "Hábito",
    lesson: "La creatividad no se mantiene despierta sola — se apaga si dejas de usarla, igual que un músculo. Todo lo que hiciste en este programa no fue para \"terminar\" un curso: fue para probar que el hábito se puede construir con constancia, no esperando la inspiración.",
    task: "Define un compromiso simple y sostenible: una acción creativa que vas a repetir cada semana, aunque sea tan chica como anotar una idea nueva. Escríbelo como una promesa a ti mismo.",
    deliverable: "Tu compromiso semanal, por escrito."
  }
];
