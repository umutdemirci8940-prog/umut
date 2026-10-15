'use strict';
/**
 * Altınyıldız Classics – 970x250 interaktif "Stil Danışmanı" billboard
 * Tüm metinler, bağlantılar ve ürün eşleşmeleri burada. Düzenleyip `node build.js` çalıştırın.
 * Görseller: assets/banner/ (tools/prepare-images.py ile altinyildizclassics.com görsellerinden üretilir).
 */
const SITE = 'https://www.altinyildizclassics.com';
const UTM = 'utm_source=display&utm_medium=richmedia&utm_campaign=size-ozel-stil-970x250';
const u = (p) => `${SITE}/${p}${p.includes('?') ? '&' : '?'}${UTM}`;

module.exports = {
  brand: {
    name: 'Altınyıldız Classics',
    url: u('yeni-sezon-c'),          // clickTag yoksa varsayılan çıkış
    eyebrow: 'Size Özel Stil',
    headline: 'Bugün nereye?',
    hint: 'Seçin, kombininizi hazırlayalım',
    rail: 'Size özel kombin',
    loupe: 'Kumaşı yakından inceleyin',
    cta: 'Kombini Keşfet',
  },
  timing: { intro: 1900, cycle: 3800, maxAutoplay: 30000 },
  occasions: [
    {
      key: 'is', chip: 'İş Günü', over: 'İş günü için', title: 'Toplantıdan akşam yemeğine',
      sub: 'Takım elbise · 4.399,99 TL\'den başlayan fiyatlarla*', note: '*Kampanya 31.10.2026 tarihine kadar geçerlidir.',
      url: u('takim-elbise-c'),
      hotspots: [
        { x: 36, y: 40, label: 'Takım Elbise', url: u('takim-elbise-c') },
        { x: 57, y: 27, label: 'Klasik Gömlek', url: u('klasik-gomlek-c') },
      ],
      products: [
        { img: 'is1', name: 'Armürlü Gömlek', meta: 'Non-Iron · Slim Fit', url: u('erkek-utu-gerektirmeyen-slim-fit-klasik-yaka-100-pamuk-armurlu-beyaz-gomlek-6-p') },
        { img: 'is2', name: 'Oxford Gömlek', meta: 'Kolay Ütü · Slim Fit', url: u('erkek-dugmeli-yaka-kolay-utulenebilir-pamuklu-slim-fit-dar-kesim-oxford-gri-gomlek-p') },
        { img: 'is3', name: 'Travel Gömlek', meta: 'Tailored Slim Fit', url: u('erkek-tailored-slim-fit-dar-kesim-dugmeli-yaka-gofre-desenli-travel-lacivert-gomlek-p') },
      ],
    },
    {
      key: 'davet', chip: 'Özel Davet', over: 'Özel davet için', title: 'Smokin bizim işimiz',
      sub: 'Smokin & Damatlık Koleksiyonu', note: '',
      url: u('smokin-c'),
      hotspots: [
        { x: 22, y: 23, label: 'Ata Yaka Gömlek', url: u('atayaka-gomlek-c') },
        { x: 30, y: 44, label: 'Smokin', url: u('smokin-c') },
      ],
      products: [
        { img: 'davet1', name: 'Ata Yaka Gömlek', meta: '%100 Pamuk', url: u('erkek-slim-fit-dar-kesim-100-pamuk-ata-yaka-beyaz-gomlek-7-p') },
        { img: 'davet2', name: 'Kırışmaz Gömlek', meta: 'Ata Yaka · Slim Fit', url: u('erkek-slim-fit-dar-kesim-ata-yaka-kolay-kirismayan-100-pamuk-beyaz-gomlek-p') },
        { img: 'davet3', name: 'Siyah Gömlek', meta: 'Non-Iron · Tailored', url: u('erkek-utu-gerektirmeyen-non-iron-tailored-slim-fit-dar-kesim-100-pamuk-siyah-gomlek-p') },
      ],
    },
    {
      key: 'haftasonu', chip: 'Hafta Sonu', over: 'Hafta sonu için', title: 'Sonbahar / Kış ’26-27',
      sub: 'Yeni sezon koleksiyonu', note: '',
      url: u('yeni-sezon-c'),
      hotspots: [
        { x: 33, y: 47, label: 'Ceket', url: u('ceket-c') },
        { x: 81, y: 44, label: 'Gömlek Ceket', url: u('gomlek-ceket-c') },
      ],
      products: [
        { img: 'hs1', name: 'Bordo Polar', meta: 'Anti-Pilling', url: u('erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-bordo-polar-p') },
        { img: 'hs2', name: 'Sweatshirt', meta: 'Pamuklu · 2 İplik', url: u('erkek-pamuklu-standart-fit-normal-kesim-2-iplik-bisiklet-yaka-lacivert-sweatshirt-p') },
        { img: 'hs3', name: 'Triko Tişört', meta: 'Jakarlı · %100 Pamuk', url: u('erkek-100-pamuk-standart-fit-bisiklet-yaka-jakarli-triko-gri-tisort-p') },
      ],
    },
  ],
};
