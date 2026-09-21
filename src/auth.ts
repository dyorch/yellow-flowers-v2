import type { Env } from './types'

export const SESSION_COOKIE = 'fa_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

const DEFAULT_USER = 'admin'
const DEFAULT_PASSWORD = 'admin123'
const DEFAULT_SECRET = 'flores-amarillas-dev-secret'

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(env: Env, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.SESSION_SECRET || DEFAULT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return toBase64Url(new Uint8Array(signature))
}

/** Comparacion de strings en tiempo constante, para no filtrar informacion por timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function checkCredentials(env: Env, user: string, password: string): boolean {
  const expectedUser = env.ADMIN_USER || DEFAULT_USER
  const expectedPassword = env.ADMIN_PASSWORD || DEFAULT_PASSWORD
  // Se evaluan ambas comparaciones siempre para que el tiempo de respuesta no
  // revele cual de las dos fallo.
  const userOk = safeEqual(user, expectedUser)
  const passwordOk = safeEqual(password, expectedPassword)
  return userOk && passwordOk
}

export async function createSessionToken(env: Env): Promise<string> {
  const expiresAt = String(Date.now() + SESSION_TTL_MS)
  return `${expiresAt}.${await sign(env, expiresAt)}`
}

export async function verifySessionToken(env: Env, token: string | undefined): Promise<boolean> {
  if (!token) return false
  const separator = token.indexOf('.')
  if (separator < 1) return false
  const expiresAt = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  if (!/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) < Date.now()) return false
  return safeEqual(signature, await sign(env, expiresAt))
}
