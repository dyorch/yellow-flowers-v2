/**
 * Rutas que no pueden usarse como codigo porque ya las ocupa la aplicacion.
 * Con codigos de 6 caracteres solo pueden chocar las de ese mismo largo,
 * pero se revisan todas por si el largo cambia mas adelante.
 */
const RESERVED = new Set([
  'admin',
  'api',
  'og',
  'login',
  'logout',
  'static',
  'assets',
  'health',
  'robots',
  'sitemap',
])

/**
 * Alfabeto sin caracteres que se confunden entre si (0/O, 1/l/I).
 * 56 simbolos: con 6 caracteres dan mas de 30.000 millones de combinaciones.
 */
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const CODE_LENGTH = 6

/**
 * Genera el codigo de la URL. Es aleatorio a proposito: el link no se deduce
 * del nombre de la persona, asi que nadie puede llegar a el adivinando.
 */
export function makeCode(length = CODE_LENGTH): string {
  // Se descarta el sobrante del byte para que todos los simbolos sean
  // igual de probables (un modulo directo favoreceria a los primeros).
  const limit = 256 - (256 % ALPHABET.length)
  const code: string[] = []
  while (code.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    for (const byte of bytes) {
      if (byte < limit && code.length < length) code.push(ALPHABET[byte % ALPHABET.length])
    }
  }
  return code.join('')
}

export function isReserved(code: string): boolean {
  return RESERVED.has(code.toLowerCase())
}

/** Normaliza el nombre visible: recorta espacios sobrantes y limita el largo. */
export function cleanName(input: string): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, 40)
}
