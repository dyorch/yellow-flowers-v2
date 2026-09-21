# Flores amarillas

Sitio para regalar "flores amarillas" personalizadas: el admin crea un link con el
nombre de una persona, y quien lo abre ve una página animada dedicada a ella.

Destino: **`floresamarillas.dyorch.com`** (dominio del usuario, con DNS ya en Cloudflare).

---

## Estado actual

El código está **completo y probado en local**. Lo que falta es **desplegarlo**.

El intento de desplegar con Workers Builds (la integración de Cloudflare con GitHub)
falló y el error nunca se llegó a ver. La sesión anterior corría en la nube, donde
`api.cloudflare.com` está bloqueada por política de red, así que no pudo diagnosticarlo
ni desplegar. **Desde local sí se puede** — ver *Desplegar* más abajo.

Pendientes concretos:

1. Desplegar y conectar el subdominio.
2. El repositorio está **público** y el README documenta que la clave por defecto es
   `admin123`. Antes de que el sitio esté vivo: ponerlo privado, o definir
   `ADMIN_PASSWORD` y `SESSION_SECRET` como secrets del Worker.
3. Verificar en producción que la vista previa de WhatsApp carga (la fuente se baja de
   Google Fonts en la primera petición) y que las métricas registran país y ciudad
   reales — en local Wrangler inventa "Austin".

---

## Arquitectura

Un solo Cloudflare Worker. Sin framework de front: el HTML se genera con template
strings en el servidor y las animaciones son SVG + CSS. Sin build step propio.

- **Hono** para las rutas.
- **D1** (SQLite de Cloudflare) para los datos. Las tablas se crean solas en el primer
  arranque (`ensureSchema`), no hay migraciones que ejecutar.
- **workers-og** para generar la imagen de vista previa de WhatsApp al vuelo.
- **qrcode-svg** para generar los QR en el servidor.

```
src/
  index.ts          rutas: público, panel, métricas, QR, imagen de WhatsApp
  db.ts             consultas a D1 y creación automática de las tablas
  auth.ts           sesión del panel con cookie firmada (HMAC-SHA256)
  slug.ts           generación del código aleatorio y palabras reservadas
  visitor.ts        aparato, ubicación y origen de cada apertura
  og.ts             imagen 1200×630 para la vista previa de WhatsApp
  views/
    card.ts         la página que recibe la persona (el corazón del proyecto)
    flowers.ts      el jardín animado en SVG
    panel.ts        estilos del panel (móvil primero) y formato de fechas
    admin.ts        login y panel
    metrics.ts      página de métricas de un link
    home.ts         portada, error 404 y pantalla de ayuda si falta la D1
```

Rutas: `/` portada · `/admin` panel · `/admin/m/<código>` métricas ·
`/admin/qr/<código>.svg` · `/og/<código>.png` · `/<código>` la página personal.

Tablas: `cards` (slug, name, created_at, views, last_view_at) y `visits` (una fila por
apertura: opened_at, device, country, city, source).

---

## Decisiones ya tomadas

Las acordó el usuario explícitamente. No las cambies sin preguntarle.

- **La URL es un código aleatorio de 6 caracteres**, no el nombre. Fue un requisito
  suyo: no quería `/maria` porque es predecible. Alfabeto de 56 símbolos sin
  caracteres confundibles (sin `0/O`, sin `1/l/I`). **Distingue mayúsculas de
  minúsculas** — eso es lo que sostiene la entropía de un código tan corto.
- **Lo único personalizable es el nombre.** Descartó explícitamente mensaje editable,
  música y foto.
- **Un solo estilo visual**, alegre y apto para cualquier persona (no romántico).
- **El texto de la tarjeta es el "corto y directo"**: *"Porque sí. Porque te lo
  mereces. Porque hoy es un buen día para recordártelo."* Lo eligió entre tres.
- **Todo pensado primero para celular.** Fue un pedido textual suyo. Los estilos del
  panel son móviles por defecto y las media queries solo agregan espacio en pantallas
  grandes — no al revés.
- **Métricas**: hora exacta, aparato, país/ciudad y origen. Horas de Colombia (`TZ` en
  `views/panel.ts`).
- **No hay botón para regenerar el código** de un link. Lo descartó.
- Credenciales por defecto `admin` / `admin123`, sobreescribibles con los secrets
  `ADMIN_USER`, `ADMIN_PASSWORD` y `SESSION_SECRET`.

---

## Trampas conocidas

Cosas que ya costaron un bug y conviene no repetir:

- **En Hono, el patrón `/admin/*` también casa con `/admin`.** Sin excluirlo, la ruta
  redirige a sí misma en bucle. Por eso existe `PUBLIC_ADMIN_PATHS` en `index.ts`.
- **`db.exec()` de D1 separa las sentencias por saltos de línea.** Cada sentencia del
  esquema tiene que ir en una sola línea (ver `STATEMENTS` en `db.ts`).
- **Los fondos con degradado necesitan un `background-color` sólido además del
  `background-image`.** Si no, al desplazarse en páginas más altas que la pantalla
  queda una franja pálida abajo.
- **Los previsualizadores de enlaces se filtran por user-agent** (`looksLikeBot`) para
  que el robot de WhatsApp no infle el contador de aperturas.
- **La mayoría de las aperturas van a aparecer como "directas"** aunque vengan de
  WhatsApp: al abrir desde una app el navegador casi nunca manda el referer. Está
  advertido dentro de la propia página de métricas; no lo presentes como un dato duro.
- **Los links se arman con el dominio de la petición**, no con un valor fijo. Así el
  sitio funciona igual en la URL `.workers.dev` que en el dominio final. `SITE_URL` en
  `wrangler.jsonc` existe solo como override y está comentado a propósito.

---

## Comandos

```bash
npm install
npm run dev      # http://127.0.0.1:8787 — crea una D1 local de prueba
npm run check    # tsc --noEmit + build de prueba de wrangler
npm run deploy   # despliega a Cloudflare
```

En local la clave sigue siendo `admin` / `admin123` y no hay que configurar nada.

### Desplegar

```bash
npx wrangler login    # abre el navegador, no se escribe ninguna clave
npx wrangler deploy
```

Imprime la URL `.workers.dev`, que funciona completa desde el primer momento. El
subdominio se conecta después en el panel del Worker: Settings → Domains & Routes →
Add → Custom domain → `floresamarillas.dyorch.com`.

La base D1 ya está creada en la cuenta y su `database_id` está en `wrangler.jsonc`.

---

## Convenciones

- **Todo el texto visible va en español**, con sus tildes.
- Los comentarios del código van en español **sin tildes ni eñes**, para evitar
  problemas de codificación. Explican *por qué*, no *qué*.
- El HTML se escribe con template strings; todo lo que venga del usuario pasa por
  `esc()` de `views/shared.ts`.
- Las animaciones respetan `prefers-reduced-motion`.
- Las páginas personales llevan `noindex` y `robots.txt` bloquea todo el sitio: son
  links privados que no deben terminar en buscadores.
