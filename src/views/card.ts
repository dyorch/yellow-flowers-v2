import { esc, hashString } from './shared'
import { gardenHtml } from './flowers'

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg%3E%3Ccircle cx='50' cy='22' r='16' fill='%23FFD230'/%3E%3Ccircle cx='50' cy='78' r='16' fill='%23FFD230'/%3E%3Ccircle cx='22' cy='50' r='16' fill='%23FFC400'/%3E%3Ccircle cx='78' cy='50' r='16' fill='%23FFC400'/%3E%3Ccircle cx='50' cy='50' r='17' fill='%238A5A2B'/%3E%3C/g%3E%3C/svg%3E"

export function cardPage(opts: { name: string; slug: string; siteUrl: string }): string {
  const { name, slug, siteUrl } = opts
  const safeName = esc(name)
  const url = `${siteUrl}/${slug}`
  const ogImage = `${siteUrl}/og/${encodeURIComponent(slug)}.png`
  const garden = gardenHtml(hashString(slug))

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${safeName}, estas flores amarillas son para ti</title>
<meta name="description" content="Alguien te regalo flores amarillas que nunca se marchitan.">
<meta name="theme-color" content="#FFD230">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="${FAVICON}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="\u{1F33B} ${safeName}, esto es para ti">
<meta property="og:description" content="Alguien te envio flores amarillas. Abrelas \u{1F49B}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="\u{1F33B} ${safeName}, esto es para ti">
<meta name="twitter:description" content="Alguien te envio flores amarillas. Abrelas \u{1F49B}">
<meta name="twitter:image" content="${esc(ogImage)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --amarillo:#FFD230; --dorado:#F5A300; --miel:#FFB703;
  --crema:#FFF8E7; --tinta:#4A2E05; --tinta-suave:#7A5312;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0; overflow:hidden;
  font-family:'Quicksand',system-ui,-apple-system,sans-serif;
  color:var(--tinta);
  background:#FFD46B;
  -webkit-font-smoothing:antialiased;
  -webkit-tap-highlight-color:transparent;
}

