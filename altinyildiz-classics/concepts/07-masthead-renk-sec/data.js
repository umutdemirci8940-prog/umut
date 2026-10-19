'use strict';
/**
 * Masthead önerisi 1 – Rengini Seç (970x250).
 * Aynı modelin sitedeki gerçek renk fotoğrafları arasında renk kutucuklarıyla geçiş; sahneyi yatay sürükleyerek renkleri tarama.
 * Renk kodları ürün fotoğraflarının göğüs bölgesinden ölçülmüştür (tools ile, bkz. README).
 * Fiyatlar 19.10.2026 tarihinde sitedeki "Sepette" fiyatlarıdır; yayın öncesi güncelleyin.
 */
const SITE = 'https://www.altinyildizclassics.com';
const UTM = 'utm_source=display&utm_medium=masthead&utm_campaign=kasim-rengini-sec-970x250';
const u = (p) => `${SITE}/${p}?${UTM}`;
const V = [
 {
  "img": "p0",
  "type": "p",
  "color": "Bordo",
  "hex": "#721d20",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-bordo-polar-p",
  "price": "637,49"
 },
 {
  "img": "p1",
  "type": "p",
  "color": "Haki",
  "hex": "#393b29",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-haki-polar-p",
  "price": "645,99"
 },
 {
  "img": "p2",
  "type": "p",
  "color": "Antrasit Melanj",
  "hex": "#484953",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-antrasit-melanj-polar-p",
  "price": "623,89"
 },
 {
  "img": "p3",
  "type": "p",
  "color": "Sarı",
  "hex": "#f0a108",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-sari-polar-p",
  "price": "594,99"
 },
 {
  "img": "p4",
  "type": "p",
  "color": "Beyaz",
  "hex": "#f3eef2",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-beyaz-polar-p",
  "price": "611,99"
 },
 {
  "img": "p5",
  "type": "p",
  "color": "Saks",
  "hex": "#1f409a",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-saks-polar-p",
  "price": "594,99"
 },
 {
  "img": "p6",
  "type": "p",
  "color": "İndigo",
  "hex": "#3977be",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-indigo-polar-p",
  "price": "594,99"
 },
 {
  "img": "p7",
  "type": "p",
  "color": "Yeşil",
  "hex": "#014949",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-yesil-polar-p",
  "price": "594,99"
 },
 {
  "img": "p8",
  "type": "p",
  "color": "Kırmızı",
  "hex": "#dd032b",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-kirmizi-polar-p",
  "price": "594,99"
 },
 {
  "img": "p9",
  "type": "p",
  "color": "Turuncu",
  "hex": "#fd7325",
  "path": "erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-soguk-gecirmez-sweatshirt-turuncu-polar-p",
  "price": "594,99"
 },
 {
  "img": "s10",
  "type": "s",
  "color": "Bordo",
  "hex": "#8c1b2a",
  "path": "erkek-standart-fit-normal-kesim-ici-polarli-bato-yaka-pamuklu-bordo-sweatshirt-p",
  "price": "849,99"
 },
 {
  "img": "s11",
  "type": "s",
  "color": "Bej",
  "hex": "#e3dcd5",
  "path": "erkek-standart-fit-normal-kesim-ici-polarli-bato-yaka-pamuklu-bej-sweatshirt-p",
  "price": "883,99"
 },
 {
  "img": "s12",
  "type": "s",
  "color": "Antrasit Melanj",
  "hex": "#827f88",
  "path": "erkek-standart-fit-normal-kesim-ici-polarli-bato-yaka-pamuklu-antrasit-melanj-sweatshirt-p",
  "price": "849,99"
 },
 {
  "img": "k13",
  "type": "k",
  "color": "Ekru",
  "hex": "#f2f2f2",
  "path": "erkek-tuylenme-yapmayan-anti-pilling-standart-fit-normal-kesim-yarim-balikci-yaka-ekru-kazak-p",
  "price": "878,89"
 },
 {
  "img": "k14",
  "type": "k",
  "color": "Bej",
  "hex": "#e9d8c4",
  "path": "erkek-tuylenme-yapmayan-anti-pilling-standart-fit-normal-kesim-yarim-balikci-yaka-bej-kazak-p",
  "price": "878,89"
 }
];
module.exports = {
  copy: {
    eyebrow: 'Kasım Renkleri',
    headline: ['Tek model,', '{n} renk.'],
    hint: 'Renge dokunun ya da fotoğrafı sağa-sola sürükleyin',
    price: 'Sepette',
    cta: 'Bu Rengi İncele',
    all: 'Tüm renkler',
    legal: 'Fiyatlar 19.10.2026 itibarıyla sitedeki sepet fiyatlarıdır, değişebilir.',
  },
  timing: { cycle: 1600, maxAutoplay: 30000 },
  tabs: [
    { key: 'p', label: 'Polar', model: 'Bato Yaka Soğuk Geçirmez Polar', meta: 'Anti-Pilling · Tüylenme yapmaz', url: u('polar-c') },
    { key: 's', label: 'Sweatshirt', model: 'İçi Polarlı Bato Yaka Sweatshirt', meta: 'Pamuklu · İçi polarlı', url: u('sweatshirt-c') },
    { key: 'k', label: 'Kazak', model: 'Yarım Balıkçı Yaka Kazak', meta: 'Anti-Pilling · Tüylenme yapmaz', url: u('kazak-c') },
  ],
  variants: V.map((v) => Object.assign(v, { url: u(v.path) })),
};
