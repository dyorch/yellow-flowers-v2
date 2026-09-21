import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import QRCode from 'qrcode-svg'

import type { Env } from './types'
import {
  ensureSchema,
  listCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  registerView,
} from './db'
import {
  SESSION_COOKIE,
  checkCredentials,
  createSessionToken,
  verifySessionToken,
} from './auth'
import { slugify, isReserved, randomSuffix, cleanName } from './slug'
import { cardPage } from './views/card'
import { adminPage, loginPage } from './views/admin'
import { homePage, notFoundPage, setupPage } from './views/home'
import { htmlResponse } from './views/shared'
import { ogImage } from './og'

const app = new Hono<{ Bindings: Env }>()

/** Mensajes de estado del panel. Se pasan por codigo para no inyectar texto libre en la URL. */
const FLASHES: Record<string, { kind: 'ok' | 'error'; message: string }> = {
  creada: { kind: 'ok', message: 'Listo, el link ya funciona. Copialo y compartelo.' },
  actualizada: { kind: 'ok', message: 'Cambios guardados.' },
  borrada: { kind: 'ok', message: 'Link borrado. Ya no abre para nadie.' },
  'error-nombre': { kind: 'error', message: 'Escribe un nombre para poder crear el link.' },
  'error-duplicado': { kind: 'error', message: 'Esa direccion ya esta ocupada por otro link.' },
  'error-reservado': { kind: 'error', message: 'Esa direccion esta reservada por el sistema. Usa otra.' },
  'error-no-encontrada': { kind: 'error', message: 'No encontramos ese link.' },
}

/** URL publica desde la que se sirvio la peticion; SITE_URL solo la sobreescribe si esta definida. */
function siteUrl(requestUrl: string, env: Env): string {
  const configured = env.SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')
  return new URL(requestUrl).origin
}

function isSecureRequest(requestUrl: string): boolean {
  return new URL(requestUrl).protocol === 'https:'
}

/** Los previsualizadores de enlaces no deben contar como visitas reales. */
function looksLikeBot(userAgent: string | undefined): boolean {
  if (!userAgent) return true
  return /bot|crawler|spider|preview|whatsapp|facebookexternalhit|telegram|twitter|slack|discord|embed|curl|wget|headless/i.test(
    userAgent,
  )
}

// La tabla se crea sola la primera vez que se usa la base. Si el Worker todavia
// no tiene D1 conectada, se explica que falta en lugar de devolver un error 500.
app.use('*', async (c, next) => {
  if (!c.env.DB) return htmlResponse(setupPage(), { status: 503 })
  await ensureSchema(c.env.DB)
  await next()
})

/* ------------------------------- publico ------------------------------- */

app.get('/', (c) => htmlResponse(homePage()))

app.get('/robots.txt', (c) =>
  c.text('User-agent: *\nDisallow: /\n', 200, { 'content-type': 'text/plain; charset=utf-8' }),
)

/* ---------------------------------- admin ------------------------------ */

// Ojo: en Hono el patron '/admin/*' tambien casa con '/admin', asi que esa ruta
// se excluye explicitamente (si no, redirigiria a si misma en bucle).
const PUBLIC_ADMIN_PATHS = new Set(['/admin', '/admin/login', '/admin/logout'])

app.use('/admin/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  if (PUBLIC_ADMIN_PATHS.has(path)) return next()
  if (!(await verifySessionToken(c.env, getCookie(c, SESSION_COOKIE)))) return c.redirect('/admin', 302)
  return next()
})

app.get('/admin', async (c) => {
  if (!(await verifySessionToken(c.env, getCookie(c, SESSION_COOKIE)))) {
    return htmlResponse(loginPage({}))
  }
  const cards = await listCards(c.env.DB)
  const flashKey = c.req.query('m') ?? ''
  return htmlResponse(
    adminPage({
      cards,
      siteUrl: siteUrl(c.req.url, c.env),
      flash: FLASHES[flashKey],
    }),
  )
})

