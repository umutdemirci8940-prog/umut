'use strict';
/**
 * Konsept 3 – Stil Borsası: finans/ekonomi ilgi alanındaki hedef kitle için borsa dili.
 * Risk profili kaydırıcısı (Muhafazakâr → Dengeli → Atak) gardırop "portföyünü" değiştirir.
 * Fiyatlar 16.10.2026 tarihinde altinyildizclassics.com'daki "Sepette" fiyatlarıdır; yayın öncesi güncelleyin.
 * Portföy dağılımı (%) her parçanın fiyatının portföy toplamına oranıdır (uydurma veri yok).
 */
const SITE = 'https://www.altinyildizclassics.com';
const UTM = 'utm_source=display&utm_medium=richmedia&utm_campaign=kasim-stil-borsasi-970x250';
const u = (p) => `${SITE}/${p}?${UTM}`;
module.exports = {
  copy: {
    tickerLabel: 'Stil Borsası',
    tickerPrefix: 'Sepette',
    eyebrow: 'Kasım · Gardırop Portföyü',
    headline: ['Risk profilinizi seçin,', 'portföyünüz hazır.'],
    sub: 'Kazak, polar, sweatshirt ve pantolonla dengeli bir gardırop.',
    hint: 'Kaydırıcıyı sürükleyin',
    alloc: 'Portföy dağılımı',
    total: 'Portföy toplamı',
    cta: 'Portföyü İncele',
    legal: 'Fiyatlar 16.10.2026 itibarıyla sitedeki sepet fiyatlarıdır, değişebilir.',
  },
  timing: { demoStep: 1500, maxAutoplay: 30000 },
  profiles: [
    {
      key: 'muhafazakar', label: 'Muhafazakâr', style: 'Klasik', desc: 'Zamansız parçalar; ofiste güvenli liman.', url: u('kazak-c'),
      items: [
        { img: 'k1', cat: 'Kazak', name: 'Yarım Balıkçı Kazak', price: 951.99, url: u('erkek-standart-fit-normal-kesim-yarim-balikci-yaka-lacivert-kazak-4-p') },
        { img: 'k2', cat: 'Pantolon', name: 'Klasik Lacivert Pantolon', price: 3569.99, url: u('erkek-slim-fit-dar-kesim-klasik-lacivert-pantolon-p') },
        { img: 'k3', cat: 'Triko Ceket', name: 'Dik Yaka Triko Ceket', price: 1274.99, url: u('erkek-pamuklu-standart-fit-normal-kesim-dik-yaka-triko-siyah-triko-ceket-p') },
      ],
    },
    {
      key: 'dengeli', label: 'Dengeli', style: 'Smart Casual', desc: 'Ofisle hafta sonu arasında ideal denge.', url: u('polar-c'),
      items: [
        { img: 'd1', cat: 'Polar', name: 'Sweatshirt Ceket Polar', price: 917.99, url: u('erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-sweatshirt-ceket-gri-melanj-polar-p') },
        { img: 'd2', cat: 'Pantolon', name: 'Antrasit Chino', price: 747.99, url: u('erkek-slim-fit-dar-kesim-5-cep-pamuklu-esnek-antrasit-chino-pantolon-p') },
        { img: 'd3', cat: 'Kazak', name: 'Petek Desen Kazak', price: 639.99, url: u('erkek-standart-fit-normal-kesim-bisiklet-yaka-petek-desenli-bordo-lacivert-kazak-p') },
      ],
    },
    {
      key: 'atak', label: 'Atak', style: 'Casual', desc: 'Rahatlığa yüksek ağırlık, tarza tam pozisyon.', url: u('sweatshirt-c'),
      items: [
        { img: 'a1', cat: 'Sweatshirt', name: 'Kapüşonlu Sweatshirt', price: 1002.99, url: u('erkek-standart-fit-normal-kesim-ici-polarli-3-iplik-kapusonlu-kanguru-cepli-pamuklu-lacivert-sweatshirt-p') },
        { img: 'a2', cat: 'Pantolon', name: 'Jogger Pantolon', price: 892.49, url: u('erkek-slim-fit-dar-kesim-beli-baglamali-yan-cepli-casual-jogger-gri-pantolon-2-p') },
        { img: 'a3', cat: 'Polar', name: 'Saks Polar', price: 594.99, url: u('erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-saks-polar-p') },
      ],
    },
  ],
};
