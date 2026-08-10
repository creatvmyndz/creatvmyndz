# CREATV MYNDZ ☁️

Sitio del colectivo creativo **CREATV MYNDZ**: lista de proyectos estilo MSCHF + programa **WAKE UP**.

Sitio estático puro (HTML/CSS/JS, sin frameworks ni build): rápido, responsive y fácil de editar.

## ¿Cómo agrego o edito un proyecto?

Todo vive en **`assets/projects.js`**. Copia un bloque `{...}`, edítalo y haz push a `main`. Nada más.

- `status`: `"done"` (hecho) · `"now"` (en curso) · `"soon"` (próximo)
- `image`: sube tu foto a `assets/img/` y pon la ruta, p. ej. `"assets/img/mi-proyecto.jpg"`
- `link`: URL externa del proyecto (Instagram, YouTube, tienda…)

## ¿Cómo se publica? (pipeline)

Cada **push a `main`** dispara el workflow `.github/workflows/deploy.yml`, que publica el sitio
en **GitHub Pages** automáticamente. No hay que subir nada a mano. También puedes lanzarlo
manualmente desde la pestaña **Actions → Deploy a producción → Run workflow**.

URL del sitio: `https://creatvmyndz.github.io/creatvmyndz/`

### Conectar el dominio creatvmyndz.com (cuando quieras)

1. En GitHub: **Settings → Pages → Custom domain** → escribe `creatvmyndz.com` y guarda.
2. En tu proveedor de dominio, apunta el DNS a GitHub Pages
   (CNAME `www` → `creatvmyndz.github.io`, y registros A del apex a las IPs de GitHub Pages).
3. Activa **Enforce HTTPS**.

⚠️ Hazlo solo cuando quieras reemplazar la página que hoy vive en creatvmyndz.com.

## Formulario WAKE UP (leads)

El formulario envía los correos a **camiloveggaart@gmail.com** vía [FormSubmit](https://formsubmit.co)
(gratis, sin backend). **La primera vez** que alguien envíe el formulario, FormSubmit te manda un
correo de activación — confírmalo y desde ahí llegan todos los leads a tu bandeja.

Cuando el programa esté a la venta, reemplaza el formulario en `index.html` (sección
`<!-- Captura de leads -->`) por tu botón de pago (Stripe Payment Link, Gumroad, Hotmart…).

## Estructura

```
index.html              página completa (hero, proyectos, WAKE UP)
assets/projects.js      ← DATA de proyectos (lo único que editas a diario)
assets/styles.css       estilos (nubes, lista MSCHF, WAKE UP)
assets/app.js           lógica: modal, idioma ES/EN, relojes, FLYING %
assets/img/             imágenes de proyectos
.github/workflows/      pipeline de deploy a GitHub Pages
```
