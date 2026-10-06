import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../logic/portfolio.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../theme.dart';
import '../widgets/asset_icon.dart';
import '../widgets/format.dart';
import '../widgets/status_dot.dart';
import 'about_sheet.dart';

class PortfolioScreen extends StatelessWidget {
  const PortfolioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final summary = app.summary;

    return RefreshIndicator(
      onRefresh: app.refresh,
      child: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            title: const Text('Kıymet'),
            actions: [
              StatusDot(app.status),
              IconButton(
                tooltip: 'Hakkında',
                icon: const Icon(Icons.info_outline),
                onPressed: () => showAboutKiymet(context),
              ),
            ],
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            sliver: SliverToBoxAdapter(child: _SummaryCard(summary: summary, hasCpi: !app.cpi.isEmpty)),
          ),
          if (summary.valueByType.isNotEmpty)
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              sliver: SliverToBoxAdapter(child: _AllocationBar(summary: summary)),
            ),
          if (summary.isEmpty)
            const SliverFillRemaining(hasScrollBody: false, child: _EmptyState())
          else ...[
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
              sliver: SliverToBoxAdapter(
                child: Text('Varlıklarım', style: Theme.of(context).textTheme.titleMedium),
              ),
            ),
            SliverList.builder(
              itemCount: summary.items.length,
              itemBuilder: (context, i) => _HoldingTile(valuation: summary.items[i]),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 96)),
          ],
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.summary, required this.hasCpi});
  final PortfolioSummary summary;
  final bool hasCpi;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [KiymetColors.navy, Color(0xFF233A5E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: DefaultTextStyle(
        style: const TextStyle(color: Colors.white),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Toplam varlık', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 4),
            Text(
              formatTl(summary.totalValue),
              style: text.headlineMedium?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            if (summary.dailyChangePct != null)
              Text(
                'Bugün ${formatSignedTl(summary.dailyChange)} (${formatPct(summary.dailyChangePct!)})',
                style: TextStyle(color: _onDark(summary.dailyChange)),
              ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _Metric(
                    label: 'Toplam kâr/zarar',
                    value: summary.pnlPct == null ? '—' : formatSignedTl(summary.pnl),
                    sub: summary.pnlPct == null ? null : formatPct(summary.pnlPct!),
                    color: _onDark(summary.pnl),
                  ),
                ),
                Expanded(
                  child: _Metric(
                    label: 'Reel getiri (enflasyona göre)',
                    value: summary.realReturnPct != null
                        ? formatPct(summary.realReturnPct!)
                        : (hasCpi ? '—' : 'Yakında'),
                    sub: summary.realReturnPct != null
                        ? (summary.realReturnPct! >= 0 ? 'Enflasyonu yendin' : 'Enflasyonun gerisinde')
                        : (hasCpi ? null : 'TÜFE verisi bağlanınca'),
                    color: summary.realReturnPct == null ? Colors.white : _onDark(summary.realReturnPct!),
                  ),
                ),
              ],
            ),
            if (summary.missingPrices > 0) ...[
              const SizedBox(height: 12),
              Text(
                '${summary.missingPrices} varlığın fiyatı bekleniyor, toplama dahil değil.',
                style: const TextStyle(color: Colors.white60, fontSize: 12),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _onDark(double v) => v > 0 ? const Color(0xFF5BE39A) : (v < 0 ? const Color(0xFFFF8A8A) : Colors.white);
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value, this.sub, required this.color});
  final String label;
  final String value;
  final String? sub;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(color: color, fontSize: 17, fontWeight: FontWeight.w600)),
        if (sub != null) Text(sub!, style: TextStyle(color: color.withValues(alpha: 0.85), fontSize: 12)),
      ],
    );
  }
}

const _typeColors = {
  AssetType.metal: KiymetColors.gold,
  AssetType.currency: Color(0xFF2F80ED),
  AssetType.crypto: Color(0xFFF2994A),
  AssetType.stock: Color(0xFF6C5CE7),
};

class _AllocationBar extends StatelessWidget {
  const _AllocationBar({required this.summary});
  final PortfolioSummary summary;

  @override
  Widget build(BuildContext context) {
    final total = summary.totalValue;
    final entries = summary.valueByType.entries.where((e) => e.value > 0).toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Dağılım', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: SizedBox(
                height: 10,
                child: Row(
                  children: [
                    for (final e in entries)
                      Expanded(
                        flex: (e.value / total * 1000).round().clamp(1, 1000),
                        child: Container(color: _typeColors[e.key]),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 14,
              runSpacing: 6,
              children: [
                for (final e in entries)
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(color: _typeColors[e.key], shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 6),
                      Text('${e.key.label} %${(e.value / total * 100).toStringAsFixed(0)}'),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HoldingTile extends StatelessWidget {
  const _HoldingTile({required this.valuation});
  final HoldingValuation valuation;

  @override
  Widget build(BuildContext context) {
    final app = context.read<AppState>();
    final h = valuation.holding;
    final instrument = app.instrument(h.instrumentId);
    final date = DateFormat('d MMM y', 'tr_TR').format(h.purchaseDate);

    return Dismissible(
      key: ValueKey(h.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        color: KiymetColors.down,
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      confirmDismiss: (_) => showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Varlık silinsin mi?'),
          content: Text('${formatQty(h.quantity)} ${instrument.unit} ${instrument.name}'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Vazgeç')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Sil')),
          ],
        ),
      ),
      onDismissed: (_) => app.removeHolding(h.id),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: AssetIcon(instrument),
        title: Text(instrument.name, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text('${formatQty(h.quantity)} ${instrument.unit} · $date'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              valuation.value == null ? 'Fiyat bekleniyor' : formatTl(valuation.value!),
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            if (valuation.pnlPct != null)
              Text(
                '${formatSignedTl(valuation.pnl!)} (${formatPct(valuation.pnlPct!)})',
                style: TextStyle(color: changeColor(context, valuation.pnl), fontSize: 12),
              ),
            if (valuation.realReturnPct != null)
              Text(
                'Reel ${formatPct(valuation.realReturnPct!)}',
                style: TextStyle(color: changeColor(context, valuation.realReturnPct), fontSize: 11),
              ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.savings_outlined, size: 64, color: KiymetColors.gold),
          const SizedBox(height: 16),
          Text('Tüm kıymetlerin tek yerde', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          const Text(
            'Altın, döviz, hisse ve kripto varlıklarını ekle; toplam değerini ve gerçek getirini anlık takip et.',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
