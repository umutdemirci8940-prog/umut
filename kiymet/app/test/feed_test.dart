import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kiymet/logic/metals.dart';
import 'package:kiymet/models/models.dart';
import 'package:kiymet/services/cpi_source.dart';
import 'package:kiymet/services/feed_market_data.dart';
import 'package:kiymet/services/price_history.dart';
import 'package:shared_preferences/shared_preferences.dart';

const base = 'https://ornek.github.io/kiymet-site/data';

Map<String, dynamic> p(String id, double price, [double? prev]) =>
    {'id': id, 'price': price, 'prevClose': prev, 'changePct': null, 'source': 't', 'ts': 0, 'delayed': true};

final feed = {
  'attribution': 'Kaynaklar: TCMB, TCMB EVDS, OECD, BIS',
  'prices': [p('FX:USD', 42.15, 42.0), p('METAL:GRAM_ALTIN', 5373.29), p('METAL:CEYREK', 8676.45)],
  'cpi': {
    'series': [
      {'month': '2026-07', 'index': 1616.0},
      {'month': '2026-08', 'index': 1646.0},
    ],
  },
};

final history = {
  'series': {
    'METAL:GRAM_ALTIN': {'2024-03-15': 2100.0},
  },
};

http.Client client() => MockClient((req) async {
      final u = req.url.toString();
      if (u.startsWith('$base/prices.json')) return http.Response(jsonEncode(feed), 200);
      if (u == '$base/history.json') return http.Response(jsonEncode(history), 200);
      return http.Response('', 404);
    });

class EmptyBundle extends CachingAssetBundle {
  @override
  Future<ByteData> load(String key) async => throw StateError('yok');
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('yayındaki varlıklar katalog olarak gelir (kripto/hisse yoksa görünmez)', () async {
    final data = FeedMarketData(
      client: client(),
      baseUrl: base,
      cpi: CpiSource(client: MockClient((_) async => http.Response('', 500)), bundle: EmptyBundle()),
    );
    final ids = (await data.instruments()).map((i) => i.id).toSet();
    expect(ids, {'FX:USD', 'METAL:GRAM_ALTIN', 'METAL:CEYREK'});
    expect(ids.any((i) => i.startsWith('CRYPTO:') || i.startsWith('STOCK:')), isFalse);

    final prices = await data.snapshot();
    expect(prices.firstWhere((x) => x.id == 'FX:USD').price, 42.15);
    expect(data.attribution, contains('TCMB EVDS'));

    final cpi = await data.inflation();
    expect(cpi.latestMonth, '2026-08');
  });

  test('yayın modunda geçmiş altın fiyatı history.json\'dan, ürünler katsayıyla', () async {
    final h = PriceHistory(client: client(), feedBaseUrl: base);
    final gram = await h.priceOn('METAL:GRAM_ALTIN', DateTime(2024, 3, 15));
    expect(gram!.price, 2100.0);
    // hafta sonu: önceki güne düşer
    final ceyrek = await h.priceOn('METAL:CEYREK', DateTime(2024, 3, 17));
    final product = metalProducts.firstWhere((m) => m.code == 'CEYREK');
    expect(ceyrek!.price, closeTo(2100 / 0.995 * product.weight * product.purity, 1e-9));
    expect(ceyrek.date, DateTime.utc(2024, 3, 15));
    // yayında olmayan kripto için tahmin yapılmaz
    expect(await h.priceOn('CRYPTO:BTC', DateTime(2024, 3, 15)), isNull);
  });

  test('AssetType yardımcıları', () {
    expect(AssetType.ofId('METAL:CEYREK'), AssetType.metal);
  });
}
