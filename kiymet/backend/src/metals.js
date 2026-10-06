// Ons altın/gümüş (USD) ve USD/TRY'den Türkiye'de işlem gören altın türlerinin
// teorik "has" değerini hesaplar. Kuyumcu fiyatları işçilik ve makas nedeniyle farklıdır.

export const GRAMS_PER_TROY_OUNCE = 31.1034768;

export const PURITY = {
  K24: 0.995,
  K22: 0.916,
  K18: 0.75,
  K14: 0.585,
};

/**
 * Altın ürünleri. weight: brüt gram, purity: milyem.
 * Sikke ağırlıkları Darphane standartlarıdır.
 */
export const GOLD_PRODUCTS = [
  { id: 'GRAM_ALTIN', name: 'Gram Altın (24 ayar)', unit: 'gram', weight: 1, purity: PURITY.K24 },
  { id: 'CEYREK', name: 'Çeyrek Altın', unit: 'adet', weight: 1.754, purity: PURITY.K22 },
  { id: 'YARIM', name: 'Yarım Altın', unit: 'adet', weight: 3.508, purity: PURITY.K22 },
  { id: 'TAM', name: 'Tam Altın', unit: 'adet', weight: 7.016, purity: PURITY.K22 },
  { id: 'CUMHURIYET', name: 'Cumhuriyet (Ata) Altını', unit: 'adet', weight: 7.216, purity: PURITY.K22 },
  { id: 'GREMSE', name: 'Gremse Altın', unit: 'adet', weight: 17.54, purity: PURITY.K22 },
  { id: 'AYAR22', name: '22 Ayar Bilezik', unit: 'gram', weight: 1, purity: PURITY.K22 },
  { id: 'AYAR18', name: '18 Ayar Altın', unit: 'gram', weight: 1, purity: PURITY.K18 },
  { id: 'AYAR14', name: '14 Ayar Altın', unit: 'gram', weight: 1, purity: PURITY.K14 },
];

export const SILVER_PRODUCTS = [
  { id: 'GRAM_GUMUS', name: 'Gram Gümüş', unit: 'gram', weight: 1, purity: 0.999 },
];

/** Saf metalin TRY/gram fiyatı. */
export function pureGramTry(ounceUsd, usdTry) {
  if (!(ounceUsd > 0) || !(usdTry > 0)) return null;
  return (ounceUsd * usdTry) / GRAMS_PER_TROY_OUNCE;
}

/** Bir ürünün has değeri (TRY). */
export function productValueTry(product, ounceUsd, usdTry) {
  const pure = pureGramTry(ounceUsd, usdTry);
  if (pure == null) return null;
  return pure * product.weight * product.purity;
}

/**
 * Store'daki ham XAUUSD/XAGUSD/USDTRY değerlerinden tüm altın ve gümüş
 * ürünlerinin fiyatlarını yeniden hesaplayıp yazar.
 */
export function recomputeMetals(store) {
  const usd = store.getRaw('USDTRY');
  if (!usd) return;
  const groups = [
    ['XAUUSD', GOLD_PRODUCTS],
    ['XAGUSD', SILVER_PRODUCTS],
  ];
  for (const [key, products] of groups) {
    const ounce = store.getRaw(key);
    if (!ounce) continue;
    const prevAvailable = ounce.prevClose > 0 && usd.prevClose > 0;
    for (const product of products) {
      store.set(`METAL:${product.id}`, {
        price: productValueTry(product, ounce.price, usd.price),
        prevClose: prevAvailable ? productValueTry(product, ounce.prevClose, usd.prevClose) : null,
        source: `${ounce.source}+${usd.source}`,
        delayed: Boolean(ounce.delayed || usd.delayed),
      });
    }
  }
}
