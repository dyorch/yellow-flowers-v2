import type { Card } from './types'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS cards (
  slug          TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  views         INTEGER NOT NULL DEFAULT 0,
  last_view_at  INTEGER
);
`

// La migracion corre una sola vez por isolate; no hace falta ejecutar comandos
// manualmente al desplegar.
let schemaReady: Promise<void> | null = null

export function ensureSchema(db: D1Database): Promise<void> {
  if (!schemaReady) {
    schemaReady = db
      .exec(SCHEMA.replace(/\n/g, ' ').trim())
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

export async function updateCard(
  db: D1Database,
  slug: string,
  next: { slug: string; name: string },
): Promise<void> {
  await db
    .prepare('UPDATE cards SET slug = ?, name = ? WHERE slug = ?')
    .bind(next.slug, next.name, slug)
    .run()
}

export async function deleteCard(db: D1Database, slug: string): Promise<void> {
  await db.prepare('DELETE FROM cards WHERE slug = ?').bind(slug).run()
}

export async function registerView(db: D1Database, slug: string): Promise<void> {
  await db
    .prepare('UPDATE cards SET views = views + 1, last_view_at = ? WHERE slug = ?')
    .bind(Date.now(), slug)
    .run()
}
