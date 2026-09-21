import { esc, formatDate } from './shared'
import type { Card } from '../types'

const BASE_STYLES = `
*{box-sizing:border-box}
body{margin:0;min-height:100vh;font-family:'Quicksand',system-ui,-apple-system,sans-serif;color:#432A05;
  background:radial-gradient(120% 80% at 50% 0%,#FFF6D4 0%,#FFE9A8 38%,#FFD87A 100%);
  padding:28px 18px 64px;-webkit-font-smoothing:antialiased}
a{color:#B96D00}
h1,h2{font-family:'Playfair Display',serif;margin:0}
.wrap{max-width:900px;margin:0 auto}
.card{background:rgba(255,255,255,.82);border:1px solid rgba(180,120,20,.16);border-radius:20px;
  padding:22px;box-shadow:0 14px 34px rgba(150,95,0,.14);backdrop-filter:blur(6px)}
label{display:block;font-weight:700;font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;
  color:#8A5510;margin-bottom:7px}
input[type=text],input[type=password]{width:100%;padding:13px 15px;font:inherit;font-size:1rem;
  border:2px solid rgba(180,120,20,.25);border-radius:12px;background:#FFFDF5;color:#432A05}
input:focus{outline:none;border-color:#F5A300;box-shadow:0 0 0 4px rgba(245,163,0,.18)}
.btn{display:inline-flex;align-items:center;gap:7px;border:0;cursor:pointer;font:inherit;font-weight:700;
  padding:12px 20px;border-radius:999px;transition:transform .15s ease,box-shadow .15s ease;text-decoration:none}
.btn:active{transform:scale(.97)}
.btn--primary{background:linear-gradient(135deg,#FFB300,#F57C00);color:#fff;box-shadow:0 8px 20px rgba(200,110,0,.34)}
.btn--primary:hover{transform:translateY(-1px);box-shadow:0 12px 26px rgba(200,110,0,.42)}
.btn--small{padding:8px 14px;font-size:.85rem;border-radius:10px;background:rgba(255,255,255,.9);
  color:#8A5510;border:1px solid rgba(180,120,20,.22)}
.btn--small:hover{background:#fff;border-color:#F5A300}
.btn--danger{color:#B3261E;border-color:rgba(179,38,30,.25)}
.btn--danger:hover{background:#FFF0EF;border-color:#B3261E}
.flash{border-radius:14px;padding:13px 16px;margin-bottom:18px;font-weight:600;font-size:.95rem}
.flash--ok{background:#E7F6E7;border:1px solid #8BC98B;color:#1E5E1E}
.flash--error{background:#FDECEA;border:1px solid #E9A19C;color:#9A2820}
`

export function loginPage(opts: { error?: string }): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Entrar | Flores amarillas</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${BASE_STYLES}
body{display:flex;align-items:center;justify-content:center;padding:24px}
.wrap{max-width:400px;width:100%}
.mark{font-size:3.2rem;text-align:center;margin-bottom:10px}
</style>
</head>
<body>
<div class="wrap">
  <div class="mark">\u{1F33B}</div>
  <h1 style="text-align:center;font-size:1.9rem;margin-bottom:6px">Flores amarillas</h1>
  <p style="text-align:center;color:#8A5510;margin:0 0 24px;font-weight:600">Panel para crear links</p>
  <div class="card">
    ${opts.error ? `<div class="flash flash--error">${esc(opts.error)}</div>` : ''}
    <form method="post" action="/admin/login">
      <div style="margin-bottom:16px">
        <label for="user">Usuario</label>
        <input id="user" name="user" type="text" autocomplete="username" required autofocus>
      </div>
      <div style="margin-bottom:22px">
        <label for="password">Clave</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </div>
      <button class="btn btn--primary" type="submit" style="width:100%;justify-content:center">Entrar</button>
    </form>
  </div>
