import 'models/models.dart';

/// BIST hisseleri. Ticari yayına uygun, lisanslı bir veri kaynağı bağlanana kadar kapalıdır.
/// Açmak için: flutter build ... --dart-define=KIYMET_STOCKS=true
const stocksEnabled = bool.fromEnvironment('KIYMET_STOCKS');

/// Arayüzde gösterilen varlık türleri.
const visibleAssetTypes = [
  AssetType.metal,
  AssetType.currency,
  AssetType.crypto,
  if (stocksEnabled) AssetType.stock,
];
