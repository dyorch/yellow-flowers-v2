import type { Card, Visit } from './types'
import type { VisitContext } from './visitor'

/**
 * Cada sentencia va en una sola linea: D1 separa por saltos de linea
 * las instrucciones que recibe en exec().
 */
const STATEMENTS = [
  'CREATE TABLE IF NOT EXISTS cards (slug TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL, views INTEGER NOT NULL DEFAULT 0, last_view_at INTEGER)',
  'CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL, opened_at INTEGER NOT NULL, device TEXT, country TEXT, city TEXT, source TEXT)',
  'CREATE INDEX IF NOT EXISTS idx_visits_slug_time ON visits (slug, opened_at DESC)',
]

// La migracion corre una sola vez por isolate; no hace falta ejecutar comandos
// manualmente al desplegar.
let schemaReady: Promise<void> | null = null

export function ensureSchema(db: D1Database): Promise<void> {
  if (!schemaReady) {
    schemaReady = db
      .exec(STATEMENTS.join('\n'))
      .then(() => undefined)
      .catch((err) => {
        // Si falla se reintenta en la siguiente peticion en lugar de quedar
        // cacheado un estado roto.
        schemaReady = null
        throw err
      })
  }
  return schemaReady
}

export async function listCards(db: D1Database): Promise<Card[]> {
  const { results } = await db
    .prepare('SELECT slug, name, created_at, views, last_view_at FROM cards ORDER BY created_at DESC')
    .all<Card>()
  return results ?? []
}

export async function getCard(db: D1Database, slug: string): Promise<Card | null> {
  return await db
    .prepare('SELECT slug, name, created_at, views, last_view_at FROM cards WHERE slug = ?')
    .bind(slug)
    .first<Card>()
}

export async function createCard(db: D1Database, slug: string, name: string): Promise<void> {
  await db
    .prepare('INSERT INTO cards (slug, name, created_at, views) VALUES (?, ?, ?, 0)')
    .bind(slug, name, Date.now())
    .run()
}

export async function renameCard(db: D1Database, slug: string, name: string): Promise<void> {
  await db.prepare('UPDATE cards SET name = ? WHERE slug = ?').bind(name, slug).run()
}

export async function deleteCard(db: D1Database, slug: string): Promise<void> {
  await db.batch([
    db.prepare('DELETE FROM visits WHERE slug = ?').bind(slug),
    db.prepare('DELETE FROM cards WHERE slug = ?').bind(slug),
  ])
}

/** Registra una apertura: suma al contador y guarda la fila con hora y contexto. */
export async function recordVisit(
  db: D1Database,
  slug: string,
  context: VisitContext,
): Promise<void> {
  const now = Date.now()
  await db.batch([
    db.prepare('UPDATE cards SET views = views + 1, last_view_at = ? WHERE slug = ?').bind(now, slug),
    db
      .prepare(
        'INSERT INTO visits (slug, opened_at, device, country, city, source) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(slug, now, context.device, context.country, context.city, context.source),
  ])
}

/**
 * Aperturas mas recientes de un link. El total exacto se lee de cards.views,
 * asi que aqui basta con un tope generoso para armar los desgloses.
 */
export async function listVisits(db: D1Database, slug: string, limit = 2000): Promise<Visit[]> {
  const { results } = await db
    .prepare(
      'SELECT opened_at, device, country, city, source FROM visits WHERE slug = ? ORDER BY opened_at DESC LIMIT ?',
    )
    .bind(slug, limit)
    .all<Visit>()
  return results ?? []
}