</div>
</body>
</html>`
}

export function adminPage(opts: {
  cards: Card[]
  siteUrl: string
  flash?: { kind: 'ok' | 'error'; message: string }
}): string {
  const { cards, siteUrl, flash } = opts

  const rows = cards
    .map((card) => {
      const url = `${siteUrl}/${card.slug}`
      const safeUrl = esc(url)
      const safeSlug = esc(card.slug)
      return `<li class="row" data-url="${safeUrl}" data-name="${esc(card.name)}">
  <div class="row__main">
    <div>
      <p class="row__name">${esc(card.name)}</p>
      <a class="row__url" href="/${encodeURIComponent(card.slug)}" target="_blank" rel="noopener">${safeUrl}</a>
    </div>
    <div class="row__meta">
      <span title="Veces que se abrio">\u{1F441} ${card.views}</span>
      <span>${formatDate(card.created_at)}</span>
    </div>
  </div>
  <div class="row__actions">
    <button class="btn btn--small js-copy" type="button" data-url="${safeUrl}">Copiar link</button>
    <button class="btn btn--small js-qr" type="button" data-slug="${safeSlug}" data-url="${safeUrl}" data-name="${esc(card.name)}">QR</button>
    <button class="btn btn--small js-edit" type="button" data-slug="${safeSlug}">Editar</button>
    <form method="post" action="/admin/delete" class="js-delete" style="display:inline">
      <input type="hidden" name="slug" value="${safeSlug}">
      <button class="btn btn--small btn--danger" type="submit">Borrar</button>
    </form>
  </div>
  <form method="post" action="/admin/update" class="row__edit" id="edit-${safeSlug}" hidden>
    <input type="hidden" name="slug" value="${safeSlug}">
    <div class="edit-grid">
      <div>
        <label for="name-${safeSlug}">Nombre</label>
        <input id="name-${safeSlug}" name="name" type="text" value="${esc(card.name)}" maxlength="40" required>
      </div>
      <div>
        <label for="slug-${safeSlug}">Direccion</label>
        <input id="slug-${safeSlug}" name="newSlug" type="text" value="${safeSlug}" maxlength="60" required>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn--primary" type="submit" style="padding:10px 18px;font-size:.9rem">Guardar</button>
      <button class="btn btn--small js-cancel" type="button" data-slug="${safeSlug}">Cancelar</button>
    </div>
  </form>
