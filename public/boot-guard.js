/* boot-guard.js - Se ejecuta ANTES de React. Si la app no pinta nada en 8 s,
   muestra un panel con el error en vez de dejar la pantalla en blanco. */
(function () {
  var errors = [];
  window.__BOOT_ERRORS__ = errors;
  function push(m) { try { errors.push(String(m).slice(0, 400)); if (errors.length > 15) errors.shift(); } catch (e) {} }
  window.addEventListener('error', function (e) {
    push('error: ' + (e.message || '') + (e.filename ? ' @' + String(e.filename).split('/').pop() + ':' + e.lineno : ''));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason; push('promesa: ' + ((r && (r.stack || r.message)) || r));
  });
  window.addEventListener('securitypolicyviolation', function (e) {
    push('CSP: ' + e.violatedDirective + ' ' + e.blockedURI);
  });

  function diagnostic() {
    return ['Diagnostico App Condominio',
      'Version: ' + (window.__APP_VERSION__ || 'desconocida'),
      'Fecha: ' + new Date().toISOString(),
      'Navegador: ' + navigator.userAgent,
      'URL: ' + location.href,
      'Errores:', errors.length ? errors.join('\n') : '(ninguno capturado)'].join('\n');
  }
  function el(tag, text, style) {
    var n = document.createElement(tag);
    if (text) n.textContent = text;           // textContent: nunca innerHTML con texto de errores
    if (style) n.setAttribute('style', style);
    return n;
  }
  function show() {
    var root = document.getElementById('root');
    if (window.__APP_MOUNTED__ || (root && root.childNodes.length > 0)) return;
    if (document.getElementById('boot-guard-panel')) return;
    var btn = 'min-height:44px;padding:10px 16px;border-radius:12px;border:0;font-weight:700;font-size:15px;margin:6px 6px 0 0;cursor:pointer;';
    var p = el('div', null, 'position:fixed;inset:0;z-index:99999;overflow:auto;background:#0f5551;color:#fff;padding:24px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;');
    p.id = 'boot-guard-panel'; p.setAttribute('role', 'alert');
    p.appendChild(el('h1', 'La app no pudo iniciar', 'font-size:22px;margin:24px 0 8px;'));
    p.appendChild(el('p', 'Pulsa "Reintentar". Si se repite, toca "Copiar diagnostico" y envialo al administrador.', 'font-size:15px;line-height:1.5;margin:0 0 12px;'));
    var retry = el('button', 'Reintentar', btn + 'background:#fff;color:#0f5551;');
    retry.onclick = function () { location.reload(); };
    var copy = el('button', 'Copiar diagnostico', btn + 'background:transparent;color:#fff;border:2px solid #fff;');
    copy.onclick = function () {
      var t = diagnostic();
      try { navigator.clipboard.writeText(t).then(function () { copy.textContent = 'Copiado'; }); }
      catch (e) { var ta = el('textarea', t); document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); copy.textContent = 'Copiado'; } catch (e2) {} document.body.removeChild(ta); }
    };
    var reset = el('button', 'Restablecer datos locales', btn + 'background:transparent;color:#fff;border:2px solid #fff;');
    var armed = false;
    reset.onclick = function () {
      if (!armed) { armed = true; reset.textContent = 'Toca otra vez: cerrara tu sesion'; return; }
      try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
      try { var P = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences; if (P && P.clear) P.clear(); } catch (e) {}
      setTimeout(function () { location.reload(); }, 300);
    };
    p.appendChild(retry); p.appendChild(copy); p.appendChild(reset);
    p.appendChild(el('pre', diagnostic(), 'white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.4;margin-top:16px;background:rgba(0,0,0,.25);padding:12px;border-radius:8px;'));
    document.body.appendChild(p);
  }
  window.__bootGuardShow = show;
  setTimeout(show, 8000);
})();
