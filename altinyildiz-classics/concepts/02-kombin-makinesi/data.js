'use strict';
/** Konsept 2 – Kombin Makinesi: kolu çek, üst ve alt makaraları dönsün; 5 × 5 = 25 kombin. */
const SITE = 'https://www.altinyildizclassics.com';
const UTM = 'utm_source=display&utm_medium=richmedia&utm_campaign=kasim-kombin-makinesi-970x250';
const u = (p) => `${SITE}/${p}?${UTM}`;
module.exports = {
  copy: {
    eyebrow: 'Kasım Kombin Makinesi',
    headline: ['Kolu çekin,', 'kombininiz gelsin.'],
    sub: 'Kazak, polar, sweatshirt ve pantolon: tek kolla 25 kombin.',
    lever: 'ÇEK',
    hint: 'Kolu aşağı çekin ya da makaraları kaydırın',
    result: 'Kombininiz',
    buy: 'Satın Al',          // her makaranın altında, o an görünen ürünün sayfasına gider
    tried: 'Denenen kombin',
    again: 'Yeniden Çevir',   // kombin sayfası olmadığı için siteye götürmez, yeni kombin çevirir
  },
  timing: { demoSpin: 2100, idleSpin: 6500, maxAutoplay: 30000 },
  tops: [
    { img: 'u1', type: 'kazak', name: 'Muline Desen Kazak', meta: 'Bordo · Pamuklu', url: u('erkek-standart-fit-normal-kesim-pamuklu-bisiklet-yaka-muline-desenli-bordo-lacivert-kazak-p'), cat: u('kazak-c') },
    { img: 'u2', type: 'kazak', name: 'Yarım Balıkçı Kazak', meta: 'Bej · Anti-Pilling', url: u('erkek-tuylenme-yapmayan-anti-pilling-standart-fit-normal-kesim-yarim-balikci-yaka-bej-kazak-p'), cat: u('kazak-c') },
    { img: 'u3', type: 'polar', name: 'Sweatshirt Ceket Polar', meta: 'Gri Melanj · Anti-Pilling', url: u('erkek-anti-pilling-tuylenme-yapmayan-standart-fit-bato-yaka-sweatshirt-ceket-gri-melanj-polar-p'), cat: u('polar-c') },
    { img: 'u4', type: 'sweat', name: 'Bisiklet Yaka Sweatshirt', meta: 'Gri Melanj · 2 İplik', url: u('erkek-pamuklu-standart-fit-normal-kesim-2-iplik-bisiklet-yaka-gri-melanj-sweatshirt-p'), cat: u('sweatshirt-c') },
    { img: 'u5', type: 'sweat', name: 'Bato Yaka Sweatshirt', meta: 'Bordo · İçi Polarlı', url: u('erkek-standart-fit-normal-kesim-ici-polarli-bato-yaka-pamuklu-bordo-sweatshirt-p'), cat: u('sweatshirt-c') },
  ],
  bottoms: [
    { img: 'a1', type: 'chino', name: 'Chino Pantolon', meta: 'Antrasit · Slim Fit', url: u('erkek-slim-fit-dar-kesim-5-cep-pamuklu-esnek-antrasit-chino-pantolon-p') },
    { img: 'a2', type: 'klasik', name: 'Klasik Pantolon', meta: 'Bej · Slim Fit', url: u('erkek-slim-fit-dar-kesim-klasik-yan-cep-bej-pantolon-p') },
    { img: 'a3', type: 'klasik', name: 'Klasik Pantolon', meta: 'Siyah · Slim Fit', url: u('erkek-slim-fit-dar-kesim-klasik-siyah-pantolon-p') },
    { img: 'a4', type: 'klasik', name: 'Klasik Pantolon', meta: 'Gri · Slim Fit', url: u('erkek-slim-fit-dar-kesim-klasik-gri-pantolon-2-p') },
    { img: 'a5', type: 'chino', name: 'Chino Pantolon', meta: 'Lacivert · Slim Fit', url: u('erkek-slim-fit-dar-kesim-pamuklu-esnek-lacivert-chino-pantolon-3-p') },
  ],
  // Üst × alt türüne göre stil notu
  notes: {
    'kazak|klasik': 'Toplantıdan akşam yemeğine, tek kat.',
    'kazak|chino': 'Cuma ofisinin smart casual cevabı.',
    'polar|klasik': 'Soğuk sabahlar için ofis katmanı.',
    'polar|chino': 'Hafta sonu kaçamağına hazır.',
    'sweat|klasik': 'Rahatlığı ciddiyetle dengeleyin.',
    'sweat|chino': 'Maç günü, kahve, şehir turu.',
  },
};
