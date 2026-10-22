'use strict';
/**
 * Elif Tuncel Akademi – "İçten Dışa Parla" Wellbeing Day 2026
 * Bannerlardaki tüm metinler, renkler ve bağlantı burada.
 * Tarih / mekân netleşince `event.date` ve `event.venue` alanlarını doldurun; boş kalırsa gösterilmez.
 */
module.exports = {
  url: 'https://eliftuncel.com/egitim/icten-disa-parla-wellbeing-day-2026-egitimi/',
  utm: { source: 'display', medium: 'banner', campaign: 'wellbeing_day_2026' },

  event: {
    academy: 'ELİF TUNCEL AKADEMİ',
    titleA: 'İçten Dışa',
    titleB: 'Parla',
    name: 'Wellbeing Day 2026',
    date: '',   // örn. '14 Kasım Cumartesi'
    venue: '',  // örn. 'İstanbul'
    status: 'Kayıtlar açık',
  },

  question: 'Bugün ışığını ne besler?',
  hint: 'Birini seç, sana özel oturumu gör',
  cta: 'Programı İncele',
  ctaEnd: 'Yerini Ayırt',

  // Seçilebilir dört alan. key → UTM utm_content değerine de yazılır.
  pillars: [
    { key: 'beslenme', label: 'Beslenme', title: 'Enerjini içeriden besle', text: 'Fonksiyonel beslenme ve sağlıklı yaşam alışkanlıkları', color: '#7fa45f' },
    { key: 'zihin', label: 'Zihin', title: 'Zihnine nefes aldır', text: 'Mindfulness, meditasyon ve stres yönetimi', color: '#8a7fca' },
    { key: 'beden', label: 'Beden', title: 'Dengeni yeniden kur', text: 'Yoga, pilates ve fiziksel denge', color: '#df8a5c' },
    { key: 'cilt', label: 'Cilt', title: 'Işıltın içeriden gelsin', text: 'Bütüncül cilt bakımı ve anti-aging', color: '#d77f8d' },
  ],

  // Hiçbir alan seçili değilken ve kapanışta gösterilen genel mesaj.
  overview: { key: 'genel', label: 'Tek günde', title: 'Kendine yatırım yap', text: 'Beslenme, zihin, beden ve cilt bakımı uzmanlarla tek bir günde', color: '#e0a15a' },

  // Otomatik tanıtım akışı (ms). Toplam süre 30 sn'yi aşmaz; sonunda kapanış karesinde durur.
  timing: { intro: 2600, idle: 1400, perPillar: 2600, stopAfter: 29000 },
};
