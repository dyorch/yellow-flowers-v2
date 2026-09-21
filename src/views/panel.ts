/**
 * Estilos del panel. Estan escritos primero para celular: lo que se ve sin
 * media query es la version movil, y las consultas @media solo agregan mejoras
 * cuando hay mas espacio.
 */
export const PANEL_STYLES = `
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0;min-height:100dvh;color:#432A05;
  font-family:'Quicksand',system-ui,-apple-system,'Segoe UI',sans-serif;
  font-size:16px;line-height:1.5;
  background-color:#FFD87A;
  background-image:radial-gradient(130% 70% at 50% 0%,#FFF7D6 0%,#FFEBAC 40%,#FFD87A 100%);
  background-repeat:no-repeat;background-size:100% 100dvh;
  padding:14px 13px calc(34px + env(safe-area-inset-bottom));
  -webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;
}
a{color:#B96D00}
h1,h2,h3{font-family:'Playfair Display',serif;margin:0;line-height:1.2}
.wrap{max-width:780px;margin:0 auto}

.card{background:rgba(255,255,255,.84);border:1px solid rgba(180,120,20,.16);border-radius:18px;
  padding:16px;box-shadow:0 10px 26px rgba(150,95,0,.12)}
.card+.card{margin-top:12px}

label{display:block;font-weight:700;font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;
  color:#8A5510;margin-bottom:6px}
input[type=text],input[type=password]{
  width:100%;padding:14px 15px;font:inherit;font-size:16px; /* 16px evita que iOS haga zoom al enfocar */
  border:2px solid rgba(180,120,20,.25);border-radius:13px;background:#FFFDF5;color:#432A05}
input:focus{outline:none;border-color:#F5A300;box-shadow:0 0 0 4px rgba(245,163,0,.18)}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;border:0;cursor:pointer;
  font:inherit;font-weight:700;font-size:.95rem;text-decoration:none;min-height:46px;padding:0 20px;
  border-radius:999px;transition:transform .15s ease,box-shadow .15s ease,background .15s ease}
.btn:active{transform:scale(.97)}
.btn--primary{background:linear-gradient(135deg,#FFB300,#F57C00);color:#fff;box-shadow:0 8px 18px rgba(200,110,0,.32)}
.btn--block{width:100%}
.btn--small{min-height:42px;padding:0 15px;font-size:.88rem;border-radius:12px;
  background:rgba(255,255,255,.92);color:#8A5510;border:1px solid rgba(180,120,20,.24)}
.btn--danger{color:#B3261E;border-color:rgba(179,38,30,.28)}
.btn svg{width:17px;height:17px;flex:none}

.flash{border-radius:14px;padding:13px 15px;margin-bottom:14px;font-weight:600;font-size:.94rem}
.flash--ok{background:#E7F6E7;border:1px solid #8BC98B;color:#1E5E1E}
.flash--error{background:#FDECEA;border:1px solid #E9A19C;color:#9A2820}

.top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}
.top__title{display:flex;align-items:center;gap:9px;min-width:0}
.top__title h1{font-size:1.35rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.back{display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:.92rem;
  text-decoration:none;margin-bottom:12px}

@media (min-width:640px){
  body{padding:26px 20px 60px}
  .card{padding:22px;border-radius:20px}
  .top__title h1{font-size:1.7rem}
}
`

export function panelHead(title: string): string {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#FFD87A">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">`
}

/** Zona horaria en la que se muestran todas las fechas del panel. */
export const TZ = 'America/Bogota'

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('es-CO', {
    timeZone: TZ,
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-CO', {
    timeZone: TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
