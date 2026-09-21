import { esc } from './shared'
import { PANEL_STYLES, panelHead, formatDateTime, formatDate, TZ } from './panel'
import type { Card, Visit } from '../types'

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const hourFormat = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false })
const dayLabelFormat = new Intl.DateTimeFormat('es-CO', { timeZone: TZ, day: 'numeric' })

let regionNames: Intl.DisplayNames | null = null
function countryName(code: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(['es'], { type: 'region' })
    return regionNames.of(code) ?? code
  } catch {
    return code
  }
}

const DEVICE_LABELS: Record<string, string> = {
  celular: 'Celular',
  tablet: 'Tablet',
  computador: 'Computador',
  desconocido: 'Sin identificar',
}

const SOURCE_LABELS: Record<string, string> = {
  directo: 'Directo o desde una app',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  telegram: 'Telegram',
  tiktok: 'TikTok',
  google: 'Google',
  x: 'X',
  otro: 'Otro',
}

function countBy(visits: Visit[], read: (visit: Visit) => string): [string, number][] {
  const tally = new Map<string, number>()
  for (const visit of visits) {
    const key = read(visit)
    tally.set(key, (tally.get(key) ?? 0) + 1)
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1])
}

function breakdown(title: string, rows: [string, number][], total: number, note?: string): string {
  if (rows.length === 0) return ''
  const items = rows
    .slice(0, 6)
    .map(([label, count]) => {
      const percent = total > 0 ? Math.round((count / total) * 100) : 0
      return `<div class="brk">
      <div class="brk__row"><span class="brk__name">${esc(label)}</span><span class="brk__val">${count} · ${percent}%</span></div>
      <div class="brk__track"><div class="brk__fill" style="width:${percent}%"></div></div>
    </div>`
    })
    .join('\n')
  return `<div class="card">
  <h2 class="h">${esc(title)}</h2>
  ${items}
  ${note ? `<p class="note">${esc(note)}</p>` : ''}
</div>`
}

/** Grafica de barras simple, sin librerias: una columna por periodo. */
function barChart(columns: { label: string; value: number; title: string }[], showValues: boolean): string {
  const max = Math.max(1, ...columns.map((column) => column.value))
  const bars = columns
    .map((column) => {
      const height = Math.round((column.value / max) * 100)
      return `<div class="chart__col" title="${esc(column.title)}">
      ${showValues ? `<span class="chart__count">${column.value || ''}</span>` : ''}
      <div class="chart__bar" style="height:${column.value === 0 ? 2 : Math.max(6, height)}%"></div>
      <span class="chart__label">${esc(column.label)}</span>
    </div>`
    })
    .join('\n')
  return `<div class="chart">${bars}</div>`
}

