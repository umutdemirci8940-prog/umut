'use strict';
/* eslint-disable no-undef */
/**
 * Çalışma 01–07. Her çalışma tek dosyada iki yerleşime sahiptir:
 * css → 320x480 (varsayılan), alt → 970x250 (.ad.w). js tarayıcıda çalışır (motor: src/engine.js).
 * Ürünler coffy.com.tr menüsündeki orijinal görsellerdir (cup / prodImg / ring).
 */

const ICON = {
  cal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm-2 7h14v10H5V9z"/></svg>',
  book: '<svg viewBox="0 0 48 48" width="54" height="54"><rect x="8" y="30" width="32" height="8" rx="2" fill="#0b0b0b"/><rect x="11" y="21" width="28" height="8" rx="2" fill="#0b0b0b" opacity=".75"/><rect x="7" y="12" width="30" height="8" rx="2" fill="#0b0b0b" opacity=".5"/></svg>',
  clock: '<svg viewBox="0 0 48 48" width="54" height="54"><circle cx="24" cy="24" r="16" fill="none" stroke="#0b0b0b" stroke-width="4"/><path d="M24 14v11l7 5" stroke="#0b0b0b" stroke-width="4" fill="none" stroke-linecap="round"/></svg>',
  chat: '<svg viewBox="0 0 48 48" width="54" height="54"><path d="M8 10h32v20H22l-9 8v-8H8z" fill="#0b0b0b"/><circle cx="17" cy="20" r="2.5" fill="#fff"/><circle cx="24" cy="20" r="2.5" fill="#fff"/><circle cx="31" cy="20" r="2.5" fill="#fff"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>',
};

/* 3B sahne girişi: öğeler perspektifle aşağıdan döner */
const IN3D = '@keyframes in3d{from{opacity:0;transform:perspective(700px) rotateX(-70deg) translateY(24px)}to{opacity:1;transform:none}}';

