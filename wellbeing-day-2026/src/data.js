'use strict';
/**
 * Elif Tuncel Akademi – "İçten Dışa Parla" Wellbeing Day 2026
 * Bannerlardaki tüm metinler, renkler ve bağlantı burada.
 * Etkinlik bilgileri resmi afişten alınmıştır (21 Kasım 2026 · Marriott İstanbul Şişli · 4. Sezon).
 */
module.exports = {
  url: 'https://eliftuncel.com/egitim/icten-disa-parla-wellbeing-day-2026-egitimi/',
  utm: { source: 'display', medium: 'banner', campaign: 'wellbeing_day_2026' },

  event: {
    academy: 'ELİF TUNCEL AKADEMİ',
    title: 'İÇTEN DIŞA PARLA',
    sub: 'Wellbeing Day',
    date: '21 Kasım 2026',
    time: '11.30–18.00',
    venue: 'Marriott İstanbul Şişli',
    season: '4. Sezon',
    note: 'Kontenjan sınırlıdır',
    slogan: 'İçinizdeki ışığı ortaya çıkarmaya var mısınız?',
    host: 'Elif Tuncel',
    start: '2026-11-21T11:30:00+03:00', // kalan gün sayacı için
  },

  question: 'Işığınızı ne besler?',
  hint: 'Bir alan seçin, size özel oturumu görün',
  cta: 'Programı İncele',
  ctaEnd: 'Yerinizi Ayırtın',

  // Seçilebilir dört alan. key → UTM utm_content değerine de yazılır.
  pillars: [
    { key: 'beslenme', label: 'Beslenme', title: 'Enerjinizi içeriden besleyin', text: 'Fonksiyonel beslenme ve sağlıklı yaşam', color: '#7f9f5c' },
    { key: 'zihin', label: 'Zihin', title: 'Zihninize nefes aldırın', text: 'Mindfulness, meditasyon ve stres yönetimi', color: '#8a7cc2' },
    { key: 'beden', label: 'Beden', title: 'Dengenizi yeniden kurun', text: 'Yoga, pilates ve fiziksel denge', color: '#d0814f' },
    { key: 'cilt', label: 'Cilt', title: 'Işıltınız içeriden gelsin', text: 'Bütüncül cilt bakımı ve anti-aging', color: '#c9636f' },
  ],

  // Hiçbir alan seçili değilken ve kapanışta gösterilen genel mesaj.
  overview: { key: 'genel', label: 'Kontenjan sınırlıdır', title: 'Kendinize yatırım yapın', text: 'Bütüncül wellbeing, uzmanlarla tek günde', color: '#b08a57' },

  // Banner görselleri (resmi afişten kırpıldı: assets/source/afis.webp). build.js base64 olarak gömer.
  images: {
    portrait: 'assets/portrait.webp',
    logo: 'assets/logo-e.png',
    bg: { '970x250': 'assets/bg-970x250.jpg', '320x480': 'assets/bg-320x480.jpg' },
  },

  // Çalışma 2–4'e özel metin ve süreler (ms)
  concepts: {
    nefes: {
      kicker: 'Bir nefeslik mola', title: 'Birlikte nefes alalım', pill: 'Basılı tutun',
      text: 'Daireye basılı tutun; nefes aldıkça ışığınız büyüsün.',
      doneKicker: 'Işığınız parlıyor',
      txt: { idle: 'Hazır olduğunuzda…', inhale: 'Nefes alın…', keep: 'Bırakmayın…', exhale: 'Nefes verin…' },
      inhale: 4000, exhale: 3000, autoAfter: 4400,
    },
    kazi: {
      coverTitle: 'KAZIYIN', coverText: 'içinizdeki ışığı ortaya çıkarın',
      line: 'Beslenme · Zihin · Beden · Cilt – tek günde',
      revealAt: 0.45, autoAfter: 4200, autoDur: 2600,
    },
    isik: {
      kicker: 'Işığınızı açın', title: 'Kaydırın, içten dışa parlayın', hint: 'Kaydırın',
      thresholds: [0.2, 0.45, 0.7, 0.92], autoAfter: 3400, autoDur: 3600,
      daysText: 'gün kaldı', tomorrow: 'Yarın!',
    },
  },

  // Otomatik tanıtım akışı (ms). Toplam süre 30 sn'yi aşmaz; sonunda kapanış karesinde durur.
  timing: { intro: 2600, idle: 1400, perPillar: 2600, stopAfter: 29000 },
};
