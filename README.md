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

## 3. Publicar en producción

El repositorio es **privado**. GitHub Pages cobra por publicar repos privados, así que el
sitio se publica en **Cloudflare Pages**: gratis, sin límite de tráfico, con HTTPS y dominio
propio incluidos, y funciona perfecto con repos privados.

El workflow `.github/workflows/deploy.yml` publica solo, en cada push a `main`.

### Configuración inicial (una sola vez, ~5 minutos)

1. Crea una cuenta gratis en <https://dash.cloudflare.com>.
2. En el panel: **Workers & Pages → Create → Pages → Direct Upload**.
   Nombra el proyecto exactamente **`creatvmyndz`** y créalo (puedes subir cualquier archivo,
   el pipeline lo reemplaza en el primer deploy).
3. Copia tu **Account ID** (aparece en la barra lateral de Workers & Pages).
4. Crea un token en **My Profile → API Tokens → Create Token**, plantilla
   **"Edit Cloudflare Workers"** (incluye permiso de Pages). Cópialo.
5. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   y agrega los dos:
   - `CLOUDFLARE_ACCOUNT_ID` → tu Account ID
   - `CLOUDFLARE_API_TOKEN` → el token
6. Listo. Haz cualquier push a `main` (o **Actions → Run workflow**) y se publica.

> Mientras no existan esos dos secretos, el workflow falla a propósito con un mensaje claro
> explicando qué falta.

### Alternativa aún más simple (sin secretos)

En Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, eliges este repositorio
y dejas el build vacío (carpeta de salida `/`). Cloudflare publica solo en cada push, sin
tocar GitHub Actions. Si eliges esta opción, borra `.github/workflows/deploy.yml`.

### Conectar creatvmyndz.com

En el proyecto de Cloudflare Pages: **Custom domains → Set up a domain** → `creatvmyndz.com`.
Si el dominio ya está en Cloudflare, el DNS se configura solo. Si está en otro proveedor,
Cloudflare te dice exactamente qué registro crear. El certificado HTTPS es automático.

⚠️ Hazlo solo cuando quieras reemplazar la página que hoy vive en creatvmyndz.com.

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
.github/workflows/      pipeline de publicación automática
```
