import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../logic/debts.dart';
import '../models/debt.dart';
import '../state/app_state.dart';
import '../theme.dart';
import '../widgets/asset_icon.dart';
import '../widgets/format.dart';
import 'debt_detail_sheet.dart';

class DebtsScreen extends StatefulWidget {
  const DebtsScreen({super.key});

  @override
  State<DebtsScreen> createState() => _DebtsScreenState();
}

class _DebtsScreenState extends State<DebtsScreen> {
  DebtDirection _direction = DebtDirection.lent;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final summary = app.debtSummary;
    final items = summary.of(_direction);

    return CustomScrollView(
      slivers: [
        const SliverAppBar(floating: true, title: Text('Alacak & Borç')),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
          sliver: SliverToBoxAdapter(
            child: _DebtSummaryCard(summary: summary, hasCpi: !app.cpi.isEmpty),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          sliver: SliverToBoxAdapter(
            child: SegmentedButton<DebtDirection>(
              segments: [
                for (final d in DebtDirection.values)
                  ButtonSegment(
                    value: d,
                    label: Text('${d.plural} (${summary.of(d).length})'),
                  ),
              ],
              selected: {_direction},
              showSelectedIcon: false,
              onSelectionChanged: (s) => setState(() => _direction = s.first),
            ),
          ),
        ),
        if (items.isEmpty)
          SliverFillRemaining(
            hasScrollBody: false,
            child: _Empty(direction: _direction),
          )
        else ...[
          SliverList.builder(
            itemCount: items.length,
            itemBuilder: (context, i) => _DebtTile(valuation: items[i]),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 96)),
        ],
      ],
    );
  }
}

class _DebtSummaryCard extends StatelessWidget {
  const _DebtSummaryCard({required this.summary, required this.hasCpi});
  final DebtSummary summary;
  final bool hasCpi;

  @override
  Widget build(BuildContext context) {
    Widget metric(String label, String value, {Color color = Colors.white}) =>
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  color: color,
                  fontSize: 17,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        );

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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Net alacak (bugünkü değerle)',
            style: TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 4),
          Text(
            formatSignedTl(summary.net),
            style: Theme.of(context).textTheme.headlineMedium
                ?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              metric('Alacaklarım', formatTl(summary.totalLent)),
              metric('Borçlarım', formatTl(summary.totalBorrowed)),
            ],
          ),
          if (summary.lentInflationLoss > 0 ||
              summary.borrowedInflationGain > 0) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                if (summary.lentInflationLoss > 0)
                  metric(
                    'Alacakların enflasyon kaybı',
                    '−${formatTl(summary.lentInflationLoss)}',
                    color: const Color(0xFFFF8A8A),
                  ),
                if (summary.borrowedInflationGain > 0)
                  metric(
                    'Borçların eriyen kısmı',
                    formatTl(summary.borrowedInflationGain),
                    color: const Color(0xFF5BE39A),
                  ),
              ],
            ),
          ] else if (!hasCpi) ...[
            const SizedBox(height: 12),
            const Text(
              'Enflasyon verisi yüklenince TL alacakların değer kaybı gösterilecek.',
              style: TextStyle(color: Colors.white60, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }
}

class _DebtTile extends StatelessWidget {
  const _DebtTile({required this.valuation});
  final DebtValuation valuation;

  @override
  Widget build(BuildContext context) {
    final app = context.read<AppState>();
    final d = valuation.debt;
    final asset = app.debtAsset(d.assetId);
    final amountText = d.isCash
        ? formatTl(d.amount)
        : '${formatQty(d.amount)} ${asset.unit} ${asset.name}';
    final dateText = d.date == null
        ? 'Tarih yok'
        : DateFormat('d MMM y', 'tr_TR').format(d.date!);
    final loss = valuation.inflationLoss;
    final lent = d.direction == DebtDirection.lent;

    return Dismissible(
      key: ValueKey(d.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        color: KiymetColors.up,
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Kapandı', style: TextStyle(color: Colors.white)),
            SizedBox(width: 8),
            Icon(Icons.check, color: Colors.white),
          ],
        ),
      ),
      confirmDismiss: (_) => showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text(lent ? 'Alacak tahsil edildi mi?' : 'Borç ödendi mi?'),
          content: Text(
            '${d.person} · $amountText\nKayıt listeden kaldırılacak.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Vazgeç'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Evet, kaldır'),
            ),
          ],
        ),
      ),
      onDismissed: (_) => app.removeDebt(d.id),
      child: ListTile(
        onTap: () => showDebtDetail(context, valuation),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: d.isCash
            ? CircleAvatar(
                backgroundColor: KiymetColors.gold.withValues(alpha: 0.15),
                child: Text(
                  d.person.isEmpty
                      ? '?'
                      : d.person.characters.first.toUpperCase(),
                  style: const TextStyle(
                    color: KiymetColors.gold,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              )
            : AssetIcon(asset),
        title: Text(d.person, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text('$amountText · $dateText', maxLines: 2),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              valuation.currentValue == null
                  ? 'Fiyat bekleniyor'
                  : formatTl(valuation.currentValue!),
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            if (loss != null && loss > 0)
              Text(
                lent
                    ? 'Enflasyon kaybı −${formatTl(loss)}'
                    : 'Eriyen ${formatTl(loss)}',
                style: TextStyle(
                  color: lent ? KiymetColors.down : KiymetColors.up,
                  fontSize: 12,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({required this.direction});
  final DebtDirection direction;

  @override
  Widget build(BuildContext context) {
    final lent = direction == DebtDirection.lent;
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            lent ? Icons.call_made : Icons.call_received,
            size: 56,
            color: KiymetColors.gold,
          ),
          const SizedBox(height: 12),
          Text(
            lent ? 'Kimseye borç vermemişsin' : 'Kimseye borcun yok',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            lent
                ? 'Verdiğin parayı veya altını ekle; bugünkü değerini ve enflasyon karşısında ne kadar eridiğini gör.'
                : 'Aldığın borcu ekle; bugünkü değerini takip et.',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