app.post('/admin/login', async (c) => {
  const body = await c.req.parseBody()
  const user = String(body.user ?? '')
  const password = String(body.password ?? '')

  if (!checkCredentials(c.env, user, password)) {
    return htmlResponse(loginPage({ error: 'Usuario o clave incorrectos.' }), { status: 401 })
  }

  setCookie(c, SESSION_COOKIE, await createSessionToken(c.env), {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureRequest(c.req.url),
    maxAge: 7 * 24 * 60 * 60,
  })
  return c.redirect('/admin', 302)
})

app.get('/admin/logout', (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: '/', secure: isSecureRequest(c.req.url) })
  return c.redirect('/admin', 302)
})

app.post('/admin/create', async (c) => {
  const body = await c.req.parseBody()
  const name = cleanName(String(body.name ?? ''))
  if (!name) return c.redirect('/admin?m=error-nombre', 302)

  const base = slugify(name) || 'flores'
  let slug = isReserved(base) ? `${base}-${randomSuffix()}` : base

  // Si el slug ya existe se le agrega un sufijo corto hasta encontrar uno libre.
  for (let attempt = 0; attempt < 8 && (await getCard(c.env.DB, slug)); attempt++) {
    slug = `${base}-${randomSuffix(attempt < 4 ? 3 : 5)}`
  }
  if (await getCard(c.env.DB, slug)) return c.redirect('/admin?m=error-duplicado', 302)

  await createCard(c.env.DB, slug, name)
  return c.redirect('/admin?m=creada', 302)
})

app.post('/admin/update', async (c) => {
  const body = await c.req.parseBody()
  const slug = String(body.slug ?? '')
  const name = cleanName(String(body.name ?? ''))
  const newSlug = slugify(String(body.newSlug ?? ''))

  if (!name || !newSlug) return c.redirect('/admin?m=error-nombre', 302)
  if (isReserved(newSlug)) return c.redirect('/admin?m=error-reservado', 302)
  if (!(await getCard(c.env.DB, slug))) return c.redirect('/admin?m=error-no-encontrada', 302)
  if (newSlug !== slug && (await getCard(c.env.DB, newSlug))) {
    return c.redirect('/admin?m=error-duplicado', 302)
  }

  await updateCard(c.env.DB, slug, { slug: newSlug, name })
  return c.redirect('/admin?m=actualizada', 302)
})

app.post('/admin/delete', async (c) => {
  const body = await c.req.parseBody()
  const slug = String(body.slug ?? '')
  if (slug) await deleteCard(c.env.DB, slug)
  return c.redirect('/admin?m=borrada', 302)
})

app.get('/admin/qr/:file', async (c) => {
  const slug = c.req.param('file').replace(/\.svg$/i, '')
  const card = await getCard(c.env.DB, slug)
  if (!card) return c.notFound()

  const svg = new QRCode({
    content: `${siteUrl(c.req.url, c.env)}/${card.slug}`,
    padding: 2,
    width: 320,
    height: 320,
    color: '#4A2E05',
    background: '#FFFFFF',
    ecl: 'M',
    join: true,
  }).svg()

  return c.body(svg, 200, {
    'content-type': 'image/svg+xml; charset=utf-8',
    'cache-control': 'no-store',
  })
})

/* ------------------------ imagen para WhatsApp ------------------------- */

app.get('/og/:file', async (c) => {
  const slug = c.req.param('file').replace(/\.png$/i, '')
  const card = await getCard(c.env.DB, slug)
  if (!card) return c.notFound()
  return await ogImage(card.name, card.slug)
})

/* --------------------------- pagina personal --------------------------- */

app.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const card = await getCard(c.env.DB, slug)
  if (!card) return htmlResponse(notFoundPage(), { status: 404 })

  // El contador se actualiza despues de responder, para no demorar la pagina.
  if (!looksLikeBot(c.req.header('user-agent'))) {
    c.executionCtx.waitUntil(registerView(c.env.DB, slug))
  }

  return htmlResponse(cardPage({ name: card.name, slug: card.slug, siteUrl: siteUrl(c.req.url, c.env) }))
})

app.notFound((c) => htmlResponse(notFoundPage(), { status: 404 }))

export default app
