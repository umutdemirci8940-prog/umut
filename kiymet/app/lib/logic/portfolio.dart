import '../models/models.dart';
import 'inflation.dart';

class HoldingValuation {
  const HoldingValuation({
    required this.holding,
    required this.price,
    required this.inflationFactor,
  });

  final Holding holding;
  final Price? price;

  /// Alımdan bugüne TÜFE artış katsayısı (ör. 1,35 = %35 enflasyon).
  final double? inflationFactor;

  double get cost => holding.cost;
  double? get value => price == null ? null : price!.price * holding.quantity;
  double? get pnl => value == null ? null : value! - cost;
  double? get pnlPct => (pnl == null || cost <= 0) ? null : pnl! / cost * 100;

  /// Enflasyondan arındırılmış getiri (%): (değer / (maliyet × enflasyon katsayısı)) - 1
  double? get realReturnPct {
    if (value == null || inflationFactor == null || cost <= 0) return null;
    return (value! / (cost * inflationFactor!) - 1) * 100;
  }

  double? get dailyChange {
    final p = price;
    if (p == null || p.prevClose == null) return null;
    return (p.price - p.prevClose!) * holding.quantity;
  }
}

class PortfolioSummary {
  const PortfolioSummary({
    required this.items,
    required this.totalValue,
    required this.totalCost,
    required this.dailyChange,
    required this.realReturnPct,
    required this.valueByType,
    required this.missingPrices,
  });

  final List<HoldingValuation> items;

  /// Yalnızca fiyatı bilinen varlıkların toplamı.
  final double totalValue;

  /// Fiyatı bilinen varlıkların maliyeti (K/Z ile karşılaştırılabilir olsun diye).
  final double totalCost;
  final double dailyChange;
  final double? realReturnPct;
  final Map<AssetType, double> valueByType;
  final int missingPrices;

  double get pnl => totalValue - totalCost;
  double? get pnlPct => totalCost > 0 ? pnl / totalCost * 100 : null;
  double? get dailyChangePct {
    final prev = totalValue - dailyChange;
    return prev > 0 ? dailyChange / prev * 100 : null;
  }

  bool get isEmpty => items.isEmpty;

  static PortfolioSummary compute(
    List<Holding> holdings,
    Map<String, Price> prices,
    CpiSeries cpi,
  ) {
    final items = [
      for (final h in holdings)
        HoldingValuation(
          holding: h,
          price: prices[h.instrumentId],
          inflationFactor: cpi.inflationFactorSince(h.purchaseDate),
        ),
    ];

    var totalValue = 0.0, totalCost = 0.0, daily = 0.0;
    var realValue = 0.0, inflatedCost = 0.0;
    var realComplete = true;
    var missing = 0;
    final byType = <AssetType, double>{};

    for (final v in items) {
      final value = v.value;
      if (value == null) {
        missing++;
        continue;
      }
      totalValue += value;
      totalCost += v.cost;
      daily += v.dailyChange ?? 0;
      byType[v.holding.type] = (byType[v.holding.type] ?? 0) + value;
      if (v.inflationFactor == null) {
        realComplete = false;
      } else {
        realValue += value;
        inflatedCost += v.cost * v.inflationFactor!;
      }
    }

    return PortfolioSummary(
      items: items,
      totalValue: totalValue,
      totalCost: totalCost,
      dailyChange: daily,
      realReturnPct:
          realComplete && inflatedCost > 0 ? (realValue / inflatedCost - 1) * 100 : null,
      valueByType: byType,
      missingPrices: missing,
    );
  }
}

/// "1.250,50" ve "0.5" gibi Türkçe/İngilizce sayı girişlerini çözer.
double? parseAmount(String input) {
  var s = input.trim().replaceAll(' ', '');
  if (s.isEmpty) return null;
  if (s.contains(',')) s = s.replaceAll('.', '').replaceAll(',', '.');
  final v = double.tryParse(s);
  return (v == null || v.isNaN || v.isInfinite) ? null : v;
}
