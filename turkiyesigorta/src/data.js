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
  colors: {
    navy: '#062a38',
    teal: '#0e7c8c',
    turquoise: '#1fb6c1',
    turquoiseLight: '#9ff0f2',
    red: '#e2001a',
    redDark: '#b30014',
    white: '#ffffff',
  },
  timing: { intro: 2600, slide: 3400, outro: 3800, maxAutoplay: 30000 },
  scenes: [
    { key: 'arac', kicker: 'Araç Sigortaları', title: 'Aracınız için Genişletilmiş Kasko',
      sub: 'Çarpma, yanma, çalınma gibi risklere karşı güvence', chips: ['Online 30 saniyede teklif', 'Peşin fiyatına 12 taksit'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/arac-sigortalari' },
    { key: 'konut', kicker: 'Konut Sigortaları', title: 'Eviniz ve eşyalarınız güvence altında',
      sub: 'Yangından depreme, dahili su hasarına kadar geniş koruma', chips: ['Konut Paket Sigortası', 'DASK'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/konut-sigortalari' },
    { key: 'saglik', kicker: 'Sağlık Sigortaları', title: 'Tamamlayıcı Sağlık Sigortası',
      sub: 'SGK anlaşmalı özel hastanelerde fark ödemeden sağlık hizmeti', chips: ['Özel Sağlık', 'Esnek Sağlık', 'Acil Sağlık'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/saglik-sigortalari' },
    { key: 'seyahat', kicker: 'Seyahat Sağlık Sigortası', title: 'Seyahatte de güvence sizinle',
      sub: 'Online 30 saniyede teklif, dakikalar içinde poliçe', chips: ['Yurt içi · Yurt dışı', 'VIP · Öğrenci paketleri'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/saglik-sigortalari/seyahat-saglik-sigortasi' },
    { key: 'hayat', kicker: 'Hayat Sigortası · Bireysel Emeklilik', title: 'Geleceğiniz güvence altında',
      sub: 'Sevdiklerinizin geleceği için hayat sigortası ve bireysel emeklilik', chips: ['%20 devlet katkısı', 'Hayat Sigortası', 'BES'],
      url: 'https://www.turkiyesigorta.com.tr/urunlerimiz/hayat-sigortalari' },
  ],
};
