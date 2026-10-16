'use strict';
/**
 * Konsept 5 (mobil, 320x480) – Stil Eşleşmesi: kartları sağa (beğen) / sola (geç) kaydır,
 * sonunda kişisel stil profili ve beğenilen parçalardan mini gardırop.
 */
const SITE = 'https://www.altinyildizclassics.com';
const UTM = 'utm_source=display&utm_medium=mobile-richmedia&utm_campaign=kasim-stil-eslesmesi-320x480';
const u = (p) => `${SITE}/${p}?${UTM}`;
module.exports = {
  size: { w: 320, h: 480 },
  copy: {
    eyebrow: 'Kasım · Stil Eşleşmesi',
    hint: 'Beğendiğini sağa, geçtiğini sola kaydır',
    like: 'Beğendim', nope: 'Geç',
    view: 'İncele',
    resultOver: 'Stil profiliniz',
    likedTitle: 'Eşleştiğiniz parçalar',
    none: 'Henüz eşleşme yok. Belki tüm koleksiyon size göre?',
    cta: 'Gardırobumu Gör',
    ctaNone: 'Koleksiyonu Keşfet',
    again: '↺ Yeniden oyna',
  },
  url: u('yeni-sezon-c'),
  profiles: {
    klasik: { title: 'Klasik Beyefendi', desc: 'Keskin hatlar, zamansız parçalar.', url: u('kazak-c') },
    smart:  { title: 'Smart Casual', desc: 'Ofisten hafta sonuna tek gardırop.', url: u('polar-c') },
    casual: { title: 'Rahat & Şehirli', desc: 'Önce konfor, her zaman tarz.', url: u('sweatshirt-c') },
  },
  cards: [
    { img: 'c1', style: 'klasik', cat: 'Kazak', name: 'Yarım Balıkçı Kazak', meta: 'Bej · Anti-Pilling', url: u('erkek-tuylenme-yapmayan-anti-pilling-standart-fit-normal-kesim-yarim-balikci-yaka-bej-kazak-p') },
    { img: 'c2', style: 'smart', cat: 'Polar', name: 'Sweatshirt Ceket Polar', meta: 'Gri Melanj · Anti-Pilling', url: u('erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-sweatshirt-ceket-gri-melanj-polar-p') },
    { img: 'c3', style: 'casual', cat: 'Sweatshirt', name: 'Kapüşonlu Sweatshirt', meta: 'Lacivert · İçi Polarlı', url: u('erkek-standart-fit-normal-kesim-ici-polarli-3-iplik-kapusonlu-kanguru-cepli-pamuklu-lacivert-sweatshirt-p') },
    { img: 'c4', style: 'klasik', cat: 'Pantolon', name: 'Klasik Pantolon', meta: 'Siyah · Slim Fit', url: u('erkek-slim-fit-dar-kesim-klasik-siyah-pantolon-p') },
    { img: 'c5', style: 'smart', cat: 'Kazak', name: 'Muline Desen Kazak', meta: 'Kahve-Bej · Pamuklu', url: u('erkek-standart-fit-normal-kesim-pamuklu-bisiklet-yaka-muline-desenli-kahve-bej-kazak-p') },
    { img: 'c6', style: 'casual', cat: 'Polar', name: 'Bato Yaka Polar', meta: 'Kırmızı · Soğuk Geçirmez', url: u('erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-kirmizi-polar-p') },
    { img: 'c7', style: 'smart', cat: 'Pantolon', name: 'Chino Pantolon', meta: 'Lacivert · Slim Fit', url: u('erkek-slim-fit-dar-kesim-pamuklu-esnek-lacivert-chino-pantolon-3-p') },
    { img: 'c8', style: 'klasik', cat: 'Kazak', name: 'Yarım Balıkçı Kazak', meta: 'Lacivert · Standart Fit', url: u('erkek-standart-fit-normal-kesim-yarim-balikci-yaka-lacivert-kazak-4-p') },
  ],
};
