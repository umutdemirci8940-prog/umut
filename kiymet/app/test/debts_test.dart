import 'package:flutter_test/flutter_test.dart';
import 'package:kiymet/logic/debts.dart';
import 'package:kiymet/logic/inflation.dart';
import 'package:kiymet/models/debt.dart';
import 'package:kiymet/services/cpi_source.dart';
import 'package:kiymet/services/market_data.dart';

Debt debt(String id, DebtDirection dir, String asset, double amount, {DateTime? date}) =>
    Debt(id: id, person: 'Ali', direction: dir, assetId: asset, amount: amount, date: date);

void main() {
  final cpi = CpiSeries({'2024-01': 100, '2025-01': 150});
  final prices = {'FX:USD': makePrice('FX:USD', 40, source: 't')};

  test('TL alacak: enflasyona göre bugünkü karşılık ve kayıp', () {
    final s = DebtSummary.compute(
      [debt('1', DebtDirection.lent, cashTryId, 10000, date: DateTime(2024, 1, 10))],
      prices,
      cpi,
    );
    final v = s.items.single;
    expect(v.currentValue, 10000);
    expect(v.inflationAdjusted, 15000);
    expect(v.inflationLoss, 5000);
    expect(v.purchasingPowerLostPct, closeTo(33.33, 0.01));
    expect(s.lentInflationLoss, 5000);
    expect(s.totalLent, 10000);
  });

  test('tarihsiz TL alacakta enflasyon hesabı yapılmaz', () {
    final v = DebtSummary.compute([debt('1', DebtDirection.lent, cashTryId, 10000)], prices, cpi).items.single;
    expect(v.inflationLoss, isNull);
    expect(v.currentValue, 10000);
  });

  test('döviz alacağı bugünkü kurla değerlenir, enflasyon kaybı sayılmaz', () {
    final v = DebtSummary.compute(
      [debt('1', DebtDirection.lent, 'FX:USD', 500, date: DateTime(2024, 1, 10))],
      prices,
      cpi,
    ).items.single;
    expect(v.currentValue, 20000);
    expect(v.inflationLoss, isNull);
  });

  test('borçlar ayrı toplanır, net = alacak − borç', () {
    final s = DebtSummary.compute(
      [
        debt('1', DebtDirection.lent, cashTryId, 10000, date: DateTime(2024, 1, 1)),
        debt('2', DebtDirection.borrowed, cashTryId, 4000, date: DateTime(2024, 1, 1)),
        debt('3', DebtDirection.borrowed, 'FX:USD', 100),
      ],
      prices,
      cpi,
    );
    expect(s.totalBorrowed, 8000);
    expect(s.net, 2000);
    expect(s.borrowedInflationGain, 2000);
    expect(s.of(DebtDirection.lent), hasLength(1));
  });

  test('Debt JSON gidiş-dönüş (tarihli ve tarihsiz)', () {
    final a = debt('1', DebtDirection.borrowed, 'METAL:CEYREK', 2, date: DateTime(2023, 5, 1));
    final b = Debt.fromJson(a.toJson());
    expect(b.direction, DebtDirection.borrowed);
    expect(b.date, a.date);
    expect(Debt.fromJson(debt('2', DebtDirection.lent, cashTryId, 5).toJson()).date, isNull);
  });

  test('OECD CSV ayrıştırma', () {
    const csv = 'STRUCTURE,STRUCTURE_ID,ACTION,REF_AREA,FREQ,TIME_PERIOD,OBS_VALUE,UNIT_MULT\n'
        'DATAFLOW,"OECD.SDD.TPS:DSD_PRICES@DF_PRICES_ALL(1.0)",I,TUR,M,2024-01,1984.02,0\n'
        'DATAFLOW,"OECD.SDD.TPS:DSD_PRICES@DF_PRICES_ALL(1.0)",I,TUR,M,2024-02,2073.9,0\n'
        'DATAFLOW,x,I,TUR,M,2024-03,,0\n';
    final s = parseOecdCsv(csv);
    expect(s.length, 2);
    expect(s.latestMonth, '2024-02');
    expect(s.inflationFactorSince(DateTime(2024, 1, 5)), closeTo(2073.9 / 1984.02, 1e-12));
  });

  test('daha güncel seri seçilir', () {
    final old = CpiSeries({'2025-11': 1, '2025-12': 2});
    final extended = CpiSeries({'2025-12': 2, '2026-08': 3});
    expect(isNewer(extended, old), isTrue);
    expect(isNewer(old, extended), isFalse);
    expect(isNewer(CpiSeries.empty, old), isFalse);
    expect(isNewer(old, CpiSeries.empty), isTrue);
  });

  test('OECD CSV beklenmeyen biçimde boş seri döner', () {
    expect(parseOecdCsv('<html>hata</html>').isEmpty, isTrue);
  });
}
