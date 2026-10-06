import 'package:flutter/material.dart';

import '../models/models.dart';
import '../theme.dart';

class AssetIcon extends StatelessWidget {
  const AssetIcon(this.instrument, {super.key, this.size = 40});
  final Instrument instrument;
  final double size;

  @override
  Widget build(BuildContext context) {
    final (IconData icon, Color color) = switch (instrument.type) {
      AssetType.metal when instrument.code.contains('GUMUS') =>
        (Icons.toll, const Color(0xFF9EA7B3)),
      AssetType.metal => (Icons.toll, KiymetColors.gold),
      AssetType.currency => (Icons.currency_exchange, const Color(0xFF2F80ED)),
      AssetType.crypto => (Icons.currency_bitcoin, const Color(0xFFF2994A)),
      AssetType.stock => (Icons.show_chart, const Color(0xFF6C5CE7)),
    };
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color.withValues(alpha: 0.15), shape: BoxShape.circle),
      alignment: Alignment.center,
      child: Icon(icon, color: color, size: size * 0.5),
    );
  }
}