module.exports = [
  /* ===================================================================== */
  {
    no: '01', slug: 'saat-kac-senaryosu', size: '320x480', name: 'Saat Kaç? Senaryosu',
    phase: 'Lansman + Sürdürme', channel: 'DV360 / TTD mobil interstitial, in-app (MRAID), masaüstü billboard',
    mechanic: 'Video → telefon kilit ekranı: gerçek saat ve gün dilimine göre değişen senaryo + 3 seçenek → hangi seçenek seçilirse seçilsin 3B kart döner, arkasından gerçek Iced Latte dolarak çıkar → “Çok da Coffy” + 3B ürün karuseli.',
    why: 'Gün dilimine göre (sabah dersi, öğleden sonra çöküşü, akşam teslimi, gece oyun maratonu) kendini yenileyen dinamik kreatif.',
    html: `
<section class="scene" id="v"></section>
<section class="scene q1" id="q">
  <div class="lock"><div class="date" id="date"></div><div class="time hd" id="time"></div></div>
  <div class="notif"><span class="ic">${ICON.cal}</span><div><b id="nt"></b><p id="nx"></p></div><small>şimdi</small></div>
  <h2 class="hd qq" id="qq"></h2>
  <div class="opts" id="opts"></div>
</section>
<section class="scene r1" id="r">
  <div class="pick" id="pick"></div>
  <h2 class="hd re" id="re"></h2>
  <p class="rs">Hangi cevabı verirsen ver, sonu belli:</p>
  <div class="fc flip" id="fc"><div class="fi"><div class="fa"><span class="fl" id="fl"></span><b class="hd">Senin<br>Coffy’n</b><i>hazırlanıyor</i></div><div class="fb" id="fb"></div></div></div>
</section>
<section class="scene" id="e"></section>`,
    css: `
${IN3D}
.q1{padding:46px 18px 18px;display:flex;flex-direction:column}
.q1 .lock{text-align:center}
.q1 .date{font-size:12px;font-weight:700;color:rgba(255,255,255,.7);text-transform:capitalize}
.q1 .time{font-size:66px;margin-top:2px}
.notif{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.1);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.notif .ic{width:30px;height:30px;border-radius:9px;background:var(--acc);display:grid;place-items:center;flex:none}
.notif b{font-size:11px;letter-spacing:.04em;color:rgba(255,255,255,.7)}
.notif p{font-size:13.5px;font-weight:700;margin-top:1px}
.notif small{margin-left:auto;font-size:10px;color:rgba(255,255,255,.55)}
.qq{font-size:24px;margin:16px 2px 12px;line-height:1.02}
.opts{display:flex;flex-direction:column;gap:8px}
.opt{appearance:none;border:0;cursor:pointer;display:flex;align-items:center;gap:10px;padding:0 12px;height:48px;border-radius:14px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.14);font-weight:700;font-size:14.5px;text-align:left;color:var(--cream);transition:background .2s,transform .25s}
.opt span{width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,.12);display:grid;place-items:center;font-family:var(--h);font-weight:700;font-size:15px;flex:none}
.opt:hover{background:rgba(255,255,255,.14);transform:perspective(500px) rotateX(8deg) translateY(-1px)}
.opt.sel{background:#fff;color:var(--ink);box-shadow:none}.opt.sel span{background:var(--ink);color:#fff}
.q1.on .lock,.q1.on .notif,.q1.on .qq,.q1.on .opt{animation:in3d .8s cubic-bezier(.2,.9,.25,1) both}
.q1.on .notif{animation-delay:.12s}.q1.on .qq{animation-delay:.22s}.q1.on .opt:nth-child(1){animation-delay:.3s}.q1.on .opt:nth-child(2){animation-delay:.38s}.q1.on .opt:nth-child(3){animation-delay:.46s}
.r1{display:flex;flex-direction:column;align-items:center;text-align:center;padding:52px 22px 20px}
.r1 .pick{font-size:12px;font-weight:800;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.1)}
.r1 .re{font-size:34px;margin-top:14px}
.r1 .rs{font-size:13px;font-weight:600;color:rgba(255,255,255,.7);margin-top:10px}
.fc{width:176px;height:232px;margin-top:16px}
.fc .fa,.fc .fb{border-radius:22px;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center}
.fc .fa{background:linear-gradient(160deg,#1f1f1f,#0b0b0b);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18),0 24px 40px -18px rgba(0,0,0,.9);gap:10px}
.fc .fa .fl{font-size:34px}.fc .fa b{font-size:30px;line-height:.9}.fc .fa i{font-style:normal;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--acc2)}
.fc .fb{background:radial-gradient(120% 90% at 50% 20%,#d79a62,#7c4a26 70%,#3a2214);box-shadow:0 24px 40px -18px rgba(0,0,0,.9)}
.fc .fb .pf{height:200px;margin-top:10px}`,
    alt: `
.ad.w .q1{display:grid;grid-template-columns:210px 330px 1fr;grid-template-rows:1fr 1fr;grid-template-areas:"lock notif opts" "lock qq opts";column-gap:24px;padding:20px 26px;align-items:center}
.ad.w .q1 .lock{grid-area:lock;text-align:left;margin-top:28px}
.ad.w .q1 .time{font-size:78px}
.ad.w .notif{grid-area:notif;margin:0;align-self:end}
.ad.w .qq{grid-area:qq;font-size:28px;margin:10px 0 0;align-self:start}
.ad.w .opts{grid-area:opts}
.ad.w .opt{height:52px}
.ad.w .r1{display:grid;grid-template-columns:1fr 170px;grid-template-areas:"pick fc" "re fc" "rs fc";align-content:center;justify-items:start;text-align:left;padding:20px 120px 20px 90px;column-gap:40px}
.ad.w .r1 .pick{grid-area:pick}.ad.w .r1 .re{grid-area:re;font-size:52px;margin-top:10px}.ad.w .r1 .rs{grid-area:rs}
.ad.w .fc{grid-area:fc;width:160px;height:214px;margin:0;align-self:center}.ad.w .fc .fb .pf{height:186px}`,
    js: function () {
      var S = {
        morning: { nt: 'TAKVİM', nx: 'Ders 09:00’da başlıyor.', q: 'Alarm üç kez çaldı. Ne yapıyorsun?', o: ['Koşa koşa derse', '5 dakika daha uyurum', 'Yolda Coffy’e uğrarım'], l: 'Sabah dersi zor mu? Yanında Coffy varsa, çok da değil.' },
        noon: { nt: 'EKİP', nx: 'Toplantı 14:00’e çekildi.', q: 'Öğleden sonra çöküşü geldi. Ne yapıyorsun?', o: ['Masada uyuklarım', 'Ekrana boş boş bakarım', 'Coffy molası veririm'], l: 'Öğleden sonra çöküşü mü? Yanında Coffy varsa, çok da değil.' },
        evening: { nt: 'GRUP ÖDEVİ', nx: 'Teslim yarın 10:00’da!', q: 'Akşam oldu, proje bitmedi. Ne yapıyorsun?', o: ['Yarın hallederim', 'Sabaha kadar otururum', 'Önce Coffy, sonra proje'], l: 'Son dakika teslimi mi? Yanında Coffy varsa, çok da değil.' },
        night: { nt: 'OYUN', nx: 'Takımın bir maç daha istiyor.', q: 'Gece yarısı. Bir maç daha mı?', o: ['Son maç, söz', 'Uyumaya giderim', 'Sabah ilk iş Coffy'], l: 'Uykusuz bir sabah mı? Yanında Coffy varsa, çok da değil.' },
      };
      var R = ['Cesur! Ama yakıtsız olmaz.', 'Anlıyoruz… ama gün seni bekliyor.', 'İşte bu. Doğru cevap!'];
      var dp = daypart(), s = S[dp], done = false;
      $('#time').textContent = clock();
      try { $('#date').textContent = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }); } catch (e) { /* eski tarayıcı */ }
      $('#nt').textContent = s.nt; $('#nx').textContent = s.nx; $('#qq').textContent = s.q;
      $('#opts').innerHTML = s.o.map(function (t, i) { return '<button class="opt" data-i="' + i + '"><span>' + 'ABC'[i] + '</span>' + esc(t) + '</button>'; }).join('');
      $('#fl').innerHTML = logo(); $('#fb').innerHTML = cup(0, C.hero);
      function choose(i) {
        if (done) return; done = true; cancel();
        $$('.opt')[i].classList.add('sel'); track('answer_' + 'abc'[i], { daypart: dp });
        later(function () {
          $('#pick').textContent = 'Senin cevabın: ' + s.o[i]; $('#re').textContent = R[i]; show('#r');
          later(function () { $('#fc').classList.add('on'); }, 600);
          later(function () { setFill($('#fb'), 1); burst($('#r'), 26); }, 1350);
          later(function () { endcard($('#e'), { kicker: dp === 'night' ? 'YARIN SABAH İLK DURAK' : 'ÇOK DA ZOR DEĞİL', lead: s.l, first: C.hero }); }, 3600);
        }, 450);
      }
      $('#opts').addEventListener('click', function (e) { var b = e.target.closest('.opt'); if (b) choose(+b.getAttribute('data-i')); });
      var cancel = function () {};
      show('#v');
      playVideo($('#v'), function () { show('#q'); cancel = idle(7000, function () { choose(2); }); });
    },
  },

  /* ===================================================================== */
  {
    no: '02', slug: 'enerji-doldur', size: '320x480', name: 'Enerji Doldur (Ödüllü Oyun İçi)',
    phase: 'Lansman', channel: 'Oyun içi ödüllü video + playable end card (AppLovin, Unity/LevelPlay, Mintegral, AdMob)',
    mechanic: 'Ana video ödüllü video olarak oynar → oyun arayüzü: “Enerjin %12” → kullanıcı 3B dönen gerçek Cold Brew’a dokundukça içer, bardak boşalır, karakterin enerjisi dolar → %100’de 3B “+1 Can” kartı → “Oyunda da, hayatta da: Çok da Coffy”.',
    why: 'Oyuncunun istediği şeyi (enerji/can) Coffy tüketimiyle eşleştirir; ödül anı marka anıyla birleşir.',
    html: `
<section class="scene" id="v"></section>
<section class="scene g2" id="g">
  <div class="hud"><div class="hearts" id="hearts"><i class="on">${ICON.heart}</i><i>${ICON.heart}</i><i>${ICON.heart}</i></div><div class="lvl">LVL 12</div></div>
  <div class="en"><div class="enl"><b>ENERJİ</b><span id="pct">%12</span></div><div class="track"><i id="bar"></i></div></div>
  <div class="hero sleepy" id="hero">
    <svg viewBox="0 0 120 120" width="112" height="112">
      <ellipse cx="60" cy="112" rx="30" ry="4" fill="#000" opacity=".35"/>
      <g class="bod"><ellipse cx="60" cy="62" rx="40" ry="46" fill="#7a4a2e"/><ellipse cx="60" cy="62" rx="40" ry="46" fill="url(#hg)"/>
      <path d="M44 22c8 6 10 12 8 20" stroke="#4a2a18" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="38" cy="74" r="6" fill="#ff8fb3" opacity=".55"/><circle cx="82" cy="74" r="6" fill="#ff8fb3" opacity=".55"/>
      <g class="e-sl" stroke="#1d110b" stroke-width="4" fill="none" stroke-linecap="round"><path d="M36 60q6 5 12 0"/><path d="M72 60q6 5 12 0"/><circle cx="60" cy="80" r="4" fill="#1d110b" stroke="none"/></g>
      <g class="e-aw"><circle cx="42" cy="58" r="6" fill="#1d110b"/><circle cx="78" cy="58" r="6" fill="#1d110b"/><circle cx="44" cy="56" r="2" fill="#fff"/><circle cx="80" cy="56" r="2" fill="#fff"/><path d="M50 76q10 8 20 0" stroke="#1d110b" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <g class="e-st" fill="#ffc53a"><path d="M42 47l3.5 7 7.7 1.1-5.6 5.4 1.3 7.7L42 64.6l-6.9 3.6 1.3-7.7-5.6-5.4 7.7-1.1z"/><path d="M78 47l3.5 7 7.7 1.1-5.6 5.4 1.3 7.7L78 64.6l-6.9 3.6 1.3-7.7-5.6-5.4 7.7-1.1z"/><path d="M46 76q14 16 28 0z" fill="#1d110b"/></g></g>
      <defs><radialGradient id="hg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></radialGradient></defs>
    </svg>
    <span class="z z1">z</span><span class="z z2">z</span><span class="z z3">Z</span>
  </div>
  <div class="msg hd" id="msg">Enerjin bitmek üzere!</div>
  <p class="sub" id="sub">Cold Brew’a dokun, enerjini doldur.</p>
  <button class="cupw" id="cupw" aria-label="Coffy iç"></button>
  <div class="hint" id="hint" style="left:176px;top:396px"></div>
  <div class="reward" id="reward"><b class="hd">+1 CAN</b><span>Ödülün oyuna eklendi</span></div>
</section>
<section class="scene" id="e"></section>`,
    css: `
.g2{padding:44px 16px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;background:radial-gradient(100% 60% at 50% 40%,rgba(95,224,189,.1),transparent 70%)}
.hud{position:absolute;top:12px;right:14px;display:flex;align-items:center;gap:8px}
.hearts{display:flex;gap:2px}.hearts i{fill:rgba(255,255,255,.2);transition:fill .3s,transform .3s}.hearts i.on{fill:#ff5a7a}.hearts i.pop{transform:scale(1.35)}
.lvl{font-size:10px;font-weight:800;padding:4px 7px;border-radius:6px;background:rgba(255,255,255,.12);letter-spacing:.06em}
.en{width:100%;margin-top:8px}
.enl{display:flex;justify-content:space-between;font-size:11px;font-weight:800;letter-spacing:.1em}
.enl span{font-family:var(--h);font-size:17px;letter-spacing:0;color:var(--bc)}
.track{height:14px;border-radius:99px;background:rgba(255,255,255,.1);margin-top:5px;overflow:hidden;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.12)}
.track i{display:block;height:100%;width:12%;border-radius:99px;background:var(--bc);transition:width .45s cubic-bezier(.3,1.4,.5,1),background .3s;background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,.18) 0 6px,transparent 6px 12px)}
.g2{--bc:#ff4d4d}
.hero{position:relative;margin-top:8px;height:104px;width:104px}.hero svg{width:104px;height:104px}
.hero .bod{transform-origin:60px 100px}
.hero.sleepy .bod{animation:swayb 2.6s ease-in-out infinite}
.hero.full .bod{animation:hop .5s ease-in-out infinite alternate}
@keyframes swayb{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes hop{from{transform:translateY(0)}to{transform:translateY(-8px) scale(1.03)}}
.hero .e-aw,.hero .e-st{display:none}.hero.awake .e-sl,.hero.full .e-sl{display:none}.hero.awake .e-aw{display:inline}.hero.full .e-st{display:inline}
.z{position:absolute;font-family:var(--h);font-weight:700;color:rgba(255,255,255,.7);animation:zz 2.4s ease-in-out infinite;opacity:0}
.z1{right:-6px;top:20px;font-size:13px}.z2{right:-16px;top:6px;font-size:16px;animation-delay:.6s}.z3{right:-28px;top:-10px;font-size:20px;animation-delay:1.2s}
.hero:not(.sleepy) .z{display:none}
@keyframes zz{0%{opacity:0;transform:translateY(6px)}40%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}
.msg{font-size:28px;margin-top:8px}
.sub{font-size:13px;font-weight:600;color:rgba(255,255,255,.75);margin-top:4px}
.cupw{appearance:none;border:0;background:none;cursor:pointer;margin-top:8px;padding:0;transition:transform .15s}
.cupw .pf{height:168px}
.cupw.sip{transform:scale(.92) rotate(-6deg)}
.fl{position:absolute;font-family:var(--h);font-weight:700;font-size:20px;color:var(--mint);pointer-events:none;animation:up .9s ease-out forwards}
@keyframes up{to{transform:translateY(-50px);opacity:0}}
.reward{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) perspective(600px) rotateY(90deg);opacity:0;padding:16px 26px;border-radius:20px;background:#fff;color:var(--ink);text-align:center;box-shadow:0 20px 50px -10px rgba(0,0,0,.7);transition:.7s cubic-bezier(.3,1.4,.5,1);z-index:30}
.reward b{display:block;font-size:40px}.reward span{font-size:12px;font-weight:800}
.reward.on{opacity:1;transform:translate(-50%,-50%) perspective(600px) rotateY(0)}`,
    alt: `
.ad.w .g2{display:grid;grid-template-columns:220px 1fr 230px;grid-template-rows:auto auto 1fr;grid-template-areas:"hero en cup" "hero msg cup" "hero sub cup";align-items:center;justify-items:center;padding:46px 30px 18px;column-gap:20px}
.ad.w .hero{grid-area:hero;width:150px;height:150px;margin:0}.ad.w .hero svg{width:150px;height:150px}
.ad.w .en{grid-area:en;margin:0;max-width:440px}
.ad.w .msg{grid-area:msg;font-size:44px;margin-top:16px}
.ad.w .sub{grid-area:sub;align-self:start}
.ad.w .cupw{grid-area:cup;margin:-40px 0 0}.ad.w .cupw .pf{height:200px}
.ad.w #hint{left:850px!important;top:140px!important}
.ad.w .hud{right:270px;top:16px}`,
    js: function () {
      var e = 12, n = 0, fin = false, auto = null, hero = $('#hero'), g = $('#g');
      $('#cupw').innerHTML = cup(1, 'cold-brew', 'sway');
      var MSG = ['Enerjin bitmek üzere!', 'Daha, daha!', 'Uyanıyoruz…', 'Neredeyse!', 'Enerji full!'];
      function paint() {
        $('#bar').style.width = e + '%'; $('#pct').textContent = '%' + e;
        g.style.setProperty('--bc', e < 35 ? '#ff4d4d' : e < 70 ? '#e9d1ad' : '#5fe0bd');
        hero.className = 'hero ' + (e >= 100 ? 'full' : e >= 40 ? 'awake' : 'sleepy');
      }
      function sip() {
        if (fin) return; n++; e = Math.min(100, 12 + n * 22); paint();
        $('#hint').style.display = 'none';
        var c = $('#cupw'); c.classList.add('sip'); later(function () { c.classList.remove('sip'); }, 140);
        setFill(c, 1 - n * .19); $('#msg').textContent = MSG[Math.min(n, 4)];
        var cr = c.getBoundingClientRect(), f = document.createElement('div'); f.className = 'fl'; f.textContent = '+22';
        f.style.left = cr.left + cr.width * .55 + Math.random() * 30 + 'px'; f.style.top = cr.top + cr.height * .3 + 'px'; g.appendChild(f); later(function () { f.remove(); }, 900);
        track('sip_' + n);
        if (e >= 100) win();
      }
      function win() {
        fin = true; clearInterval(auto); burst(g, 30, 190);
        $('#sub').textContent = 'Karakterin yeniden oyunda!';
        $$('#hearts i').forEach(function (h, i) { later(function () { h.classList.add('on', 'pop'); later(function () { h.classList.remove('pop'); }, 300); }, 200 + i * 180); });
        later(function () { $('#reward').classList.add('on'); track('reward'); }, 700);
        later(function () { endcard($('#e'), { kicker: 'OYUNDA DA, HAYATTA DA', lead: 'Gerçek enerji en yakın Coffy’de. Uğra, doldur, oyuna devam.', first: 'cold-brew' }); }, 2700);
      }
      $('#cupw').addEventListener('click', function (ev) { ev.stopPropagation(); clearInterval(auto); sip(); });
      g.addEventListener('click', function () { clearInterval(auto); sip(); });
      paint(); show('#v');
      playVideo($('#v'), function () { show('#g'); idle(6000, function () { auto = setInterval(sip, 650); }); }, { skipLabel: 'Ödüle geç ›' });
    },
  },

  /* ===================================================================== */
  {
    no: '03', slug: 'kopugu-kazi', size: '320x480', name: 'Köpüğü Kazı',
    phase: 'Lansman + Sürdürme', channel: 'Mobil web interstitial, in-app (MRAID), masaüstü billboard',
    mechanic: 'Video → üstten görünen latte: kullanıcı parmağıyla süt köpüğünü kazır → altından uygulama kodu çıkar, gerçek Latte 3B dönerek fincandan yükselir → kodu kopyala → en yakın şube.',
    why: 'Dokunma hissi yüksek, öğrenmesi sıfır saniye. Kod kanal bazlı verilirse uygulamada kullanım = ziyaret ölçümü.',
    html: `
<section class="scene" id="v"></section>
<section class="scene s3" id="s">
  <div class="kicker">ÇOK DA SÜRPRİZ</div>
  <h2 class="hd t">Köpüğün altında<br>ne var?</h2>
  <p class="sub" id="sub">Parmağınla kazı, keşfet.</p>
  <div class="latte" id="latte">
    <div class="prize"><small>SANA ÖZEL</small><b class="hd" id="ot"></b><div class="code" id="code"></div><em id="on"></em></div>
    <canvas id="cv"></canvas>
    <div class="hint" id="hint" style="left:150px;top:100px"></div>
  </div>
  <div class="pop" id="pop"></div>
  <div class="acts" id="acts"><button class="btn alt" id="cp">Kodu kopyala</button><button class="btn" id="go">En yakın Coffy ›</button></div>
</section>
<section class="scene" id="e"></section>`,
    css: `
.s3{touch-action:none;display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 18px 18px}
.s3 .t{font-size:32px;margin-top:6px}
.s3 .sub{font-size:13px;font-weight:600;color:rgba(255,255,255,.75);margin-top:6px}
.latte{position:relative;touch-action:none;width:250px;height:250px;margin-top:14px;border-radius:50%;background:#fff;padding:10px;box-shadow:0 30px 50px -16px rgba(0,0,0,.9),inset 0 -6px 0 rgba(0,0,0,.08)}
.latte::before{content:"";position:absolute;right:-30px;top:92px;width:46px;height:62px;border:10px solid #fff;border-left:0;border-radius:0 40px 40px 0;z-index:-1}
.prize{position:absolute;inset:10px;border-radius:50%;background:radial-gradient(circle at 50% 40%,#3b2416,#140c08);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px}
.prize small{font-size:10px;font-weight:800;letter-spacing:.16em;color:var(--acc2)}
.prize b{font-size:21px;line-height:1.02;margin-top:6px;color:#fff}
.prize .code{margin-top:10px;font-family:var(--h);font-weight:700;font-size:23px;letter-spacing:.08em;padding:6px 12px;border-radius:10px;border:2px dashed var(--acc2);color:var(--acc2)}
.prize em{font-style:normal;font-size:8.5px;color:rgba(255,255,255,.5);margin-top:8px;max-width:150px}
#cv{position:absolute;left:10px;top:10px;width:230px;height:230px;border-radius:50%;touch-action:none;cursor:grab;transition:opacity .6s}
#cv.gone{opacity:0;pointer-events:none}
.pop{position:absolute;left:50%;top:150px;height:190px;margin-left:-70px;opacity:0;transform:perspective(700px) translateY(80px) rotateY(-120deg) scale(.6);transition:transform 1.2s cubic-bezier(.2,1.2,.3,1),opacity .5s;pointer-events:none;filter:drop-shadow(0 22px 24px rgba(0,0,0,.7));z-index:5}
.pop .prod{height:100%}
.pop.on{opacity:1;transform:perspective(700px) translate(118px,40px) rotateY(-14deg) scale(.82)}
.acts{display:flex;gap:8px;margin-top:auto;width:100%;opacity:0;transform:translateY(10px);transition:.4s;pointer-events:none}
.acts.on{opacity:1;transform:none;pointer-events:auto}
.acts .btn{flex:1;padding:13px 8px;font-size:13px}`,
    alt: `
.ad.w .s3{display:grid;grid-template-columns:330px 1fr 250px;grid-template-rows:auto auto 1fr;grid-template-areas:"k . acts" "t . acts" "sub . acts";justify-items:start;text-align:left;padding:56px 26px 20px;column-gap:20px}
.ad.w .s3 .kicker{grid-area:k}.ad.w .s3 .t{grid-area:t;font-size:44px}.ad.w .s3 .sub{grid-area:sub}
.ad.w .latte{position:absolute;left:50%;top:50%;margin:0;transform:translate(-62%,-50%) scale(.84)}
.ad.m .pop{display:none}
.ad.w .pop{left:57%;top:20px;height:210px}
.ad.w .pop.on{transform:perspective(700px) translate(40px,0) rotateY(-14deg) scale(.95)}
.ad.w .acts{grid-area:acts;flex-direction:column;align-self:center;margin:-36px 0 0;width:100%}`,
    js: function () {
      $('#ot').textContent = C.offer.text; $('#code').textContent = C.offer.code; $('#on').textContent = C.offer.note;
      $('#pop').innerHTML = prodImg('latte');
      var cv = $('#cv'), D = Math.min(2, window.devicePixelRatio || 1), W = 230, x = cv.getContext('2d'), last = null, moves = 0, done = false;
      cv.width = W * D; cv.height = W * D; x.scale(D, D);
      // süt köpüğü + latte art
      var gr = x.createRadialGradient(W / 2, W / 2, 10, W / 2, W / 2, W / 2);
      gr.addColorStop(0, '#f8ead6'); gr.addColorStop(.7, '#ecd1ad'); gr.addColorStop(1, '#c8956a');
      x.fillStyle = gr; x.fillRect(0, 0, W, W);
      var sd = 3; var r = function () { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
      for (var i = 0; i < 140; i++) { x.beginPath(); x.arc(r() * W, r() * W, .6 + r() * 2.2, 0, 7); x.fillStyle = 'rgba(255,255,255,' + (.25 + r() * .4) + ')'; x.fill(); }
      for (var k = 0; k < 4; k++) { var s = 1 - k * .2; x.save(); x.translate(W / 2, W / 2 + 4); x.scale(s, s); x.beginPath(); x.moveTo(0, 48); x.bezierCurveTo(-70, 0, -46, -58, 0, -26); x.bezierCurveTo(46, -58, 70, 0, 0, 48); x.fillStyle = k % 2 ? '#f6e4cc' : '#b37b4f'; x.fill(); x.restore(); }
      x.font = '700 15px "Barlow Condensed",Manrope,sans-serif'; x.textAlign = 'center'; x.fillStyle = 'rgba(90,52,34,.75)'; x.fillText('KAZI', W / 2, W - 26);
      x.globalCompositeOperation = 'destination-out'; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 38;
      function scratch(p) {
        if (done) return;
        x.beginPath(); if (last) { x.moveTo(last.x, last.y); x.lineTo(p.x, p.y); x.stroke(); } else { x.arc(p.x, p.y, 19, 0, 7); x.fill(); }
        last = p; if (++moves % 6 === 0) check();
      }
      function check() {
        var d = x.getImageData(0, 0, cv.width, cv.height).data, t = 0, c = 0, R = cv.width / 2;
        for (var yy = 0; yy < cv.height; yy += 8) for (var xx = 0; xx < cv.width; xx += 8) { if ((xx - R) * (xx - R) + (yy - R) * (yy - R) > R * R) continue; t++; if (d[(yy * cv.width + xx) * 4 + 3] < 128) c++; }
        if (c / t > .4) reveal();
      }
      function reveal() {
        if (done) return; done = true; cancel(); cv.classList.add('gone'); burst($('#latte'), 28, 170);
        $('#sub').textContent = 'İşte senin Coffy sürprizin!'; $('#acts').classList.add('on'); track('reveal');
        later(function () { $('#pop').classList.add('on'); }, 250);
        later(function () { $('#go').classList.add('pulse'); }, 800);
        idle(5000, function () { $('#go').click(); });
      }
      // Dinleyiciler tüm sahnede: fincanın dışından başlayan sürüklemeler de köpüğe girince kazır.
      var down = false, lat = $('#s');
      function cp(e) { var rr = cv.getBoundingClientRect(), kk = W / rr.width, q = pt(e, cv); return { x: q.x * kk, y: q.y * kk }; } // ölçekli fincanda tuval koordinatı
      lat.addEventListener('pointerdown', function (e) { if (done || e.target.closest('button')) return; down = true; last = null; $('#hint').style.display = 'none'; lat.setPointerCapture && lat.setPointerCapture(e.pointerId); scratch(cp(e)); });
      lat.addEventListener('pointermove', function (e) { if (down) scratch(cp(e)); });
      lat.addEventListener('pointerup', function () { if (!down) return; down = false; last = null; check(); });
      $('#cp').addEventListener('click', function (e) {
        e.stopPropagation(); var b = this, ok = function () { b.textContent = 'Kopyalandı!'; track('copy_code'); };
        try { navigator.clipboard.writeText(C.offer.code).then(ok, ok); } catch (er) { ok(); }
      });
      $('#go').addEventListener('click', function (e) { e && e.stopPropagation && e.stopPropagation(); endcard($('#e'), { kicker: 'KODUN: ' + C.offer.code, lead: 'Şubede ya da uygulamada kullan. Çok da Coffy.', first: 'latte' }); });
      var cancel = function () {};
      function autoScratch() {
        var pts = [], j; for (j = 0; j <= 40; j++) { var a = j / 40; pts.push({ x: 30 + (j % 2 ? 170 : 0) + a * 10, y: 20 + a * 190 }); }
        $('#hint').style.display = 'none'; last = null; j = 0;
        (function step() { if (done || j >= pts.length) { reveal(); return; } scratch(pts[j++]); later(step, 45); })();
      }
      show('#v');
      playVideo($('#v'), function () { show('#s'); cancel = idle(7000, autoScratch); });
    },
  },

  /* ===================================================================== */
  {
    no: '04', slug: 'zor-mu-kaydir', size: '320x480', name: 'Zor mu? Kaydır.',
    phase: 'Lansman + Sürdürme', channel: 'Mobil interstitial, TikTok Pangle / in-app, Meta Audience Network uyarlaması, masaüstü billboard',
    mechanic: 'Video → 3B destede gençlerin bildiği 3 “zor an” kartı. Sağa kaydır = “Coffy’le hallet”: kart 3B döner, arkasında gerçek Coffy ürünü ve “Çok da Coffy” çıkar. Sola = “Pes etmek yok”. 3/3 → kapanış.',
    why: 'Swipe, Gen Z’nin en doğal hareketi. Kart içerikleri segmente göre değiştirilebilir (öğrenci / genç profesyonel / oyuncu).',
    html: `
<section class="scene" id="v"></section>
<section class="scene w4" id="w">
  <div class="kicker">ZOR MU?</div>
  <h2 class="hd t">Kaydır, hallet.</h2>
  <div class="deck" id="deck"></div>
  <div class="toast" id="toast">Pes etmek yok. Bir Coffy dene?</div>
  <div class="ctl"><button class="btn ghost" id="no">${ICON.x} Pes et</button><button class="btn" id="yes">Coffy’le hallet</button></div>
  <div class="cnt"><span id="cn">0/3 halloldu</span><span class="bn" id="bn"><i></i><i></i><i></i></span></div>
</section>
<section class="scene" id="e"></section>`,
    css: `
.w4{display:flex;flex-direction:column;align-items:center;text-align:center;padding:46px 16px 14px}
.w4 .t{font-size:32px;margin-top:4px}
.deck{position:relative;width:250px;height:262px;margin-top:14px;perspective:1000px;transform-style:preserve-3d}
.card{position:absolute;inset:0;touch-action:none;cursor:grab;transition:transform .45s cubic-bezier(.3,1.25,.5,1),opacity .4s;will-change:transform;transform-style:preserve-3d}
.card.drag{transition:none}
.card .fa,.card .fb{border-radius:24px;padding:18px;display:flex;flex-direction:column;align-items:flex-start;text-align:left;color:var(--ink);box-shadow:0 24px 40px -18px rgba(0,0,0,.9)}
.card .fb{align-items:center;justify-content:center;background:radial-gradient(120% 90% at 50% 15%,#d79a62,#7c4a26 70%,#3a2214);color:#fff}
.card .fb .prod{height:178px;filter:drop-shadow(0 16px 18px rgba(0,0,0,.6))}
.card .fb b{font-family:var(--h);font-weight:700;font-size:24px;letter-spacing:.02em;margin-top:4px}
.card small{font-size:10px;font-weight:800;letter-spacing:.16em;opacity:.7}
.card .fa svg{margin-top:12px}
.card .fa b{font-family:var(--h);font-weight:700;font-size:27px;line-height:1;letter-spacing:.01em;margin-top:auto}
.card .lv{display:flex;gap:4px;margin-top:12px;font-size:10px;font-weight:800;letter-spacing:.1em;align-items:center}
.card .lv i{width:16px;height:6px;border-radius:3px;background:var(--ink)}.card .lv i.o{opacity:.2}
.stamp{position:absolute;top:22px;right:14px;padding:6px 10px;border:3px solid currentColor;border-radius:10px;font-family:var(--h);font-weight:700;font-size:19px;transform:rotate(12deg);opacity:0;color:#0b0b0b;background:rgba(255,255,255,.6)}
.stamp.no{right:auto;left:14px;transform:rotate(-12deg)}
.toast{position:absolute;left:50%;top:330px;transform:translate(-50%,10px);opacity:0;padding:9px 14px;border-radius:999px;background:#fff;color:var(--ink);font-size:12.5px;font-weight:800;white-space:nowrap;transition:.3s;z-index:10;pointer-events:none}
.toast.on{opacity:1;transform:translate(-50%,0)}
.ctl{display:flex;gap:8px;width:100%;margin-top:16px}
.ctl .btn{flex:1;font-size:13.5px;padding:12px 8px}
.cnt{display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:10px;font-size:12px;font-weight:700;color:rgba(255,255,255,.75)}
.bn{display:flex;gap:5px}.bn i{width:12px;height:16px;border-radius:50%;background:rgba(255,255,255,.15);transition:.3s}.bn i.on{background:var(--acc);transform:rotate(20deg)}`,
    alt: `
.ad.w .w4{display:grid;grid-template-columns:300px 1fr 250px;grid-template-rows:auto auto 1fr;grid-template-areas:"k . ctl" "t . ctl" "cnt . ctl";justify-items:start;text-align:left;padding:56px 26px 20px;column-gap:20px}
.ad.w .w4 .kicker{grid-area:k}.ad.w .w4 .t{grid-area:t;font-size:48px}
.ad.w .deck{position:absolute;left:50%;top:50%;width:250px;height:212px;margin:0;transform:translate(-50%,-50%)}
.ad.w .card .fa,.ad.w .card .fb{padding:14px}.ad.w .card .fa svg{width:40px;height:40px;margin-top:6px}.ad.w .card .fa b{font-size:23px}.ad.w .card .fb .prod{height:150px}
.ad.w .ctl{grid-area:ctl;flex-direction:column;align-self:center;margin:-34px 0 0}
.ad.w .cnt{grid-area:cnt;align-self:end;width:200px;margin:0}
.ad.w .toast{top:auto;bottom:12px}`,
    js: function () {
      var CARDS = [
        { k: 'DURUM 1/3', t: 'Final haftası. 4 sınav arka arkaya.', c: '#ffffff', ic: 'book', lv: 5, p: 'cold-brew' },
        { k: 'DURUM 2/3', t: 'Pazartesi, saat 09:00. Kamera açık.', c: '#e9d1ad', ic: 'clock', lv: 4, p: 'iced-latte' },
        { k: 'DURUM 3/3', t: 'Grup ödevi. Herkes sessiz.', c: '#c8864e', ic: 'chat', lv: 4, p: 'pumpkin-latte' },
      ];
      var IC = { book: '__BOOK__', clock: '__CLOCK__', chat: '__CHAT__' };
      var deck = $('#deck'), ok = 0, busy = false, auto = null;
      deck.innerHTML = CARDS.map(function (c, i) {
        var lv = ''; for (var j = 0; j < 5; j++) lv += '<i' + (j < c.lv ? '' : ' class="o"') + '></i>';
        return '<div class="card flip" data-i="' + i + '" style="z-index:' + (10 - i) + '"><div class="fi">' +
          '<div class="fa" style="background:' + c.c + '"><small>' + c.k + '</small>' + IC[c.ic] + '<b>' + esc(c.t) + '</b><div class="lv">ZORLUK ' + lv + '</div><div class="stamp yes">ÇOK DA COFFY</div><div class="stamp no">PES?</div></div>' +
          '<div class="fb">' + prodImg(c.p) + '<b>ÇOK DA COFFY.</b><small>' + esc(P(c.p).name) + '</small></div></div></div>';
      }).join('');
      var cards = $$('.card', deck);
      function top() { return cards[ok]; }
      // 3B deste: arkadaki kartlar geride ve hafif eğik
      function restack() { cards.forEach(function (c, i) { if (i < ok) return; var d = i - ok; c.style.transform = 'translateY(' + d * 12 + 'px) translateZ(' + (-d * 60) + 'px) rotateX(' + (d * 6) + 'deg)'; }); }
      restack();
      function accept() {
        var c = top(); if (!c || busy) return; busy = true;
        $('.stamp.yes', c).style.opacity = 1; c.classList.add('on'); // 3B dönüş: ürün yüzü
        ok++; $$('#bn i')[ok - 1].classList.add('on'); $('#cn').textContent = ok + '/3 halloldu'; track('swipe_yes_' + ok);
        later(function () {
          c.style.transform = 'translate(360px,-40px) rotate(24deg)'; c.style.opacity = 0;
          c.style.pointerEvents = 'none'; later(function () { c.style.visibility = 'hidden'; }, 420); // uçan kart butonların üstünde kalıp tıklamayı yutmasın
          busy = false; restack(); if (ok === 3) finish();
        }, 760);
      }
      function reject() {
        var c = top(); if (!c || busy) return; busy = true; track('swipe_no_' + ok);
        c.style.transform = 'translate(-60px,0) rotate(-8deg)';
        $('#toast').classList.add('on');
        later(function () { restack(); $('.stamp.no', c).style.opacity = 0; busy = false; }, 380);
        later(function () { $('#toast').classList.remove('on'); }, 1500);
      }
      function finish() { clearInterval(auto); burst($('#w'), 26); later(function () { endcard($('#e'), { kicker: 'FİNAL, PAZARTESİ, GRUP ÖDEVİ…', lead: 'Yanında Coffy varsa hiçbiri çok da şey değil.', first: 'pumpkin-latte' }); }, 700); }
      var sx = 0, dx = 0, dragging = null;
      deck.addEventListener('pointerdown', function (e) { var c = e.target.closest('.card'); if (!c || c !== top() || busy) return; clearInterval(auto); dragging = c; sx = e.clientX; dx = 0; c.classList.add('drag'); c.setPointerCapture && c.setPointerCapture(e.pointerId); });
      deck.addEventListener('pointermove', function (e) { if (!dragging) return; dx = e.clientX - sx; dragging.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 14 + 'deg) rotateY(' + dx / 10 + 'deg)'; $('.stamp.yes', dragging).style.opacity = Math.max(0, dx / 90); $('.stamp.no', dragging).style.opacity = Math.max(0, -dx / 90); });
      deck.addEventListener('pointerup', function () { if (!dragging) return; var c = dragging; dragging = null; c.classList.remove('drag'); if (dx > 70) accept(); else if (dx < -70) reject(); else { restack(); $$('.stamp', c).forEach(function (s) { s.style.opacity = 0; }); } });
      $('#yes').addEventListener('click', function (e) { e.stopPropagation(); clearInterval(auto); accept(); });
      $('#no').addEventListener('click', function (e) { e.stopPropagation(); clearInterval(auto); reject(); });
      show('#v');
      playVideo($('#v'), function () { show('#w'); idle(6000, function () { auto = setInterval(accept, 1500); }); });
    },
    // ikonlar build sırasında js içine gömülür
    inject: { __BOOK__: ICON.book, __CLOCK__: ICON.clock, __CHAT__: ICON.chat },
  },

  /* ===================================================================== */
  {
    no: '05', slug: 'cekirdek-avi', size: '320x480', name: 'Çekirdek Avı (Mini Oyun)',
    phase: 'Lansman + Sürdürme', channel: 'Oyun içi playable / interstitial (AppLovin, Unity/LevelPlay, Mintegral), mobil web, masaüstü billboard',
    mechanic: 'Video → 10 saniyelik mini oyun: gerçek Iced Latte bardağını sağa-sola sürükle (hareket yönüne 3B döner), düşen çekirdekleri topla (altın çekirdek +5). Bardak skorla dolar → skor + “Çok da Coffy” + skora özel kod.',
    why: 'Gerçek bir oyun anı: etkileşim süresi uzar, skor paylaşımı ve tekrar oynama doğal. Sürdürmede haftalık skor tablosu.',
    html: `
<section class="scene" id="v"></section>
<section class="scene i5" id="i">
  <div class="kicker">MİNİ OYUN</div>
  <h2 class="hd t">Çekirdek Avı</h2>
  <p class="sub">10 saniyede kaç çekirdek toplarsın?</p>
  <div class="demo">${'<span class="db"></span>'.repeat(5)}<div class="dcup" id="dcup"></div></div>
  <ul class="rules"><li><i class="b"></i>Çekirdek <b>+1</b></li><li><i class="b g"></i>Altın çekirdek <b>+5</b></li></ul>
  <button class="btn pulse" id="start">Başla</button>
</section>
<section class="scene g5" id="g">
  <canvas id="cv"></canvas>
  <div class="hud5"><span>SKOR <b id="sc">0</b></span><div class="tm"><i id="tm"></i></div></div>
  <div class="pl" id="pl"></div>
</section>
<section class="scene r5" id="r">
  <div class="kicker">SÜRE BİTTİ</div>
  <div class="big hd" id="big">0</div>
  <p class="rt" id="rt"></p>
  <div class="slw" id="slw"></div>
  <div class="code5"><small>SKORUNA ÖZEL KOD</small><b id="cd"></b></div>
  <button class="btn" id="claim">Ödülünü al ›</button>
</section>
<section class="scene" id="e"></section>`,
    css: `
.i5,.r5{display:flex;flex-direction:column;align-items:center;text-align:center;padding:50px 20px 22px}
.i5 .t{font-size:52px;margin-top:6px}
.i5 .sub{font-size:13.5px;font-weight:600;color:rgba(255,255,255,.78);margin-top:6px}
.demo{position:relative;width:240px;height:150px;margin-top:12px}
.db{position:absolute;width:16px;height:21px;border-radius:50%;background:#6b3d24;animation:fall 1.8s linear infinite}
.db::after{content:"";position:absolute;left:46%;top:12%;width:2px;height:76%;background:rgba(0,0,0,.35);transform:rotate(10deg)}
.db:nth-child(1){left:30px}.db:nth-child(2){left:90px;animation-delay:-.6s}.db:nth-child(3){left:150px;animation-delay:-1.2s;background:#ffc53a}.db:nth-child(4){left:200px;animation-delay:-.3s}.db:nth-child(5){left:120px;animation-delay:-.9s}
@keyframes fall{from{transform:translateY(-20px) rotate(0)}to{transform:translateY(120px) rotate(200deg)}}
.dcup{position:absolute;bottom:-10px;left:96px;animation:slide 2.4s ease-in-out infinite alternate}
.dcup .pf{height:84px}
@keyframes slide{from{transform:translateX(-80px) perspective(500px) rotateY(-30deg)}to{transform:translateX(80px) perspective(500px) rotateY(30deg)}}
.rules{list-style:none;display:flex;gap:16px;margin-top:20px;font-size:12.5px;font-weight:700;color:rgba(255,255,255,.85)}
.rules li{display:flex;align-items:center;gap:6px}
.rules .b{width:11px;height:14px;border-radius:50%;background:#8a5233;display:inline-block}.rules .b.g{background:#ffc53a}
.i5 .btn{margin-top:auto;width:100%;font-size:16px}
.g5{cursor:ew-resize;touch-action:none}
.g5 canvas{position:absolute;inset:0;width:320px;height:480px}
.hud5{position:absolute;top:14px;right:14px;left:110px;display:flex;align-items:center;gap:10px;font-size:11px;font-weight:800;letter-spacing:.1em}
.hud5 b{font-family:var(--h);font-size:24px;letter-spacing:0;color:var(--acc2);margin-left:4px}
.tm{flex:1;height:8px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden}.tm i{display:block;height:100%;width:100%;background:var(--acc);transform-origin:left}
.pl{position:absolute;left:0;top:372px;width:80px;margin-left:-40px;will-change:transform;text-align:center}
.pl .pf{height:100px;transition:transform .2s;transform:perspective(500px) rotateY(var(--ry,0deg))}
.r5 .big{font-size:120px;color:var(--acc2);margin-top:6px;line-height:.9}
.r5 .rt{font-size:15px;font-weight:700;margin-top:4px}
.slw{font-size:56px;margin-top:16px}
.code5{margin-top:auto;width:100%;padding:12px;border-radius:16px;border:2px dashed rgba(233,209,173,.6)}
.code5 small{display:block;font-size:10px;font-weight:800;letter-spacing:.14em;color:rgba(255,255,255,.65)}
.code5 b{font-family:var(--h);font-size:26px;letter-spacing:.08em;color:var(--acc2)}
.r5 .btn{width:100%;margin-top:10px}`,
    alt: `
.ad.w .i5{display:grid;grid-template-columns:320px 1fr 250px;grid-template-rows:auto auto auto 1fr;grid-template-areas:"k demo go" "t demo go" "sub demo go" "rules demo go";justify-items:start;text-align:left;padding:50px 26px 20px;column-gap:20px}
.ad.w .i5 .kicker{grid-area:k}.ad.w .i5 .t{grid-area:t;font-size:58px;margin-top:2px}.ad.w .i5 .sub{grid-area:sub}
.ad.w .demo{grid-area:demo;justify-self:center;margin:-24px 0 0;height:190px}
.ad.w .rules{grid-area:rules;margin-top:12px}
.ad.w .i5 .btn{grid-area:go;align-self:center;margin:-30px 0 0}
.ad.w .pl .pf{height:86px}
.ad.w .r5{display:grid;grid-template-columns:260px 1fr 270px;grid-template-rows:auto auto 1fr;grid-template-areas:"k slw code" "big slw code" "rt slw claim";justify-items:start;text-align:left;padding:50px 26px 20px;column-gap:20px}
.ad.w .r5 .kicker{grid-area:k}.ad.w .r5 .big{grid-area:big;font-size:100px;margin-top:2px}.ad.w .r5 .rt{grid-area:rt;font-size:13px}
.ad.w .slw{grid-area:slw;align-self:center;justify-self:center;margin:-30px 0 0;font-size:68px}
.ad.w .code5{grid-area:code;margin:0;align-self:end}.ad.w .r5 .btn{grid-area:claim;align-self:start;margin-top:10px}`,
    js: function () {
      $('#dcup').innerHTML = cup(1, C.hero); $('#pl').innerHTML = cup(.12, C.hero); $('#slw').innerHTML = slogan(); $('#cd').textContent = C.offer.code;
      var cv = $('#cv'), D = Math.min(2, window.devicePixelRatio || 1), x = cv.getContext('2d'), SZ = size(), W = SZ.w, H = SZ.h, CY = H - 100, SP = H / 480;
      $('#pl').style.top = CY - 8 + 'px'; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      cv.width = W * D; cv.height = H * D; x.scale(D, D);
      var beans = [], px = W / 2, tx = W / 2, score = 0, T = 10000, t0 = 0, lastS = 0, run = false, demo = false, raf, prev;
      function spawn(now) { if (now - lastS < 360) return; lastS = now; var gold = Math.random() < .14; beans.push({ x: 24 + Math.random() * (W - 48), y: -20, v: (150 + Math.random() * 110 + (now - t0) / 60) * Math.max(.55, SP), r: Math.random() * 6, g: gold }); }
      function drawBean(b) {
        x.save(); x.translate(b.x, b.y); x.rotate(b.r);
        var gr = x.createLinearGradient(-9, -12, 9, 12); gr.addColorStop(0, b.g ? '#ffe08a' : '#a0643c'); gr.addColorStop(1, b.g ? '#d69a12' : '#4e2a16');
        x.beginPath(); x.ellipse(0, 0, 9, 12, 0, 0, 7); x.fillStyle = gr; x.fill();
        x.beginPath(); x.moveTo(-1, -9); x.quadraticCurveTo(3, 0, -1, 9); x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 2; x.stroke();
        if (b.g) { x.beginPath(); x.arc(0, 0, 16, 0, 7); x.strokeStyle = 'rgba(255,197,58,.35)'; x.lineWidth = 3; x.stroke(); }
        x.restore();
      }
      function pop(b, v) { var f = document.createElement('div'); f.textContent = '+' + v; f.style.cssText = 'position:absolute;left:' + (b.x - 10) + 'px;top:' + (CY - 30) + 'px;font-family:var(--h);font-weight:700;font-size:22px;color:' + (v > 1 ? '#ffc53a' : '#5fe0bd') + ';animation:up .8s ease-out forwards;pointer-events:none'; $('#g').appendChild(f); later(function () { f.remove(); }, 800); }
      function frame(now) {
        var dt = Math.min(50, now - (prev || now)) / 1000; prev = now;
        var left = Math.max(0, T - (now - t0)); $('#tm').style.transform = 'scaleX(' + left / T + ')';
        if (left > 0) spawn(now);
        if (demo) { var tgt = beans.filter(function (b) { return b.y < CY; }).sort(function (a, b) { return (b.g - a.g) || (b.y - a.y); })[0]; if (tgt) tx = tgt.x; }
        var ox = px; px += (tx - px) * Math.min(1, dt * 14); $('#pl').style.transform = 'translateX(' + px + 'px)';
        $('#pl').style.setProperty('--ry', Math.max(-35, Math.min(35, (px - ox) * 3)) + 'deg'); // hareket yönüne 3B dönüş
        x.clearRect(0, 0, W, H);
        for (var i = beans.length - 1; i >= 0; i--) {
          var b = beans[i]; b.y += b.v * dt; b.r += dt * 3;
          if (b.y > CY && b.y < CY + 30 && Math.abs(b.x - px) < 34) { var v = b.g ? 5 : 1; score += v; pop(b, v); beans.splice(i, 1); $('#sc').textContent = score; setFill($('#pl'), .12 + Math.min(.88, score / 30)); continue; }
          if (b.y > H + 20) { beans.splice(i, 1); continue; }
          drawBean(b);
        }
        if (left > 0 || beans.length) raf = requestAnimationFrame(frame); else end();
      }
      function begin(isDemo) {
        if (run) return; run = true; demo = !!isDemo; track(demo ? 'game_demo' : 'game_start');
        show('#g'); t0 = performance.now(); prev = 0; raf = requestAnimationFrame(frame);
      }
      function end() {
        track('game_end', { score: score });
        $('#big').textContent = score; $('#rt').textContent = score < 8 ? 'Isınma turu! Bir Coffy, bir tur daha?' : score < 18 ? 'Fena değil! Bir Coffy’le daha da iyisi.' : 'Efsane skor! Çok da Coffy.';
        show('#r'); burst($('#r'), 26);
        idle(4500, function () { $('#claim').click(); });
      }
      var g = $('#g');
      g.addEventListener('pointerdown', function (e) { demo = false; tx = pt(e, g).x; });
      g.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || e.buttons || e.pressure) { demo = false; tx = pt(e, g).x; } });
      $('#start').addEventListener('click', function (e) { e.stopPropagation(); begin(false); });
      $('#claim').addEventListener('click', function (e) { e && e.stopPropagation && e.stopPropagation(); endcard($('#e'), { kicker: 'SKORUN ' + score + ' · KODUN ' + C.offer.code, lead: 'Ödülünü en yakın Coffy’de ya da uygulamada kullan.', first: C.hero }); });
      show('#v');
      playVideo($('#v'), function () { show('#i'); idle(4500, function () { begin(true); }); });
    },
  },

  /* ===================================================================== */
  {
    no: '06', slug: 'en-yakin-coffy', size: '320x480', name: 'En Yakın Coffy (Konum)',
    phase: 'Sürdürme (always-on)', channel: 'Lokasyon hedefli mobil: DV360/TTD geo-fence, in-app (MRAID konum), masaüstü billboard',
    mechanic: 'Video → 3B eğimli şehir haritası: kullanıcının konumu ve gerçek şube listesinden en yakın Coffy, ayakta duran 3B pin ve yürüme rotası; mesafe, yürüme süresi, gün dilimine göre mesaj. CTA: Yol tarifi (Haritalar’da Coffy araması) / Sipariş.',
    why: 'Şubenin 300 m–1 km çevresinde, “şimdi uğra” anında görünür; tıklama doğrudan haritada en yakın Coffy’lere gider.',
    html: `
<section class="scene" id="v"></section>
<section class="scene m6" id="m">
  <div class="plane" id="plane"><div class="mapw" id="mapw"></div><svg class="route" id="route"><path id="rp" d=""/></svg><div class="me" id="me"><i></i></div><i class="anc" id="anc"></i></div>
  <div class="spin" id="spin"><div class="pb" id="pbl"></div><i></i></div>
  <div class="top6"><div class="chip" id="chip"></div><h2 class="hd" id="hl"></h2></div>
  <div class="sheet" id="sheet">
    <div class="sh-h"><div class="sp" id="shp"></div><div><b id="sn"></b><small id="ss"></small></div><span class="dist hd" id="sd"></span></div>
    <p class="dp" id="dpl"></p>
    <div class="row"><button class="btn" data-exit="directions">Yol tarifi al</button><button class="btn ghost dk" data-exit="app">Sipariş ver</button></div>
  </div>
</section>`,
    css: `
.m6{overflow:hidden;background:#0b0b0b}
.plane{position:absolute;transform-origin:50% 100%;transform:perspective(900px) rotateX(52deg);transform-style:preserve-3d}
.plane .map{display:block}
.route{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}
.route path{fill:none;stroke:var(--acc2);stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:3 12}
.route path.anim{animation:dash 1s linear infinite}
@keyframes dash{to{stroke-dashoffset:-30}}
.me{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#4aa3ff;border:4px solid #fff;animation:me 1.8s ease-out infinite}
@keyframes me{0%{box-shadow:0 0 0 0 rgba(74,163,255,.6)}100%{box-shadow:0 0 0 34px rgba(74,163,255,0)}}
.anc{position:absolute;width:2px;height:2px;margin:-1px}
.spin{position:absolute;width:0;height:0;z-index:4}
.spin .pb{position:absolute;left:0;bottom:30px;transform:translateX(-50%);padding:8px 12px;border-radius:12px;background:#fff;color:#0b0b0b;box-shadow:0 18px 30px -8px rgba(0,0,0,.8);white-space:nowrap;animation:pin .9s cubic-bezier(.3,1.6,.5,1) both}
.spin .pb .logo{font-size:20px;color:#0b0b0b}
.spin>i{position:absolute;left:-2px;bottom:0;width:4px;height:32px;background:linear-gradient(#fff,rgba(255,255,255,.2))}
.spin::after{content:"";position:absolute;left:-20px;top:-8px;width:40px;height:16px;border-radius:50%;background:radial-gradient(closest-side,rgba(200,134,78,.8),transparent)}
@keyframes pin{from{transform:translate(-50%,-60px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
.top6{position:absolute;left:0;right:0;top:0;padding:46px 16px 60px;background:linear-gradient(#0b0b0b 55%,transparent)}
.chip{display:inline-flex;font-size:10.5px;font-weight:800;letter-spacing:.12em;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.12);color:var(--acc2)}
.top6 h2{font-size:32px;margin-top:8px}
.top6 h2 em{font-style:normal;color:var(--acc2)}
.sheet{position:absolute;left:8px;right:8px;bottom:8px;padding:14px;border-radius:22px;background:#fff;color:var(--ink);box-shadow:0 -10px 30px -10px rgba(0,0,0,.6);transform:translateY(110%);transition:transform .6s cubic-bezier(.3,1.2,.5,1)}
.sheet.on{transform:none}
.sh-h{display:flex;align-items:center;gap:10px}
.sh-h .sp{height:58px;flex:none;margin:-22px 0 -6px -4px}
.sh-h b{display:block;font-size:15px}.sh-h small{display:block;font-size:11.5px;font-weight:600;color:rgba(11,11,11,.65);margin-top:2px}
.sh-h .dist{margin-left:auto;font-size:28px;color:var(--acc);white-space:nowrap}
.dp{font-size:12.5px;font-weight:700;margin-top:8px;color:rgba(11,11,11,.8)}
.row{display:flex;gap:8px;margin-top:10px}.row .btn{flex:1;font-size:13px;padding:12px 6px}
.sheet .btn:not(.dk){background:var(--ink);color:#fff;box-shadow:none}
.btn.dk{color:var(--ink);box-shadow:inset 0 0 0 1.5px rgba(11,11,11,.2);background:transparent}`,
    alt: `
.ad.w .top6{right:auto;bottom:0;width:440px;padding:54px 26px 20px;background:linear-gradient(90deg,#0b0b0b 62%,transparent)}
.ad.w .top6 h2{font-size:46px}
.ad.w .sheet{left:auto;right:12px;top:12px;bottom:12px;width:330px;display:flex;flex-direction:column;justify-content:center;transform:translateX(115%)}
.ad.w .sheet.on{transform:none}`,
    js: function () {
      var G = locate(), s = G.near, dp = daypart(), SZ = size(), wide = !isM();
      var DL = { morning: 'Derse giderken tam yolunun üstünde.', noon: 'Öğle arasına tam mesafe.', evening: 'Akşam molası için yolun üstünde.', night: 'Yarın sabah ilk durak burası.' };
      var DN = { morning: 'SABAH', noon: 'ÖĞLE', evening: 'AKŞAM', night: 'GECE' };
      // 3B harita düzlemi: reklamdan geniş, alt kenarından geriye yatırılmış
      var PW = Math.round(SZ.w * 1.5), PH = Math.round(SZ.h * (wide ? 1.9 : 1.25)), plane = $('#plane');
      plane.style.width = PW + 'px'; plane.style.height = PH + 'px'; plane.style.left = (SZ.w - PW) / 2 + 'px'; plane.style.top = (SZ.h - PH + (wide ? 20 : 30)) + 'px';
      $('#mapw').innerHTML = mapBg(PW, PH); $('#pbl').innerHTML = logo();
      $('#route').setAttribute('width', PW); $('#route').setAttribute('height', PH);
      // Kullanıcı ve şube, ekranda başlık ile şube kartı arasındaki görünür harita bandına denk gelecek şekilde yerleşir
      var off = (PW - SZ.w) / 2, host = $('#m'), u = { x: (wide ? 500 : SZ.w * .42) + off }, p = project(G.user, s, u.x, PH * .8, PH * .4);
      p.x = Math.min(off + (wide ? 610 : SZ.w - 70), Math.max(off + (wide ? 470 : 70), p.x));
      $('#me').style.left = u.x + 'px'; u.y = planeY($('#me'), host, wide ? 214 : 268, PH);
      $('#anc').style.left = p.x + 'px'; p.y = planeY($('#anc'), host, wide ? 132 : 214, PH);
      var sp = screenPos($('#anc'), host); $('#spin').style.left = sp.x + 'px'; $('#spin').style.top = sp.y + 'px';
      $('#rp').setAttribute('d', 'M' + u.x + ' ' + u.y + ' L' + u.x + ' ' + (p.y + 50) + ' L' + p.x + ' ' + (p.y + 50) + ' L' + p.x + ' ' + (p.y + 6));
      $('#chip').textContent = DN[dp] + ' · ' + clock() + (G.src === 'fallback' ? ' · ' + C.geo.fallback.area.toUpperCase() : '');
      $('#hl').innerHTML = 'En yakın Coffy<br><em>' + fmtDist(s.m) + '</em> ötede.';
      $('#shp').innerHTML = prodImg(C.hero);
      $('#sn').textContent = s.name; $('#ss').innerHTML = esc(place(s)) + ' · ' + s.min + ' dk yürüme'; $('#sd').textContent = fmtDist(s.m);
      $('#dpl').textContent = DL[dp] + ' Çok da Coffy.';
      bindExits($('#m'));
      show('#v');
      playVideo($('#v'), function () {
        show('#m'); $('#spin').style.display = 'none';
        later(function () { $('#spin').style.display = ''; $('#rp').classList.add('anim'); }, 300);
        later(function () { $('#sheet').classList.add('on'); track('endcard'); }, 900);
      });
    },
  },

  /* ===================================================================== */
  {
    no: '07', slug: 'ruh-halin-ne', size: '320x480', name: 'Ruh Halin Ne? (Barista Önerisi)',
    phase: 'Sürdürme', channel: 'Mobil interstitial, in-app, Meta / TikTok uyarlaması, masaüstü billboard',
    mechanic: 'Video → “Bugün nasılsın?” 4 ruh hali → 3B barista makarası (gerçek ürünlerden oluşan silindir) döner ve ruh haline göre menüden bir içecekte durur → en yakın şube / sipariş.',
    why: 'Kişiselleştirilmiş sonuç = paylaşılabilir an. Menü önerisi ürün çeşitliliğini lansman mesajına bağlar.',
    html: `
<section class="scene" id="v"></section>
<section class="scene p7" id="p">
  <div class="kicker">BARİSTA SORUYOR</div>
  <h2 class="hd t">Bugün nasılsın?</h2>
  <div class="grid7" id="grid">
    <button class="tile" data-k="sleepy" style="--c:#8e7cff"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="var(--c)"/><path d="M11 18q3 3 6 0M23 18q3 3 6 0" stroke="#1d110b" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="20" cy="27" r="2.6" fill="#1d110b"/><text x="30" y="11" font-size="9" font-weight="800" fill="#fff">z</text></svg><b>Uykulu</b></button>
    <button class="tile" data-k="stressed" style="--c:#ff7a59"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="var(--c)"/><path d="M11 15l5 3-5 3M29 15l-5 3 5 3" stroke="#1d110b" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 28q2-3 4 0t4 0 4 0 4 0" stroke="#1d110b" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg><b>Stresli</b></button>
    <button class="tile" data-k="social" style="--c:#ffc53a"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="var(--c)"/><path d="M11 17q3-4 6 0M23 17q3-4 6 0" stroke="#1d110b" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M11 23q9 10 18 0z" fill="#1d110b"/></svg><b>Sosyal</b></button>
    <button class="tile" data-k="focus" style="--c:#5fe0bd"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="var(--c)"/><circle cx="14" cy="17" r="4.5" fill="none" stroke="#1d110b" stroke-width="2.2"/><circle cx="26" cy="17" r="4.5" fill="none" stroke="#1d110b" stroke-width="2.2"/><path d="M18.5 17h3" stroke="#1d110b" stroke-width="2.2"/><path d="M14 27h12" stroke="#1d110b" stroke-width="2.4" stroke-linecap="round"/></svg><b>Odakta</b></button>
  </div>
  <p class="sub">Ruh haline göre Coffy’ni seçelim.</p>
</section>
<section class="scene s7" id="s">
  <div class="kicker">BARİSTA HAZIRLIYOR…</div>
  <div class="reel3d"><div class="cyl" id="cyl"></div></div>
  <b class="rn hd" id="rn"></b>
</section>
<section class="scene" id="e"></section>`,
    css: `
${IN3D}
.p7,.s7{display:flex;flex-direction:column;align-items:center;text-align:center;padding:50px 18px 18px}
.p7 .t{font-size:38px;margin-top:6px}
.grid7{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-top:20px;perspective:800px}
.tile{appearance:none;border:0;cursor:pointer;height:128px;border-radius:22px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--cream);transition:transform .3s,background .2s}
.p7.on .tile{animation:in3d .7s cubic-bezier(.2,.9,.25,1) both}.p7.on .tile:nth-child(2){animation-delay:.07s}.p7.on .tile:nth-child(3){animation-delay:.14s}.p7.on .tile:nth-child(4){animation-delay:.21s}
.tile svg{width:62px;height:62px;transition:transform .3s}
.tile:hover{transform:rotateX(10deg) translateY(-3px)}.tile:hover svg{transform:rotate(-8deg) scale(1.08)}
.tile b{font-size:15px}
.tile.sel{background:var(--c);color:var(--ink);transform:scale(1.04)}
.p7 .sub{font-size:13px;font-weight:600;color:rgba(255,255,255,.7);margin-top:auto}
/* 3B makara: ürünler silindirin yüzlerinde */
.reel3d{position:relative;width:220px;height:250px;margin-top:20px;perspective:900px;-webkit-mask:linear-gradient(transparent,#000 22%,#000 78%,transparent);mask:linear-gradient(transparent,#000 22%,#000 78%,transparent)}
.cyl{position:absolute;inset:0;transform-style:preserve-3d;transition:transform 2.4s cubic-bezier(.12,.75,.18,1)}
.cyl .ci{position:absolute;left:0;right:0;top:50%;height:150px;margin-top:-75px;display:flex;justify-content:center;-webkit-backface-visibility:hidden;backface-visibility:hidden}
.cyl .ci .prod{height:150px;filter:drop-shadow(0 10px 12px rgba(0,0,0,.6))}
.s7 .rn{font-size:34px;margin-top:10px;color:var(--acc2);min-height:34px}`,
    alt: `
.ad.w .p7{display:grid;grid-template-columns:270px 1fr;grid-template-rows:auto auto 1fr;grid-template-areas:"k grid" "t grid" "sub grid";justify-items:start;text-align:left;padding:56px 26px 20px;column-gap:24px}
.ad.w .p7 .kicker{grid-area:k}.ad.w .p7 .t{grid-area:t;font-size:50px}.ad.w .p7 .sub{grid-area:sub;margin-top:10px}
.ad.w .grid7{grid-area:grid;grid-template-columns:repeat(4,1fr);margin:-36px 0 0;align-self:center}
.ad.w .tile{height:164px}
.ad.w .s7{flex-direction:row;justify-content:center;gap:40px;padding:0 20px}
.ad.w .reel3d{margin:0;height:250px}.ad.w .s7 .rn{margin:0;width:300px;text-align:left;font-size:44px}`,
    js: function () {
      var WHY = { sleepy: 'Gözler kapanıyorsa:', stressed: 'Stres mi? Buz gibi bir', social: 'Ekip toplandıysa:', focus: 'Odak modu açık:' };
      var keys = C.productKeys, n = keys.length, step = 360 / n, Rz = Math.round(75 / Math.tan(Math.PI / n)) + 30, picked = false;
      $('#cyl').innerHTML = keys.map(function (k, i) { return '<div class="ci" style="transform:rotateX(' + (-i * step) + 'deg) translateZ(' + Rz + 'px)">' + prodImg(k) + '</div>'; }).join('');
      $('#cyl').style.transform = 'translateZ(' + (-Rz) + 'px) rotateX(0deg)';
      function pick(k) {
        if (picked) return; picked = true; cancel();
        var t = $('.tile[data-k="' + k + '"]'); t.classList.add('sel'); track('mood_' + k);
        var d = C.drinks[k], idx = keys.indexOf(d);
        later(function () {
          show('#s');
          // 3 tam tur + hedef ürün: makara ürünün yüzünde durur
          later(function () { $('#cyl').style.transform = 'translateZ(' + (-Rz) + 'px) rotateX(' + (360 * 3 + idx * step) + 'deg)'; }, 80);
          later(function () { $('#rn').textContent = P(d).name; burst($('#s'), 20, 150); }, 2500);
          later(function () { endcard($('#e'), { kicker: 'SANA ÖZEL: <span lang="en">' + esc(P(d).name) + '</span>', first: d, lead: WHY[k] + ' ' + P(d).name + '. Ruh halin ne olursa olsun, çok da Coffy.' }); }, 3600);
        }, 500);
      }
      $('#grid').addEventListener('click', function (e) { var t = e.target.closest('.tile'); if (t) pick(t.getAttribute('data-k')); });
      var cancel = function () {};
      show('#v');
      playVideo($('#v'), function () { show('#p'); cancel = idle(6500, function () { var ks = Object.keys(C.drinks); pick(ks[Math.floor(Math.random() * ks.length)]); }); });
    },
  },
];
