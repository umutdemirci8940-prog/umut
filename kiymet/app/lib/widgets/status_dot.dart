import 'package:flutter/material.dart';

import '../services/market_data.dart';
import '../theme.dart';

class StatusDot extends StatelessWidget {
  const StatusDot(this.status, {super.key});
  final StreamStatus status;

  @override
  Widget build(BuildContext context) {
    final (color, label) = switch (status) {
      StreamStatus.live => (KiymetColors.up, 'Canlı'),
      StreamStatus.connecting => (Colors.orange, 'Bağlanıyor'),
      StreamStatus.offline => (KiymetColors.down, 'Çevrimdışı'),
    };
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: Theme.of(context).textTheme.labelMedium),
      ],
    );
  }
}
