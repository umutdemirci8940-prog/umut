/* Ortak çalışma zamanı: tıklama çıkışları, ölçüm, kupon kopyalama. Her kreatifin içine satır içi gömülür. */
var AD = window.AD || {};
(function () {
  // Ölçüm: Studio/DV360 Enabler varsa sayaç, yoksa konsol (ağ makrosuna buradan bağlanır).
  AD.track = function (name) {
    try { if (window.Enabler && Enabler.counter) Enabler.counter(name); } catch (e) {}
    if (window.console && console.debug) console.debug('[ad]', name);
  };
  // Çıkış: Enabler → exitOverride; clickTag tanımlıysa (Google Ads/CM360 tek çıkış) clickTag; yoksa UTM'li doğrudan adres.
  AD.exit = function (id, url) {
    AD.track('exit_' + id);
    try {
      if (window.Enabler && Enabler.exitOverride) { Enabler.exitOverride(id, url); return; }
    } catch (e) {}
    var tag = window.clickTag || window.clickTAG;
    window.open(tag || url, '_blank');
  };
  // Kupon kodunu panoya kopyalar; el.dataset.code okunur, geri bildirim için `copied` sınıfı eklenir.
  AD.copy = function (el, code, done) {
    function ok() {
      el.classList.add('copied');
      AD.track('coupon_copy');
      clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('copied'); }, 1800);
      if (done) done();
    }
    try {
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(code).then(ok, fallback); return; }
    } catch (e) {}
    fallback();
    function fallback() {
      var t = document.createElement('textarea');
      t.value = code; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;left:-99px';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t); ok();
    }
  };
  AD.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Görseller yüklenince başlat (Enabler varsa görünür olduğunda).
  AD.ready = function (fn) {
    function go() {
      var imgs = [].slice.call(document.images), n = imgs.length, started = false;
      function start() { if (!started) { started = true; document.documentElement.classList.add('ready'); fn(); } }
      if (!n) return start();
      imgs.forEach(function (im) { if (im.complete) { if (!--n) start(); } else im.onload = im.onerror = function () { if (!--n) start(); }; });
      setTimeout(start, 2500);
    }
    if (window.Enabler && Enabler.isInitialized) {
      if (Enabler.isInitialized()) go(); else Enabler.addEventListener('init', go);
    } else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  };
  AD.h = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
})();
