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

El dominio **ya está funcionando en Netlify** (sitio `effortless-liger-a44de3`), con el DNS
gestionado desde Wix. No hay que tocar DNS ni certificados: se reutiliza todo eso y solo
cambia el contenido que Netlify publica.

Netlify gratis alcanza de sobra: funciona con repos privados, 100 GB de tráfico al mes
(≈ 50.000 visitas con este sitio) y despliegue automático en cada push.

### Opción A — Conectar el repo a Netlify (la más simple, recomendada)

1. Entra a <https://app.netlify.com> con la cuenta donde vive `effortless-liger-a44de3`.
2. Abre ese sitio → **Site configuration → Build & deploy → Continuous deployment**.
3. **Link repository** → GitHub → autoriza y elige `creatvmyndz/creatvmyndz`.
4. Branch: `main`. El comando de build y la carpeta de publicación los lee solo de
   `netlify.toml`, no tienes que escribir nada.
5. **Deploy site.** Desde ahí, cada push a `main` republica creatvmyndz.com solo.

Si eliges esta opción, borra `.github/workflows/deploy.yml` para no desplegar dos veces.

### Opción B — Desde GitHub Actions

El workflow `.github/workflows/deploy.yml` ya está listo; solo necesita dos llaves:

1. En Netlify: **User settings → Applications → Personal access tokens → New access token**.
   Cópialo.
2. En el sitio: **Site configuration → General → Site details** → copia el **Site ID**.
3. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - `NETLIFY_AUTH_TOKEN` → el token
   - `NETLIFY_SITE_ID` → el Site ID
4. Haz push a `main` (o **Actions → Run workflow**) y se publica.

> Mientras no existan esos dos secretos, el workflow falla a propósito con un mensaje claro
> explicando qué falta.

⚠️ **Ojo:** al publicar, la página que hoy está en creatvmyndz.com queda reemplazada.
La anterior no se pierde: en Netlify sigue disponible en **Deploys**, y puedes volver a
ella cuando quieras con *Publish deploy*.

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
netlify.toml, _headers    configuración de Netlify (build y caché)
.github/workflows/      pipeline de publicación automática
```
