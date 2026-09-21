const SHELL_STYLES = `
*{box-sizing:border-box}
html,body{min-height:100%}
body{margin:0;display:flex;align-items:center;justify-content:center;padding:32px 22px;text-align:center;
  font-family:'Quicksand',system-ui,-apple-system,sans-serif;color:#4A2E05;
  background-color:#FFC352;
  background-image:radial-gradient(120% 85% at 50% 4%,#FFF9D9 0%,#FFEDAE 30%,#FFD87A 66%,#FFC352 100%);
  background-repeat:no-repeat;background-size:100% 100dvh;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:520px}
h1{font-family:'Playfair Display',serif;font-weight:900;margin:0 0 14px;
  font-size:clamp(2.1rem,9vw,3.4rem);line-height:1.08;text-wrap:balance}
p{margin:0 0 14px;font-size:clamp(1rem,4.2vw,1.18rem);line-height:1.6;color:#6B3F04;font-weight:500}
.mark{width:clamp(96px,30vw,150px);height:auto;margin:0 auto 22px;display:block;
  animation:sway 5s ease-in-out infinite alternate;transform-origin:bottom center}
@keyframes sway{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
.soft{font-size:.9rem;color:#8A5510;margin-top:26px;font-weight:600}
@media (prefers-reduced-motion:reduce){.mark{animation:none}}
`

const FLOWER = `<svg class="mark" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="p" x1="60" y1="8" x2="60" y2="70" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF06A"/><stop offset="1" stop-color="#FFC400"/>
    </linearGradient>
  </defs>
  <path d="M60 150 Q66 105 60 62" stroke="#4C9A2A" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M60 104 C43 90 24 96 20 113 C35 126 53 120 60 104 Z" fill="#5FA22F"/>
  <g transform="translate(60 42)">
    <g fill="url(#p)">
      <ellipse cy="-24" rx="9" ry="21"/><ellipse cy="24" rx="9" ry="21"/>
      <ellipse cx="-24" rx="21" ry="9"/><ellipse cx="24" rx="21" ry="9"/>
      <ellipse cy="-24" rx="9" ry="21" transform="rotate(45)"/>
      <ellipse cy="24" rx="9" ry="21" transform="rotate(45)"/>
      <ellipse cx="-24" rx="21" ry="9" transform="rotate(45)"/>
      <ellipse cx="24" rx="21" ry="9" transform="rotate(45)"/>
    </g>
    <circle r="15" fill="#8A5A2B"/>
    <circle r="15" fill="none" stroke="#FFB300" stroke-width="2.5" opacity=".7"/>
  </g>
</svg>`

const HEAD = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#FFD230">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">`

export function homePage(): string {
  return `<!doctype html>
<html lang="es">
<head>
${HEAD}
<title>Flores amarillas</title>
<meta name="description" content="Flores amarillas que no se marchitan, con el nombre de quien las recibe.">
<style>${SHELL_STYLES}</style>
</head>
<body>
<div class="wrap">
  ${FLOWER}
  <h1>Flores amarillas</h1>
  <p>Aquí las flores no se marchitan nunca.</p>
  <p>Si alguien te dejó un link, ábrelo:<br>hay un ramo esperando con tu nombre.</p>
  <p class="soft">\u{1F49B}</p>
</div>
</body>
</html>`
}

export function notFoundPage(): string {
  return `<!doctype html>
<html lang="es">
<head>
${HEAD}
<title>Este ramo no existe</title>
<meta name="robots" content="noindex, nofollow">
<style>${SHELL_STYLES}</style>
</head>
<body>
<div class="wrap">
  ${FLOWER}
  <h1>Aquí no hay flores</h1>
  <p>Este link no corresponde a ningún ramo.</p>
  <p>Revisa que esté bien escrito: a veces se pierde una letra al copiarlo.</p>
  <p class="soft">\u{1F33B}</p>
</div>
</body>
</html>`
}

/** Se muestra si el Worker esta desplegado pero todavia no tiene base de datos. */
export function setupPage(): string {
  return `<!doctype html>
<html lang="es">
<head>
${HEAD}
<title>Falta conectar la base de datos</title>
<meta name="robots" content="noindex, nofollow">
<style>${SHELL_STYLES}
.wrap{max-width:600px;text-align:left}
ol{text-align:left;padding-left:22px;line-height:1.8;font-weight:500;color:#5C3703}
code{background:rgba(255,255,255,.7);padding:2px 7px;border-radius:6px;font-size:.92em}
h1{text-align:center}
</style>
</head>
<body>
<div class="wrap">
  ${FLOWER}
  <h1>Casi listo</h1>
  <p style="text-align:center">El sitio ya esta publicado, pero le falta la base de datos donde se guardan los links.</p>
  <ol>
    <li>Entra al panel de Cloudflare, a <strong>Storage &amp; Databases \u2192 D1 SQL Database</strong>.</li>
    <li>Crea una base llamada <code>flores-amarillas</code>.</li>
    <li>Copia el <strong>Database ID</strong> que te muestra.</li>
    <li>Pegalo en el archivo <code>wrangler.jsonc</code> del repositorio, donde dice <code>PEGA_AQUI_TU_DATABASE_ID</code>.</li>
    <li>Guarda el cambio: el sitio se vuelve a publicar solo y la tabla se crea sola.</li>
  </ol>
</div>
</body>
</html>`
}
