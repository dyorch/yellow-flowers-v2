# 🌻 Flores amarillas

Crea links personalizados que le regalan a una persona una página animada con flores
amarillas y su nombre. Pensado para `floresamarillas.dyorch.com`.

- **`/`** — portada. No muestra ningún link: solo se llega a ellos con la dirección exacta.
- **`/admin`** — panel privado para crear, editar, copiar y borrar links, y ver sus métricas.
- **`/k7Mx2q`** — la página que recibe quien abre el link.

La dirección es un **código aleatorio de 6 caracteres**, no el nombre de la persona.
Son más de 30.000 millones de combinaciones: nadie puede llegar a un link probando
nombres. El código distingue mayúsculas de minúsculas.

Todo está diseñado primero para celular, que es donde se abren estos links. Corre en
un Cloudflare Worker con una base D1: no hay servidores ni costos, entra de sobra en
el plan gratuito.

---

## 1. Crear la base de datos

En el panel de Cloudflare:

1. **Storage & Databases → D1 SQL Database → Create**
2. Nombre: `flores-amarillas`
3. Copia el **Database ID** que aparece al crearla.
4. Abre `wrangler.jsonc` en este repositorio y reemplaza `PEGA_AQUI_TU_DATABASE_ID`
   por ese identificador. Guarda el cambio.

> Las tablas se crean solas la primera vez que alguien entra al sitio. No hay que
> ejecutar migraciones a mano.

## 2. Publicar el Worker desde GitHub

1. **Workers & Pages → Create → Workers → Import a repository**
2. Elige este repositorio y la rama que quieras publicar.
3. Cloudflare detecta `wrangler.jsonc` y usa `npx wrangler deploy`. Dale **Deploy**.

Desde ahí, cada push a esa rama vuelve a publicar el sitio solo.

## 3. Conectar el subdominio

En el Worker recién creado: **Settings → Domains & Routes → Add → Custom domain**
y escribe `floresamarillas.dyorch.com`.

Como `dyorch.com` ya tiene su DNS en Cloudflare, el registro se crea solo y el
certificado HTTPS queda listo en un par de minutos.

## 4. Cambiar la clave del panel

Por defecto entra con **`admin` / `admin123`**. Para cambiarla sin tocar el código,
en el Worker: **Settings → Variables and Secrets → Add**, tipo *Secret*:

| Nombre | Para qué sirve |
| --- | --- |
| `ADMIN_USER` | Usuario del panel (por defecto `admin`) |
| `ADMIN_PASSWORD` | Clave del panel (por defecto `admin123`) |
| `SESSION_SECRET` | Texto largo y aleatorio con el que se firma la cookie de sesión |

> `admin123` es fácil de adivinar. Como el panel solo sirve para crear tarjetas,
> el riesgo es bajo, pero si el sitio queda público conviene cambiar al menos
> `ADMIN_PASSWORD` y definir `SESSION_SECRET`.

---

## Cómo se usa

1. Entra a `floresamarillas.dyorch.com/admin` y escribe tu usuario y clave.
2. Escribe el nombre de la persona y dale **Crear flores**.
3. Se genera una dirección con un código al azar, por ejemplo `/k7Mx2q`. El nombre
   queda guardado aparte y solo se ve dentro de la página.
4. Copia el link, o muestra el **QR** si quieres imprimirlo o mostrarlo en pantalla.

Al pegar el link en WhatsApp aparece una vista previa con el nombre de la persona
sobre un campo de flores. Esa imagen se genera al vuelo en `/og/<codigo>.png`.

## Métricas

Cada link tiene su página de **Métricas** en el panel, con:

- Cuántas veces se abrió en total, y cuándo fue la última.
- Gráfica de los últimos 14 días y otra de a qué hora del día la abren.
- Desde qué aparato (celular, tablet, computador), desde dónde (país y ciudad
  aproximados que entrega Cloudflare) y de dónde llegaron.
- El historial de las últimas aperturas, una por una, con fecha y hora.

Las horas se muestran en **hora de Colombia (UTC-5)**; para cambiarlo, edita `TZ`
en `src/views/panel.ts`.

Dos advertencias sobre cómo leer estos números:

- Los previsualizadores de enlaces (el robot de WhatsApp, Telegram, etc.) están
  filtrados y no cuentan como aperturas.
- Cuando alguien abre el link desde una app, el navegador casi nunca informa el
  origen. Por eso la mayoría de las aperturas reales aparecen como **directas**,
  aunque hayan venido de WhatsApp.

## Qué ve la persona

1. Un sobre cerrado que flota, con su nombre: *"tienes algo para ti, María José"*.
2. Al tocarlo, el sobre se abre, sale una carta y estalla una nube de pétalos.
3. Aparece su nombre en grande con brillo dorado, el mensaje, y un campo de flores
   amarillas que crecen desde abajo y se mecen con el viento.
4. Llueven pétalos todo el tiempo; si toca la pantalla, salen más desde su dedo.
5. Puede compartir el link o volver a ver la animación.

El jardín se genera a partir del link, así que cada persona tiene un ramo distinto
—siempre el mismo cada vez que lo abre.

---

## Desarrollo local

```bash
npm install
npm run dev      # http://127.0.0.1:8787
npm run check    # typecheck + build de prueba
```

En local no hace falta configurar nada: Wrangler crea una base D1 de prueba y la
clave sigue siendo `admin` / `admin123`.

## Estructura

```
src/
  index.ts          rutas (público, panel, métricas, QR, imagen de WhatsApp)
  db.ts             consultas a D1 y creación automática de las tablas
  auth.ts           sesión del panel con cookie firmada (HMAC)
  slug.ts           generación del código aleatorio y palabras reservadas
  visitor.ts        aparato, ubicación y origen de cada apertura
  og.ts             imagen 1200×630 para la vista previa de WhatsApp
  views/
    card.ts         la página que recibe la persona
    flowers.ts      el jardín animado en SVG
    panel.ts        estilos del panel (móvil primero) y formato de fechas
    admin.ts        login y panel
    metrics.ts      página de métricas de un link
    home.ts         portada, error 404 y ayuda de instalación
```
