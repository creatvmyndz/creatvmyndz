# CREATV MYNDZ ☁️

Sitio del colectivo: lista de proyectos estilo MSCHF + programa **WAKE UP**, sobre un
cielo en video que **avanza y retrocede con el scroll** (de día a noche estrellada).

Sitio estático puro (HTML/CSS/JS, sin frameworks ni build). Rápido, responsive y fácil de editar.

---

## 1. Editar proyectos (lo que harás casi siempre)

Todo está en **`assets/projects.js`**. Copias un bloque `{ ... }`, lo pegas arriba, lo editas,
haces push a `main` y la web se actualiza sola.

### ¿Cómo se edita el "CRTV 01"?

Lo controla el campo **`num`**. Escribes solo el número y la web lo muestra con el prefijo
y dos dígitos:

| Escribes en `projects.js` | Se ve en la web |
| --- | --- |
| `num: 1` | CRTV 01 |
| `num: 7` | CRTV 07 |
| `num: 23` | CRTV 23 |

La palabra **CRTV** es fija para todos. Si algún día quieres otra (por ejemplo `MYNDZ 01`),
se cambia en **una sola línea** de `assets/app.js`:

```js
const PREFIX = "CRTV";
```

### Los demás campos

- `status`: `"done"` (hecho) · `"now"` (en curso) · `"soon"` (próximo) — controla la etiqueta y los filtros
- `image`: sube la foto a `assets/img/` y pon `"assets/img/tu-foto.jpg"`
- `link`: URL externa del proyecto (Instagram, YouTube, tienda…)
- `id`: se usa en el enlace directo, p. ej. `creatvmyndz.com/#el-despegue`

### Correo, redes y contacto

Arriba de `assets/projects.js` está el bloque `SITE`: correo donde llegan los leads,
correo público de contacto y las redes. Borra las redes que no uses.

---

## 2. El cielo (video de fondo)

El video **no** es un `<video>`: al rebobinar, los celulares se traban. En su lugar el video
está convertido en **121 imágenes** que se dibujan en un canvas según cuánto has bajado.
Es la técnica que usa Apple y va fluida en iPhone y Android.

- `assets/sky/d/` → 121 frames horizontales (computador), 3.4 MB
- `assets/sky/m/` → 121 frames verticales (celular), 1.7 MB

Cada dispositivo descarga **solo su versión**, y en conexiones lentas o teléfonos modestos
la web usa automáticamente menos frames.

### Cambiar el video

Con [ffmpeg](https://ffmpeg.org) y `cwebp` instalados (`brew install ffmpeg webp`):

```bash
ffmpeg -i "TU-VIDEO.mp4" -vf "select=not(mod(n\,3)),scale=1280:720" -vsync 0 /tmp/fd/%04d.png
ffmpeg -i "TU-VIDEO.mp4" -vf "select=not(mod(n\,3)),crop=608:1080:140:0,scale=540:960" -vsync 0 /tmp/fm/%04d.png
for f in /tmp/fd/*.png; do cwebp -quiet -q 70 -m 6 "$f" -o "assets/sky/d/$(basename "$f" .png).webp"; done
for f in /tmp/fm/*.png; do cwebp -quiet -q 70 -m 6 "$f" -o "assets/sky/m/$(basename "$f" .png).webp"; done
```

Si el número de frames cambia, actualiza `SKY_TOTAL` en `assets/app.js`.

---

## 3. Publicar en producción (creatvmyndz.com)

El sitio se publica en **Cloudflare Pages**: gratis, con ancho de banda y peticiones
**ilimitados**, uso comercial permitido y repos privados sin problema. Es lo que aguanta
un pico viral sin que la página se caiga.

> Antes estuvo en Netlify. Su plan gratis ahora son 300 créditos al mes con tope duro
> (15 créditos por cada publicación y 20 por GB de tráfico) y, al agotarse, **apaga el
> sitio** hasta el mes siguiente. No sirve para una estrategia de tráfico viral.

### Paso 1 — Mover el DNS a Cloudflare (una sola vez)

El dominio está registrado en **Wix** y su DNS está limpio: no hay correo (sin registros MX),
ni SPF, ni subdominios. Solo apunta al hosting. Por eso mover los nameservers no rompe nada.

1. Crea una cuenta gratis en <https://dash.cloudflare.com>.
2. **Add a domain** → `creatvmyndz.com` → plan **Free**.
3. Cloudflare escanea el DNS actual. Revisa que la lista quede vacía o solo con el
   apuntamiento viejo al hosting; borra los registros que apunten a Netlify.
4. Cloudflare te muestra dos nameservers propios. Cópialos.
5. En Wix: **Dominios → creatvmyndz.com → Avanzado → Nameservers**, cambia a
   "usar nameservers externos" y pega los dos de Cloudflare.
6. Espera a que Cloudflare marque el dominio como **Active** (suele ser de minutos a
   unas horas).

### Paso 2 — Crear el proyecto en Cloudflare Pages

1. **Workers & Pages → Create → Pages → Direct Upload**.
2. Nombra el proyecto exactamente **`creatvmyndz`** y créalo (sube cualquier archivo
   suelto; el primer deploy real lo reemplaza).
3. En el proyecto: **Custom domains → Set up a domain** → `creatvmyndz.com`.
   Como el DNS ya está en Cloudflare, se configura solo, con HTTPS automático.

### Paso 3 — Conectar el despliegue automático

El workflow `.github/workflows/deploy.yml` publica en cada push a `main`. Necesita dos llaves:

1. **Account ID**: aparece en la barra lateral de Workers & Pages.
2. **API Token**: **My Profile → API Tokens → Create Token**, plantilla
   **"Edit Cloudflare Workers"** (incluye permiso de Pages).
3. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
4. Haz push a `main` (o **Actions → Run workflow**) y se publica.

> Mientras no existan esos dos secretos, el workflow falla a propósito con un mensaje claro
> explicando qué falta.

**Alternativa sin secretos:** en Cloudflare, **Pages → Connect to Git**, eliges este
repositorio, comando de build
`mkdir -p dist && cp index.html _headers dist/ && cp -r assets dist/` y carpeta de
salida `dist`. Si eliges esta vía, borra `.github/workflows/deploy.yml` para no
desplegar dos veces.

⚠️ **Ojo:** al publicar, la página que hoy está en creatvmyndz.com queda reemplazada.
Si quieres conservarla, guarda una copia antes desde tu cuenta de Netlify.

---

## 4. Formulario de WAKE UP (leads)

Los correos llegan a la dirección de `SITE.leadEmail` vía [FormSubmit](https://formsubmit.co)
(gratis, sin backend). **La primera vez** que alguien envíe el formulario, FormSubmit te manda
un correo de activación: confírmalo y desde ahí llegan todos los leads a tu bandeja.

Cuando el programa esté a la venta, reemplaza el formulario en `index.html`
(sección `<!-- Captura de leads -->`) por tu botón de pago (Stripe Payment Link,
Gumroad, Hotmart…).

---

## 5. Estructura

```
index.html              la página completa
assets/projects.js      ← CONTENIDO: proyectos, correos y redes (lo que editas a diario)
assets/app.js           lógica: cielo con scroll, menú, idioma ES/EN, modal, relojes
assets/styles.css       estilos
assets/sky/d, /m        frames del cielo (escritorio y celular)
assets/img/             logos, favicon e imágenes de proyectos
assets/fonts/           tipografía Outfit (licencia libre OFL)
_headers                reglas de caché del navegador
.github/workflows/      pipeline de publicación automática
```
