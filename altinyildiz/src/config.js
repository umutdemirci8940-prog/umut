/* Altınyıldız Classics masthead seti – içerik yapılandırması.
 * Ürünler, fiyatlar ve görseller altinyildizclassics.com'dan GitHub Actions ile çekildi (assets/site/, 15 Ekim 2026).
 * Fiyat değişirse yalnızca bu dosyayı güncelleyip `node altinyildiz/build.js` çalıştırın. */
const SITE = 'https://www.altinyildizclassics.com';
const UTM = 'utm_source=display&utm_medium=masthead&utm_campaign=sk26_yildiz';
const u = (p) => SITE + p + (p.includes('?') ? '&' : '?') + UTM;

module.exports = {
  // Genel tıklama (clickTag) ve kategori tıklamaları (clickTag1..4) – reklam sunucusu ezebilir
  clickTag: u('/'),

  cats: [
    {
      key: 'dis', chip: 'Mont & Kaban', label: 'Mont & Kabanlar', url: u('/kaban-c'),
      tone: '#6b4630', tonename: 'Kahve', word: 'KABAN',
      items: [
        { name: 'Geniş Kırlangıç Yaka Vizon Kaban', price: 5999.99, oldPrice: 9019.99, src: 'products/kaban-standart-fit-normal-kesim-genis-kirlangic-yaka-yan-cepli-viz-0.jpg', url: SITE + '/erkek-standart-fit-normal-kesim-genis-kirlangic-yaka-yan-cepli-vizon-kaban-p' },
        { name: 'Dik Yaka Casual Lacivert Mont', price: 4999.99, src: 'products/mont-standart-fit-normal-kesim-dik-yaka-yan-cepli-casual-lacivert-0.jpg', url: SITE + '/erkek-standart-fit-normal-kesim-dik-yaka-yan-cepli-casual-lacivert-mont-p' },
      ],
    },
    {
      key: 'ceket', chip: 'Ceket', label: 'Ceketler', url: u('/ceket-c'),
      tone: '#1d2a48', tonename: 'Lacivert', word: 'CEKET',
      items: [
        { name: 'Slim Fit Mono Yaka Casual Lacivert Ceket', price: 3199.99, oldPrice: 3329.99, src: 'products/ceket-slim-fit-dar-kesim-mono-yaka-casual-lacivert-ceket-0.jpg', url: SITE + '/erkek-slim-fit-dar-kesim-mono-yaka-casual-lacivert-ceket-p' },
        { name: 'Slim Fit Mono Yaka Armürlü Kahverengi Ceket', price: 3499.99, oldPrice: 4909.99, src: 'products/ceket-slim-fit-dar-kesim-mono-yaka-armurlu-kahverengi-ceket-0.jpg', url: SITE + '/erkek-slim-fit-dar-kesim-mono-yaka-armurlu-kahverengi-ceket-2-p' },
      ],
    },
    {
      key: 'triko', chip: 'Triko', label: 'Triko & Kazaklar', url: u('/triko-c'),
      tone: '#6e2233', tonename: 'Bordo', word: 'TRİKO',
      items: [
        { name: 'Anti-Pilling Polo Yaka Lacivert Kazak', price: 1249.99, oldPrice: 1729.99, src: 'products/triko-tuylenme-yapmayan-anti-pilling-ozellikli-standart-fit-polo-y-0.jpg', url: SITE + '/erkek-tuylenme-yapmayan-anti-pilling-ozellikli-standart-fit-polo-yaka-lacivert-kazak-p' },
        { name: 'Anti-Pilling Yarım Balıkçı Kahverengi Kazak', price: 1033.99, oldPrice: 1449.99, src: 'products/triko-tuylenme-yapmayan-anti-pilling-standart-fit-normal-kesim-yar-0.jpg', url: SITE + '/erkek-tuylenme-yapmayan-anti-pilling-standart-fit-normal-kesim-yarim-balikci-yaka-kahverengi-kazak-p' },
      ],
    },
    {
      key: 'takim', chip: 'Takım Elbise', label: 'Takım Elbiseler', url: u('/takim-elbise-c'),
      tone: '#3b3e46', tonename: 'Antrasit', word: 'TAKIM',
      items: [
        { name: 'Slim Fit Mono Yaka Lacivert Takım Elbise', price: 3999.99, oldPrice: 4449.99, src: 'products/takim-slim-fit-dar-kesim-mono-yaka-lacivert-takim-elbise-0.jpg', url: SITE + '/erkek-slim-fit-dar-kesim-mono-yaka-lacivert-takim-elbise-8-p' },
        { name: 'Slim Fit Mono Yaka Siyah Takım Elbise', price: 3999.99, oldPrice: 4339.99, src: 'products/takim-slim-fit-dar-kesim-mono-yaka-siyah-takim-elbise-0.jpg', url: SITE + '/erkek-slim-fit-dar-kesim-mono-yaka-siyah-takim-elbise-8-p' },
      ],
    },
  ],

  // Vitrin: maskot tıklanınca gösterilecek "yıldız parça" (slayt sırası: kategori × ürün)
  star: 0,

  legal: {
    vitrin: 'Fiyatlar 15.10.2026 itibarıyla altinyildizclassics.com fiyatlarıdır; stok ve kampanyalarla değişebilir.',
    lookbook: 'Fiyatlar 15.10.2026 itibarıyla altinyildizclassics.com fiyatlarıdır; stok ve kampanyalarla değişebilir.',
  },
};
