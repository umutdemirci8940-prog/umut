import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:kiymet/logic/metals.dart';
import 'package:kiymet/services/price_history.dart';

final day = DateTime.utc(2024, 3, 15); // Cuma
final dayMs = day.millisecondsSinceEpoch;

List kline(int openTime, double close) => [openTime, '0', '0', '0', '$close', '0'];

String tcmbXml(double usd) =>
    '<Tarih_Date><Currency Kod="USD"><Unit>1</Unit><ForexSelling>$usd</ForexSelling></Currency></Tarih_Date>';

Map yahoo(List<(DateTime, double?)> rows) => {
      'chart': {
        'result': [
          {
            'timestamp': [for (final r in rows) r.$1.millisecondsSinceEpoch ~/ 1000],
            'indicators': {
              'quote': [
                {'close': [for (final r in rows) r.$2]}
              ]
            },
          }
        ]
      }
    };

PriceHistory historyWith(Map<String, Object> routes, {List<String>? log}) {
  return PriceHistory(
    client: MockClient((req) async {
      log?.add(req.url.toString());
      for (final e in routes.entries) {
        if (req.url.toString().contains(e.key)) {
          final body = e.value is String ? e.value as String : jsonEncode(e.value);
          return http.Response(body, 200);
        }
      }
      return http.Response('', 404);
    }),
  );
}

void main() {
  test('döviz: TCMB arşivinden o günün kuru', () async {
    final h = historyWith({'kurlar/202403/15032024.xml': tcmbXml(32.25)});
    final r = await h.priceOn('FX:USD', DateTime(2024, 3, 15));
    expect(r!.price, 32.25);
    expect(r.date, day);
  });

  test('döviz: hafta sonu seçilirse önceki iş günü', () async {
    final h = historyWith({'kurlar/202403/15032024.xml': tcmbXml(32.25)});
    final r = await h.priceOn('FX:USD', DateTime(2024, 3, 17)); // Pazar
    expect(r!.price, 32.25);
    expect(r.date, day);
  });

  test('kripto: Binance TRY paritesi kapanışı', () async {
    final h = historyWith({'symbol=BTCTRY': [kline(dayMs, 2100000)]});
    final r = await h.priceOn('CRYPTO:BTC', DateTime(2024, 3, 15));
    expect(r!.price, 2100000);
  });

  test('kripto: TRY paritesi yoksa USDT × USDT/TRY', () async {
    final h = historyWith({
      'symbol=ARBUSDT': [kline(dayMs, 2.0)],
      'symbol=USDTTRY': [kline(dayMs, 32.0)],
    });
    final r = await h.priceOn('CRYPTO:ARB', DateTime(2024, 3, 15));
    expect(r!.price, 64.0);
  });

  test('Binance listelemeden önceki tarih için başka günün mumunu kabul etmez', () async {
    final later = DateTime.utc(2024, 6, 1).millisecondsSinceEpoch;
    final h = historyWith({'symbol=NEWTRY': [kline(later, 5)]});
    expect(await h.priceOn('CRYPTO:NEW', DateTime(2024, 3, 15)), isNull);
  });

  test('altın: PAXG ons × USDT/TRY ile çeyrek has değeri', () async {
    final h = historyWith({
      'symbol=PAXGUSDT': [kline(dayMs, 2160.0)],
      'symbol=USDTTRY': [kline(dayMs, 32.0)],
    });
    final r = await h.priceOn('METAL:CEYREK', DateTime(2024, 3, 15));
    final ceyrek = metalProducts.firstWhere((m) => m.code == 'CEYREK');
    expect(r!.price, closeTo(productValueTry(ceyrek, 2160, 32)!, 1e-9));
  });

  test('hisse: Yahoo, tarih dahil son kapanış (hafta sonu -> cuma)', () async {
    final h = historyWith({
      'THYAO.IS': yahoo([
        (DateTime.utc(2024, 3, 14, 7), 280.0),
        (DateTime.utc(2024, 3, 15, 7), 285.5),
      ]),
    });
    final r = await h.priceOn('STOCK:THYAO', DateTime(2024, 3, 16));
    expect(r!.price, 285.5);
    expect(r.date, day);
  });

  test('bulunamayan fiyat null döner ve önbelleğe alınmaz', () async {
    final log = <String>[];
    final h = historyWith({}, log: log);
    expect(await h.priceOn('STOCK:XYZ', DateTime(2024, 3, 15)), isNull);
    expect(await h.priceOn('STOCK:XYZ', DateTime(2024, 3, 15)), isNull);
    expect(log.where((u) => u.contains('XYZ')).length, 2);
  });

  test('Yahoo boş kapanışları atlar', () {
    final r = parseYahooCloseOnOrBefore(
      yahoo([(DateTime.utc(2024, 3, 14, 7), 10.0), (DateTime.utc(2024, 3, 15, 7), null)]),
      day,
    );
    expect(r!.$1, 10.0);
  });
}
