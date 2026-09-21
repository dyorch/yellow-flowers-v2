import { makeRandom } from './shared'

interface Palette {
  petalLight: string
  petalDark: string
  petalInner: string
  centerOuter: string
  centerInner: string
}

/** Variaciones de amarillo, de mas claro a mas intenso. */
const PALETTES: Palette[] = [
  { petalLight: '#FFF06A', petalDark: '#FFC400', petalInner: '#FFB300', centerOuter: '#8A5A2B', centerInner: '#5A3517' },
  { petalLight: '#FFE14D', petalDark: '#F7A600', petalInner: '#E89400', centerOuter: '#7C4B22', centerInner: '#4E2C11' },
  { petalLight: '#FFD84D', petalDark: '#FF9F1C', petalInner: '#F08A00', centerOuter: '#8B5E34', centerInner: '#553413' },
  { petalLight: '#FFF7A8', petalDark: '#FFD230', petalInner: '#F5BC00', centerOuter: '#946131', centerInner: '#5E3A18' },
]

interface FlowerSpec {
  id: number
  palette: Palette
  petals: number
  bend: number
  leaves: 'left' | 'right' | 'both'
}

/**
 * Dibuja una flor completa (tallo, hojas y corola) en un SVG de 120x320.
 * El tallo se dibuja de abajo hacia arriba para poder animarlo con
 * stroke-dashoffset, como si creciera.
 */
function flowerSvg(spec: FlowerSpec): string {
  const { id, palette, petals, bend, leaves } = spec
  const cx = 60
  const cy = 92

  const outer: string[] = []
  const inner: string[] = []
  for (let i = 0; i < petals; i++) {
    const angle = (360 / petals) * i
    outer.push(
      `<ellipse cx="${cx}" cy="54" rx="10" ry="30" fill="url(#petal-${id})" transform="rotate(${angle.toFixed(1)} ${cx} ${cy})"/>`,
    )
  }
  for (let i = 0; i < petals; i++) {
    const angle = (360 / petals) * i + 360 / petals / 2
    inner.push(
      `<ellipse cx="${cx}" cy="68" rx="7" ry="20" fill="${palette.petalInner}" opacity=".95" transform="rotate(${angle.toFixed(1)} ${cx} ${cy})"/>`,
    )
  }

  // Semillas del centro distribuidas en espiral de Fermat (como un girasol real).
  const seeds: string[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < 26; i++) {
    const radius = 3.6 * Math.sqrt(i)
    const theta = i * golden
    const sx = cx + radius * Math.cos(theta)
    const sy = cy + radius * Math.sin(theta)
    seeds.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1.7" fill="${palette.centerInner}" opacity=".55"/>`)
  }

  const leafLeft = `<path class="leaf leaf--left" d="M60 232 C41 216 21 222 16 241 C33 255 53 250 60 232 Z" fill="url(#leaf-${id})"/>`
  const leafRight = `<path class="leaf leaf--right" d="M60 258 C79 242 99 248 104 267 C87 281 67 276 60 258 Z" fill="url(#leaf-${id})"/>`

  return `<svg class="flower__svg" viewBox="0 0 120 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="petal-${id}" x1="60" y1="24" x2="60" y2="84" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.petalLight}"/>
      <stop offset="1" stop-color="${palette.petalDark}"/>
    </linearGradient>
    <linearGradient id="leaf-${id}" x1="16" y1="230" x2="104" y2="270" gradientUnits="userSpaceOnUse">
      <stop stop-color="#7CB342"/>
      <stop offset="1" stop-color="#3F7D25"/>
    </linearGradient>
    <radialGradient id="center-${id}" cx=".4" cy=".35" r=".8">
      <stop stop-color="${palette.centerOuter}"/>
      <stop offset="1" stop-color="${palette.centerInner}"/>
    </radialGradient>
  </defs>
  <path class="stem" pathLength="1" d="M60 320 Q${(60 + bend).toFixed(0)} 214 ${cx} ${cy + 18}" stroke="#4C9A2A" stroke-width="7" stroke-linecap="round"/>
  ${leaves === 'left' || leaves === 'both' ? leafLeft : ''}
  ${leaves === 'right' || leaves === 'both' ? leafRight : ''}
  <g class="head">
    <g class="petals">
      ${outer.join('\n      ')}
      ${inner.join('\n      ')}
    </g>
    <circle cx="${cx}" cy="${cy}" r="23" fill="url(#center-${id})"/>
    <circle cx="${cx}" cy="${cy}" r="23" fill="none" stroke="${palette.petalInner}" stroke-width="2.5" opacity=".7"/>
    ${seeds.join('\n    ')}
    <circle cx="52" cy="84" r="6" fill="#ffffff" opacity=".13"/>
  </g>
</svg>`
}

