'use strict';
/** Selfy Fest '26 masthead içeriği. Metin / tarih / sanatçı değişiklikleri yalnızca burada yapılır. */
module.exports = {
  url: 'https://www.selfy.com.tr/kampanyalar/selfyfest26?utm_source=oasis&utm_medium=970x250&utm_campaign=Selfy-Fest-2026',
  year: 2026, month: 10, monthName: 'EKİM', monthShort: 'EKİ',
  // kartın üzerine gelince dönen yüz (sitedeki "Akış" bölümünden)
  backTitle: 'KONSER 20.00',
  backText: 'Etkinlikler 12.00\'de başlıyor<br>3x3 Basketbol · HADO · DJ',
  // sağ paneldeki dönen etkinlik bandı
  ticker: [
    '<b>6</b> ŞEHİR · <b>6</b> KAMPÜS · <b>6</b> KONSER',
    'Selfy <b>3x3</b> Basketbol Turnuvası',
    '<b>5G</b> ile HADO Turnuvası',
    'Sürpriz <b>hediyeli</b> yarışmalar',
  ],
  artists: [
    { key: 'murat', city: 'RİZE',     name: 'MURAT DALKILIÇ', day: 6,  uni: 'RECEP TAYYİP ERDOĞAN ÜNİVERSİTESİ' },
    { key: 'simge', city: 'SAMSUN',   name: 'SİMGE',          day: 8,  uni: 'ONDOKUZ MAYIS ÜNİVERSİTESİ' },
    { key: 'mert',  city: 'İZMİR',    name: 'MERT DEMİR',     day: 13, uni: 'EGE ÜNİVERSİTESİ' },
    { key: 'fatma', city: 'ISPARTA',  name: 'FATMA TURGUT',   day: 15, uni: 'SÜLEYMAN DEMİREL ÜNİVERSİTESİ' },
    { key: 'kofn',  city: 'ANKARA',   name: 'KÖFN',           day: 20, uni: 'ATILIM ÜNİVERSİTESİ' },
    { key: 'edis',  city: 'İSTANBUL', name: 'EDİS',           day: 23, uni: 'İSTANBUL TEKNİK ÜNİVERSİTESİ' },
  ],
};
