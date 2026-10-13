import '../models/debt.dart';
import '../models/models.dart';
import 'inflation.dart';

class DebtValuation {
  const DebtValuation({
    required this.debt,
    required this.price,
    required this.inflationFactor,
  });

  final Debt debt;

  /// Varlığın güncel birim fiyatı (nakit TL için null).
  final Price? price;

  /// Verildiği aydan bugüne TÜFE katsayısı (tarih yoksa veya veri yoksa null).
  final double? inflationFactor;

  /// Bugünkü TL değeri.
  double? get currentValue => debt.isCash
      ? debt.amount
      : (price == null ? null : price!.price * debt.amount);

  /// TL olarak verilen paranın, aynı alım gücünü koruması için bugün olması gereken tutar.
  double? get inflationAdjusted => (debt.isCash && inflationFactor != null)
      ? debt.amount * inflationFactor!
      : null;

  /// Enflasyon nedeniyle kaybedilen değer, bugünkü TL ile (alacakta kayıp, borçta kazanç).
  double? get inflationLoss =>
      inflationAdjusted == null ? null : inflationAdjusted! - debt.amount;

  /// Alım gücünün yüzde kaçı eridi (ör. %40).
  double? get purchasingPowerLostPct =>
      (inflationFactor == null || !debt.isCash || inflationFactor! <= 0)
      ? null
      : (1 - 1 / inflationFactor!) * 100;
}

class DebtSummary {
  const DebtSummary({
    required this.items,
    required this.totalLent,
    required this.totalBorrowed,
    required this.lentInflationLoss,
    required this.borrowedInflationGain,
  });

  final List<DebtValuation> items;
  final double totalLent;
  final double totalBorrowed;

  /// TL alacakların enflasyon karşısında kaybettiği toplam değer.
  final double lentInflationLoss;

  /// TL borçların enflasyonla eriyen toplam değeri (lehinize).
  final double borrowedInflationGain;

  double get net => totalLent - totalBorrowed;

  List<DebtValuation> of(DebtDirection d) =>
      items.where((v) => v.debt.direction == d).toList();

  static DebtSummary compute(
    List<Debt> debts,
    Map<String, Price> prices,
    CpiSeries cpi,
  ) {
    final items = [
      for (final d in debts)
        DebtValuation(
          debt: d,
          price: d.isCash ? null : prices[d.assetId],
          inflationFactor: d.date == null
              ? null
              : cpi.inflationFactorSince(d.date!),
        ),
    ];
    var lent = 0.0, borrowed = 0.0, loss = 0.0, gain = 0.0;
    for (final v in items) {
      final value = v.currentValue ?? 0;
      final infl = v.inflationLoss ?? 0;
      if (v.debt.direction == DebtDirection.lent) {
        lent += value;
        loss += infl;
      } else {
        borrowed += value;
        gain += infl;
      }
    }
    return DebtSummary(
      items: items,
      totalLent: lent,
      totalBorrowed: borrowed,
      lentInflationLoss: loss,
      borrowedInflationGain: gain,
    );
  }
}
