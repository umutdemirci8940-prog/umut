#!/usr/bin/env node
'use strict';
/**
 * Kasım interaktif çalışmalarını derler (rich/*.html → dist-rich/).
 *   dist-rich/<ad>/index.html + img/   : reklam sunucusuna yüklenecek klasör (yalnızca kullanılan görseller)
 *   dist-rich/zip/<ad>.zip             : aynı klasörün zip'i
 *   dist-rich/inline/<ad>.html         : görseller base64 gömülü tek dosya (sunum / önizleme)
 * Önce: python3 tools/rich-assets.py (assets/media → assets/rich)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('../rich/data');

const root = path.join(__dirname, '..');
const src = path.join(root, 'rich');
const imgSrc = path.join(root, 'assets', 'rich');
const dist = path.join(root, 'dist-rich');
const ADS = {
  'masthead-970x250': { content: 'masthead', photo: 'mh' },
  'mobil-320x480-kartlar': { content: 'mobil_kartlar', photo: 'mb' },
  'mobil-320x480-sil-kesfet': { content: 'mobil_sil', photo: 'mb' },
  'mobil-320x480-rutin': { content: 'mobil_rutin', photo: 'st' },
  'masthead-970x250-mercek': { content: 'masthead_mercek', photo: 'mh', creative: 'lens' },
  'mobil-320x480-mercek': { content: 'mobil_mercek', photo: 'mh', creative: 'lens' },
  'mobil-320x480-ofis': { content: 'mobil_ofis', photo: 'mh', creative: 'office' },
  'mobil-320x480-eslestir': { content: 'mobil_eslestir', photo: 'mh', creative: 'memory' },
  'masthead-970x250-golge': { content: 'masthead_golge', photo: 'mh', creative: 'gunes' },
  'mobil-320x480-golge': { content: 'mobil_golge', photo: 'mh', creative: 'gunes' },
};

function adData(content) {
  const L = (p, c) => data.link(p, `${content}_${c}`);
  return {
    creative: data.creative(content),
    data: {
      brand: { ...data.brand, home: L('/collections/gida-takviyeleri', 'genel') },
      coupon: { ...data.coupon, url: L('/collections/en-cok-satanlar', 'kupon') },
      segments: data.segments.map((s) => ({
        ...s,
        url: L(s.path, s.key),
        img: { mh: `img/mh-${s.key}.webp`, mb: `img/mb-${s.key}.webp`, st: `img/st-${s.key}.webp` },
        products: s.products.map((p) => ({ ...p, img: `img/p-${p.key}.webp`, url: L(p.path, `${s.key}_${p.key}`) })),
      })),
    },
  };
}

const css = fs.readFileSync(path.join(src, 'shared.css'), 'utf8');
const js = fs.readFileSync(path.join(src, 'shared.js'), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
fs.mkdirSync(path.join(dist, 'zip'), { recursive: true });
fs.mkdirSync(path.join(dist, 'inline'), { recursive: true });
let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }

for (const [name, cfg] of Object.entries(ADS)) {
  const file = path.join(src, `${name}.html`);
  if (!fs.existsSync(file)) { console.log(`– ${name}: kaynak yok, atlandı`); continue; }
  const d = adData(cfg.content);
  // Kreatif kendi fotoğraf ailesini kullanır; diğer ailelerin adreslerini çıkar ki gereksiz görsel paketlenmesin.
  for (const s of d.data.segments) s.img = { [cfg.photo]: s.img[cfg.photo] };
  // Yaratıcı set segment fotoğraflarını kullanmaz; yalnızca kendi verisi gömülür (gereksiz görsel paketlenmez).
  if (cfg.creative) { delete d.data.segments; d.creative = { [cfg.creative]: d.creative[cfg.creative] }; } else delete d.creative;
  const vars = { ...data.brand, ...data.coupon };
  let html = fs.readFileSync(file, 'utf8')
    .replace('{{SHARED_CSS}}', () => css)
    .replace('{{SHARED_JS}}', () => js)
    .replace(/\{\{INCLUDE:([\w.-]+)\}\}/g, (m, f) => fs.readFileSync(path.join(src, f), 'utf8'))
    .replace('{{DATA}}', () => JSON.stringify(d).replace(/</g, '\\u003c'))
    .replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? esc(vars[k]) : m));
  const used = [...new Set([...html.matchAll(/img\/([\w-]+\.webp)/g)].map((m) => m[1]))];
  const missing = used.filter((f) => !fs.existsSync(path.join(imgSrc, f)));
  if (missing.length) throw new Error(`${name}: eksik görsel ${missing.join(', ')} (python3 tools/rich-assets.py)`);

  const out = path.join(dist, name);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'img'), { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  let bytes = Buffer.byteLength(html);
  for (const f of used) { fs.copyFileSync(path.join(imgSrc, f), path.join(out, 'img', f)); bytes += fs.statSync(path.join(imgSrc, f)).size; }

  const inline = html.replace(/img\/([\w-]+\.webp)/g, (m, f) => `data:image/webp;base64,${fs.readFileSync(path.join(imgSrc, f)).toString('base64')}`);
  fs.writeFileSync(path.join(dist, 'inline', `${name}.html`), inline);

  let note = '';
  if (hasZip) {
    const z = path.join(dist, 'zip', `ilacsizyasam-${name}.zip`);
    fs.rmSync(z, { force: true });
    execSync(`cd "${out}" && zip -q -r -X "${z}" . -x ".*"`);
    note = ` → zip ${(fs.statSync(z).size / 1024).toFixed(0)} KB`;
  }
  console.log(`✔ ${name.padEnd(26)} ${String(used.length).padStart(2)} görsel, toplam ${(bytes / 1024).toFixed(0)} KB${note}`);
}

// Sunum sayfası: dört çalışma tek dosyada (srcdoc ile gömülü), tekrar oynat düğmeleri ve kurgu notları.
const NOTES = {
  'masthead-970x250-golge': ['Interaktif Masthead · 970×250', 'Gölgen Ne Diyor?', "Reklam, izleyicinin şehri (yayın makrosu ?city= ya da seçim) ve bugünün tarihi için güneşi canlı hesaplar: \"Bugün İstanbul'da öğlen gölgen boyunun 1,7 katı.\" Gölge boydan uzunsa güneş D vitamini üretimi için yeterince dik gelmez; ihtiyaç kullanıcının kendi verisiyle ortaya çıkar. Güneş Haziran'dan Aralık'a sürüklendikçe fotoğrafın ışığı gerçekten söner, gün ışığı kaybı dakikasıyla yazılır. Ardından fotoğraflı 3 soru → kişisel Kasım rutini (2–3 ürün, onaylı beyanlar, %10 kod). Cevaplar UTM'e yazılır: marka hangi mecrada hangi ihtiyacın baskın olduğunu görür."],
  'mobil-320x480-golge': ['Mobil Interaktif · 320×480', 'Gölgen Ne Diyor? (Mobil)', 'Aynı canlı hesap mobilde: ışığı şehrin güneşine göre değişen fotoğraf, büyük gölge oranı, şehir seçici, güneş kaydırıcısı; tam ekran fotoğraflı 3 soru ve kişisel rutin ekranı.'],

  'masthead-970x250-mercek': ['Interaktif Masthead · 970×250', 'Merceği Gezdir', "\"Her anın arkasında bir rutin var.\" Fare bir büyüteç olur; dört gerçek an (gri Kasım göğü, kahkaha, parkta koşan çocuklar, pilates) üzerinde gezdikçe mercek altında o anın arkasındaki ürün sahnesi belirir: gri gökyüzünün altında güneşli D3 & K2, kahkahanın arkasında B12 tableti. Mercek kendi kendine tur atarak mekaniği gösterir; kullanıcı 4 keşfi tamamlayınca kupon parlar. Her keşif ürün sayfasına gider."],
  'mobil-320x480-mercek': ['Mobil Interaktif · 320×480', 'Merceği Gezdir (Mobil)', 'Masthead\'in mobil eşi: 2×2 gerçek an, parmakla sürüklenen mercek; mercek altında ürün sahnesi ve onaylı beyan. Keşif sayacı + kalıcı kupon şeridi; keşfedilen panele ikinci dokunuş ürün sayfasını açar.'],
  'mobil-320x480-ofis': ['Mobil Interaktif · 320×480', "Dr. Ümit Aktaş'ın Ofisi", "Markanın kendi ofis fotoğrafı gezinilebilir bir sahneye dönüşür: parmakla kaydırılır ya da telefon eğilerek (gyro) bakılır. Fotoğraftaki gerçek nesneler sıcak nokta: kitaplık → kitapları, yoga heykeli → Huzur Ritüeli, stetoskop → imzalı takviyeler, raftaki oyuncak → çocuk ürünleri, kırmızı ajanda → %10 Kasım notu. 5 sürpriz sayacı keşfi oyunlaştırır; Dr. Ümit Aktaş içeriklerine ilgi duyan kitle için."],
  'mobil-320x480-eslestir': ['Mobil Interaktif · 320×480', 'Rutin Eşleştir (Hafıza Oyunu)', 'Gerçek fotoğraflarla hafıza oyunu: kartlar 2 sn açık kalır, sonra kapanır; kullanıcı her anı (pilates, kahkaha, oyuncaklarla çocuk) doğru ürünüyle eşleştirir. Üç eş bulununca Dr. Ümit Aktaş\'lı final ekranında %10 kod açılır. Etkileşim yoksa oyun bir eşi kendisi gösterir ve 22 sn\'de finale geçer. Ürün-an bağını öğreten, dwell time yüksek bir format.'],

  'masthead-970x250': ['Interaktif Masthead · 970×250', 'Rutin Seçici Akordeon', "Dr. Ümit Aktaş portresiyle marka paneli + 4 tam fotoğraf paneli (Yetişkin, Bağışıklık, Çocuk & Aile, Aktif Yaşam). Panel kendiliğinden döner (2 tur, &lt;30 sn); üzerine gelinen panel açılır, ürün ambalajları yükselir. Her panel ve her ürün ayrı açılış sayfasına gider → daha fazla session, daha derin keşif. Kupon kodu tek dokunuşla kopyalanır."],
  'mobil-320x480-kartlar': ['Mobil Interaktif · 320×480', 'Rutin Kartları (Kaydır)', 'Tam ekran fotoğraf kartları; parmakla sağa/sola kaydırılır (story ilerleme çubuğu, ‹ › düğmeleri). Her kartta onaylı sağlık beyanı ve 2–3 ürün; son kart Dr. Ümit Aktaş portreli %10 yeni üye kuponu. İlk saniyelerde kart "sallanarak" kaydırma ipucu verir.'],
  'mobil-320x480-sil-kesfet': ['Mobil Interaktif · 320×480', 'Sil & Keşfet (Kazı-kazan)', 'Magnezyum kapsül fotoğrafı parmakla silinir, altından Dr. Ümit Aktaş ve %10 kupon çıkar. Otomatik demo çizgisi mekaniği gösterir; %45 silinince sahne açılır, 12 sn etkileşim yoksa kendiliğinden açılır (görünürlük garantisi). Silme hareketi tıklama sayılmaz.'],
  'mobil-320x480-rutin': ['Mobil Interaktif · 320×480', 'Rutin Seçici (Dikey)', "Masthead'in mobil eşi: 4 fotoğraf şeridi, dokununca açılır; ürünlere ve segment sayfasına derin bağlantı. Altta her an görünen kopyalanabilir kupon şeridi."],
};
const block = (n) => {
  const [size, title, note] = NOTES[n];
  const [w, h] = n.match(/(\d+)x(\d+)/).slice(1).map(Number);
  const doc = fs.readFileSync(path.join(dist, 'inline', `${n}.html`), 'utf8').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `<section class="item ${w > 500 ? 'wide' : ''}"><div class="meta"><span class="size">${size}</span><h2>${title}</h2><p>${note}</p>
<div class="act"><button onclick="var f=this.closest('section').querySelector('iframe');f.srcdoc=f.srcdoc">↻ Tekrar oynat</button><a href="../dist-rich/zip/ilacsizyasam-${n}.zip">Zip</a><a href="../dist-rich/${n}/index.html" target="_blank">Yeni sekme</a></div></div>
<div class="frame" style="width:${w}px;height:${h}px"><iframe title="${title}" width="${w}" height="${h}" srcdoc="${doc}"></iframe></div></section>`;
};
const have = (n) => NOTES[n] && fs.existsSync(path.join(dist, 'inline', `${n}.html`));
const needSet = Object.keys(ADS).filter((n) => ADS[n].creative === 'gunes' && have(n)).map(block).join('\n');
const creativeSet = Object.keys(ADS).filter((n) => ADS[n].creative && ADS[n].creative !== 'gunes' && have(n)).map(block).join('\n');
const standardSet = Object.keys(ADS).filter((n) => !ADS[n].creative && have(n)).map(block).join('\n');
const blocks = `<h3 class="sec">Ana fikir · İhtiyacı ortaya çıkaran canlı veri</h3>${needSet}<h3 class="sec">Yaratıcı set · keşif mekanikleri</h3>${creativeSet}<h3 class="sec">Standart set · alternatif / yedek</h3>${standardSet}`;
fs.mkdirSync(path.join(root, 'preview-rich'), { recursive: true });
fs.writeFileSync(path.join(root, 'preview-rich', 'index.html'), `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>İlaçsız Yaşam – Kasım Interaktif Çalışmalar</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Manrope:wght@500;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:Manrope,Arial,sans-serif;background:#f3f5fa;color:#0f1a3a;padding:40px 24px 80px}
header{max-width:1040px;margin:0 auto 32px}header .k{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#5fa511}
h1{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:40px;line-height:1.05;margin:8px 0 12px;color:#132d7d}header p{max-width:760px;line-height:1.55;font-size:15px;color:#3a4566}
.grid{max-width:1040px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:28px}
.sec{grid-column:1/-1;font-family:Fraunces,Georgia,serif;font-weight:600;font-size:22px;color:#132d7d;margin-top:18px;border-top:2px solid #dfe4f0;padding-top:22px}.item{background:#fff;border-radius:18px;padding:22px;box-shadow:0 10px 30px rgba(19,45,125,.08);display:flex;flex-direction:column;gap:16px}
.item.wide{grid-column:1/-1}.item.wide .frame{max-width:100%}
.size{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#5fa511}.item h2{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:24px;color:#132d7d;margin:4px 0 6px}
.item p{font-size:13.5px;line-height:1.55;color:#3a4566}.act{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.act button,.act a{font:inherit;font-size:12px;font-weight:800;padding:8px 14px;border-radius:999px;border:1.5px solid #132d7d;color:#132d7d;background:#fff;cursor:pointer;text-decoration:none}
.act button{background:#132d7d;color:#fff}.frame{overflow:hidden;border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,.18);align-self:center}iframe{border:0;display:block}
@media (max-width:1040px){.item.wide .frame{transform-origin:0 0}}
</style></head><body>
<header><div class="k">İlaçsız Yaşam · Kasım 2026</div><h1>Gölgen ne diyor?</h1>
<p>Kasım'da insanlar ihtiyaçlarının farkında değil: gün kısalıyor, güneş alçalıyor, ama kimse bunu kendi hayatına bağlamıyor. Ana fikir, reklamın izleyicinin şehri ve bugünün tarihi için güneşi <b>canlı hesaplayıp</b> ona kendi gerçeğini göstermesi: <i>"Bugün İstanbul'da öğlen gölgen boyunun 1,7 katı."</i> İhtiyaç, kullanıcının kendi verisiyle ortaya çıkar; ardından 3 fotoğraflı soru kişisel Kasım rutinini kurar. Cevaplar UTM'e yazıldığı için marka da mecra bazında hangi ihtiyacın baskın olduğunu öğrenir. Tamamı markanın kendi fotoğraflarıyla; hiçbir çizim/vektör yok.</p></header>
<div class="grid">${blocks}</div></body></html>`);
console.log('✔ preview-rich/index.html (tek dosya sunum)');
