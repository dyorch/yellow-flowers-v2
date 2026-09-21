/** Datos de una apertura, deducidos de la peticion. */
export interface VisitContext {
  device: string
  country: string | null
  city: string | null
  source: string
}

function detectDevice(userAgent: string): string {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(userAgent)) return 'tablet'
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(userAgent)) return 'celular'
  if (!userAgent) return 'desconocido'
  return 'computador'
}

/**
 * De donde llego la visita. Ojo: cuando alguien abre el link desde una app
 * (WhatsApp, Instagram) el navegador casi nunca envia el origen, asi que la
 * mayoria de las aperturas reales apareceran como 'directo'.
 */
function detectSource(referer: string | undefined): string {
  if (!referer) return 'directo'
  let host: string
  try {
    host = new URL(referer).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return 'otro'
  }
  if (host.includes('whatsapp')) return 'whatsapp'
  if (host.includes('instagram')) return 'instagram'
  if (host.includes('facebook') || host === 'm.me' || host.includes('messenger')) return 'facebook'
  if (host.includes('t.me') || host.includes('telegram')) return 'telegram'
  if (host.includes('tiktok')) return 'tiktok'
  if (host.includes('google')) return 'google'
  if (host.includes('x.com') || host.includes('twitter') || host === 't.co') return 'x'
  return host.slice(0, 40)
}

export function readVisitContext(request: Request): VisitContext {
  // Cloudflare agrega la ubicacion aproximada a cada peticion; en local viene vacia.
  const cf = request.cf as { country?: string; city?: string } | undefined
  const country = typeof cf?.country === 'string' ? cf.country : null
  const city = typeof cf?.city === 'string' ? cf.city : null

  return {
    device: detectDevice(request.headers.get('user-agent') ?? ''),
    country,
    city,
    source: detectSource(request.headers.get('referer') ?? undefined),
  }
}
