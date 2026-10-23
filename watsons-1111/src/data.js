'use strict';
/**
 * Watsons 11.11 – marka metinleri ve reklam verisi.
 * Ürünler, kategoriler ve görseller tools/prepare.py'nin ürettiği assets/ads/selection.json'dan gelir
 * (watsons.com.tr'den çekilen gerçek ürün fotoğrafları, fiyatlar ve ürün adresleri).
 * İndirim oranı, kupon kodu ve sepet kademeleri ÖRNEKTİR; yayın öncesi markayla teyit edilmelidir.
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.watsons.com.tr';
const brand = {
  home: `${BASE}/`,
  event: 'Büyük İndirim Günü',
  offer: '11.11\'e özel seçili ürünlerde ekstra indirim.',
  code: 'WATSONS1111',
  legal: 'Kampanya 11.11 tarihinde watsons.com.tr\'de geçerlidir. Stoklarla sınırlıdır. Detaylar watsons.com.tr\'de.',
  logo: 'img/logo-w.webp',
};

// Sepeti Doldur kademeleri (örnek kurgu)
const tiers = [
  { n: 1, label: '11.11 fiyatı' },
  { n: 3, label: 'Sepette ek indirim' },
  { n: 5, label: 'Hediye ürün' },
];

// Rutinini Kur soruları; 1. cevap kategoriyi seçer (cat = selection.json'daki kategori anahtarı)
const quiz = [
  { q: 'Bu 11.11\'de en çok neye ihtiyacın var?', a: [
    { i: '💄', t: 'Makyaj yenilemek', cat: 'makyaj', steps: ['Baz', 'Renk', 'Bitiş'] },
    { i: '🧴', t: 'Cilt bakımı', cat: 'cilt', steps: ['Temizle', 'Bakım', 'Koru'] },
    { i: '💇', t: 'Saç bakımı', cat: 'sac', steps: ['Yıka', 'Besle', 'Şekil ver'] },
    { i: '🌸', t: 'Yeni bir koku', cat: 'parfum', steps: ['Gündüz', 'Akşam', 'Yanında'] },
  ] },
  { q: 'Rutinini kimin için kuruyorsun?', a: [
    { i: '✨', t: 'Kendim' }, { i: '🎁', t: 'Hediye' }, { i: '👫', t: 'İkimiz' }, { i: '🏠', t: 'Tüm aile' },
  ] },
  { q: 'Rutinine ne kadar zaman ayırıyorsun?', a: [
    { i: '⚡', t: '5 dakika' }, { i: '⏱️', t: '15 dakika' }, { i: '🛁', t: 'Kendime vakit' }, { i: '🤷', t: 'Fark etmez' },
  ] },
];

function selection() {
  const f = path.join(__dirname, '..', 'assets', 'ads', 'selection.json');
  if (!fs.existsSync(f)) throw new Error('assets/ads/selection.json yok – önce: python3 tools/prepare.py');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

const utm = (url, content) => {
  const u = new URL(url, BASE);
  u.searchParams.set('utm_source', 'masthead');
  u.searchParams.set('utm_medium', 'display');
  u.searchParams.set('utm_campaign', '1111');
  u.searchParams.set('utm_content', content);
  return u.toString();
};

function forAd(ad) {
  const s = selection();
  const c = ad.id.replace(/^\d+-/, '');
  const prod = (p) => ({ key: p.key, brand: p.brand, name: p.name, price: p.price, club: p.club || '', img: `img/${p.img}`, url: utm(p.url, `${c}_${p.key}`) });
  const all = s.products.map(prod);
  const byKey = Object.fromEntries(all.map((p) => [p.key, p]));
  const products = all.slice(0, ad.products ?? 12);
  const cats = s.cats.slice(0, ad.cats ?? 8).map((k) => {
    const ps = (k.products || []).map((x) => byKey[x]).filter(Boolean);
    return { key: k.key, name: k.name, img: `img/${k.img}`, url: utm(k.url, `${c}_kat_${k.key}`), product: ps[0], products: ps };
  });
  const b = { ...brand, home: utm(brand.home, `${c}_genel`) };
  const vars = {
    LOGO: '<img class="wlogo" src="img/logo-w.webp" alt="Watsons">',
    BADGE: `<div class="b1111"><b>11.11</b><span>${brand.event}</span></div>`,
    LEGAL: brand.legal, CODE: brand.code, OFFER: brand.offer, EVENT: brand.event,
    HERO: s.heroes[ad.hero || 0] || s.heroes[0], HERO2: s.heroes[1] || s.heroes[0], CAT0: (s.cats[0] || {}).img || s.heroes[0],
  };
  return { brand: b, products, cats, tiers, quiz, vars };
}

module.exports = { brand, forAd, BASE };