/**
 * Construye el jardin completo. La semilla depende del slug, asi que el ramo
 * de cada persona es distinto pero siempre igual cada vez que abre su link.
 */
export function gardenHtml(seed: number): string {
  const rand = makeRandom(seed)
  const pick = <T,>(items: T[]): T => items[Math.floor(rand() * items.length)]

  // Tres capas de profundidad: el fondo va mas pequenio y desenfocado.
  const layers = [
    { name: 'back', count: 7, size: [0.44, 0.62], lift: [30, 62], z: 1 },
    { name: 'mid', count: 6, size: [0.7, 0.94], lift: [6, 28], z: 2 },
    { name: 'front', count: 5, size: [1.02, 1.4], lift: [-18, 2], z: 3 },
  ] as const

  const flowers: string[] = []
  let id = 0

  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      // Reparte las flores a lo ancho y les da un empujon aleatorio para que
      // no queden alineadas como soldados.
      const slot = (i + 0.5) / layer.count
      const left = Math.min(97, Math.max(3, slot * 100 + (rand() - 0.5) * (70 / layer.count)))
      const scale = layer.size[0] + rand() * (layer.size[1] - layer.size[0])
      const lift = layer.lift[0] + rand() * (layer.lift[1] - layer.lift[0])
      const delay = 0.15 + rand() * 0.9 + (layer.name === 'front' ? 0.25 : 0)
      const sway = 4.2 + rand() * 3.6
      const tilt = 1.6 + rand() * 2.8
      const svg = flowerSvg({
        id: id++,
        palette: pick(PALETTES),
        petals: 12 + Math.floor(rand() * 5),
        bend: (rand() - 0.5) * 34,
        leaves: pick(['left', 'right', 'both'] as const),
      })
      flowers.push(
        `<div class="flower flower--${layer.name}" style="left:${left.toFixed(1)}%;bottom:${lift.toFixed(0)}px;z-index:${layer.z};--k:${scale.toFixed(2)};--delay:${delay.toFixed(2)}s;--sway:${sway.toFixed(2)}s;--tilt:${tilt.toFixed(1)}deg;--flip:${rand() > 0.5 ? 1 : -1}">${svg}</div>`,
      )
    }
  }

  // Pasto de primer plano para tapar la base de los tallos.
  const blades: string[] = []
  for (let i = 0; i < 34; i++) {
    const x = (i / 34) * 100 + (rand() - 0.5) * 1.6
    const height = 34 + rand() * 46
    const bend = (rand() - 0.5) * 1.6
    blades.push(
      `<path d="M${x.toFixed(2)} 100 Q${(x + bend).toFixed(2)} ${(100 - height / 2).toFixed(1)} ${(x + bend * 1.7).toFixed(2)} ${(100 - height).toFixed(1)}" stroke="rgba(61,124,37,${(0.3 + rand() * 0.35).toFixed(2)})" stroke-width="1.6" stroke-linecap="round" vector-effect="non-scaling-stroke" fill="none"/>`,
    )
  }

  return `<div class="garden" aria-hidden="true">
  ${flowers.join('\n  ')}
  <svg class="grass" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    ${blades.join('\n    ')}
  </svg>
</div>`
}
