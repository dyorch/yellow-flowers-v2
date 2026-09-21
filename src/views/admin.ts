import { esc } from './shared'
import { PANEL_STYLES, panelHead, formatDate, formatDateTime } from './panel'
import type { Card } from '../types'

const FLOWER_MARK = `<svg viewBox="0 0 100 100" width="30" height="30" aria-hidden="true" style="flex:none">
  <g transform="translate(50 50)" fill="#FFC400">
    <ellipse cy="-24" rx="9" ry="21"/><ellipse cy="24" rx="9" ry="21"/>
    <ellipse cx="-24" rx="21" ry="9"/><ellipse cx="24" rx="21" ry="9"/>
    <ellipse cy="-24" rx="9" ry="21" transform="rotate(45)"/>
    <ellipse cy="24" rx="9" ry="21" transform="rotate(45)"/>
    <ellipse cx="-24" rx="21" ry="9" transform="rotate(45)"/>
    <ellipse cx="24" rx="21" ry="9" transform="rotate(45)"/>
  </g>
  <circle cx="50" cy="50" r="15" fill="#8A5A2B"/>
</svg>`

export function loginPage(opts: { error?: string }): string {
  return `<!doctype html>
<html lang="es">
<head>
${panelHead('Entrar | Flores amarillas')}
<style>${PANEL_STYLES}
body{display:flex;align-items:center;justify-content:center}
.wrap{max-width:380px;width:100%}
.mark{font-size:2.8rem;text-align:center;line-height:1}
.lead{text-align:center;color:#8A5510;margin:4px 0 20px;font-weight:600;font-size:.94rem}
h1{text-align:center;font-size:1.6rem}
.field+.field{margin-top:14px}
</style>
</head>
<body>
<div class="wrap">
  <div class="mark">\u{1F33B}</div>
  <h1>Flores amarillas</h1>
  <p class="lead">Panel para crear links</p>
  <div class="card">
    ${opts.error ? `<div class="flash flash--error">${esc(opts.error)}</div>` : ''}
    <form method="post" action="/admin/login">
      <div class="field">
        <label for="user">Usuario</label>
        <input id="user" name="user" type="text" autocomplete="username" autocapitalize="none" required autofocus>
      </div>
      <div class="field">
        <label for="password">Clave</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
      </div>
      <button class="btn btn--primary btn--block" type="submit" style="margin-top:20px">Entrar</button>
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
  justCreated?: string
}): string {
  const { cards, siteUrl, flash, justCreated } = opts

  const rows = cards
    .map((card) => {
      const url = `${siteUrl}/${card.slug}`
      const safeUrl = esc(url)
      const safeSlug = esc(card.slug)
      const isNew = card.slug === justCreated
      const stats =
        card.views === 0
          ? 'Sin aperturas todavía'
          : `${card.views} ${card.views === 1 ? 'apertura' : 'aperturas'}${card.last_view_at ? ` · última ${formatDateTime(card.last_view_at)}` : ''}`

      return `<li class="item${isNew ? ' item--new' : ''}">
  <p class="item__name">${esc(card.name)}</p>
  <a class="item__url" href="/${encodeURIComponent(card.slug)}" target="_blank" rel="noopener">${safeUrl}</a>
  <p class="item__stats">${esc(stats)} · creado ${esc(formatDate(card.created_at))}</p>
  <div class="item__actions">
    <button class="btn btn--small btn--copy js-copy" type="button" data-url="${safeUrl}">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>
      Copiar link
    </button>
    <button class="btn btn--small js-qr" type="button" data-slug="${safeSlug}" data-name="${esc(card.name)}" data-url="${safeUrl}">QR</button>
  </div>
  <div class="item__actions item__actions--three">
    <a class="btn btn--small" href="/admin/m/${encodeURIComponent(card.slug)}">Métricas</a>
    <button class="btn btn--small js-edit" type="button" data-slug="${safeSlug}">Editar</button>
    <form method="post" action="/admin/delete" class="js-delete">
      <input type="hidden" name="slug" value="${safeSlug}">
      <button class="btn btn--small btn--danger btn--block" type="submit">Borrar</button>
    </form>
  </div>
  <form method="post" action="/admin/update" class="item__edit" id="edit-${safeSlug}" hidden>
    <input type="hidden" name="slug" value="${safeSlug}">
    <label for="name-${safeSlug}">Nombre de la persona</label>
    <input id="name-${safeSlug}" name="name" type="text" value="${esc(card.name)}" maxlength="40" required>
    <div class="item__actions" style="margin-top:12px">
      <button class="btn btn--primary" type="submit" style="flex:1">Guardar</button>
      <button class="btn btn--small js-cancel" type="button" data-slug="${safeSlug}">Cancelar</button>
    </div>
  </form>
</li>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="es">
<head>
${panelHead('Panel | Flores amarillas')}
<style>${PANEL_STYLES}
.hint{font-size:.83rem;color:#8A5510;margin:11px 0 0;line-height:1.5}
.list{list-style:none;padding:0;margin:14px 0 0;display:flex;flex-direction:column;gap:11px}
.item{background:rgba(255,255,255,.84);border:1px solid rgba(180,120,20,.16);border-radius:17px;
  padding:15px;box-shadow:0 7px 18px rgba(150,95,0,.1)}
.item--new{border-color:#F5A300;box-shadow:0 0 0 3px rgba(245,163,0,.22),0 7px 18px rgba(150,95,0,.1)}
.item__name{font-family:'Playfair Display',serif;font-size:1.22rem;font-weight:700;margin:0 0 3px}
.item__url{display:block;font-size:.85rem;word-break:break-all;text-decoration:none;font-weight:600}
.item__stats{font-size:.79rem;color:#8A5510;margin:7px 0 0;font-weight:600;line-height:1.45}
.item__actions{display:flex;gap:8px;margin-top:11px}
.item__actions--three{display:grid;grid-template-columns:repeat(3,1fr)}
.item__actions--three>*{min-width:0}
.item__actions--three .btn{width:100%;padding:0 6px}
.btn--copy{flex:1}
.item__edit{margin-top:13px;padding-top:13px;border-top:1px dashed rgba(180,120,20,.3)}
.empty{text-align:center;padding:30px 16px;color:#8A5510;font-weight:600}
.empty span{font-size:2.4rem;display:block;margin-bottom:8px}
.create__row{display:flex;flex-direction:column;gap:12px}

dialog{border:0;border-radius:20px;padding:22px;background:#FFFDF5;text-align:center;
  box-shadow:0 24px 60px rgba(90,55,0,.35);max-width:min(92vw,330px);width:100%}
dialog::backdrop{background:rgba(70,45,0,.5)}
dialog img{border-radius:12px;background:#fff;display:block;width:100%;height:auto;max-width:250px;margin:0 auto}
.qr__url{font-size:.75rem;color:#8A5510;word-break:break-all;margin:12px 0 15px}
.qr__actions{display:flex;gap:8px}
.qr__actions>*{flex:1}

.toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));
  transform:translate(-50%,calc(100% + 40px));background:#432A05;color:#FFE9A8;padding:13px 22px;
  border-radius:999px;font-weight:700;font-size:.9rem;opacity:0;pointer-events:none;z-index:50;
  transition:transform .32s cubic-bezier(.22,1,.36,1),opacity .2s ease;max-width:90vw}
.toast.show{transform:translate(-50%,0);opacity:1}

@media (min-width:640px){
  .create__row{flex-direction:row;align-items:flex-end}
  .create__row>div{flex:1}
  .item{padding:18px}
  .item__name{font-size:1.35rem}
}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div class="top__title">${FLOWER_MARK}<h1>Flores amarillas</h1></div>
    <a class="btn btn--small" href="/admin/logout">Salir</a>
  </div>

  ${flash ? `<div class="flash flash--${flash.kind}">${esc(flash.message)}</div>` : ''}

  <div class="card">
    <h2 style="font-size:1.05rem;margin-bottom:13px">Crear un link nuevo</h2>
    <form method="post" action="/admin/create" class="create__row">
      <div>
        <label for="name">Nombre de la persona</label>
        <input id="name" name="name" type="text" placeholder="María José" maxlength="40" required autocomplete="off">
      </div>
      <button class="btn btn--primary btn--block" type="submit">Crear flores</button>
    </form>
    <p class="hint">La dirección es un código al azar, no el nombre: nadie puede llegar al link adivinando a quién va dirigido.</p>
  </div>

  ${
    cards.length === 0
      ? `<div class="card empty"><span>\u{1F331}</span>Todavía no has creado ningún link.<br>Escribe un nombre arriba y empieza.</div>`
      : `<ul class="list">${rows}</ul>`
  }
</div>

<dialog id="qrDialog">
  <h2 id="qrTitle" style="font-size:1.15rem;margin-bottom:13px"></h2>
  <img id="qrImage" alt="Código QR del link">
  <p class="qr__url" id="qrUrl"></p>
  <div class="qr__actions">
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
      var src = '/admin/qr/' + encodeURIComponent(qr.dataset.slug) + '.svg';
      document.getElementById('qrTitle').textContent = qr.dataset.name;
      document.getElementById('qrUrl').textContent = qr.dataset.url;
      document.getElementById('qrImage').src = src;
      var download = document.getElementById('qrDownload');
      download.href = src;
      download.setAttribute('download', qr.dataset.slug + '-qr.svg');
      document.getElementById('qrDialog').showModal();
    }
  });

  document.getElementById('qrClose').addEventListener('click', function(){
    document.getElementById('qrDialog').close();
  });

  document.querySelectorAll('.js-delete').forEach(function(form){
    form.addEventListener('submit', function(e){
      if (!window.confirm('Seguro que quieres borrar este link? Dejara de funcionar y se pierden sus metricas.')) e.preventDefault();
    });
  });
})();
</script>
</body>
</html>`
}
