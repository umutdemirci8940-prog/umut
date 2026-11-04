'use strict';
/**
 * Kombin Makinesi – onaylanan sürüm (AC_V4_1) + markanın ürün listesi (Altınyıldız UTM Linkleri – Splash).
 * Yönlendirmeler markanın verdiği UTM'li adreslerdir (src/ac-urunler.json, Word dosyasından birebir).
 * Görseller ürün sayfalarındaki stüdyo fotoğrafları (assets/raw-ac, tools/fetch-products.js).
 */
const list = require('../../src/ac-urunler.json');
const url = (no) => list.find((p) => p.no === no).url;

const tops = [
  [1, 'triko', 'Yarım Balıkçı Kazak', 'Siyah · Anti-Pilling'],
  [2, 'gomlek', 'Flamlı Oxford Gömlek', 'Beyaz · %100 Pamuk'],
  [3, 'triko', 'Yarım Balıkçı Kazak', 'Haki · Anti-Pilling'],
  [5, 'dis', 'Mono Yaka Casual Ceket', 'Gri · Slim Fit'],
  [6, 'gomlek', 'Oxford Gömlek', 'Haki · Kolay Ütü'],
  [7, 'dis', 'Şişme Mont', 'Siyah · Ultra Hafif'],
  [9, 'dis', 'Yünlü Blazer Ceket', 'Mavi · Slim Fit'],
  [11, 'triko', 'Bisiklet Yaka Sweatshirt', 'Siyah · 2 İplik'],
  [12, 'gomlek', 'Bisiklet Yaka Tişört', 'Beyaz · %100 Pamuk'],
  [13, 'triko', "2'li Paket Polar", 'Lacivert-Siyah · Anti-Pilling'],
  [14, 'dis', 'Şişme Mont', 'Lacivert · Ultra Hafif'],
  [15, 'triko', 'Bato Yaka Polar', 'Siyah · Soğuk Geçirmez'],
  [16, 'dis', 'Süet Ceket Mont', 'Bej · Dik Yaka'],
  [17, 'gomlek', 'Oxford Gömlek', 'Gri · Kolay Ütü'],
  [18, 'triko', 'Bato Yaka Polar', 'Lacivert · Soğuk Geçirmez'],
  [20, 'triko', 'Bato Yaka Polar', 'Antrasit Melanj · Anti-Pilling'],
  [22, 'dis', 'Kapüşonlu Kaban', 'Siyah · Dik Yaka'],
  [24, 'dis', 'Dolgulu Mont', 'Bej · Rüzgar Geçirmez'],
];
const bottoms = [
  [4, 'casual', 'Jean Pantolon', 'Siyah · Ekstra Slim Fit'],
  [10, 'chino', 'Chino Pantolon', 'Haki · Slim Fit'],
  [19, 'casual', 'Jogger Eşofman Altı', 'Lacivert · 2 İplik'],
  [21, 'chino', 'Chino Pantolon', 'Siyah · Slim Fit'],
  [23, 'casual', 'Örme Pantolon', 'Siyah · Diagonal Desen'],
];
const n = tops.length * bottoms.length;

module.exports = {
  copy: {
    eyebrow: 'Kasım Kombin Makinesi',
    headline: ['Kolu çekin,', 'kombininiz gelsin.'],
    sub: `Mont, ceket, triko, gömlek ve pantolon: tek kolla ${n} kombin.`,
    lever: 'ÇEK',
    hint: 'Kolu aşağı çekin ya da makaraları kaydırın',
    result: 'Kombininiz',
    buy: 'Satın Al',
    tried: 'Denenen kombin',
    total: n,
    again: 'Yeniden Çevir',
  },
  timing: { demoSpin: 2100, idleSpin: 6500, maxAutoplay: 30000 },
  // cat: banner zeminine tıklanınca gidilecek adres = o an görünen üst parçanın ürün sayfası (kombin sayfası yok)
  tops: tops.map(([no, type, name, meta]) => ({ img: 'u' + no, type, name, meta, url: url(no), cat: url(no) })),
  bottoms: bottoms.map(([no, type, name, meta]) => ({ img: 'a' + no, type, name, meta, url: url(no) })),
  notes: {
    'dis|chino': 'Şehirde katmanlı, ofiste şık.',
    'dis|casual': 'Hafta sonu soğuğuna tam hazır.',
    'triko|chino': 'Cuma ofisinin smart casual cevabı.',
    'triko|casual': 'Maç günü, kahve, şehir turu.',
    'gomlek|chino': 'Toplantıdan akşam yemeğine.',
    'gomlek|casual': 'Rahat ama her zaman özenli.',
  },
};
