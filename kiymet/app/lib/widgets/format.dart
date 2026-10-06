import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../theme.dart';

final _tl = NumberFormat.currency(locale: 'tr_TR', symbol: '₺', decimalDigits: 2);
final _tlCompact = NumberFormat.currency(locale: 'tr_TR', symbol: '₺', decimalDigits: 0);
final _qty = NumberFormat.decimalPattern('tr_TR')..maximumFractionDigits = 8;

String formatTl(double value) => value.abs() >= 100000 ? _tlCompact.format(value) : _tl.format(value);

/// Küçük fiyatlı kripto paralar (ör. 0,0004 ₺) için daha fazla basamak gösterir.
String formatPrice(double value) {
  if (value >= 1) return formatTl(value);
  final digits = value >= 0.01 ? 4 : 8;
  return NumberFormat.currency(locale: 'tr_TR', symbol: '₺', decimalDigits: digits).format(value);
}

String formatQty(double value) => _qty.format(value);

String formatPct(double value) {
  final sign = value > 0 ? '+' : (value < 0 ? '−' : '');
  return '$sign%${NumberFormat('0.00', 'tr_TR').format(value.abs())}';
}

String formatSignedTl(double value) {
  final sign = value > 0 ? '+' : (value < 0 ? '−' : '');
  return '$sign${formatTl(value.abs())}';
}

Color changeColor(BuildContext context, double? value) {
  if (value == null || value == 0) return Theme.of(context).colorScheme.onSurfaceVariant;
  return value > 0 ? KiymetColors.up : KiymetColors.down;
}

class ChangeChip extends StatelessWidget {
  const ChangeChip(this.pct, {super.key});
  final double? pct;

  @override
  Widget build(BuildContext context) {
    final color = changeColor(context, pct);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        pct == null ? '—' : formatPct(pct!),
        style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 12.5),
      ),
    );
  }
}
