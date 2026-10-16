'use strict';
/**
 * Konsept 6 (mobil, 320x480) – Salla, Kombin Gelsin: telefon sallanınca üst + alt parça karışır, yeni kombin gelir.
 * Hareket algılanamayan cihazlarda SALLA düğmesi; iOS'ta hareket izni, kullanıcı düğmeye ilk dokunduğunda istenir.
 * Ürünler Kombin Makinesi (02) ile aynıdır.
 */
const base = require('../02-kombin-makinesi/data.js');
const UTM_OLD = 'kasim-kombin-makinesi-970x250', UTM_NEW = 'kasim-salla-kombin-320x480';
const fix = (o) => JSON.parse(JSON.stringify(o).split(UTM_OLD).join(UTM_NEW).split('utm_medium=richmedia').join('utm_medium=mobile-richmedia'));
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
