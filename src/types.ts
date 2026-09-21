export interface Env {
  DB: D1Database
  /** URL publica del sitio, usada para construir links absolutos (Open Graph, QR, compartir). */
  SITE_URL?: string
  /** Usuario del panel. Por defecto: admin */
  ADMIN_USER?: string
  /** Clave del panel. Por defecto: admin123. Conviene definirla como secret en Cloudflare. */
  ADMIN_PASSWORD?: string
  /** Clave con la que se firma la cookie de sesion. Conviene definirla como secret. */
  SESSION_SECRET?: string
}

export interface Card {
  slug: string
  name: string
  created_at: number
  views: number
  last_view_at: number | null
}
