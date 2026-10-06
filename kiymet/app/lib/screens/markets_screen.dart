import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/market_data.dart';
import '../state/app_state.dart';
import '../widgets/asset_icon.dart';
import '../widgets/format.dart';
import '../widgets/status_dot.dart';

class MarketsScreen extends StatelessWidget {
  const MarketsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final status = context.select<AppState, StreamStatus>((a) => a.status);
    return DefaultTabController(
      length: AssetType.values.length,
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: const Text('Piyasalar'),
          actions: [StatusDot(status), const SizedBox(width: 16)],
          bottom: TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            tabs: [for (final t in AssetType.values) Tab(text: t.label)],
          ),
        ),
        body: TabBarView(
          children: [for (final t in AssetType.values) _MarketList(type: t)],
        ),
      ),
    );
  }
}

class _MarketList extends StatelessWidget {
  const _MarketList({required this.type});
  final AssetType type;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final items = app.instrumentsOf(type).where((i) => app.prices.containsKey(i.id)).toList();
    if (type == AssetType.crypto) {
      // Önce popüler coinler, sonra alfabetik
      items.sort((a, b) => a.featured == b.featured ? a.code.compareTo(b.code) : (a.featured ? -1 : 1));
    }

    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (app.error != null) ...[
                Text(app.error!, textAlign: TextAlign.center),
                const SizedBox(height: 12),
                OutlinedButton(onPressed: app.refresh, child: const Text('Tekrar dene')),
              ] else ...[
                const CircularProgressIndicator(),
                const SizedBox(height: 12),
                const Text('Fiyatlar yükleniyor…'),
              ],
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.only(bottom: 24),
      itemCount: items.length + 1,
      separatorBuilder: (_, _) => const Divider(height: 1, indent: 72),
      itemBuilder: (context, i) {
        if (i == items.length) return _Footnote(type: type);
        final instrument = items[i];
        final price = app.prices[instrument.id]!;
        return ListTile(
          leading: AssetIcon(instrument),
          title: Text(instrument.name),
          subtitle: Text(
            instrument.type == AssetType.crypto || instrument.type == AssetType.stock
                ? instrument.code
                : '1 ${instrument.unit}',
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(formatPrice(price.price), style: const TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              ChangeChip(price.changePct),
            ],
          ),
        );
      },
    );
  }
}

class _Footnote extends StatelessWidget {
  const _Footnote({required this.type});
  final AssetType type;

  @override
  Widget build(BuildContext context) {
    final text = switch (type) {
      AssetType.metal =>
        'Altın ve gümüş fiyatları ons fiyatı ve dolar kurundan hesaplanan teorik has değeridir; kuyumcu alış/satış fiyatları işçilik ve makas nedeniyle farklıdır.',
      AssetType.currency => 'TCMB gösterge niteliğindeki döviz satış kurlarıdır, günde bir kez güncellenir.',
      AssetType.crypto => 'Değişim son 24 saate göredir.',
      AssetType.stock => 'Hisse fiyatları en az 15 dakika gecikmelidir.',
    };
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Text(
        '$text Yatırım tavsiyesi değildir.',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
      ),
    );
  }
}
