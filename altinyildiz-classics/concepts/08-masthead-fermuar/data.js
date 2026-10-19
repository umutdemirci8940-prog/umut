'use strict';
/**
 * Masthead önerisi 2 – Fermuarı Çek (970x250).
 * Banner kapalı bir mont ön yüzüdür (sitedeki "Mevsimlik Dış Giyim – Mont" kampanya fotoğrafının iki yarısı birleştirilerek).
 * Kullanıcı fermuarı aşağı çektikçe mont V şeklinde açılır; tamamen açılınca altındaki Kasım katmanları çıkar.
 */
const SITE = 'https://www.altinyildizclassics.com';
const UTM = 'utm_source=display&utm_medium=masthead&utm_campaign=kasim-fermuar-970x250';
const u = (p) => `${SITE}/${p}?${UTM}`;
module.exports = {
  copy: {
    closedOver: 'Kasım geldi',
    closedTitle: ['Montun altında', 'ne var?'],
    closedSub: 'Fermuarı aşağı çekin',
    pull: 'Çek',
    openOver: 'Kasım katmanları',
    openTitle: ['Katman katman', 'sıcak kalın.'],
    openSub: 'Polar, sweatshirt, kazak ve pantolon: montun altına ne giyerseniz.',
    cta: 'Katmanları Keşfet',
    coats: 'Montlar',
    replay: '↺ Fermuarı kapat',
  },
  timing: { tease: 2000, autoOpen: 12000 },
  url: u('yeni-sezon-c'),
  coatsUrl: u('mont-c'),
  tiles: [
    { img: 't1', cat: 'Polar', name: 'Bato Yaka Polar', url: u('erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-antrasit-melanj-polar-p'), catUrl: u('polar-c') },
    { img: 't2', cat: 'Sweatshirt', name: 'İçi Polarlı Sweatshirt', url: u('erkek-standart-fit-normal-kesim-ici-polarli-bato-yaka-pamuklu-bej-sweatshirt-p'), catUrl: u('sweatshirt-c') },
    { img: 't3', cat: 'Kazak', name: 'Muline Desen Kazak', url: u('erkek-standart-fit-normal-kesim-pamuklu-bisiklet-yaka-muline-desenli-kahve-bej-kazak-p'), catUrl: u('kazak-c') },
    { img: 't4', cat: 'Pantolon', name: 'Lacivert Chino', url: u('erkek-slim-fit-dar-kesim-pamuklu-esnek-lacivert-chino-pantolon-3-p'), catUrl: u('pantolon-c') },
  ],
};
