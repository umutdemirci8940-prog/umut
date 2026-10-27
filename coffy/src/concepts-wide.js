'use strict';
/* eslint-disable no-undef */
/**
 * Çalışma 08–10. Her çalışma tek dosyada iki yerleşime sahiptir:
 * css → 970x250 (varsayılan), alt → 320x480 (.ad.m). Ürünler coffy.com.tr menüsündeki orijinal görsellerdir.
 */
module.exports = [
  /* ===================================================================== */
  {
    no: '08', slug: 'coffy-seviyesi', size: '970x250', name: 'Coffy Seviyesi (Video + Kaydırıcı)',
    phase: 'Lansman', channel: 'Masaüstü billboard: DV360 / TTD, haber & spor & oyun içerik siteleri; mobilde interstitial',
    mechanic: 'Ana video döngüde (sesi açılabilir). Yanında “Bugün ne kadar Coffy’sin?” kaydırıcısı: kaydırdıkça gerçek Iced Latte dolar ve 3B döner, başlık “Az da Coffy → Orta da Coffy → Çok da Coffy.” olur; %100’de en yakın şube + sipariş CTA’sı açılır.',
    why: 'Video ve interaksiyon aynı karede. Kampanya sözü (“çok da”) bizzat kullanıcının hareketiyle tamamlanır.',
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
.ad.w .ad-logo{left:476px;top:16px}
.v8{position:absolute;left:0;top:0;width:444px;height:250px}
.v8::after{content:"";position:absolute;right:0;top:0;bottom:0;width:40px;background:linear-gradient(90deg,transparent,rgba(11,11,11,.9));pointer-events:none;z-index:3}
.p8{position:absolute;left:476px;top:50px;width:330px}
.lh{font-size:50px;margin-top:6px;height:50px;white-space:nowrap}
.lh .slogan{font-size:42px;flex-direction:row;align-items:baseline;gap:8px}.lh .slogan .s1{font-size:42px;margin:0}
.sl{position:relative;width:300px;height:56px;margin-top:22px;touch-action:none;cursor:pointer;transition:opacity .4s,transform .4s}
.sl .tr{position:absolute;left:0;right:0;top:12px;height:12px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden}
.sl .tr i{display:block;height:100%;width:0;background:linear-gradient(90deg,#8a5a36,var(--acc),var(--acc2))}
.sl .kn{position:absolute;top:0;left:0;width:36px;height:36px;margin-left:-18px;border-radius:50%;background:#fff;box-shadow:0 6px 16px -4px rgba(0,0,0,.7);display:grid;place-items:center}
.sl .kn span{width:13px;height:17px;border-radius:50%;background:#6b3d24;position:relative}
.sl .kn span::after{content:"";position:absolute;left:45%;top:12%;width:2px;height:76%;background:rgba(0,0,0,.35);transform:rotate(10deg)}
.sl .lb{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;font-size:10px;font-weight:800;letter-spacing:.14em;color:rgba(255,255,255,.6)}
.p8.done .sl{opacity:0;transform:translateY(10px);pointer-events:none}
.ct8{position:absolute;left:0;top:96px;width:330px;opacity:0;transform:translateY(12px);transition:.5s .15s;pointer-events:none}
.p8.done .ct8{opacity:1;transform:none;pointer-events:auto}
.st8{font-size:12.5px;font-weight:700;color:rgba(255,255,255,.8)}.st8 b{color:var(--acc2)}
.bt8{display:flex;gap:8px;margin-top:10px}
.c8{position:absolute;right:20px;top:6px;width:160px;height:240px;display:grid;place-items:center}
.c8 .pf{height:228px;transform:perspective(700px) rotateY(var(--ry,0deg)) rotateX(4deg);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.c8::before{content:"";position:absolute;inset:30px -20px 0;border-radius:50%;background:radial-gradient(closest-side,rgba(200,134,78,.4),transparent);z-index:-1}`,
    alt: `
.ad.m .ad-logo{left:14px;top:14px}
.ad.m .v8{width:100%;height:160px}.ad.m .v8::after{display:none}
.ad.m .p8{left:16px;top:176px;width:180px}
.ad.m .lh{font-size:40px;height:42px}
.ad.m .lh .slogan,.ad.m .lh .slogan .s1{font-size:34px}
.ad.m .sl{width:180px}
.ad.m .ct8{top:92px;width:180px}
.ad.m .bt8{flex-direction:column}.ad.m .bt8 .btn{width:100%}
.ad.m .c8{right:0;top:262px;width:120px;height:210px}.ad.m .c8 .pf{height:196px}`,
    js: function () {
      $('#c8').innerHTML = cup(.06, C.hero);
      var s = locate().near, v = 0, done = false, p8 = $('#p8'), sl = $('#sl'), hint = $('#hint');
      $('#st8').innerHTML = 'En yakın Coffy: <b>' + esc(s.name) + '</b> · ' + fmtDist(s.m) + ' · ' + s.min + ' dk' + geoNote();
      bindExits(p8);
      function set(nv) {
        v = Math.max(0, Math.min(100, nv)); var x = v / 100 * sl.clientWidth;
        $('#kn').style.left = x + 'px'; $('#fb').style.width = v + '%'; setFill($('#c8'), .06 + v / 100 * .94);
        $('#c8').style.setProperty('--ry', ((v - 50) * .7).toFixed(1) + 'deg'); // kaydırdıkça bardak 3B döner
        if (!done) $('#lh').textContent = v < 34 ? 'Az da Coffy.' : v < 67 ? 'Orta da Coffy.' : v < 100 ? 'Biraz daha…' : '';
        if (v >= 100 && !done) finish();
      }
      function finish() {
        done = true; $('#lh').innerHTML = '<div class="slogan"><span class="s1">Çok da</span><span class="s2">Coffy<i>.</i></span></div>';
        p8.classList.add('done'); hint.style.display = 'none'; burst($('#c8'), 26, 130); track('level_full'); track('endcard');
        $('#c8').classList.add('sway'); $('#c8').style.setProperty('--ry', '0deg');
      }
      var drag = false;
      function at(e) { set(pt(e, sl).x / sl.clientWidth * 100); }
      sl.addEventListener('pointerdown', function (e) { if (done) return; drag = true; hint.style.display = 'none'; stop(); sl.setPointerCapture && sl.setPointerCapture(e.pointerId); at(e); });
      sl.addEventListener('pointermove', function (e) { if (drag) at(e); });
      sl.addEventListener('pointerup', function () { drag = false; track('level_' + Math.round(v)); });
      var tm = null;
      function stop() { clearInterval(tm); }
      function demo() {
        hint.style.display = ''; var k = 0;
        tm = setInterval(function () { k += 2; set(k); var r = sl.getBoundingClientRect(); hint.style.left = (r.left + v / 100 * r.width - 17) + 'px'; hint.style.top = (r.top - 6) + 'px'; if (k >= 100) stop(); }, 45);
      }
      set(0);
      playVideo($('#v'), null, { loop: true });
      idle(2600, demo);
    },
  },

  /* ===================================================================== */
  {
    no: '09', slug: 'senaryonu-sec', size: '970x250', name: 'Senaryonu Seç',
    phase: 'Lansman + Sürdürme', channel: 'Masaüstü billboard: DV360 / TTD, PMP (oyun, e-spor, üniversite / kariyer içerikleri); mobilde interstitial',
    mechanic: 'Ana video açılır (5 sn, geçilebilir) → üç senaryo paneli: Sınav haftası / Pazartesi 09:00 / Oyun gecesi. Seçilen panel 3B döner; arkasında gerçek Coffy ürünü, “Çok da Coffy” ve %95’ten %15’e inen “zorluk” barı çıkar.',
    why: 'Videodaki hikâyeyi kullanıcının kendi hayatına bağlar; seçilen senaryo ölçülerek sürdürme dönemi kararlarına veri sağlar.',
    html: `
<section class="scene" id="v"></section>
<section class="scene s9" id="p">
  <div class="l9"><h2 class="hd">Hangisi <br>sensin?</h2><p>Birini seç, gerisini <br>Coffy halleder.</p></div>
  <div class="pns" id="pns"></div>
  <div class="r9"><div id="sl9"></div><div class="st9" id="st9"></div><button class="btn" data-exit="directions">Yol tarifi al</button></div>
</section>`,
    css: `
.s9 .l9{position:absolute;left:26px;top:56px;width:166px}
.s9 .l9 h2{font-size:40px}
.s9 .l9 p{font-size:12.5px;font-weight:600;line-height:1.35;color:rgba(255,255,255,.75);margin-top:10px}
.pns{position:absolute;left:196px;right:232px;top:14px;bottom:14px;display:flex;gap:8px}
.pn{position:relative;flex:1;border:0;padding:0;cursor:pointer;background:none;color:var(--ink);text-align:left;transition:flex .45s cubic-bezier(.3,1.2,.5,1),filter .3s}
.pns:hover .pn:not(.on){filter:brightness(.8)}.pns .pn:hover,.pns .pn.on{flex:1.45;filter:none}
.s9.on .pn{animation:rise .5s both}.s9.on .pn:nth-child(2){animation-delay:.08s}.s9.on .pn:nth-child(3){animation-delay:.16s}
.pn .fa,.pn .fb{border-radius:20px;padding:14px;display:flex;flex-direction:column;overflow:hidden}
.pn .fa{background:var(--c)}
.pn .fb{background:radial-gradient(120% 100% at 50% 10%,#d79a62,#7c4a26 70%,#3a2214);color:#fff;align-items:center;text-align:center;padding-top:8px}
.pn .fb .prod{height:100px;flex:none;filter:drop-shadow(0 12px 14px rgba(0,0,0,.6))}
.pn .fb .bx{display:flex;flex-direction:column;width:100%;flex:1;margin-top:4px}
.pn .fb b{font-family:var(--h);font-weight:700;font-size:20px;line-height:.9;margin-top:4px}
.pn .fb small{font-size:9.5px;font-weight:800;letter-spacing:.14em;color:var(--acc2);margin-top:6px}
.pn small{font-size:9.5px;font-weight:800;letter-spacing:.16em;opacity:.7}
.pn .fa b{font-family:var(--h);font-weight:700;font-size:25px;line-height:.98;margin-top:6px}
.pn em{font-style:normal;font-size:11.5px;font-weight:700;opacity:.75;margin-top:4px}
.pn .mt{margin-top:auto}
.pn .ml{display:flex;justify-content:space-between;font-size:9.5px;font-weight:800;letter-spacing:.12em}
.pn .ml span:last-child{font-family:var(--h);font-size:15px;letter-spacing:0}
.pn .mb{height:9px;border-radius:9px;background:rgba(11,11,11,.18);margin-top:4px;overflow:hidden}
.pn .mb i{display:block;height:100%;width:95%;background:var(--ink);border-radius:9px;transition:width 1.1s .6s cubic-bezier(.3,1,.4,1)}
.pn .fb .mb{background:rgba(255,255,255,.2)}.pn .fb .mb i{background:#fff}
.pn.on .fb .mb i{width:15%}
.r9{position:absolute;right:16px;top:44px;width:200px;display:flex;flex-direction:column;align-items:flex-start}
.r9 .slogan{font-size:50px}
.st9{font-size:11.5px;font-weight:700;color:rgba(255,255,255,.75);margin:14px 0 10px;line-height:1.35}.st9 b{color:var(--acc2)}
.r9 .btn{width:100%}`,
    alt: `
.ad.m .s9 .l9{left:16px;right:16px;top:46px;width:auto}
.ad.m .s9 .l9 h2{font-size:36px}.ad.m .s9 .l9 br{display:none}.ad.m .s9 .l9 p{margin-top:4px;font-size:12px}
.ad.m .pns{left:12px;right:12px;top:118px;bottom:122px;flex-direction:column;gap:6px}
.ad.m .pn .fa,.ad.m .pn .fb{padding:10px 12px;border-radius:16px}.ad.m .pn small,.ad.m .pn em{display:none}
.ad.m .pn .fa b{font-size:22px;margin:0}
.ad.m .pn .fb{flex-direction:row;padding:6px 12px;text-align:left;gap:8px}.ad.m .pn .fb .prod{height:62px}.ad.m .pn .fb .bx{margin:0}.ad.m .pn .fb b{font-size:20px}.ad.m .pn .fb .mt{margin-top:4px}
.ad.m .pns:hover .pn{filter:none}.ad.m .pns .pn:hover,.ad.m .pns .pn.on{flex:1}
.ad.m .r9{left:16px;right:16px;top:auto;bottom:14px;width:auto}
.ad.m .r9 .slogan{display:none}.ad.m .st9{margin:0 0 8px}`,
    js: function () {
      var S = [
        { k: 'SENARYO 1', t: 'Sınav haftası', s: '4 sınav, 1 gece.', c: '#ffffff', p: 'cold-brew' },
        { k: 'SENARYO 2', t: 'Pazartesi 09:00', s: 'Kamera açık, mikrofon açık.', c: '#e9d1ad', p: 'iced-latte' },
        { k: 'SENARYO 3', t: 'Oyun gecesi', s: 'Takım bir maç daha istiyor.', c: '#c8864e', p: 'strawberry-lemonade' },
      ];
      $('#pns').innerHTML = S.map(function (p, i) {
        return '<button class="pn flip" data-i="' + i + '" style="--c:' + p.c + '"><div class="fi">' +
          '<div class="fa"><small>' + p.k + '</small><b>' + esc(p.t) + '</b><em>' + esc(p.s) + '</em><div class="mt"><div class="ml"><span>ZORLUK</span><span>%95</span></div><div class="mb"><i></i></div></div></div>' +
          '<div class="fb">' + prodImg(p.p) + '<div class="bx"><b>ÇOK DA COFFY.</b><small>' + esc(P(p.p).name) + '</small><div class="mt"><div class="ml"><span>COFFY SONRASI</span><span class="pc">%95</span></div><div class="mb"><i></i></div></div></div></div>' +
          '</div></button>';
      }).join('');
      $('#sl9').innerHTML = slogan();
      var s = locate().near; $('#st9').innerHTML = 'En yakın Coffy <b>' + fmtDist(s.m) + '</b> ötede<br>' + esc(s.name) + ' · ' + s.min + ' dk' + geoNote();
      bindExits($('#p'));
      var n = 0, auto = null;
      function pick(i) {
        var b = $$('.pn')[i]; if (b.classList.contains('on')) return;
        b.classList.add('on'); n++; // 3B dönüş
        var k = 95; later(function () { var t = setInterval(function () { k -= 4; if (k <= 15) { k = 15; clearInterval(t); } $('.pc', b).textContent = '%' + k; }, 50); }, 600);
        track('scenario_' + (i + 1)); later(function () { burst(b, 16, 90); }, 500);
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
    phase: 'Sürdürme (always-on)', channel: 'Masaüstü/tablet billboard, lokasyon & IP tabanlı il/ilçe hedefleme (DV360 / TTD), kampüs çevresi; mobilde interstitial',
    mechanic: 'Video (5 sn) → 3B eğimli harita: kullanıcı konumu ve gerçek şube listesinden en yakın 3 Coffy, ayakta duran numaralı pinler, mesafe ve yürüme süreleri. Listeden şube seçilince pin öne çıkar; “Yol tarifi al” Haritalar’da en yakın Coffy’leri açar.',
    why: 'Lansman sonrasında görünürlüğü “ziyarete” çevirir. Şube listesi coffy.com.tr’den gelir; yeni şubeler otomatik görünür.',
    html: `
<section class="scene" id="v"></section>
<section class="scene f10" id="f">
  <div class="mp" id="mp"><div class="pl10" id="pl10"></div><div class="pins" id="pins"></div></div>
  <div class="mid">
    <div class="chip" id="chip"></div>
    <h2 class="hd" id="hl"></h2>
    <div class="lst" id="lst"></div>
  </div>
  <div class="rt10"><div id="sl10"></div><p id="op"></p><div class="bt"><button class="btn" data-exit="directions">Yol tarifi al</button><button class="btn ghost" data-exit="app">Sipariş ver</button></div></div>
</section>`,
    css: `
.mp{position:absolute;left:0;top:0;width:330px;height:250px;overflow:hidden;background:#0b0b0b}
.mp::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 70%,var(--esp)),linear-gradient(#0b0b0b,transparent 30%);pointer-events:none}
.pl10{position:absolute;transform-origin:50% 100%;transform:perspective(700px) rotateX(50deg);transform-style:preserve-3d}
.pl10 .map{display:block}
.pl10 .me{position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#4aa3ff;border:3px solid #fff;animation:me10 1.8s ease-out infinite}
@keyframes me10{0%{box-shadow:0 0 0 0 rgba(74,163,255,.6)}100%{box-shadow:0 0 0 28px rgba(74,163,255,0)}}
.pl10 .anc{position:absolute;width:2px;height:2px;margin:-1px}
.pins{position:absolute;inset:0;z-index:2}
.pn10{position:absolute;width:0;height:0}
.pn10::after{content:"";position:absolute;left:-14px;top:-6px;width:28px;height:12px;border-radius:50%;background:radial-gradient(closest-side,rgba(200,134,78,.7),transparent)}
.pn10 .ps{position:absolute;left:0;bottom:0}
.pn10 .ps b{position:absolute;left:0;bottom:24px;transform:translateX(-50%);width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.85);color:#0b0b0b;display:grid;place-items:center;font-family:var(--h);font-weight:700;font-size:18px;box-shadow:0 12px 20px -6px rgba(0,0,0,.8);transition:transform .35s cubic-bezier(.3,1.6,.5,1),background .3s}
.pn10 .ps i{position:absolute;left:-1.5px;bottom:0;width:3px;height:26px;background:linear-gradient(#fff,rgba(255,255,255,.1))}
.pn10.on .ps b{background:var(--acc);color:#fff;transform:translateX(-50%) scale(1.35)}
.f10.on .pn10 .ps{animation:drop10 .7s cubic-bezier(.3,1.6,.5,1) both}.f10.on .pn10:nth-child(2) .ps{animation-delay:.12s}.f10.on .pn10:nth-child(3) .ps{animation-delay:.24s}
@keyframes drop10{from{opacity:0;transform:translateY(-60px)}}
.mid{position:absolute;left:338px;top:14px;width:340px}
.chip{display:inline-flex;font-size:10px;font-weight:800;letter-spacing:.12em;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.1);color:var(--acc2)}
.mid h2{font-size:32px;margin-top:6px}.mid h2 em{font-style:normal;color:var(--acc2)}
.lst{display:flex;flex-direction:column;gap:5px;margin-top:10px;perspective:600px}
.it{appearance:none;border:0;cursor:pointer;display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.06);color:var(--cream);text-align:left;transition:background .2s,transform .3s}
.it:hover{transform:rotateX(10deg)}
.it.on{background:rgba(200,134,78,.2);box-shadow:inset 0 0 0 1.5px var(--acc)}
.it i{font-style:normal;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.18);display:grid;place-items:center;font-family:var(--h);font-weight:700;font-size:12px;flex:none}
.it.on i{background:var(--acc)}
.it b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:170px}.it small{font-size:11px;color:rgba(255,255,255,.65);margin-left:2px;white-space:nowrap}
.it span{margin-left:auto;font-family:var(--h);font-weight:700;font-size:17px;color:var(--acc2);white-space:nowrap}
.rt10{position:absolute;right:16px;top:40px;width:250px}
.rt10 .rp{position:absolute;right:-8px;top:-34px;height:150px;pointer-events:none}.rt10 .rp .prod{filter:drop-shadow(0 16px 18px rgba(0,0,0,.6))}
.rt10 .slogan{font-size:54px;position:relative}
.rt10 p{font-size:12px;font-weight:700;color:rgba(255,255,255,.75);margin-top:14px}
.rt10 p i{font-style:normal;color:var(--mint)}
.rt10 .bt{display:flex;gap:6px;margin-top:10px}.rt10 .btn{flex:1;padding:12px 6px;font-size:12.5px}`,
    alt: `
.ad.m .mp{width:100%;height:176px}.ad.m .mp::after{background:linear-gradient(180deg,#0b0b0b,transparent 25%,transparent 65%,var(--esp))}
.ad.m .mid{left:16px;right:16px;top:172px;width:auto}
.ad.m .mid h2{font-size:28px}
.ad.m .lst{gap:4px;margin-top:8px}.ad.m .it{padding:5px 10px}.ad.m .it b{max-width:130px}
.ad.m .rt10{left:16px;right:16px;top:auto;bottom:12px;width:auto}
.ad.m .rt10 .slogan,.ad.m .rt10 .rp{display:none}.ad.m .rt10 p{margin:0}`,
    js: function () {
      var G = locate(), L = G.stores.slice(0, 3), dp = daypart();
      var DN = { morning: 'GÜNE COFFY’LE BAŞLA', noon: 'ÖĞLE MOLASI', evening: 'AKŞAM MOLASI', night: 'YARIN SABAH İLK DURAK' };
      // 3B eğimli harita düzlemi
      var mob = isM(), MW = mob ? size().w : 330, MH = mob ? 176 : 250, PW = Math.round(MW * 1.5), PH = Math.round(MH * 1.7), pl = $('#pl10');
      pl.style.width = PW + 'px'; pl.style.height = PH + 'px'; pl.style.left = (MW - PW) / 2 + 'px'; pl.style.top = (MH - PH + 10) + 'px';
      var cx = PW / 2, cy = PH * .8, R = PW * .2, host = $('#mp');
      pl.innerHTML = mapBg(PW, PH) + '<div class="me" style="left:' + cx + 'px"></div>' + L.map(function (s, i) {
        var p = project(G.user, s, cx, cy, R * (.6 + .4 * i)); p.x = Math.max(PW * .3, Math.min(PW * .7, p.x));
        return '<i class="anc" style="left:' + p.x + 'px"></i>';
      }).join('');
      // Kullanıcı altta, şubeler mesafe sırasına göre geriye doğru (ekranda görünür bantta)
      planeY($('.me', pl), host, mob ? 166 : 214, PH);
      var SY = mob ? [152, 132, 114] : [160, 124, 94];
      $$('.anc', pl).forEach(function (a, i) { planeY(a, host, SY[i], PH); });
      $('#pins').innerHTML = $$('.anc', pl).map(function (a, i) { var q = screenPos(a, host); return '<div class="pn10' + (i ? '' : ' on') + '" style="left:' + q.x + 'px;top:' + q.y + 'px"><div class="ps"><b>' + (i + 1) + '</b><i></i></div></div>'; }).join('');
      $('#chip').textContent = DN[dp] + (G.src === 'fallback' ? ' · ' + C.geo.fallback.area.toUpperCase() : '');
      $('#hl').innerHTML = 'En yakın Coffy <em>' + fmtDist(L[0].m) + '</em> ötede.';
      $('#lst').innerHTML = L.map(function (s, i) { return '<button class="it' + (i ? '' : ' on') + '" data-i="' + i + '"><i>' + (i + 1) + '</i><b>' + esc(s.name) + '</b><small>' + s.min + ' dk</small><span>' + fmtDist(s.m) + '</span></button>'; }).join('');
      $('#sl10').innerHTML = slogan();
      function sel(i) {
        $$('.it').forEach(function (b, j) { b.classList.toggle('on', i === j); }); $$('.pn10').forEach(function (b, j) { b.classList.toggle('on', i === j); });
        G.near = L[i]; $('#op').innerHTML = esc(L[i].name) + ' · ' + esc(place(L[i])) + geoNote(); track('store_' + (i + 1));
      }
      $('#lst').addEventListener('click', function (e) { var b = e.target.closest('.it'); if (b) sel(+b.getAttribute('data-i')); });
      sel(0); bindExits($('#f'));
      show('#v');
      playVideo($('#v'), function () { show('#f'); track('endcard'); later(function () { $('.rt10 .btn').classList.add('pulse'); }, 1200); }, {});
    },
  },
];