export function metricsPage(opts: { card: Card; visits: Visit[]; siteUrl: string }): string {
  const { card, visits, siteUrl } = opts
  const url = `${siteUrl}/${card.slug}`
  const total = card.views

  // Aperturas de los ultimos 14 dias, en hora de Colombia.
  const perDay = new Map<string, number>()
  for (const visit of visits) {
    const key = dayKeyFormat.format(new Date(visit.opened_at))
    perDay.set(key, (perDay.get(key) ?? 0) + 1)
  }
  const days: { label: string; value: number; title: string }[] = []
  for (let back = 13; back >= 0; back--) {
    const moment = new Date(Date.now() - back * 86400000)
    const key = dayKeyFormat.format(moment)
    const value = perDay.get(key) ?? 0
    days.push({
      label: dayLabelFormat.format(moment),
      value,
      title: `${formatDate(moment.getTime())}: ${value} ${value === 1 ? 'apertura' : 'aperturas'}`,
    })
  }

  // Aperturas por hora del dia.
  const perHour = new Array<number>(24).fill(0)
  for (const visit of visits) {
    const hour = Number(hourFormat.format(new Date(visit.opened_at)))
    if (Number.isInteger(hour) && hour >= 0 && hour < 24) perHour[hour]++
  }
  const hours = perHour.map((value, hour) => ({
    label: hour % 3 === 0 ? String(hour) : '',
    value,
    title: `${hour}:00 a ${hour}:59 · ${value} ${value === 1 ? 'apertura' : 'aperturas'}`,
  }))

  const devices = countBy(visits, (visit) => DEVICE_LABELS[visit.device ?? ''] ?? 'Sin identificar')
  const sources = countBy(visits, (visit) => SOURCE_LABELS[visit.source ?? ''] ?? visit.source ?? 'Otro')
  const places = countBy(visits, (visit) => {
    if (!visit.country) return 'Sin identificar'
    const country = countryName(visit.country)
    return visit.city ? `${visit.city}, ${country}` : country
  })

  const history = visits
    .slice(0, 50)
    .map((visit) => {
      const meta = [
        DEVICE_LABELS[visit.device ?? ''] ?? null,
        visit.city ?? (visit.country ? countryName(visit.country) : null),
        visit.source && visit.source !== 'directo' ? SOURCE_LABELS[visit.source] ?? visit.source : null,
      ]
        .filter(Boolean)
        .join(' · ')
      return `<li class="hist__item">
      <span class="hist__when">${esc(formatDateTime(visit.opened_at))}</span>
      ${meta ? `<span class="hist__meta">${esc(meta)}</span>` : ''}
    </li>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="es">
<head>
${panelHead(`${card.name} | Metricas`)}
<style>${PANEL_STYLES}
.h{font-size:1.05rem;margin-bottom:12px}
.hero{text-align:center}
.hero__name{font-size:1.5rem;margin-bottom:4px}
.hero__link{display:inline-block;font-size:.84rem;word-break:break-all;margin-bottom:16px}
.big{font-family:'Playfair Display',serif;font-weight:900;font-size:3.4rem;line-height:1;color:#B96D00}
.big__label{font-size:.82rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8A5510;margin-top:2px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
.pair div{background:rgba(255,246,214,.7);border-radius:13px;padding:11px 12px}
.pair dt{font-size:.7rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#8A5510}
.pair dd{margin:3px 0 0;font-size:.92rem;font-weight:600}

.chart{display:flex;align-items:flex-end;gap:3px;height:132px;margin-top:6px}
.chart__col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;min-width:0;height:100%}
.chart__bar{width:100%;max-width:26px;border-radius:5px 5px 2px 2px;
  background:linear-gradient(180deg,#FFC94D,#F08A00);box-shadow:0 2px 5px rgba(200,120,0,.2)}
.chart__count{font-size:.62rem;font-weight:700;color:#8A5510;height:11px}
.chart__label{font-size:.62rem;font-weight:700;color:#8A5510;height:12px}

.brk+.brk{margin-top:11px}
.brk__row{display:flex;justify-content:space-between;gap:10px;font-size:.9rem;margin-bottom:5px}
.brk__name{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.brk__val{font-weight:700;color:#8A5510;white-space:nowrap;font-size:.84rem}
.brk__track{height:8px;border-radius:99px;background:rgba(180,120,20,.16);overflow:hidden}
.brk__fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#FFC400,#F08A00)}
.note{font-size:.79rem;color:#8A5510;margin:14px 0 0;line-height:1.5}

.hist{list-style:none;padding:0;margin:0}
.hist__item{display:flex;justify-content:space-between;align-items:baseline;gap:10px;
  padding:10px 0;border-bottom:1px dashed rgba(180,120,20,.22)}
.hist__item:last-child{border-bottom:0}
.hist__when{font-weight:700;font-size:.9rem;white-space:nowrap}
.hist__meta{font-size:.78rem;color:#8A5510;text-align:right}
.empty{text-align:center;color:#8A5510;padding:26px 10px}

@media (min-width:640px){
  .hero__name{font-size:2rem}
  .big{font-size:4.2rem}
  .pair{grid-template-columns:repeat(2,1fr)}
  .chart{height:160px}
}
</style>
</head>
<body>
<div class="wrap">
  <a class="back" href="/admin">← Volver al panel</a>

  <div class="card hero">
    <h1 class="hero__name">${esc(card.name)}</h1>
    <a class="hero__link" href="/${encodeURIComponent(card.slug)}" target="_blank" rel="noopener">${esc(url)}</a>
    <div class="big">${total}</div>
    <div class="big__label">${total === 1 ? 'apertura' : 'aperturas'}</div>
    <dl class="pair">
      <div><dt>Creado</dt><dd>${esc(formatDate(card.created_at))}</dd></div>
      <div><dt>Última vez</dt><dd>${card.last_view_at ? esc(formatDateTime(card.last_view_at)) : 'Nunca'}</dd></div>
    </dl>
  </div>

  ${
    total === 0
      ? `<div class="card empty">Todavía nadie ha abierto este link.<br>Cuando lo hagan, aquí verás cuándo y desde dónde.</div>`
      : `<div class="card">
    <h2 class="h">Últimos 14 días</h2>
    ${barChart(days, true)}
  </div>

  <div class="card">
    <h2 class="h">A qué hora la abren</h2>
    ${barChart(hours, false)}
    <p class="note">Horas de Colombia (UTC-5).</p>
  </div>

  ${breakdown('Desde qué aparato', devices, visits.length)}
  ${breakdown('De dónde llegaron', sources, visits.length, 'Cuando alguien abre el link desde una app como WhatsApp, el navegador casi nunca informa el origen: esas aperturas aparecen como directas.')}
  ${breakdown('Desde dónde', places, visits.length, 'Ubicación aproximada que entrega Cloudflare con cada visita.')}

  <div class="card">
    <h2 class="h">Historial</h2>
    <ul class="hist">${history}</ul>
    ${total > visits.length ? `<p class="note">Se muestran las ${visits.length} aperturas más recientes de ${total} en total.</p>` : ''}
  </div>`
  }
</div>
</body>
</html>`
}
