/** Rutas que no pueden usarse como slug porque ya las ocupa la aplicacion. */
const RESERVED = new Set([
  'admin',
  'api',
  'og',
  'login',
  'logout',
  'static',
  'assets',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'health',
])

/**
 * Convierte un nombre en un slug de URL: minusculas, sin tildes ni enies,
 * con guiones en lugar de espacios. "María José" -> "maria-jose"
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function isReserved(slug: string): boolean {
  return RESERVED.has(slug)
}

/** Sufijo corto y legible para desempatar slugs repetidos: "maria-7k2" */
export function randomSuffix(length = 3): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

/** Normaliza el nombre visible: recorta espacios sobrantes y limita el largo. */
export function cleanName(input: string): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, 40)
}
