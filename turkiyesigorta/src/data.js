'use strict';
/**
 * Türkiye Sigorta – 970x250 billboard: metinler, sahneler, renkler ve süreler.
 * Tüm metinler turkiyesigorta.com.tr'deki ifadelere dayanır (bkz. README.md → İçerik kaynakları).
 */
module.exports = {
  brand: {
    name: 'Türkiye Sigorta',
    site: 'https://www.turkiyesigorta.com.tr',
    url: 'https://www.turkiyesigorta.com.tr/?utm_source=display&utm_medium=banner&utm_campaign=970x250',
    domain: 'turkiyesigorta.com.tr',
    deepLink: true,            // sahnedeyken tıklama ilgili ürün sayfasına gider (clickTag tanımlıysa yine clickTag)
    kicker: "Türkiye'nin lider sigorta şirketi",
    tagline: 'Gücü, adında.',           // sitedeki marka sloganı ("Türkiye Sigorta: Gücü, adında.")
    taglinePrefix: 'Türkiye Sigorta:',
    slogan: 'Hayatınızı güvence altına alın',
    sloganIntro: ['Türkiye Sigorta ile', 'hayatınızı güvence altına alın'],
    cta: 'Hemen Teklif Al',
    phoneLabel: '7/24 Müşteri İletişim Merkezi',
    phone: '0850 202 20 20',
    outroTitle: 'Hayatınızı güvence altına alın',
    outroList: 'Kasko · Trafik · Konut · DASK · Sağlık · Seyahat · Hayat · BES',
    outroNote: 'Mobil Müşteri Platformu ile poliçe ve hasar işlemleriniz cebinizde',
  },
  // Renkler: assets/site/manifest.json'daki site renkleriyle güncellenir (build.js --colors)
  // Renkler sitenin CSS değişkenlerinden (assets/site/manifest.json → cssVars): dark-blue-500, turqoise-600/400/100, red-600
  colors: {
    navy: '#0a145a',
    navyDeep: '#070e40',
    blue: '#005aaa',
    turquoise: '#00afd2',
    turquoise600: '#019fbf',
    turquoise100: '#b0e6f1',
    turquoise50: '#e6f7fb',
    bg: '#f2f7fa',
    grey: '#6b7280',
    red: '#e41212',
    pink: '#f6c9c9',
    white: '#ffffff',
  },
  timing: { intro: 2600, slide: 3400, outro: 3800, maxAutoplay: 30000 },
  scenes: [
    { key: 'arac', kicker: 'Araç Sigortası', title: 'Genişletilmiş Kasko',
      sub: 'Aracınızı çarpma, yanma, çalınma gibi risklere karşı güvence altına alın.', chips: ['Online 30 saniyede teklif', 'Peşin fiyatına 12 taksit'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/arac-sigortalari' },
    { key: 'konut', kicker: 'Konut Sigortası', title: 'Evinize özel güvence',
      sub: 'Yangın, deprem, hırsızlık gibi risklere karşı evinizi ve eşyalarınızı güvence altına alın.', chips: ['Konut Paket Sigortası', 'DASK'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/konut-sigortalari' },
    { key: 'saglik', kicker: 'Sağlık Sigortası', title: 'Tamamlayıcı Sağlık Sigortası',
      sub: 'SGK anlaşmalı hastanelerde fark ödemeden tedavi olun.', chips: ['12 taksit fırsatı', 'Hemen teklif alın'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/saglik-sigortalari' },
    { key: 'seyahat', kicker: 'Sağlık Sigortası', title: 'Seyahat Sağlık Sigortası',
      sub: 'Yurt içi ya da yurt dışı, tüm seyahatlerinizde beklenmedik sağlık risklerine karşı güvence.', chips: ['Online 30 saniyede teklif', 'Dakikalar içinde poliçe'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/saglik-sigortalari/seyahat-saglik-sigortasi' },
    { key: 'hayat', kicker: 'Hayat Sigortası · BES', title: 'Sevdiklerinizin geleceği güvende',
      sub: 'Zengin teminatlı hayat sigortası ürünleri ve bireysel emeklilik ile geleceğinize yatırım.', chips: ['%20 devlet katkısı', 'Riskleriniz güvencede'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/hayat-sigortalari' },
  ],
};
