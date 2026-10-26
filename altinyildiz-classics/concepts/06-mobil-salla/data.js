'use strict';
/**
 * Konsept 6 (mobil, 320x480) – Salla, Kombin Gelsin: telefon sallanınca üst + alt parça karışır, yeni kombin gelir.
 * Hareket algılanamayan cihazlarda SALLA düğmesi; iOS'ta hareket izni, kullanıcı düğmeye ilk dokunduğunda istenir.
 * Ürünler Kombin Makinesi (02) ile aynıdır.
 */
const base = require('../02-kombin-makinesi/data.js');
// 02 artık UTM'siz adres veriyor; bu konsept kendi UTM'ini ekler.
const UTM = 'utm_source=display&utm_medium=mobile-richmedia&utm_campaign=kasim-salla-kombin-320x480';
const fix = (list) => list.map((p) => Object.assign({}, p, { url: p.url + '?' + UTM, cat: p.cat && p.cat + '?' + UTM }));
module.exports = {
  size: { w: 320, h: 480 },
  copy: {
    eyebrow: 'Kasım · Salla, Kombin Gelsin',
    headline: ['Telefonu sallayın,', 'kombininiz gelsin.'],
    hintMotion: 'Telefonu sallayın ya da düğmeye dokunun',
    hintTap: 'Düğmeye dokunun, kombin karışsın',
    hintIOS: 'Sallamak için önce SALLA\'ya dokunun',
    hintDenied: 'Hareket izni yok, düğmeyle karıştırın',
    ready: 'Hazır! Şimdi sallayın',
    shake: 'Salla',
    lock: 'Kilitle', locked: 'Kilitli',
    tried: 'Kombin',
    cta: 'Kombini Keşfet',
  },
  timing: { demo: 2200, idle: 5200, maxAutoplay: 30000 },
  tops: fix(base.tops),
  bottoms: fix(base.bottoms),
  notes: base.notes,
};
