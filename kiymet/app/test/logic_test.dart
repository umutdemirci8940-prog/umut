import 'package:flutter_test/flutter_test.dart';
import 'package:kiymet/logic/inflation.dart';
import 'package:kiymet/logic/metals.dart';
import 'package:kiymet/logic/portfolio.dart';
import 'package:kiymet/models/models.dart';
import 'package:kiymet/services/direct_market_data.dart';
import 'package:kiymet/services/market_data.dart';

Holding holding(String id, double qty, double cost, DateTime date) =>
    Holding(id: id, instrumentId: id, quantity: qty, unitCost: cost, purchaseDate: date);

void main() {
  group('metaller', () {
    MetalProduct p(String code) => metalProducts.firstWhere((m) => m.code == code);

    test('çeyrek = ons × kur / 31,1035 × 1,754 × 0,916', () {
      final v = productValueTry(p('CEYREK'), 3110.34768, 40)!;
      expect(v, closeTo(4000 * 1.754 * 0.916, 1e-6));
    });

    test('yarım = 2 çeyrek, tam = 2 yarım', () {
      double v(String c) => productValueTry(p(c), 3900, 41.5)!;
      expect(v('YARIM'), closeTo(2 * v('CEYREK'), 1e-6));
      expect(v('TAM'), closeTo(2 * v('YARIM'), 1e-6));
    });

    test('eksik veride null', () {
      expect(productValueTry(p('GRAM_ALTIN'), null, 40), isNull);
    });
  });

  group('enflasyon', () {
    final cpi = CpiSeries({'2024-01': 100, '2024-06': 120, '2025-01': 150});

    test('alım ayından bugüne katsayı', () {
      expect(cpi.inflationFactorSince(DateTime(2024, 1, 20)), closeTo(1.5, 1e-9));
    });

    test('açıklanmamış ay için en son endeks kullanılır', () {
      expect(cpi.inflationFactorSince(DateTime(2025, 3, 1)), closeTo(1.0, 1e-9));
    });

    test('seri öncesi tarih için null', () {
      expect(cpi.inflationFactorSince(DateTime(2023, 12, 1)), isNull);
    });
  });

  group('portföy', () {
    final prices = {
      'METAL:CEYREK': makePrice('METAL:CEYREK', 10000, prevClose: 9800, source: 't'),
      'CRYPTO:BTC': makePrice('CRYPTO:BTC', 2000000, prevClose: 2100000, source: 't'),
    };

    test('toplam değer, K/Z ve günlük değişim', () {
      final s = PortfolioSummary.compute(
        [
          holding('METAL:CEYREK', 2, 8000, DateTime(2024, 1, 1)),
          holding('CRYPTO:BTC', 0.5, 1000000, DateTime(2024, 1, 1)),
        ],
        prices,
        CpiSeries.empty,
      );
      expect(s.totalValue, 2 * 10000 + 0.5 * 2000000);
      expect(s.totalCost, 16000 + 500000);
      expect(s.pnl, closeTo(1020000 - 516000, 1e-6));
      expect(s.dailyChange, closeTo(2 * 200 - 0.5 * 100000, 1e-6));
      expect(s.realReturnPct, isNull);
      expect(s.valueByType[AssetType.metal], 20000);
    });

    test('reel getiri: değer / (maliyet × TÜFE katsayısı) - 1', () {
      final cpi = CpiSeries({'2024-01': 100, '2025-01': 150});
      final s = PortfolioSummary.compute(
        [holding('METAL:CEYREK', 1, 5000, DateTime(2024, 1, 15))],
        prices,
        cpi,
      );
      // 10.000 / (5.000 × 1,5) - 1 = %33,33
      expect(s.realReturnPct, closeTo(33.333, 0.01));
      expect(s.items.single.realReturnPct, closeTo(33.333, 0.01));
    });

    test('fiyatı olmayan varlık toplama katılmaz', () {
      final s = PortfolioSummary.compute(
        [holding('STOCK:THYAO', 10, 300, DateTime(2024, 1, 1))],
        prices,
        CpiSeries.empty,
      );
      expect(s.totalValue, 0);
      expect(s.missingPrices, 1);
    });
  });

  test('sayı girişi: Türkçe ve İngilizce ondalık', () {
    expect(parseAmount('1.250,50'), 1250.5);
    expect(parseAmount('0,5'), 0.5);
    expect(parseAmount('0.5'), 0.5);
    expect(parseAmount('9.500'), 9500);
    expect(parseAmount('1.250.000'), 1250000);
    expect(parseAmount('0.500'), 0.5);
    expect(parseAmount('2.75'), 2.75);
    expect(parseAmount('12'), 12);
    expect(parseAmount(''), isNull);
    expect(parseAmount('abc'), isNull);
  });

  test('TCMB XML ayrıştırma (birim dahil)', () {
    const xml = '''
      <Currency CrossOrder="0" Kod="USD" CurrencyCode="USD"><Unit>1</Unit><ForexSelling>41.6120</ForexSelling></Currency>
      <Currency CrossOrder="9" Kod="JPY" CurrencyCode="JPY"><Unit>100</Unit><ForexSelling>28.10</ForexSelling></Currency>''';
    final r = parseTcmbXml(xml);
    expect(r['USD'], 41.612);
    expect(r['JPY'], closeTo(0.281, 1e-12));
  });

  test('Holding JSON gidiş-dönüş', () {
    final h = holding('METAL:CEYREK', 3, 9500, DateTime(2025, 5, 2));
    final back = Holding.fromJson(h.toJson());
    expect(back.instrumentId, h.instrumentId);
    expect(back.quantity, 3);
    expect(back.purchaseDate, h.purchaseDate);
  });
}