</li>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Panel | Flores amarillas</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${BASE_STYLES}
.top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:22px;flex-wrap:wrap}
.title{display:flex;align-items:center;gap:11px}
.title h1{font-size:1.7rem}
.create{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}
.create>div{flex:1;min-width:210px}
.hint{font-size:.85rem;color:#8A5510;margin:9px 0 0}
.list{list-style:none;padding:0;margin:20px 0 0;display:flex;flex-direction:column;gap:12px}
.row{background:rgba(255,255,255,.8);border:1px solid rgba(180,120,20,.16);border-radius:16px;padding:15px 17px;
  box-shadow:0 6px 18px rgba(150,95,0,.09)}
.row__main{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap}
.row__name{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:700;margin:0 0 3px}
.row__url{font-size:.87rem;word-break:break-all;text-decoration:none}
.row__url:hover{text-decoration:underline}
.row__meta{display:flex;gap:14px;font-size:.82rem;color:#8A5510;font-weight:600;white-space:nowrap}
.row__actions{display:flex;gap:7px;margin-top:12px;flex-wrap:wrap}
.row__edit{margin-top:14px;padding-top:14px;border-top:1px dashed rgba(180,120,20,.3)}
.edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:540px){.edit-grid{grid-template-columns:1fr}}
.empty{text-align:center;padding:38px 20px;color:#8A5510}
.empty span{font-size:2.6rem;display:block;margin-bottom:10px}
dialog{border:0;border-radius:20px;padding:26px;background:#FFFDF5;box-shadow:0 24px 60px rgba(90,55,0,.35);text-align:center}
dialog::backdrop{background:rgba(70,45,0,.45)}
dialog img{border-radius:12px;background:#fff;display:block}
.toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,calc(100% + 40px));background:#432A05;
  color:#FFE9A8;padding:12px 22px;border-radius:999px;font-weight:700;font-size:.92rem;opacity:0;
  pointer-events:none;transition:transform .32s cubic-bezier(.22,1,.36,1),opacity .2s ease;z-index:50}
.toast.show{transform:translate(-50%,0);opacity:1}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div class="title"><span style="font-size:2rem">\u{1F33B}</span><h1>Flores amarillas</h1></div>
    <a class="btn btn--small" href="/admin/logout">Salir</a>
  </div>

  ${flash ? `<div class="flash flash--${flash.kind}">${esc(flash.message)}</div>` : ''}

  <div class="card">
    <h2 style="font-size:1.15rem;margin-bottom:14px">Crear un link nuevo</h2>
    <form method="post" action="/admin/create" class="create">
      <div>
        <label for="name">Nombre de la persona</label>
        <input id="name" name="name" type="text" placeholder="Maria Jose" maxlength="40" required autofocus>
      </div>
      <button class="btn btn--primary" type="submit">Crear flores</button>
    </form>
    <p class="hint">Se crea una direccion con el nombre. Ejemplo: <strong>${esc(siteUrl)}/maria-jose</strong></p>
  </div>

  ${
    cards.length === 0
      ? `<div class="card empty" style="margin-top:20px"><span>\u{1F331}</span>Todavia no has creado ningun link.<br>Escribe un nombre arriba y empieza.</div>`
      : `<ul class="list">${rows}</ul>`
  }
</div>

<dialog id="qrDialog">
  <h2 id="qrTitle" style="font-size:1.2rem;margin-bottom:14px"></h2>
  <img id="qrImage" width="240" height="240" alt="Codigo QR del link">
  <p id="qrUrl" style="font-size:.8rem;color:#8A5510;word-break:break-all;margin:12px 0 16px"></p>
  <div style="display:flex;gap:8px;justify-content:center">
    <a class="btn btn--small" id="qrDownload" download>Descargar</a>
    <button class="btn btn--primary" id="qrClose" type="button">Cerrar</button>
  </div>
</dialog>

<div class="toast" id="toast"></div>

<script>
(function(){
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function say(message){
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2200);
  }

  document.addEventListener('click', function(e){
    var copy = e.target.closest('.js-copy');
    if (copy) {
      var url = copy.dataset.url;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(function(){ say('Link copiado'); },
          function(){ window.prompt('Copia el link:', url); });
      } else {
        window.prompt('Copia el link:', url);
      }
      return;
    }

    var edit = e.target.closest('.js-edit');
    if (edit) {
      var form = document.getElementById('edit-' + edit.dataset.slug);
      form.hidden = !form.hidden;
      if (!form.hidden) form.querySelector('input[name=name]').focus();
      return;
    }

    var cancel = e.target.closest('.js-cancel');
    if (cancel) {
      document.getElementById('edit-' + cancel.dataset.slug).hidden = true;
      return;
    }

    var qr = e.target.closest('.js-qr');
    if (qr) {
      var dialog = document.getElementById('qrDialog');
      document.getElementById('qrTitle').textContent = qr.dataset.name;
      document.getElementById('qrUrl').textContent = qr.dataset.url;
      var src = '/admin/qr/' + encodeURIComponent(qr.dataset.slug) + '.svg';
      document.getElementById('qrImage').src = src;
      var download = document.getElementById('qrDownload');
      download.href = src;
      download.setAttribute('download', qr.dataset.slug + '-qr.svg');
      dialog.showModal();
    }
  });

  document.getElementById('qrClose').addEventListener('click', function(){
    document.getElementById('qrDialog').close();
  });

  document.querySelectorAll('.js-delete').forEach(function(form){
    form.addEventListener('submit', function(e){
      if (!window.confirm('Seguro que quieres borrar este link? Dejara de funcionar.')) e.preventDefault();
    });
  });
})();
</script>
</body>
</html>`
}
