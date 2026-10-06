import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../logic/catalog.dart';
import '../logic/portfolio.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../widgets/asset_icon.dart';
import '../widgets/format.dart';

class AddHoldingScreen extends StatefulWidget {
  const AddHoldingScreen({super.key});

  @override
  State<AddHoldingScreen> createState() => _AddHoldingScreenState();
}

class _AddHoldingScreenState extends State<AddHoldingScreen> {
  AssetType _type = AssetType.metal;
  Instrument? _selected;
  String _query = '';

  @override
  Widget build(BuildContext context) {
    if (_selected != null) {
      return _HoldingForm(
        instrument: _selected!,
        onBack: () => setState(() => _selected = null),
      );
    }

    final app = context.watch<AppState>();
    final q = _query.trim().toUpperCase();
    final items = app
        .instrumentsOf(_type)
        .where((i) => q.isEmpty || i.code.contains(q) || i.name.toUpperCase().contains(q))
        .toList();
    if (_type == AssetType.crypto) {
      items.sort((a, b) => a.featured == b.featured ? a.code.compareTo(b.code) : (a.featured ? -1 : 1));
    }
    // Listede olmayan BIST hissesi kodu yazıldıysa onu da eklenebilir göster.
    final customStock = _type == AssetType.stock && isValidStockCode(q) && !items.any((i) => i.code == q);

    return Scaffold(
      appBar: AppBar(title: const Text('Varlık ekle')),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SegmentedButton<AssetType>(
              segments: [
                for (final t in AssetType.values) ButtonSegment(value: t, label: Text(t.label)),
              ],
              selected: {_type},
              showSelectedIcon: false,
              onSelectionChanged: (s) => setState(() {
                _type = s.first;
                _query = '';
              }),
            ),
          ),
          if (_type == AssetType.crypto || _type == AssetType.stock)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: TextField(
                key: ValueKey(_type),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: _type == AssetType.stock ? 'Hisse kodu (ör. THYAO)' : 'Coin ara (ör. BTC)',
                  border: const OutlineInputBorder(),
                  isDense: true,
                ),
                textCapitalization: TextCapitalization.characters,
                onChanged: (v) => setState(() => _query = v),
              ),
            ),
          const SizedBox(height: 8),
          Expanded(
            child: ListView(
              children: [
                if (customStock)
                  ListTile(
                    leading: const Icon(Icons.add_circle_outline),
                    title: Text('$q hissesini ekle'),
                    onTap: () => setState(() => _selected = Instrument(
                          id: 'STOCK:$q',
                          type: AssetType.stock,
                          code: q,
                          name: q,
                          unit: 'lot',
                        )),
                  ),
                for (final i in items)
                  ListTile(
                    leading: AssetIcon(i),
                    title: Text(i.name),
                    subtitle: Text(i.type == AssetType.metal ? 'Birim: ${i.unit}' : i.code),
                    trailing: app.prices[i.id] == null ? null : Text(formatPrice(app.prices[i.id]!.price)),
                    onTap: () => setState(() => _selected = i),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HoldingForm extends StatefulWidget {
  const _HoldingForm({required this.instrument, required this.onBack});
  final Instrument instrument;
  final VoidCallback onBack;

  @override
  State<_HoldingForm> createState() => _HoldingFormState();
}

class _HoldingFormState extends State<_HoldingForm> {
  final _form = GlobalKey<FormState>();
  final _qty = TextEditingController();
  final _cost = TextEditingController();
  DateTime _date = DateTime.now();

  /// Alış fiyatı alanının altındaki açıklama (kaynak, tarih veya hata).
  String? _priceNote;
  bool _loadingPrice = false;
  int _priceRequest = 0;

  @override
  void initState() {
    super.initState();
    _qty.addListener(_refresh);
    _cost.addListener(_refresh);
    _fillLivePrice();
  }

  void _refresh() => setState(() {});

  static String _formatInput(double v) =>
      NumberFormat(v >= 1 ? '0.##' : '0.########', 'tr_TR').format(v);

  bool _isToday(DateTime d) {
    final now = DateTime.now();
    return d.year == now.year && d.month == now.month && d.day == now.day;
  }

  /// Bugün için alış fiyatını güncel fiyatla doldurur.
  void _fillLivePrice() {
    _priceRequest++;
    final price = context.read<AppState>().prices[widget.instrument.id];
    _loadingPrice = false;
    if (price != null) {
      _cost.text = _formatInput(price.price);
      _priceNote = 'Güncel fiyat otomatik dolduruldu, değiştirebilirsiniz.';
    } else {
      _priceNote = null;
    }
  }

  /// Seçilen tarihteki kapanış fiyatını çekip alış fiyatına yazar.
  Future<void> _fillHistoricalPrice(DateTime date) async {
    final request = ++_priceRequest;
    setState(() {
      _loadingPrice = true;
      _priceNote = 'O günün fiyatı getiriliyor…';
    });
    final result = await context.read<AppState>().history.priceOn(widget.instrument.id, date);
    if (!mounted || request != _priceRequest) return; // bu arada başka tarih seçildi
    setState(() {
      _loadingPrice = false;
      if (result == null) {
        _priceNote = 'Bu tarih için fiyat bulunamadı, lütfen elle girin.';
        return;
      }
      _cost.text = _formatInput(result.price);
      final sameDay = result.date.year == date.year && result.date.month == date.month && result.date.day == date.day;
      final day = DateFormat('d MMMM y', 'tr_TR').format(result.date);
      _priceNote = sameDay
          ? '$day kapanış fiyatı (${result.source}). Değiştirebilirsiniz.'
          : 'Piyasa kapalıydı; $day kapanış fiyatı kullanıldı (${result.source}).';
    });
  }

  @override
  void dispose() {
    _qty.removeListener(_refresh);
    _cost.removeListener(_refresh);
    _qty.dispose();
    _cost.dispose();
    super.dispose();
  }

  String? _validate(String? v) {
    final n = parseAmount(v ?? '');
    if (n == null) return 'Geçerli bir sayı girin';
    if (n <= 0) return 'Sıfırdan büyük olmalı';
    return null;
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      locale: const Locale('tr', 'TR'),
    );
    if (picked == null) return;
    setState(() => _date = picked);
    if (_isToday(picked)) {
      setState(_fillLivePrice);
    } else {
      await _fillHistoricalPrice(picked);
    }
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    final app = context.read<AppState>();
    await app.addHolding(Holding(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      instrumentId: widget.instrument.id,
      quantity: parseAmount(_qty.text)!,
      unitCost: parseAmount(_cost.text)!,
      purchaseDate: _date,
    ));
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final i = widget.instrument;
    final qtyLabel = switch (i.unit) {
      'adet' => 'Adet',
      'gram' => 'Gram',
      'lot' => 'Lot (adet hisse)',
      _ => 'Miktar (${i.unit})',
    };
    final inputFormat = [FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]'))];
    final qty = parseAmount(_qty.text);
    final cost = parseAmount(_cost.text);
    final total = (qty != null && cost != null) ? qty * cost : null;

    return Scaffold(
      appBar: AppBar(
        leading: BackButton(onPressed: widget.onBack),
        title: Text(i.name),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                AssetIcon(i, size: 48),
                const SizedBox(width: 12),
                Expanded(child: Text(i.name, style: Theme.of(context).textTheme.titleLarge)),
              ],
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _qty,
              autofocus: true,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: inputFormat,
              decoration: InputDecoration(labelText: qtyLabel, border: const OutlineInputBorder()),
              validator: _validate,
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.event),
              title: const Text('Alış tarihi'),
              subtitle: Text(DateFormat('d MMMM y', 'tr_TR').format(_date)),
              trailing: const Icon(Icons.chevron_right),
              onTap: _pickDate,
            ),
            Text(
              'Tarihi seçince o günün fiyatı otomatik gelir. Tarih, enflasyona göre gerçek getirinizi hesaplamak için de kullanılır.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _cost,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: inputFormat,
              decoration: InputDecoration(
                labelText: 'Birim alış fiyatı (₺)',
                helperText: _priceNote ?? '1 ${i.unit} için ödediğiniz tutar',
                helperMaxLines: 2,
                border: const OutlineInputBorder(),
                suffixIcon: _loadingPrice
                    ? const Padding(
                        padding: EdgeInsets.all(14),
                        child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
                      )
                    : const Padding(padding: EdgeInsets.only(right: 12), child: Center(widthFactor: 1, child: Text('₺'))),
              ),
              validator: _validate,
            ),
            if (total != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Text('Toplam tutar'),
                    const Spacer(),
                    Text(formatTl(total), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _save,
              icon: const Icon(Icons.check),
              label: const Text('Kaydet'),
              style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52)),
            ),
          ],
        ),
      ),
    );
  }
}
