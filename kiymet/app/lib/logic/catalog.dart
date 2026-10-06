import '../models/models.dart';
import 'metals.dart';

// Sunucu kullanılmadığında (doğrudan veri modu) cihazda oluşturulan varlık kataloğu.

const currencies = {
  'USD': 'Amerikan Doları',
  'EUR': 'Euro',
  'GBP': 'İngiliz Sterlini',
  'CHF': 'İsviçre Frangı',
};

const cryptoNames = {
  'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'USDT': 'Tether', 'SOL': 'Solana', 'XRP': 'XRP',
  'AVAX': 'Avalanche', 'DOGE': 'Dogecoin', 'ADA': 'Cardano', 'BNB': 'BNB', 'LINK': 'Chainlink',
};

const bistStocks = {
  'AKBNK': 'Akbank', 'ASELS': 'Aselsan', 'BIMAS': 'BİM', 'EREGL': 'Ereğli Demir Çelik',
  'FROTO': 'Ford Otosan', 'GARAN': 'Garanti BBVA', 'ISCTR': 'İş Bankası (C)', 'KCHOL': 'Koç Holding',
  'KOZAL': 'Koza Altın', 'PGSUS': 'Pegasus', 'SAHOL': 'Sabancı Holding', 'SASA': 'SASA Polyester',
  'SISE': 'Şişecam', 'TCELL': 'Turkcell', 'THYAO': 'Türk Hava Yolları', 'TOASO': 'Tofaş',
  'TUPRS': 'Tüpraş', 'YKBNK': 'Yapı Kredi',
};

final _stockCode = RegExp(r'^[A-Z0-9]{3,6}$');

bool isValidStockCode(String code) => _stockCode.hasMatch(code);

List<Instrument> buildCatalog({Iterable<String> extraCrypto = const [], Iterable<String> extraStocks = const []}) {
  final cryptoCodes = [
    ...cryptoNames.keys,
    ...(extraCrypto.where((c) => !cryptoNames.containsKey(c)).toList()..sort()),
  ];
  final stockCodes = {...bistStocks.keys, ...extraStocks};
  return [
    for (final m in metalProducts)
      Instrument(id: m.id, type: AssetType.metal, code: m.code, name: m.name, unit: m.unit),
    for (final e in currencies.entries)
      Instrument(id: 'FX:${e.key}', type: AssetType.currency, code: e.key, name: e.value, unit: e.key),
    for (final c in cryptoCodes)
      Instrument(
        id: 'CRYPTO:$c',
        type: AssetType.crypto,
        code: c,
        name: cryptoNames[c] ?? c,
        unit: c,
        featured: cryptoNames.containsKey(c),
      ),
    for (final s in stockCodes)
      Instrument(id: 'STOCK:$s', type: AssetType.stock, code: s, name: bistStocks[s] ?? s, unit: 'lot'),
  ];
}
