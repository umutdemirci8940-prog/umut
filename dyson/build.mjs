// İki ayrı 970×250 masthead derler (her biri kendi index.html'inde, tek ürün):
//   dist/haircare/index.html  – Dyson Supersonic Nural (saç bakımı)
//   dist/cordfree/index.html  – Dyson V12 Detect Slim (kablosuz süpürge)
// three.js dahil tüm kod satır içidir. assets/selection.json'daki siteden alınmış materyaller
// (film, poster, küçük görsel) ilgili masthead'e eklenir: görseller base64, video media/ klasörüne.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(root, 'dist');
const MASTHEADS = {
  haircare: { stage: 'hair', category: 'Saç bakımı', title: 'Dyson Supersonic Nural™ – 970×250', url: 'https://www.dyson.com.tr/products/hair-care' },
  cordfree: { stage: 'floor', category: 'Kablosuz süpürgeler', title: 'Dyson V12 Detect™ Slim – 970×250', url: 'https://www.dyson.com.tr/products/cord-free' },
};

const res = await build({ entryPoints: [path.join(root, 'src/main.js')], bundle: true, minify: true, format: 'iife', target: 'es2019', write: false, legalComments: 'none' });
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const tpl = fs.readFileSync(path.join(root, 'src/template.html'), 'utf8');
const selFile = path.join(root, 'assets', 'selection.json');
const sel = fs.existsSync(selFile) ? JSON.parse(fs.readFileSync(selFile, 'utf8')) : {};
const dataUri = (rel) => { const f = path.join(root, rel); const ext = path.extname(f).slice(1).replace('jpg', 'jpeg'); return `data:image/${ext};base64,${fs.readFileSync(f).toString('base64')}`; };
let hasZip = true; try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }
fs.mkdirSync(path.join(dist, 'zip'), { recursive: true });

function render(m, assets) {
  const other = m.stage === 'hair' ? 'floor' : 'hair';
  return tpl
    .replace(new RegExp(`<!--${other}-->[\\s\\S]*?<!--\\/${other}-->`, 'g'), '')
    .replace(new RegExp(`<!--\\/?${m.stage}-->`, 'g'), '')
    .replaceAll('{{STAGE}}', m.stage).replaceAll('{{CATEGORY}}', m.category).replaceAll('{{TITLE}}', m.title).replaceAll('{{URL}}', m.url)
    .replace('<!--ASSETS-->', () => `<script>window.__MH_STAGE__=${JSON.stringify(m.stage)};window.__MH_ASSETS__=${JSON.stringify({ [m.stage]: assets })}</script>`)
    .replace('/*BUNDLE*/', () => js);
}
function zipDir(dir, zipName) {
  if (!hasZip) return '';
  const z = path.join(dist, 'zip', zipName);
  fs.rmSync(z, { force: true });
  execSync(`cd "${dir}" && zip -q -r "${z}" .`);
  return ` → dist/zip/${zipName} (${(fs.statSync(z).size / 1024).toFixed(0)} KB)`;
}

for (const [name, m] of Object.entries(MASTHEADS)) {
  const out = path.join(dist, name);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const a = sel[m.stage] || {}, assets = {};
  if (a.image) assets.image = dataUri(a.image);
  if (a.poster) assets.poster = dataUri(a.poster);
  if (a.video) {
    fs.mkdirSync(path.join(out, 'media'), { recursive: true });
    const vName = 'film' + path.extname(a.video);
    fs.copyFileSync(path.join(root, a.video), path.join(out, 'media', vName));
    assets.video = `media/${vName}`;
  }
  const html = render(m, assets);
  fs.writeFileSync(path.join(out, 'index.html'), html);
  console.log(`✔ dist/${name}/index.html  ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB${assets.video ? ' + media/' + path.basename(assets.video) : ''}${zipDir(out, `dyson-${name}-970x250.zip`)}`);
  // Filmli sürüm 150 KB'ı aşar; Google Ads gibi sınırlı ağlar için filmsiz "lite" zip de üretilir
  if (assets.video) {
    const tmp = path.join(dist, '.lite'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
    fs.writeFileSync(path.join(tmp, 'index.html'), render(m, {}));
    console.log(`  └ filmsiz sürüm${zipDir(tmp, `dyson-${name}-970x250-lite.zip`)}`);
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
fs.rmSync(path.join(dist, 'index.html'), { force: true });
fs.rmSync(path.join(dist, 'media'), { recursive: true, force: true });

// Tek dosyalık teslim: film dosyanın içine gömülür → teslim/<ad>/index.html tek başına açılır
for (const name of Object.keys(MASTHEADS)) {
  let html = fs.readFileSync(path.join(dist, name, 'index.html'), 'utf8');
  const film = path.join(dist, name, 'media', 'film.mp4');
  if (fs.existsSync(film)) html = html.replace('"media/film.mp4"', () => `"data:video/mp4;base64,${fs.readFileSync(film).toString('base64')}"`);
  fs.mkdirSync(path.join(root, 'teslim', name), { recursive: true });
  fs.writeFileSync(path.join(root, 'teslim', name, 'index.html'), html);
  console.log(`✔ teslim/${name}/index.html  ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB (tek dosya, film gömülü)`);
}
