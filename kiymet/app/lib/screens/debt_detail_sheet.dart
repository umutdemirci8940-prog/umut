import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../logic/debts.dart';
import '../models/debt.dart';
import '../state/app_state.dart';
import '../theme.dart';
import '../widgets/format.dart';

void showDebtDetail(BuildContext context, DebtValuation valuation) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => _DebtDetail(valuation: valuation),
  );
}

class _DebtDetail extends StatelessWidget {
  const _DebtDetail({required this.valuation});
  final DebtValuation valuation;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final d = valuation.debt;
    final asset = app.debtAsset(d.assetId);
    final lent = d.direction == DebtDirection.lent;
    final text = Theme.of(context).textTheme;

    Widget row(String label, String value, {Color? color}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: Text(label)),
              const SizedBox(width: 12),
              Text(value, style: TextStyle(fontWeight: FontWeight.w600, color: color)),
            ],
          ),
        );

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(d.person, style: text.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
            Text(
              '${d.direction.label} · ${d.isCash ? formatTl(d.amount) : '${formatQty(d.amount)} ${asset.unit} ${asset.name}'}',
              style: text.bodyLarge,
            ),
            if (d.note != null && d.note!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(d.note!, style: text.bodyMedium?.copyWith(fontStyle: FontStyle.italic)),
            ],
            const Divider(height: 28),
            row('Tarih', d.date == null ? 'Bilinmiyor' : DateFormat('d MMMM y', 'tr_TR').format(d.date!)),
            row('Bugünkü değeri', valuation.currentValue == null ? '—' : formatTl(valuation.currentValue!)),
            if (valuation.inflationAdjusted != null) ...[
              row('Enflasyona göre bugünkü karşılığı', formatTl(valuation.inflationAdjusted!)),
              row(
                lent ? 'Enflasyon kaybı' : 'Enflasyonla eriyen kısım',
                '${formatTl(valuation.inflationLoss!)} (alım gücünün %${valuation.purchasingPowerLostPct!.toStringAsFixed(1)}\'i)',
                color: lent ? KiymetColors.down : KiymetColors.up,
              ),
              const SizedBox(height: 4),
              Text(
                lent
                    ? '${formatTl(d.amount)} geri ödendiğinde, verdiğin günkü alım gücünü korumak için ${formatTl(valuation.inflationAdjusted!)} alman gerekirdi.'
                    : 'Bugün ${formatTl(d.amount)} ödeyeceksin; bu tutarın alındığı günkü alım gücü ${formatTl(valuation.inflationAdjusted!)} idi.',
                style: text.bodySmall,
              ),
            ] else if (d.isCash && d.date != null)
              Text('Bu tarih için enflasyon verisi henüz yok.', style: text.bodySmall),
            if (d.date != null) _Comparisons(valuation: valuation),
            if (d.date == null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text('Tarih eklersen enflasyon kaybı ve altın/dolar karşılaştırması gösterilir.', style: text.bodySmall),
              ),
          ],
        ),
      ),
    );
  }
}

/// "O gün bu parayla ne alınabilirdi?" — altın ve dolar karşılaştırması.
class _Comparisons extends StatefulWidget {
  const _Comparisons({required this.valuation});
  final DebtValuation valuation;

  @override
  State<_Comparisons> createState() => _ComparisonsState();
}

class _ComparisonsState extends State<_Comparisons> {
  late final Future<_ComparisonData> _future = _load();

  Future<_ComparisonData> _load() async {
    final app = context.read<AppState>();
    final d = widget.valuation.debt;
    final history = app.history;
    final results = await Future.wait([
      history.priceOn('METAL:GRAM_ALTIN', d.date!),
      history.priceOn('FX:USD', d.date!),
      if (!d.isCash) history.priceOn(d.assetId, d.date!),
    ]);
    return _ComparisonData(
      goldThen: results[0]?.price,
      usdThen: results[1]?.price,
      assetThen: d.isCash ? 1 : results.length > 2 ? results[2]?.price : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final d = widget.valuation.debt;
    final goldNow = app.prices['METAL:GRAM_ALTIN']?.price;
    final usdNow = app.prices['FX:USD']?.price;
    final text = Theme.of(context).textTheme;

    return FutureBuilder<_ComparisonData>(
      future: _future,
      builder: (context, snap) {
        if (!snap.hasData) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Row(children: [
              SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
              SizedBox(width: 12),
              Text('O günün altın ve dolar fiyatları getiriliyor…'),
            ]),
          );
        }
        final data = snap.data!;
        final tlThen = data.assetThen == null ? null : d.amount * data.assetThen!;
        final lines = <Widget>[];

        if (!d.isCash && tlThen != null) {
          lines.add(_line('Verildiği gün TL değeri', formatTl(tlThen)));
        }
        if (tlThen != null && data.goldThen != null && goldNow != null) {
          final grams = tlThen / data.goldThen!;
          lines.add(_line(
            'O gün ${formatQty(double.parse(grams.toStringAsFixed(2)))} gram altın ediyordu',
            'bugün ${formatTl(grams * goldNow)}',
          ));
        }
        if (tlThen != null && data.usdThen != null && usdNow != null) {
          final usd = tlThen / data.usdThen!;
          lines.add(_line(
            'O gün \$${NumberFormat('#,##0', 'tr_TR').format(usd)} ediyordu',
            'bugün ${formatTl(usd * usdNow)}',
          ));
        }
        if (lines.isEmpty) {
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Text('O günün altın/dolar fiyatlarına ulaşılamadı.', style: text.bodySmall),
          );
        }
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Divider(height: 28),
            Text('Karşılaştırma', style: text.titleSmall),
            const SizedBox(height: 4),
            ...lines,
            const SizedBox(height: 4),
            Text('Altın has değeri ve TCMB kuru üzerinden yaklaşık hesaplanmıştır.', style: text.bodySmall),
          ],
        );
      },
    );
  }

  Widget _line(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Expanded(child: Text(label)),
            const SizedBox(width: 12),
            Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
          ],
        ),
      );
}

class _ComparisonData {
  const _ComparisonData({this.goldThen, this.usdThen, this.assetThen});
  final double? goldThen;
  final double? usdThen;

  /// Varlığın o günkü birim TL fiyatı (nakit TL için 1).
  final double? assetThen;
}
