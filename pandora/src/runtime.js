/* Pandora Moments 970×250 masthead – çalışma zamanı (ES5). Veri nesnesi derlemede JSON ile yerleştirilir. */
(function () {
  'use strict';
  var D = __DATA__;
  var ad = document.getElementById('ad');
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var T = D.timing, K = D.copy, S = D.stage;
  var st = { metal: D.bracelets[0].key, charms: [], demo: !RM, user: false, sound: false, still: false, started: false, hover: null };
  var timers = [];
  function q(s) { return ad.querySelector(s); }
  function qa(s) { return Array.prototype.slice.call(ad.querySelectorAll(s)); }
  var els = { ring: q('.ring'), slots: q('.slots'), caption: q('.caption'), total: q('.total b'), count: q('.count'), cta: q('.cta'), ctaText: q('.cta span'), tray: q('.tray'), reset: q('.reset'), sound: q('.sound'), fx: q('.fx'), metals: qa('.metal'), cells: qa('.cell'), metalName: q('.metal-name') };
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }
  function track(n) { if (!D.tracking || !D.tracking.enabled) return; try { if (typeof window.adTrack === 'function') window.adTrack(n); if (window.Enabler && Enabler.counter) Enabler.counter(n); } catch (e) { } }
  function fmt(n) { n = Math.round(n); var s = String(n), o = ''; while (s.length > 3) { o = '.' + s.slice(-3) + o; s = s.slice(0, -3); } return s + o + ' TL'; }
  function bracelet() { for (var i = 0; i < D.bracelets.length; i++) if (D.bracelets[i].key === st.metal) return D.bracelets[i]; return D.bracelets[0]; }
  function charm(k) { for (var i = 0; i < D.charms.length; i++) if (D.charms[i].key === k) return D.charms[i]; return null; }
  function total() { var b = bracelet(), t = b.price || 0; for (var i = 0; i < st.charms.length; i++) { var c = charm(st.charms[i]); if (c && c.price) t += c.price; } return t; }
  function hasPrice() { var b = bracelet(); if (!b.price) return false; for (var i = 0; i < st.charms.length; i++) { var c = charm(st.charms[i]); if (!c || !c.price) return false; } return true; }
  function rel(el) { var r = el.getBoundingClientRect(), a = ad.getBoundingClientRect(); return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height }; }

  /* ---------- ses (varsayılan kapalı; yalnız kullanıcı açarsa) ---------- */
  var actx = null;
  function beep(kind) {
    if (!st.sound) return;
    try {
      if (!actx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; actx = new AC(); }
      if (actx.state === 'suspended') actx.resume();
      var now = actx.currentTime;
      var tone = function (f0, f1, t, dur, type, g) { var o = actx.createOscillator(), gn = actx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, now + t); o.frequency.exponentialRampToValueAtTime(f1, now + t + dur); gn.gain.setValueAtTime(g, now + t); gn.gain.exponentialRampToValueAtTime(0.001, now + t + dur); o.connect(gn); gn.connect(actx.destination); o.start(now + t); o.stop(now + t + dur + 0.02); };
      if (kind === 'snap') tone(720, 180, 0, 0.06, 'sine', 0.22);
      else if (kind === 'sparkle') { tone(1320, 1330, 0, 0.12, 'triangle', 0.08); tone(1760, 1770, 0.05, 0.12, 'triangle', 0.07); tone(2200, 2210, 0.1, 0.14, 'triangle', 0.06); }
      else if (kind === 'tick') tone(900, 600, 0, 0.04, 'sine', 0.12);
    } catch (e) { }
  }

  /* ---------- görünüm ---------- */
  var capTimer = null;
  function caption(html) { els.caption.innerHTML = html; els.caption.classList.remove('sw'); void els.caption.offsetWidth; els.caption.classList.add('sw'); }
  function captionDefault() {
    var b = bracelet();
    caption('<b>' + b.title + '</b><span>' + b.metal + (b.price ? ' · <i>' + fmt(b.price) + '</i>' : '') + '</span>');
  }
  var shownTotal = 0;
  function renderTotal(animate) {
    var t = total(), ok = hasPrice();
    if (!ok) { els.total.textContent = K.priceOnSite || 'Fiyat sitede'; shownTotal = 0; }
    else if (!animate || RM) { els.total.textContent = fmt(t); shownTotal = t; }
    else {
      var from = shownTotal || 0, start = Date.now(), dur = 520;
      (function step() { var p = Math.min(1, (Date.now() - start) / dur); var e = 1 - Math.pow(1 - p, 3); els.total.textContent = fmt(from + (t - from) * e); if (p < 1) requestAnimationFrame(step); else shownTotal = t; })();
    }
    els.total.classList.remove('bump'); void els.total.offsetWidth; if (animate) els.total.classList.add('bump');
    els.count.innerHTML = '<b>' + st.charms.length + '</b>/' + D.maxCharms + ' ' + K.slots;
    var full = st.charms.length >= D.maxCharms;
    for (var i = 0; i < els.cells.length; i++) {
      var c = els.cells[i], added = st.charms.indexOf(c.getAttribute('data-charm')) >= 0;
      c.classList.toggle('added', added);
      if (full && !added) c.setAttribute('disabled', ''); else c.removeAttribute('disabled');
    }
    els.ctaText.textContent = st.charms.length ? K.ctaBuilt : K.cta;
    ad.setAttribute('data-charms', st.charms.length);
  }
  function placeSlots(b) {
    var sl = (b && b.slots) || S.slots;
    for (var i = 0; i < els.slots.children.length; i++) { var s = els.slots.children[i], c = sl[i] || S.slots[i]; s.style.left = (c.x * 100) + '%'; s.style.top = (c.y * 100) + '%'; s.style.transform = 'rotate(' + (c.r || 0) + 'deg)'; }
  }
  function renderMetal() {
    var b = bracelet(); placeSlots(b);
    var imgs = qa('.ring .v');
    for (var i = 0; i < imgs.length; i++) imgs[i].classList.toggle('on', imgs[i].getAttribute('data-metal') === b.key);
    for (i = 0; i < els.metals.length; i++) { var on = els.metals[i].getAttribute('data-metal') === b.key; els.metals[i].classList.toggle('on', on); els.metals[i].setAttribute('aria-pressed', on ? 'true' : 'false'); }
    ad.setAttribute('data-metal', b.key);
    if (!st.hover) captionDefault();
  }
  function slotEl(i) { return els.slots.children[i]; }
  function sparkle(x, y, n) {
    for (var i = 0; i < n; i++) {
      var s = document.createElement('i'); s.className = 'sp' + (i % 3 === 0 ? ' g' : '');
      var a = (Math.PI * 2 * i) / n + Math.random() * 0.6, r = 22 + Math.random() * 22;
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(a) * r + 'px'); s.style.setProperty('--dy', Math.sin(a) * r + 'px');
      s.style.animationDelay = (Math.random() * 0.08) + 's';
      els.fx.appendChild(s);
    }
    var rp = document.createElement('i'); rp.className = 'ripple'; rp.style.left = x + 'px'; rp.style.top = y + 'px'; els.fx.appendChild(rp);
    later(function () { while (els.fx.firstChild) els.fx.removeChild(els.fx.firstChild); }, 800);
  }
  function placeCharm(i, key, fromEl) {
    var c = charm(key), slot = slotEl(i); if (!c || !slot) return;
    var el = document.createElement('button'); el.type = 'button'; el.className = 'charm'; el.setAttribute('data-charm', key); el.setAttribute('aria-label', c.title + ' – çıkarmak için tıkla'); el.title = c.title;
    el.innerHTML = D.charmHtml[key] + '<span class="x" aria-hidden="true">×</span>'; el.style.setProperty('--bd', (i * 0.7) + 's');
    slot.appendChild(el); slot.classList.remove('empty');
    var target = rel(slot), cx = target.x + target.w / 2, cy = target.y + target.h / 2;
    var finish = function () { el.classList.add('on'); if (!RM) sparkle(cx, cy, 9); beep('snap'); later(function () { beep('sparkle'); }, 60); };
    if (fromEl && !RM) {
      var from = rel(fromEl), size0 = 38, size1 = S.charmSize;
      var fly = document.createElement('div'); fly.className = 'fly'; fly.innerHTML = D.charmHtml[key];
      fly.style.width = size0 + 'px'; fly.style.height = size0 + 'px';
      fly.style.transform = 'translate3d(' + (from.x + from.w / 2 - size0 / 2) + 'px,' + (from.y + from.h / 2 - size0 / 2) + 'px,0) rotate(0deg)';
      ad.appendChild(fly);
      void fly.offsetWidth;
      fly.style.width = size1 + 'px'; fly.style.height = size1 + 'px';
      fly.style.transform = 'translate3d(' + (cx - size1 / 2) + 'px,' + (cy - size1 / 2) + 'px,0) rotate(' + (S.slots[i].r || 0) + 'deg)';
      later(function () { if (fly.parentNode) fly.parentNode.removeChild(fly); finish(); }, 600);
    } else finish();
  }
  function addCharm(key, fromEl) {
    if (st.charms.length >= D.maxCharms || st.charms.indexOf(key) >= 0) return false;
    st.charms.push(key);
    placeCharm(st.charms.length - 1, key, fromEl);
    renderTotal(true);
    var c = charm(key); if (c && !st.user) return true;
    if (c) { st.hover = null; caption('<b>' + c.title + '</b><span>' + (c.price ? '<i>' + fmt(c.price) + '</i> · ' : '') + 'bilekliğe eklendi</span>'); clearTimeout(capTimer); capTimer = setTimeout(function () { if (!st.hover) captionDefault(); }, 2200); }
    return true;
  }
  function removeCharm(key) {
    var idx = st.charms.indexOf(key); if (idx < 0) return;
    st.charms.splice(idx, 1);
    relayout(); renderTotal(true); beep('tick');
  }
  function relayout() {
    for (var i = 0; i < els.slots.children.length; i++) { var s = els.slots.children[i]; var old = s.querySelector('.charm'); if (old) s.removeChild(old); s.classList.add('empty'); }
    for (i = 0; i < st.charms.length; i++) { placeCharmInstant(i, st.charms[i]); }
  }
  function placeCharmInstant(i, key) { var c = charm(key), slot = slotEl(i); if (!c || !slot) return; var el = document.createElement('button'); el.type = 'button'; el.className = 'charm on'; el.setAttribute('data-charm', key); el.setAttribute('aria-label', c.title + ' – çıkarmak için tıkla'); el.title = c.title; el.innerHTML = D.charmHtml[key] + '<span class="x" aria-hidden="true">×</span>'; el.style.setProperty('--bd', (i * 0.7) + 's'); el.style.transition = 'none'; slot.appendChild(el); slot.classList.remove('empty'); void el.offsetWidth; el.style.transition = ''; }
  function resetAll() { st.charms = []; relayout(); renderTotal(true); captionDefault(); beep('tick'); track('reset'); }
  function setMetal(key, viaUser) {
    if (st.metal === key) return; st.metal = key; renderMetal(); renderTotal(true); beep('tick'); if (viaUser) track('metal_' + key);
  }

  /* ---------- çıkış (tıklama) ---------- */
  function openLink(label, deep) {
    track('cta_click'); track('exit');
    var u = D.brand.url;
    if (deep && D.brand.deepLink) u = deep;
    if (window.clickTag && window.clickTag !== D.clickTagDefault) u = window.clickTag;
    if (window.Enabler && Enabler.exit) { Enabler.exit(label || 'CTA', u); } else { window.open(u, '_blank', 'noopener'); }
  }

  /* ---------- kullanıcı devralması ---------- */
  function takeover() {
    if (st.user) return; st.user = true; st.demo = false; clearTimers();
    ad.classList.add('is-user'); ad.classList.remove('is-demo');
    if (!ad.classList.contains('is-rest')) rest();
    for (var i = 0; i < els.slots.children.length; i++) if (!els.slots.children[i].querySelector('.charm')) els.slots.children[i].classList.add('empty');
    track('interact');
  }
  function rest() { ad.classList.add('is-rest'); ad.classList.remove('is-demo'); }

  /* ---------- olaylar ---------- */
  // Devralma: gerçek fare hareketi (iki farklı konum), dokunma, tıklama veya klavye. Sayfa yüklenirken imlecin
  // reklamın üzerinde durması kurguyu bozmaz.
  var lastPt = null, moves = 0;
  ad.addEventListener('mousemove', function (e) { if (st.user) return; if (lastPt && (Math.abs(e.clientX - lastPt[0]) > 2 || Math.abs(e.clientY - lastPt[1]) > 2)) moves++; lastPt = [e.clientX, e.clientY]; if (moves >= 2) takeover(); });
  ad.addEventListener('mousedown', takeover);
  ad.addEventListener('touchstart', takeover, { passive: true });
  ad.addEventListener('focusin', function () { if (st.started) takeover(); });
  ad.addEventListener('click', function (e) {
    var t = e.target;
    var cell = t.closest ? t.closest('.cell') : null;
    if (cell) { e.stopPropagation(); if (cell.hasAttribute('disabled')) return; var key = cell.getAttribute('data-charm'); if (st.charms.indexOf(key) >= 0) { removeCharm(key); track('charm_remove'); } else { if (addCharm(key, cell)) track('charm_add_' + key); } return; }
    var ch = t.closest ? t.closest('.charm') : null;
    if (ch) { e.stopPropagation(); removeCharm(ch.getAttribute('data-charm')); track('charm_remove'); return; }
    var m = t.closest ? t.closest('.metal') : null;
    if (m) { e.stopPropagation(); setMetal(m.getAttribute('data-metal'), true); return; }
    if (t.closest && t.closest('.reset')) { e.stopPropagation(); resetAll(); return; }
    if (t.closest && t.closest('.sound')) { e.stopPropagation(); st.sound = !st.sound; els.sound.classList.toggle('on', st.sound); els.sound.setAttribute('aria-pressed', st.sound ? 'true' : 'false'); if (st.sound) { beep('sparkle'); track('sound_on'); } return; }
    if (t.closest && t.closest('.panel')) { e.stopPropagation(); return; }
    if (t.closest && t.closest('.ring') && !ch) { openLink('Bracelet', bracelet().url); return; }
    openLink('CTA');
  });
  ad.addEventListener('keydown', function (e) {
    if (e.target !== ad) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLink('CTA'); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var i = 0; for (var k = 0; k < D.bracelets.length; k++) if (D.bracelets[k].key === st.metal) i = k; i = (i + (e.key === 'ArrowRight' ? 1 : D.bracelets.length - 1)) % D.bracelets.length; setMetal(D.bracelets[i].key, true); }
  });
  els.tray.addEventListener('mouseover', function (e) { var cell = e.target.closest ? e.target.closest('.cell') : null; if (!cell) return; var c = charm(cell.getAttribute('data-charm')); if (!c) return; st.hover = c.key; clearTimeout(capTimer); caption('<b>' + c.title + '</b><span>' + (c.price ? '<i>' + fmt(c.price) + '</i> · ' : '') + (st.charms.indexOf(c.key) >= 0 ? 'çıkarmak için tıkla' : 'eklemek için tıkla') + '</span>'); });
  els.tray.addEventListener('mouseleave', function () { st.hover = null; captionDefault(); });
  els.ring.addEventListener('mouseover', function (e) { var ch = e.target.closest ? e.target.closest('.charm') : null; if (ch) { var c = charm(ch.getAttribute('data-charm')); if (c) { st.hover = c.key; caption('<b>' + c.title + '</b><span>' + (c.price ? '<i>' + fmt(c.price) + '</i> · ' : '') + 'çıkarmak için tıkla</span>'); } } });
  els.ring.addEventListener('mouseleave', function () { st.hover = null; captionDefault(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clearTimers(); } });

  /* ---------- kurgu ---------- */
  function demo() {
    if (!st.demo) return;
    ad.classList.add('is-demo');
    var order = D.demoOrder || [], n = Math.min(order.length, T.demoCharms || 3), i = 0;
    (function step() {
      if (!st.demo) return;
      if (i >= n) { rest(); track('demo_complete'); return; }
      var key = order[i++]; var cell = null;
      for (var k = 0; k < els.cells.length; k++) if (els.cells[k].getAttribute('data-charm') === key) cell = els.cells[k];
      if (cell) { cell.classList.add('hot'); later(function () { cell.classList.remove('hot'); }, 500); }
      addCharm(key, cell);
      later(step, T.demoStep);
    })();
  }
  function start() {
    if (st.started) return; st.started = true;
    // yuvalar
    for (var i = 0; i < S.slots.length && i < D.maxCharms; i++) { var s = document.createElement('div'); s.className = 'slot empty'; s.style.left = (S.slots[i].x * 100) + '%'; s.style.top = (S.slots[i].y * 100) + '%'; s.style.transform = 'rotate(' + (S.slots[i].r || 0) + 'deg)'; s.innerHTML = '<i class="hint"></i>'; els.slots.appendChild(s); }
    renderMetal(); renderTotal(false); caption('<b>' + K.sub + '</b>'); later(function () { if (!st.hover) captionDefault(); }, Math.max(1200, T.intro - 600));
    requestAnimationFrame(function () { requestAnimationFrame(function () { ad.classList.add('is-in'); }); });
    if (RM) { ad.classList.add('is-in'); rest(); }
    else later(demo, T.intro);
    later(function () { st.still = true; ad.classList.add('is-still'); }, T.autoStop);
    track('impression_start');
  }
  window.pandoraMasthead = { state: function () { return { metal: st.metal, charms: st.charms.slice(), total: total(), demo: st.demo, user: st.user, sound: st.sound, still: st.still, rest: ad.classList.contains('is-rest'), started: st.started }; }, add: addCharm, remove: removeCharm, setMetal: setMetal, reset: resetAll, takeover: takeover };
  if (window.Enabler && typeof Enabler.isInitialized === 'function') { if (Enabler.isInitialized()) start(); else Enabler.addEventListener(studio.events.StudioEvent.INIT, start); }
  else if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
