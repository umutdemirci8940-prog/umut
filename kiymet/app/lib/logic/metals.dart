// Ons altın/gümüş (USD) ve USD/TRY'den Türkiye'deki altın türlerinin teorik "has" değeri.
// Sunucudaki backend/src/metals.js ile aynı katsayılar kullanılır.
// Kuyumcu fiyatları işçilik ve makas nedeniyle farklıdır.

const gramsPerTroyOunce = 31.1034768;

class MetalProduct {
  const MetalProduct(this.code, this.name, this.unit, this.weight, this.purity, {this.silver = false});
  final String code;
  final String name;
  final String unit;

  /// Brüt ağırlık (gram)
  final double weight;

  /// Saflık (milyem)
  final double purity;
  final bool silver;

  String get id => 'METAL:$code';
}

const metalProducts = [
  MetalProduct('GRAM_ALTIN', 'Gram Altın (24 ayar)', 'gram', 1, 0.995),
  MetalProduct('CEYREK', 'Çeyrek Altın', 'adet', 1.754, 0.916),
  MetalProduct('YARIM', 'Yarım Altın', 'adet', 3.508, 0.916),
  MetalProduct('TAM', 'Tam Altın', 'adet', 7.016, 0.916),
  MetalProduct('CUMHURIYET', 'Cumhuriyet (Ata) Altını', 'adet', 7.216, 0.916),
  MetalProduct('GREMSE', 'Gremse Altın', 'adet', 17.54, 0.916),
  MetalProduct('AYAR22', '22 Ayar Bilezik', 'gram', 1, 0.916),
  MetalProduct('AYAR18', '18 Ayar Altın', 'gram', 1, 0.75),
  MetalProduct('AYAR14', '14 Ayar Altın', 'gram', 1, 0.585),
  MetalProduct('GRAM_GUMUS', 'Gram Gümüş', 'gram', 1, 0.999, silver: true),
];

double? pureGramTry(double? ounceUsd, double? usdTry) {
  if (ounceUsd == null || usdTry == null || ounceUsd <= 0 || usdTry <= 0) return null;
  return ounceUsd * usdTry / gramsPerTroyOunce;
}

double? productValueTry(MetalProduct p, double? ounceUsd, double? usdTry) {
  final pure = pureGramTry(ounceUsd, usdTry);
  return pure == null ? null : pure * p.weight * p.purity;
}
