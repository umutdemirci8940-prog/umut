'use strict';
/**
 * Konsept 4 – Buğulu Cam: Kasım soğuğunda buğulanmış camı kullanıcı parmağı/faresiyle siler,
 * altından sitedeki "Polar & Sweatshirt – Tarzını Seç" kampanya fotoğrafı çıkar.
 * Buğu katmanı aynı fotoğrafın bulanık raster kopyasıdır (vektör yok).
 */
const SITE = 'https://www.altinyildizclassics.com';
const UTM = 'utm_source=display&utm_medium=richmedia&utm_campaign=kasim-bugulu-cam-970x250';
const u = (p) => `${SITE}/${p}?${UTM}`;
module.exports = {
  copy: {
    fogOver: 'Kasım geldi',
    fogTitle: ['Camı silin,', 'sıcaklığı bulun.'],
    fogHint: 'Fare ya da parmağınızla silin',
    cleared: 'temizlendi',
    title: 'Tarzını seç',
    sub: 'Polar & Sweatshirt',
    cta: 'Hemen Keşfet',
    replay: 'Yeniden buğula',
  },
  timing: { demo: 1900, autoClear: 11000, threshold: 0.5 },
  url: u('sweatshirt-c'),
  sides: [
    { key: 'polar', label: 'Polar', arrow: 'left', url: u('polar-c'), spot: { x: 228, y: 176 },
      card: { img: 'p1', name: 'Bato Yaka Polar', meta: 'Anti-Pilling · Soğuk Geçirmez', url: u('erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-beyaz-polar-p'), x: 18, y: 34 } },
    { key: 'sweat', label: 'Sweatshirt', arrow: 'right', url: u('sweatshirt-c'), spot: { x: 770, y: 196 },
      card: { img: 'p2', name: 'Bato Yaka Sweatshirt', meta: 'İçi Polarlı · Pamuklu', url: u('erkek-standart-fit-normal-kesim-ici-polarli-bato-yaka-pamuklu-bordo-sweatshirt-p'), x: 852, y: 34 } },
  ],
};