/* ---------- cielo y rayos de sol ---------- */
.sky{
  position:fixed; inset:0; z-index:0;
  background:
    radial-gradient(120% 85% at 50% 6%, #FFF9D6 0%, #FFEEA6 26%, #FFDC7A 55%, #FFC85A 82%, #FFB947 100%);
}
.sky::after{
  content:''; position:absolute; inset:-30%;
  background:radial-gradient(closest-side, rgba(255,255,255,.55), transparent 70%);
  animation:drift 18s ease-in-out infinite alternate;
}
.rays{
  position:fixed; inset:-60%; z-index:0; pointer-events:none;
  background:repeating-conic-gradient(from 0deg at 50% 20%,
    rgba(255,255,255,.30) 0deg 5deg, rgba(255,255,255,0) 5deg 17deg);
  -webkit-mask-image:radial-gradient(circle at 50% 20%, #000 0%, rgba(0,0,0,.5) 35%, transparent 62%);
  mask-image:radial-gradient(circle at 50% 20%, #000 0%, rgba(0,0,0,.5) 35%, transparent 62%);
  animation:spin 120s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes drift{from{transform:translate3d(-6%,-4%,0) scale(1)}to{transform:translate3d(7%,5%,0) scale(1.12)}}

/* ---------- etapa 1: el sobre ---------- */
.stage{position:fixed; inset:0; z-index:5; display:flex; flex-direction:column;
  align-items:center; justify-content:center; padding:max(24px,env(safe-area-inset-top)) 20px max(24px,env(safe-area-inset-bottom));}
body.opened .stage--envelope{display:none}
body:not(.opened) .stage--card{display:none}

.teaser{margin:0 0 4px; font-size:clamp(.95rem,4vw,1.25rem); font-weight:600;
  letter-spacing:.06em; text-transform:lowercase; color:var(--tinta-suave);
  animation:rise .8s .1s both}
.teaser-name{margin:0 0 clamp(20px,5vh,40px); font-family:'Playfair Display',serif;
  font-weight:900; font-size:clamp(2.4rem,11vw,4.5rem); line-height:1.05; text-align:center;
  color:#8A4B00; text-wrap:balance;
  text-shadow:0 2px 0 rgba(255,255,255,.55), 0 10px 30px rgba(140,80,0,.22);
  animation:rise .9s .22s both}

.envelope{
  position:relative; width:min(78vw,330px); aspect-ratio:320/210;
  border:0; padding:0; background:none; cursor:pointer;
  perspective:1000px; animation:float 4.5s ease-in-out infinite; touch-action:manipulation;
  filter:drop-shadow(0 22px 34px rgba(150,86,0,.32));
}
.envelope:focus-visible{outline:3px solid #8A4B00; outline-offset:10px; border-radius:18px}
.env-layer{position:absolute; inset:0; width:100%; height:100%}
.env-flap{transform-origin:50% 16%; transform:rotateX(0deg); transition:transform .75s cubic-bezier(.65,-0.2,.3,1.2); z-index:4}
.env-front{z-index:3}
.env-back{z-index:1}
.env-letter{
  position:absolute; left:11%; right:11%; top:20%; z-index:2;
  background:#FFFDF6; border-radius:8px; padding:10px 12px;
  box-shadow:0 4px 14px rgba(140,80,0,.18);
  transform:translateY(0) scale(.98); transition:transform .8s cubic-bezier(.22,1,.36,1);
}
.env-letter svg{display:block; width:100%; height:auto}
.env-seal{
  position:absolute; left:50%; top:63%; z-index:5; width:19%; aspect-ratio:1;
  transform:translate(-50%,-50%); transition:transform .4s ease, opacity .4s ease;
}
body.opening .env-flap{transform:rotateX(-172deg)}
body.opening .env-seal{transform:translate(-50%,-50%) scale(.2) rotate(40deg); opacity:0}
body.opening .env-letter{transform:translateY(-58%) scale(1.06)}
body.opening .envelope{animation:none}
body.leaving .stage--envelope{opacity:0; transform:scale(.92); transition:opacity .55s ease, transform .55s ease}

.hint{margin:clamp(22px,5vh,38px) 0 0; font-size:.95rem; font-weight:600; letter-spacing:.14em;
  text-transform:uppercase; color:var(--tinta-suave); animation:pulse 2.1s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-14px) rotate(1deg)}}
@keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes rise{from{opacity:0; transform:translateY(22px)}to{opacity:1; transform:none}}

/* ---------- etapa 2: la tarjeta ---------- */
.stage--card{justify-content:flex-start; padding-bottom:min(46vh,340px); overflow-y:auto; overflow-x:hidden}
.stage--card::-webkit-scrollbar{width:0}
.content{position:relative; z-index:4; text-align:center; max-width:640px; width:100%; margin-block:auto}
.content::before{
  content:''; position:absolute; inset:-14% -22%; z-index:-1; pointer-events:none;
  background:radial-gradient(ellipse at 50% 42%, rgba(255,255,255,.82) 0%, rgba(255,255,255,.42) 42%, transparent 72%);
}
.name{
  margin:0; font-family:'Playfair Display',serif; font-weight:900; line-height:1.02;
  font-size:clamp(2.8rem,13.5vw,6rem); text-wrap:balance; letter-spacing:-.01em;
  background:linear-gradient(100deg,#8F4300 0%,#D97800 22%,#FFC21A 42%,#FFE98A 50%,#FFC21A 58%,#D97800 78%,#8F4300 100%);
  background-size:260% 100%; -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 3px 0 rgba(255,255,255,.5)) drop-shadow(0 12px 26px rgba(140,80,0,.28));
  animation:reveal .95s .05s both, shimmer 5.5s 1s linear infinite;
}
.lead{margin:14px 0 clamp(18px,4vh,30px); font-size:clamp(1.1rem,5vw,1.7rem); font-weight:600;
  line-height:1.45; color:#6B3F04; animation:reveal .9s .45s both}
.line{margin:0 0 9px; font-size:clamp(1rem,4.3vw,1.35rem); font-weight:500; line-height:1.5; color:#5C3703}
.line:nth-of-type(1){animation:reveal .8s .95s both}
.line:nth-of-type(2){animation:reveal .8s 1.25s both}
.line:nth-of-type(3){animation:reveal .8s 1.55s both; font-weight:600}
@keyframes reveal{from{opacity:0; transform:translateY(26px) scale(.97)}to{opacity:1; transform:none}}
@keyframes shimmer{from{background-position:180% 0}to{background-position:-80% 0}}

.actions{display:flex; flex-wrap:wrap; gap:10px; justify-content:center;
  margin-top:clamp(20px,4.5vh,34px); animation:reveal .8s 1.9s both}
.btn{
  display:inline-flex; align-items:center; gap:8px; border:0; cursor:pointer;
  font-family:inherit; font-size:.98rem; font-weight:700; text-decoration:none;
  padding:13px 22px; border-radius:999px; transition:transform .18s ease, box-shadow .18s ease;
  touch-action:manipulation;
}
.btn:active{transform:scale(.96)}
.btn--share{background:linear-gradient(135deg,#FF9F1C,#F57C00); color:#fff;
  box-shadow:0 10px 24px rgba(190,100,0,.4)}
.btn--share:hover{transform:translateY(-2px); box-shadow:0 14px 30px rgba(190,100,0,.48)}
.btn--ghost{background:rgba(255,255,255,.72); color:#7A4A05; box-shadow:0 6px 16px rgba(150,90,0,.18)}
.btn--ghost:hover{background:#fff}
.btn svg{width:19px; height:19px; flex:none}

/* ---------- jardin ---------- */
.garden{position:fixed; left:0; right:0; bottom:0; z-index:3; height:min(52vh,390px); pointer-events:none}
.flower{position:absolute; transform-origin:bottom center;
  width:calc(var(--k) * clamp(76px,23vw,128px));
  animation:sway var(--sway) ease-in-out infinite alternate;
  animation-delay:calc(var(--delay) * -1)}
.flower--back{opacity:.62; filter:blur(1.1px) saturate(.9)}
.flower--mid{opacity:.88}
.flower__svg{display:block; width:100%; height:auto; overflow:visible}
.stem{stroke-dasharray:1; stroke-dashoffset:1; animation:grow 1.15s var(--delay) cubic-bezier(.22,1,.36,1) forwards}
.head{transform:scale(0); transform-box:view-box; transform-origin:60px 92px;
  animation:bloom .95s calc(var(--delay) + .8s) cubic-bezier(.34,1.56,.64,1) forwards}
.petals{transform-box:view-box; transform-origin:60px 92px;
  animation:breathe 4.2s calc(var(--delay) + 1.8s) ease-in-out infinite}
.leaf{transform:scale(0); transform-box:view-box; transform-origin:60px 245px;
  animation:bloom .7s calc(var(--delay) + .55s) cubic-bezier(.34,1.56,.64,1) forwards}
.grass{position:absolute; left:0; bottom:0; width:100%; height:64px; z-index:5}
@keyframes grow{to{stroke-dashoffset:0}}
@keyframes bloom{to{transform:scale(1)}}
@keyframes breathe{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.045) rotate(3deg)}}
@keyframes sway{from{transform:rotate(calc(var(--tilt) * -1))}to{transform:rotate(var(--tilt))}}

/* ---------- petalos y confeti ---------- */
.fx{position:fixed; inset:0; z-index:6; pointer-events:none; overflow:hidden}
.petal{position:absolute; top:-10vh; border-radius:52% 0 52% 0;
  background:linear-gradient(135deg,var(--c1),var(--c2)); will-change:transform;
  animation:fall var(--dur) linear forwards}
@keyframes fall{
  0%{opacity:0; transform:translate3d(0,0,0) rotate(0deg)}
  10%{opacity:.92}
  100%{opacity:.1; transform:translate3d(var(--dx),118vh,0) rotate(var(--rot))}
}
.spark{position:absolute; border-radius:50%; will-change:transform}

@media (max-width:540px){
  .stage--card{padding-bottom:min(36vh,300px)}
}
@media (max-height:640px){
  .stage--card{padding-bottom:min(38vh,220px)}
  .garden{height:min(42vh,260px)}
}
@media (prefers-reduced-motion:reduce){
  .rays,.sky::after,.envelope,.hint,.name{animation:none!important}
  .flower{animation:none!important}
  .petals,.head,.leaf,.stem{animation-duration:.01s!important; animation-delay:0s!important}
  .stem{stroke-dashoffset:0}
  .head,.leaf{transform:scale(1)}
  .petal{display:none}
}
</style>
<noscript><style>
  .stage--envelope{display:none!important}
  .stage--card{display:flex!important}
</style></noscript>
</head>
<body>
<div class="sky"></div>
<div class="rays"></div>

<section class="stage stage--envelope">
  <p class="teaser">tienes algo para ti,</p>
  <h1 class="teaser-name">${safeName}</h1>
  <button class="envelope" id="envelope" type="button" aria-label="Abrir el sobre de ${safeName}">
    <svg class="env-layer env-back" viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="30" width="316" height="178" rx="15" fill="#EFCE8E"/>
    </svg>
    <div class="env-letter">
      <svg viewBox="0 0 260 132" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g transform="translate(130 42)">
          <g fill="#FFC400">
            <ellipse cx="0" cy="-19" rx="7" ry="17"/><ellipse cx="0" cy="19" rx="7" ry="17"/>
            <ellipse cx="-19" cy="0" rx="17" ry="7"/><ellipse cx="19" cy="0" rx="17" ry="7"/>
            <ellipse cx="-13" cy="-13" rx="7" ry="17" transform="rotate(45)"/>
            <ellipse cx="13" cy="13" rx="7" ry="17" transform="rotate(45)"/>
            <ellipse cx="13" cy="-13" rx="17" ry="7" transform="rotate(45)"/>
            <ellipse cx="-13" cy="13" rx="17" ry="7" transform="rotate(45)"/>
          </g>
          <circle r="11" fill="#8A5A2B"/>
        </g>
        <rect x="52" y="80" width="156" height="7" rx="3.5" fill="#F0DFB6"/>
        <rect x="76" y="99" width="108" height="7" rx="3.5" fill="#F0DFB6"/>
      </svg>
    </div>
    <svg class="env-layer env-front" viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 52 L160 166 L318 52 V193 a15 15 0 0 1-15 15 H17 a15 15 0 0 1-15-15 Z" fill="#FFE9B5"/>
      <path d="M2 196 L116 112 M318 196 L204 112" stroke="#F3D89C" stroke-width="2.5" fill="none"/>
    </svg>
    <svg class="env-layer env-flap" viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 45 a15 15 0 0 1 15-15 h286 a15 15 0 0 1 15 15 L160 166 Z" fill="#FFDB94"/>
      <path d="M2 45 L160 166 L318 45" stroke="#F0C87B" stroke-width="2.5" fill="none"/>
    </svg>
    <svg class="env-seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#D98200"/>
      <circle cx="50" cy="50" r="39" fill="none" stroke="#B96D00" stroke-width="3"/>
      <g fill="#FFE9A8" transform="translate(50 50)">
        <ellipse cy="-17" rx="6.5" ry="14"/><ellipse cy="17" rx="6.5" ry="14"/>
        <ellipse cx="-17" rx="14" ry="6.5"/><ellipse cx="17" rx="14" ry="6.5"/>
        <ellipse cy="-17" rx="6.5" ry="14" transform="rotate(45)"/>
        <ellipse cy="17" rx="6.5" ry="14" transform="rotate(45)"/>
        <ellipse cx="-17" rx="14" ry="6.5" transform="rotate(45)"/>
        <ellipse cx="17" rx="14" ry="6.5" transform="rotate(45)"/>
      </g>
      <circle cx="50" cy="50" r="10" fill="#7A4A00"/>
    </svg>
  </button>
  <p class="hint">toca para abrir</p>
</section>

<main class="stage stage--card" id="card">
  <div class="content">
    <h1 class="name">${safeName},</h1>
    <p class="lead">estas flores amarillas<br>son para ti \u{1F33B}</p>
    <p class="line">Porque sí.</p>
    <p class="line">Porque te lo mereces.</p>
    <p class="line">Porque hoy es un buen día<br>para recordártelo. \u{1F49B}</p>
    <div class="actions">
      <button class="btn btn--share" id="share" type="button">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92Z"/></svg>
        Compartir
      </button>
      <button class="btn btn--ghost" id="replay" type="button">Ver de nuevo</button>
    </div>
  </div>
  ${garden}
</main>

<div class="fx" id="fx"></div>

<script>
(function(){
  var body = document.body;
  var fx = document.getElementById('fx');
  var envelope = document.getElementById('envelope');
  var card = document.getElementById('card');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = [['#FFF59A','#FFC400'],['#FFE066','#F5A300'],['#FFD230','#E08A00'],['#FFFBE0','#FFD766']];
  var rainTimer = null;

  function rand(min, max){ return min + Math.random() * (max - min); }

  /* Lluvia continua de petalos */
  function dropPetal(){
    if (fx.childElementCount > 28) return;
    var el = document.createElement('div');
    var pair = COLORS[(Math.random() * COLORS.length) | 0];
    var size = rand(9, 20);
    el.className = 'petal';
    el.style.left = rand(-4, 100) + 'vw';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.setProperty('--c1', pair[0]);
    el.style.setProperty('--c2', pair[1]);
    el.style.setProperty('--dx', rand(-16, 16) + 'vw');
    el.style.setProperty('--rot', rand(-720, 720) + 'deg');
    el.style.setProperty('--dur', rand(7, 14) + 's');
    el.addEventListener('animationend', function(){ el.remove(); });
    fx.appendChild(el);
  }

  function startRain(){
    if (calm || rainTimer) return;
    for (var i = 0; i < 7; i++) setTimeout(dropPetal, i * 260);
    rainTimer = setInterval(dropPetal, 620);
  }

  /* Estallido de petalos y destellos desde un punto */
  function burst(x, y, amount){
    if (calm) return;
    for (var i = 0; i < amount; i++) {
      var el = document.createElement('div');
      var pair = COLORS[(Math.random() * COLORS.length) | 0];
      var isPetal = Math.random() > 0.35;
      var size = isPetal ? rand(10, 22) : rand(4, 9);
      el.className = isPetal ? 'petal' : 'spark';
      el.style.animation = 'none';
      el.style.top = y + 'px';
      el.style.left = x + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = 'linear-gradient(135deg,' + pair[0] + ',' + pair[1] + ')';
      fx.appendChild(el);

      var angle = rand(0, Math.PI * 2);
      var distance = rand(70, Math.min(window.innerWidth, 560) * 0.7);
      var anim = el.animate(
        [
          { transform: 'translate(-50%,-50%) rotate(0deg) scale(.4)', opacity: 1 },
          {
            transform: 'translate(calc(-50% + ' + (Math.cos(angle) * distance).toFixed(1) + 'px),' +
              ' calc(-50% + ' + (Math.sin(angle) * distance + rand(40, 180)).toFixed(1) + 'px))' +
              ' rotate(' + rand(-540, 540).toFixed(0) + 'deg) scale(1)',
            opacity: 0
          }
        ],
        { duration: rand(900, 1900), easing: 'cubic-bezier(.12,.75,.3,1)', fill: 'forwards' }
      );
      anim.onfinish = (function(node){ return function(){ node.remove(); }; })(el);
    }
  }

  /* Secuencia de apertura del sobre */
  var opened = false;
  function open(){
    if (opened) return;
    opened = true;
    body.classList.add('opening');
    var box = envelope.getBoundingClientRect();
    setTimeout(function(){ burst(box.left + box.width / 2, box.top + box.height / 2, 46); }, 620);
    setTimeout(function(){ body.classList.add('leaving'); }, 900);
    setTimeout(function(){
      body.classList.add('opened');
      body.classList.remove('opening', 'leaving');
      startRain();
      setTimeout(function(){ burst(window.innerWidth / 2, window.innerHeight * 0.42, 30); }, 450);
    }, 1400);
  }

  envelope.addEventListener('click', open);

  /* Al tocar la tarjeta salen mas petalos desde el dedo */
  card.addEventListener('pointerdown', function(e){
    if (e.target.closest('.btn')) return;
    burst(e.clientX, e.clientY, 12);
  });

  /* Volver a ver la animacion */
  document.getElementById('replay').addEventListener('click', function(){
    if (rainTimer) { clearInterval(rainTimer); rainTimer = null; }
    fx.innerHTML = '';
    body.classList.remove('opened');
    opened = false;
    // Reinicia las animaciones del jardin forzando un reflow.
    void card.offsetWidth;
  });

  /* Compartir: usa el menu nativo del telefono y si no existe, WhatsApp */
  document.getElementById('share').addEventListener('click', function(){
    var url = ${JSON.stringify(url)};
    var text = 'Me regalaron flores amarillas \u{1F33B}';
    if (navigator.share) {
      navigator.share({ title: 'Flores amarillas', text: text, url: url }).catch(function(){});
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
    }
  });

  /* Si el navegador no ejecuta la apertura (por ejemplo con JS parcial) igual se ve el jardin */
  if (calm) { body.classList.add('opened'); }
})();
</script>
</body>
</html>`
}
