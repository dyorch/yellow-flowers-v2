import { ImageResponse, loadGoogleFont } from 'workers-og'
import { makeRandom, hashString } from './views/shared'

interface FontDef {
  name: string
  data: ArrayBuffer
  weight: 400 | 600 | 900
  style: 'normal'
}

// Las fuentes se descargan una vez por isolate (y quedan en caches.default).
let fontsPromise: Promise<FontDef[]> | null = null

function loadFonts(): Promise<FontDef[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadGoogleFont({ family: 'Playfair Display', weight: 900 }),
      loadGoogleFont({ family: 'Quicksand', weight: 600 }),
    ])
      .then(([playfair, quicksand]): FontDef[] => [
        { name: 'Playfair', data: playfair, weight: 900, style: 'normal' },
        { name: 'Quicksand', data: quicksand, weight: 600, style: 'normal' },
      ])
      .catch((err) => {
        fontsPromise = null
        throw err
      })
  }
  return fontsPromise
}

const PALETTES = [
  { light: '#FFF06A', dark: '#FFC400', inner: '#FFB300', center: '#7C4B22' },
  { light: '#FFE14D', dark: '#F7A600', inner: '#E89400', center: '#6E4018' },
  { light: '#FFD84D', dark: '#FF9F1C', inner: '#F08A00', center: '#8B5E34' },
]

/** Flor estatica para el fondo de la imagen, sin animaciones. */
function ogFlower(id: number, x: number, y: number, scale: number, petals: number): string {
  const p = PALETTES[id % PALETTES.length]
  const ring: string[] = []
  for (let i = 0; i < petals; i++) {
    const angle = ((360 / petals) * i).toFixed(1)
    ring.push(`<ellipse cx="0" cy="-38" rx="10" ry="30" fill="url(#pg${id})" transform="rotate(${angle})"/>`)
  }
  for (let i = 0; i < petals; i++) {
    const angle = ((360 / petals) * i + 180 / petals).toFixed(1)
    ring.push(`<ellipse cx="0" cy="-26" rx="7" ry="20" fill="${p.inner}" transform="rotate(${angle})"/>`)
  }
  return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${scale.toFixed(2)})">
    <path d="M0 0 Q${(Math.sin(id) * 26).toFixed(0)} 150 0 320" stroke="#4C9A2A" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M0 110 C-20 94 -42 100 -47 120 C-30 134 -8 128 0 110 Z" fill="#5FA22F"/>
    <path d="M0 158 C20 142 42 148 47 168 C30 182 8 176 0 158 Z" fill="#4E8C26"/>
    <g>${ring.join('')}
      <circle r="23" fill="${p.center}"/>
      <circle r="23" fill="none" stroke="${p.inner}" stroke-width="3" opacity=".75"/>
      <circle cx="-8" cy="-8" r="6" fill="#ffffff" opacity=".14"/>
    </g>
  </g>`
}

/** Fondo completo de la imagen: cielo, rayos, petalos sueltos y un ramo abajo. */
function backgroundSvg(seed: number): string {
  const rand = makeRandom(seed)

  const rays: string[] = []
  for (let i = 0; i < 22; i++) {
    const angle = (360 / 22) * i
    rays.push(
      `<rect x="-7" y="0" width="14" height="820" fill="#FFFFFF" opacity=".16" transform="rotate(${angle.toFixed(1)})"/>`,
    )
  }

  const flowers: string[] = []
  const count = 9
  for (let i = 0; i < count; i++) {
    const x = 60 + ((1200 - 120) / (count - 1)) * i + (rand() - 0.5) * 34
    const y = 458 + rand() * 72
    const scale = 0.72 + rand() * 0.55
    flowers.push(ogFlower(i, x, y, scale, 12 + Math.floor(rand() * 4)))
  }

  const loose: string[] = []
  for (let i = 0; i < 16; i++) {
    const x = rand() * 1200
    const y = 40 + rand() * 380
    const r = (rand() * 360).toFixed(0)
    const s = (0.5 + rand() * 0.7).toFixed(2)
    loose.push(
      `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(11 * Number(s)).toFixed(1)}" ry="${(24 * Number(s)).toFixed(1)}" fill="#FFD86B" opacity="${(0.28 + rand() * 0.3).toFixed(2)}" transform="rotate(${r} ${x.toFixed(0)} ${y.toFixed(0)})"/>`,
    )
  }

  // Cada flor referencia el gradiente de su propio indice.
  const flowerGradients = Array.from({ length: count }, (_, i) => {
    const p = PALETTES[i % PALETTES.length]
    return `<linearGradient id="pg${i}" x1="0" y1="-68" x2="0" y2="-8" gradientUnits="userSpaceOnUse"><stop stop-color="${p.light}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="630" gradientUnits="userSpaceOnUse">
    <stop stop-color="#FFF8D8"/><stop offset=".42" stop-color="#FFE293"/><stop offset="1" stop-color="#FFC153"/>
  </linearGradient>
  <radialGradient id="glow" cx=".5" cy=".1" r=".7">
    <stop stop-color="#FFFEF4" stop-opacity=".95"/><stop offset="1" stop-color="#FFFEF4" stop-opacity="0"/>
  </radialGradient>
  ${flowerGradients}
</defs>
<rect width="1200" height="630" fill="url(#sky)"/>
<g transform="translate(600 60)">${rays.join('')}</g>
<rect width="1200" height="630" fill="url(#glow)"/>
${loose.join('')}
${flowers.join('')}
</svg>`
}

function nameFontSize(name: string): number {
  const length = [...name].length
  if (length <= 7) return 136
  if (length <= 11) return 112
  if (length <= 16) return 86
  if (length <= 24) return 66
  return 52
}

/** Imagen 1200x630 que WhatsApp, Telegram y demas muestran al pegar el link. */
export async function ogImage(name: string, slug: string): Promise<Response> {
  const fonts = await loadFonts()
  const background = `data:image/svg+xml;base64,${btoa(backgroundSvg(hashString(slug)))}`
  const safe = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const markup = `<div style="display:flex;position:relative;width:1200px;height:630px;">
  <img src="${background}" width="1200" height="630" style="position:absolute;top:0;left:0;" />
  <div style="display:flex;flex-direction:column;align-items:center;width:1200px;height:630px;padding-top:74px;">
    <div style="display:flex;font-family:Quicksand;font-size:32px;letter-spacing:10px;color:#8A5510;">PARA TI</div>
    <div style="display:flex;font-family:Playfair;font-size:${nameFontSize(name)}px;color:#7A3A00;margin-top:8px;text-align:center;">${safe}</div>
    <div style="display:flex;font-family:Quicksand;font-size:38px;color:#6B3F04;margin-top:18px;text-align:center;">estas flores amarillas son para ti</div>
  </div>
</div>`

  return new ImageResponse(markup, {
    width: 1200,
    height: 630,
    fonts,
    headers: {
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
