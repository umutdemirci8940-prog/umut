'use strict';
/* eslint-disable no-undef */
/**
 * 970x250 billboard konseptleri (3 adet).
 */
module.exports = [
  /* ===================================================================== */
  {
    no: '08', slug: 'coffy-seviyesi', size: '970x250', name: 'Coffy Seviyesi (Video + Kaydırıcı)',
    phase: 'Lansman', channel: 'Masaüstü billboard: DV360 / TTD, haber & spor & oyun içerik siteleri, YouTube masaüstü ile eş zamanlı',
    mechanic: 'Solda ana video döngüde (sesi açılabilir). Sağda “Bugün ne kadar Coffy’sin?” kaydırıcısı: kaydırdıkça bardak dolar, başlık “Az da Coffy → Orta da Coffy → Çok da Coffy.” olur; %100’de en yakın şube + sipariş CTA’sı açılır.',
    why: 'Video ve interaksiyon aynı karede: video izlenirken kullanıcı oynar. Kampanya sözü (“çok da”) bizzat kullanıcının hareketiyle tamamlanır.',
    html: `
<div class="v8" id="v"></div>
<div class="p8" id="p8">
  <div class="kicker">BUGÜN NE KADAR COFFY’SİN?</div>
  <div class="lh hd" id="lh">Az da Coffy.</div>
  <div class="sl" id="sl"><div class="tr"><i id="fb"></i></div><div class="kn" id="kn"><span></span></div><div class="lb"><span>AZ</span><span>ORTA</span><span>ÇOK</span></div></div>
  <div class="ct8" id="ct8"><div class="st8" id="st8"></div><div class="bt8"><button class="btn" data-exit="directions">Yol tarifi al</button><button class="btn ghost" data-exit="app">Sipariş ver</button></div></div>
</div>
<div class="c8" id="c8"></div>
<div class="hint" id="hint" style="display:none"></div>`,
    css: `
.ad-logo{left:476px;top:16px}
.v8{position:absolute;left:0;top:0;width:444px;height:250px}
.v8::after{content:"";position:absolute;right:0;top:0;bottom:0;width:40px;background:linear-gradient(90deg,transparent,rgba(29,17,11,.85));pointer-events:none;z-index:3}
.p8{position:absolute;left:476px;top:50px;width:330px}
.lh{font-size:46px;margin-top:6px;height:48px;white-space:nowrap}
.lh .slogan{font-size:46px;flex-direction:row;align-items:baseline;gap:10px}.lh .slogan .s1{font-size:46px;margin:0}
.sl{position:relative;width:300px;height:56px;margin-top:22px;touch-action:none;cursor:pointer;transition:opacity .4s,transform .4s}
.sl .tr{position:absolute;left:0;right:0;top:12px;height:12px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden}
.sl .tr i{display:block;height:100%;width:0;background:linear-gradient(90deg,#c88b58,var(--acc))}
.sl .kn{position:absolute;top:0;left:0;width:36px;height:36px;margin-left:-18px;border-radius:50%;background:var(--cream);box-shadow:0 6px 16px -4px rgba(0,0,0,.7);display:grid;place-items:center}
.sl .kn span{width:13px;height:17px;border-radius:50%;background:#6b3d24;position:relative}
.sl .kn span::after{content:"";position:absolute;left:45%;top:12%;width:2px;height:76%;background:rgba(0,0,0,.35);transform:rotate(10deg)}
.sl .lb{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;font-size:10px;font-weight:800;letter-spacing:.14em;color:rgba(251,239,223,.6)}
.p8.done .sl{opacity:0;transform:translateY(10px);pointer-events:none}
.ct8{position:absolute;left:0;top:96px;width:330px;opacity:0;transform:translateY(12px);transition:.5s .15s;pointer-events:none}
.p8.done .ct8{opacity:1;transform:none;pointer-events:auto}
.st8{font-size:12.5px;font-weight:700;color:rgba(251,239,223,.8)}.st8 b{color:var(--acc2)}
.bt8{display:flex;gap:8px;margin-top:10px}
.c8{position:absolute;right:26px;top:12px;width:150px;height:230px;display:grid;place-items:center}
.c8 .cup{height:226px;width:auto}
.c8::before{content:"";position:absolute;inset:20px 0 0;border-radius:50%;background:radial-gradient(closest-side,rgba(255,90,44,.35),transparent);z-index:-1}`,
    js: function () {
      $('#c8').innerHTML = cup(.08);
      var s = locate().near, v = 0, done = false, p8 = $('#p8'), sl = $('#sl'), hint = $('#hint');
      $('#st8').innerHTML = 'En yakın Coffy: <b>' + esc(s.name) + '</b> · ' + fmtDist(s.m) + ' · ' + s.min + ' dk' + smp();
      bindExits(p8);
      function set(nv) {
        v = Math.max(0, Math.min(100, nv)); var x = v / 100 * 300;
        $('#kn').style.left = x + 'px'; $('#fb').style.width = v + '%'; setFill($('#c8'), .08 + v / 100 * .86);
        if (!done) $('#lh').textContent = v < 34 ? 'Az da Coffy.' : v < 67 ? 'Orta da Coffy.' : v < 100 ? 'Biraz daha…' : '';
        if (v >= 100 && !done) finish();
      }
      function finish() {
        done = true; $('#lh').innerHTML = '<div class="slogan"><span class="s1">Çok da</span><span class="s2">Coffy<i>.</i></span></div>';
        p8.classList.add('done'); hint.style.display = 'none'; burst($('#c8'), 26, 130); track('level_full'); track('endcard');
      }
      var drag = false;
      function at(e) { set(pt(e, sl).x / 300 * 100); }
      sl.addEventListener('pointerdown', function (e) { if (done) return; drag = true; hint.style.display = 'none'; stop(); sl.setPointerCapture && sl.setPointerCapture(e.pointerId); at(e); });
      sl.addEventListener('pointermove', function (e) { if (drag) at(e); });
      sl.addEventListener('pointerup', function () { drag = false; track('level_' + Math.round(v)); });
      var tm = null;
      function stop() { clearInterval(tm); }
      function demo() {
        hint.style.display = ''; var k = 0;
        tm = setInterval(function () { k += 2; set(k); hint.style.left = (476 + v / 100 * 300 - 17) + 'px'; hint.style.top = '122px'; if (k >= 100) stop(); }, 45);
      }
      set(0);
      playVideo($('#v'), null, { loop: true });
      idle(2600, demo);
    },
  },

  /* ===================================================================== */
  {
    no: '09', slug: 'senaryonu-sec', size: '970x250', name: 'Senaryonu Seç',
    phase: 'Lansman + Sürdürme', channel: 'Masaüstü billboard: DV360 / TTD, PMP (oyun, e-spor, üniversite / kariyer içerikleri)',
    mechanic: 'Ana video tam genişlikte açılır (5 sn, geçilebilir) → üç senaryo paneli: Sınav haftası / Pazartesi 09:00 / Oyun gecesi. Seçilen panelde “zorluk” barı %95’ten “Coffy sonrası” %15’e iner, “Çok da Coffy” damgası basılır.',
    why: 'Videodaki hikâyeyi kullanıcının kendi hayatına bağlar; hangi senaryonun seçildiği ölçülerek sürdürme dönemi kreatif/hedefleme kararlarına veri sağlar.',
    html: `
<section class="scene" id="v"></section>
<section class="scene s9" id="p">
  <div class="l9"><h2 class="hd">Hangisi<br>sensin?</h2><p>Birini seç, gerisini<br>Coffy halleder.</p></div>
  <div class="pns" id="pns"></div>
  <div class="r9"><div id="sl9"></div><div class="st9" id="st9"></div><button class="btn" data-exit="directions">Yol tarifi al</button></div>
</section>`,
    css: `
.s9 .l9{position:absolute;left:16px;top:52px;width:170px}
.s9 .l9 h2{font-size:36px}
.s9 .l9 p{font-size:12.5px;font-weight:600;line-height:1.35;color:rgba(251,239,223,.75);margin-top:10px}
.pns{position:absolute;left:196px;right:232px;top:14px;bottom:14px;display:flex;gap:8px}
.pn{position:relative;flex:1;border:0;cursor:pointer;border-radius:20px;padding:14px;text-align:left;color:var(--ink);background:var(--c);overflow:hidden;display:flex;flex-direction:column;transition:flex .45s cubic-bezier(.3,1.2,.5,1),filter .3s}
.pns:hover .pn{filter:saturate(.7) brightness(.85)}.pns .pn:hover,.pns .pn.done{flex:1.45;filter:none}
.s9.on .pn{animation:rise .5s both}.s9.on .pn:nth-child(2){animation-delay:.08s}.s9.on .pn:nth-child(3){animation-delay:.16s}
.pn small{font-size:9.5px;font-weight:800;letter-spacing:.16em;opacity:.7}
.pn b{font-family:var(--h);font-weight:800;font-size:23px;line-height:.98;letter-spacing:-.03em;margin-top:6px}
.pn em{font-style:normal;font-size:11.5px;font-weight:700;opacity:.75;margin-top:4px}
.pn .mt{margin-top:auto}
.pn .ml{display:flex;justify-content:space-between;font-size:9.5px;font-weight:800;letter-spacing:.12em}
.pn .ml span:last-child{font-family:var(--h);font-size:14px;letter-spacing:0}
.pn .mb{height:9px;border-radius:9px;background:rgba(29,17,11,.18);margin-top:4px;overflow:hidden}
.pn .mb i{display:block;height:100%;width:95%;background:var(--ink);border-radius:9px;transition:width 1.1s cubic-bezier(.3,1,.4,1)}
.pn.done .mb i{width:15%}
.pn .stp{position:absolute;right:10px;bottom:60px;padding:5px 9px;border:3px solid var(--ink);border-radius:10px;font-family:var(--h);font-weight:800;font-size:15px;transform:rotate(10deg) scale(1.6);opacity:0;transition:.35s cubic-bezier(.3,1.6,.5,1);background:rgba(255,255,255,.45)}
.pn.done .stp{opacity:1;transform:rotate(10deg) scale(1)}
.pn .ic{position:absolute;right:-10px;bottom:28px;opacity:.16;transform:rotate(-12deg)}
.r9{position:absolute;right:16px;top:44px;width:200px;display:flex;flex-direction:column;align-items:flex-start}
.r9 .slogan{font-size:46px}
.st9{font-size:11.5px;font-weight:700;color:rgba(251,239,223,.75);margin:14px 0 10px;line-height:1.35}.st9 b{color:var(--acc2)}
.r9 .btn{width:100%}`,
    js: function () {
      var P = [
        { k: 'SENARYO 1', t: 'Sınav haftası', s: '4 sınav, 1 gece.', c: '#ff8a5c' },
        { k: 'SENARYO 2', t: 'Pazartesi 09:00', s: 'Kamera açık, mikrofon açık.', c: '#5fe0bd' },
        { k: 'SENARYO 3', t: 'Oyun gecesi', s: 'Takım bir maç daha istiyor.', c: '#ffc53a' },
      ];
      var IC = '<svg class="ic" width="110" height="110" viewBox="0 0 120 192">' + '<path d="M20 54H100L90 178Q89 184 83 184H37Q31 184 30 178Z" fill="#1d110b"/><rect x="15" y="44" width="90" height="12" rx="6" fill="#1d110b"/></svg>';
      $('#pns').innerHTML = P.map(function (p, i) {
        return '<button class="pn" data-i="' + i + '" style="--c:' + p.c + '"><small>' + p.k + '</small><b>' + esc(p.t) + '</b><em>' + esc(p.s) + '</em>' + IC +
          '<div class="mt"><div class="ml"><span class="lbl">ZORLUK</span><span class="pc">%95</span></div><div class="mb"><i></i></div></div><div class="stp">ÇOK DA COFFY</div></button>';
      }).join('');
      $('#sl9').innerHTML = slogan();
      var s = locate().near; $('#st9').innerHTML = 'En yakın Coffy <b>' + fmtDist(s.m) + '</b> ötede<br>' + esc(s.name) + ' · ' + s.min + ' dk' + smp();
      bindExits($('#p'));
      var n = 0, auto = null;
      function pick(i) {
        var b = $$('.pn')[i]; if (b.classList.contains('done')) return;
        b.classList.add('done'); $('.lbl', b).textContent = 'COFFY SONRASI'; n++;
        var k = 95, t = setInterval(function () { k -= 4; if (k <= 15) { k = 15; clearInterval(t); } $('.pc', b).textContent = '%' + k; }, 50);
        track('scenario_' + (i + 1)); burst(b, 16, 90);
        if (n === 1) { $('.r9 .btn').classList.add('pulse'); track('endcard'); }
      }
      $('#pns').addEventListener('click', function (e) { var b = e.target.closest('.pn'); if (b) { clearInterval(auto); pick(+b.getAttribute('data-i')); } });
      show('#v');
      playVideo($('#v'), function () {
        show('#p');
        idle(4000, function () { var j = 0; pick(j++); auto = setInterval(function () { if (j > 2) return clearInterval(auto); pick(j++); }, 1700); });
      });
    },
  },

  /* ===================================================================== */
  {
    no: '10', slug: 'sube-bulucu', size: '970x250', name: 'Şube Bulucu (Konum)',
    phase: 'Sürdürme (always-on)', channel: 'Masaüstü/tablet billboard, lokasyon & IP tabanlı il/ilçe hedefleme (DV360 / TTD), kampüs çevresi',
    mechanic: 'Video (5 sn) → harita: kullanıcı konumu ve en yakın 3 Coffy, mesafe ve yürüme süreleri. Listeden şube seçilince haritada vurgulanır; “Yol tarifi al” seçilen şubeye gider.',
    why: 'Lansman sonrasında görünürlüğü “ziyarete” çevirir. Şube feed’i bağlandığında yeni açılan şubeler otomatik görünür – her yeni şube için ayrı kreatif gerekmez.',
    html: `
<section class="scene" id="v"></section>
<section class="scene f10" id="f">
  <div class="mp" id="mp"></div>
  <div class="mid">
    <div class="chip" id="chip"></div>
    <h2 class="hd" id="hl"></h2>
    <div class="lst" id="lst"></div>
  </div>
  <div class="rt10"><div id="sl10"></div><p id="op"></p><div class="bt"><button class="btn" data-exit="directions">Yol tarifi al</button><button class="btn ghost" data-exit="app">Sipariş ver</button></div></div>
</section>`,
    css: `
.mp{position:absolute;left:0;top:0;width:330px;height:250px;overflow:hidden}
.mp::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 70%,var(--esp));pointer-events:none}
.mp .me{position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#4aa3ff;border:3px solid #fff;animation:me 1.8s ease-out infinite}
@keyframes me{0%{box-shadow:0 0 0 0 rgba(74,163,255,.5)}100%{box-shadow:0 0 0 24px rgba(74,163,255,0)}}
.mp .pn10{position:absolute;width:28px;height:28px;margin:-34px 0 0 -14px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:rgba(255,255,255,.25);display:grid;place-items:center;transition:background .3s,transform .3s}
.mp .pn10 b{transform:rotate(45deg);font-family:var(--h);font-size:13px;color:#fff}
.mp .pn10.on{background:var(--acc);transform:rotate(-45deg) scale(1.25)}
.f10.on .pn10{animation:drop10 .6s cubic-bezier(.3,1.6,.5,1) both}.f10.on .pn10:nth-of-type(2){animation-delay:.12s}.f10.on .pn10:nth-of-type(3){animation-delay:.24s}
@keyframes drop10{from{opacity:0;margin-top:-70px}}
.mid{position:absolute;left:338px;top:14px;width:340px}
.chip{display:inline-flex;font-size:10px;font-weight:800;letter-spacing:.12em;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.1);color:var(--acc2)}
.mid h2{font-size:30px;margin-top:6px}.mid h2 em{font-style:normal;color:var(--acc2)}
.lst{display:flex;flex-direction:column;gap:5px;margin-top:10px}
.it{appearance:none;border:0;cursor:pointer;display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.06);color:var(--cream);text-align:left;transition:background .2s}
.it.on{background:rgba(255,90,44,.2);box-shadow:inset 0 0 0 1.5px var(--acc)}
.it i{font-style:normal;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.18);display:grid;place-items:center;font-family:var(--h);font-weight:800;font-size:11px;flex:none}
.it.on i{background:var(--acc)}
.it b{font-size:12.5px}.it small{font-size:11px;color:rgba(251,239,223,.65);margin-left:6px}
.it span{margin-left:auto;font-family:var(--h);font-weight:800;font-size:15px;color:var(--acc2)}
.rt10{position:absolute;right:16px;top:40px;width:250px}
.rt10 .slogan{font-size:52px}
.rt10 p{font-size:12px;font-weight:700;color:rgba(251,239,223,.75);margin-top:14px}
.rt10 p i{font-style:normal;color:var(--mint)}
.rt10 .bt{display:flex;gap:6px;margin-top:10px}.rt10 .btn{flex:1;padding:12px 6px;font-size:12.5px}`,
    js: function () {
      var G = locate(), L = G.stores.slice(0, 3), dp = daypart();
      var DN = { morning: 'GÜNE COFFY’LE BAŞLA', noon: 'ÖĞLE MOLASI', evening: 'AKŞAM MOLASI', night: 'YARIN SABAH İLK DURAK' };
      var mp = $('#mp'), cx = 160, cy = 140, maxM = L[L.length - 1].m || 1;
      mp.innerHTML = mapBg(330, 250) + '<div class="me" style="left:' + cx + 'px;top:' + cy + 'px"></div>' + L.map(function (s, i) {
        var p = project(G.user, s, cx, cy, 34 + 76 * (s.m / maxM)); p.x = Math.max(24, Math.min(300, p.x)); p.y = Math.max(44, Math.min(236, p.y));
        return '<div class="pn10' + (i ? '' : ' on') + '" style="left:' + p.x + 'px;top:' + p.y + 'px"><b>' + (i + 1) + '</b></div>';
      }).join('');
      $('#chip').textContent = DN[dp] + (G.src === 'fallback' ? ' · ' + C.geo.fallback.area.toUpperCase() : '');
      $('#hl').innerHTML = 'En yakın Coffy <em>' + fmtDist(L[0].m) + '</em> ötede.';
      $('#lst').innerHTML = L.map(function (s, i) { return '<button class="it' + (i ? '' : ' on') + '" data-i="' + i + '"><i>' + (i + 1) + '</i><b>' + esc(s.name) + '</b><small>' + s.min + ' dk yürüme</small><span>' + fmtDist(s.m) + '</span></button>'; }).join('');
      $('#sl10').innerHTML = slogan();
      function sel(i) {
        $$('.it').forEach(function (b, j) { b.classList.toggle('on', i === j); }); $$('.pn10').forEach(function (b, j) { b.classList.toggle('on', i === j); });
        G.near = L[i]; $('#op').innerHTML = '<i>Açık</i> · ' + esc(L[i].hours) + ' · ' + esc(L[i].name) + smp(); track('store_' + (i + 1));
      }
      $('#lst').addEventListener('click', function (e) { var b = e.target.closest('.it'); if (b) sel(+b.getAttribute('data-i')); });
      sel(0); bindExits($('#f'));
      show('#v');
      playVideo($('#v'), function () { show('#f'); track('endcard'); later(function () { $('.rt10 .btn').classList.add('pulse'); }, 1200); }, {});
    },
  },
];
